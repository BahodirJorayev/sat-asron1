'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Target,
  Calendar,
  Save,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types';
import { supabase, saveUserProfile } from '../../lib/supabase';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveSuccess?: (updatedUser: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveSuccess,
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [targetScore, setTargetScore] = useState<number>(currentUser.targetScore || 1550);
  const [targetExamDate, setTargetExamDate] = useState<string>(
    currentUser.targetExamDate?.slice(0, 10) || '2026-10-03'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when currentUser prop updates or modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(currentUser.fullName || '');
      setUsername(currentUser.username || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setTargetScore(currentUser.targetScore || 1550);
      setTargetExamDate(currentUser.targetExamDate?.slice(0, 10) || '2026-10-03');
      setErrorMessage(null);
      setSavedSuccess(false);
    }
  }, [isOpen, currentUser]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const cleanFullName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
    const cleanPhone = phoneNumber.trim();
    const cleanAvatarUrl = avatarUrl.trim() || currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    if (!cleanFullName) {
      setErrorMessage("Ism va familiyani kiritish majburiy.");
      setIsSaving(false);
      return;
    }

    if (!cleanUsername) {
      setErrorMessage("Foydalanuvchi nomi (@username) noto'g'ri shaklda.");
      setIsSaving(false);
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const activeId = authData?.user?.id || currentUser.id;

      if (!activeId) {
        throw new Error("Foydalanuvchi sessiyasi topilmadi.");
      }

      // 1. Direct Cloud Persistence: Upsert directly into Supabase public.profiles
      const profileData: any = {
        id: activeId,
        full_name: cleanFullName,
        username: cleanUsername,
        avatar_url: cleanAvatarUrl,
        target_score: Number(targetScore) || 1500,
        updated_at: new Date().toISOString(),
      };

      let { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      // If updated_at column is missing on profiles in DB, retry without it
      if (profileError && profileError.message?.includes('updated_at')) {
        delete profileData.updated_at;
        const retry = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });
        profileError = retry.error;
      }

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 2. Persist extended fields to Supabase Auth metadata for instant multi-device retrieval
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: cleanFullName,
            username: cleanUsername,
            avatar_url: cleanAvatarUrl,
            phone: cleanPhone,
            target_score: Number(targetScore) || 1500,
            target_exam_date: targetExamDate,
          },
        });
      } catch (authErr) {
        console.warn('Supabase auth metadata update notice:', authErr);
      }

      const updatedUser: User = {
        ...currentUser,
        fullName: cleanFullName,
        username: cleanUsername,
        avatarUrl: cleanAvatarUrl,
        phoneNumber: cleanPhone,
        targetScore: Number(targetScore) || 1500,
        targetExamDate: targetExamDate,
      };

      // 3. Update application cache & local cookies
      await saveUserProfile(updatedUser);

      // Invalidate client-side cache and broadcast cross-device/cross-tab
      if (typeof window !== 'undefined') {
        localStorage.setItem('aurasat_user_profile', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('profile_updated', { detail: updatedUser }));
        try {
          const bc = new BroadcastChannel('asron_profile_channel');
          bc.postMessage({ type: 'profile_updated', user: updatedUser });
          bc.close();
        } catch {}
      }

      // 4. Broadcast via Supabase Realtime channel so other open tabs / devices reflect immediately
      try {
        const realtimeChannel = supabase.channel(`profile-realtime-${activeId}`);
        realtimeChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            realtimeChannel.send({
              type: 'broadcast',
              event: 'profile_updated',
              payload: updatedUser,
            });
          }
        });
      } catch (rtErr) {
        // ignore
      }

      setSavedSuccess(true);
      onSaveSuccess?.(updatedUser);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('EditProfileModal save error:', err);
      setErrorMessage(err.message || "Profilni saqlashda xatolik yuz berdi.");
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#0A0F1D]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E07A5F]/10 text-[#E07A5F] flex items-center justify-center font-bold">
              <UserIcon size={16} />
            </div>
            <div>
              <h2 id="edit-profile-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Profilni Tahrirlash
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Barcha qurilmalarda bir zumda bulut orqali sinxronlashadi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                Avatar URL (yoki DiceBear)
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... avatar rasm havolasi"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              Ism va Familiya
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ism Familiya"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-[#E07A5F] transition-colors"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              Foydalanuvchi nomi (@username)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#E07A5F] transition-colors"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              Telefon raqami
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#E07A5F] transition-colors"
              />
            </div>
          </div>

          {/* Target Score Slider */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Target size={14} className="text-[#E07A5F]" />
                <span>Maqsadli SAT Bali</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#E07A5F]">
                {targetScore} / 1600
              </span>
            </div>
            <input
              type="range"
              min={1200}
              max={1600}
              step={10}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full accent-[#E07A5F] cursor-pointer"
            />
          </div>

          {/* Target Exam Date */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>Imtihon Sanasi</span>
            </label>
            <input
              type="date"
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#E07A5F] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>Saqlandi!</span>
                </>
              ) : isSaving ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <Save size={14} />
                  <span>O'zgarishlarni Saqlash</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
