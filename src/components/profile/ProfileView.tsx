'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  Target,
  BarChart3,
  Shield,
  LogOut,
  Save,
  Check,
  Calendar,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Sun,
  Moon,
  Trash2,
  Camera,
  Loader2,
  Upload,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Clock,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';
import { User } from '../../types';
import { supabase, saveUserProfile, signOutUser } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUserProgress } from '../../hooks/useUserProgress';
import { useExamProgram } from '../../context/ExamProgramContext';
import { EditProfileModal } from './EditProfileModal';

interface ProfileViewProps {
  initialUser?: User;
  currentUser?: User;
  onSignOut?: () => void;
  onUpdateUser?: (updated: User) => void;
  onOpenPaywall?: () => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onOpenChat?: () => void;
  onOpenArena?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialUser,
  currentUser,
  onSignOut,
  onUpdateUser,
}) => {
  const router = useRouter();
  const effectiveInitialUser = initialUser || currentUser;

  // 1. User State
  const [user, setUser] = useState<User>(() => {
    if (effectiveInitialUser) return effectiveInitialUser;
    return {
      id: '',
      email: '',
      fullName: 'Talaba',
      username: 'talaba',
      planTier: 'STANDARD',
      role: 'STUDENT',
      streakDays: 0,
      totalQuestionsDone: 0,
      overallAccuracy: 0,
      targetScore: 1550,
      targetExamDate: '2026-10-03',
      createdAt: new Date().toISOString(),
    };
  });

  // Form Fields State
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [targetScore, setTargetScore] = useState<number>(1550);
  const [targetExamDate, setTargetExamDate] = useState<string>('2026-10-03');

  // Security Form State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Status State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [mockTestsCompleted, setMockTestsCompleted] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Account Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Apple-grade Theme state
  const { resolvedTheme, setTheme } = useTheme();
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const { progress: userProg } = useUserProgress(user);
  const { examType: globalExamType } = useExamProgram();

  // Dual-Exam Track Switcher ('SAT' | 'IELTS')
  const [profileTrack, setProfileTrack] = useState<'SAT' | 'IELTS'>(() => {
    return globalExamType === 'IELTS' ? 'IELTS' : 'SAT';
  });

  const [ieltsTargetBand, setIeltsTargetBand] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asron_ielts_target_band');
      if (saved) return parseFloat(saved) || 7.5;
    }
    return user.ieltsTargetBand || 7.5;
  });

  const [ieltsSubmissions, setIeltsSubmissions] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('asron_ielts_submissions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const handleUpdateTargetBand = (band: number) => {
    setIeltsTargetBand(band);
    if (typeof window !== 'undefined') {
      localStorage.setItem('asron_ielts_target_band', band.toString());
      window.dispatchEvent(new CustomEvent('asron_target_band_changed', { detail: { band } }));
    }
    const updated = { ...user, ieltsTargetBand: band };
    setUser(updated);
    onUpdateUser?.(updated);
  };

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploadingAvatar(true);
      setAvatarUploadError(null);

      const publicUrl = await uploadAvatar(file);

      if (publicUrl) {
        setUser((prev) => ({ ...prev, avatarUrl: publicUrl }));
        onUpdateUser?.({ ...user, avatarUrl: publicUrl });
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setAvatarUploadError(err.message || "Rasm yuklashda xatolik yuz berdi.");
    } finally {
      setIsUploadingAvatar(false);
      if (event.target) event.target.value = '';
    }
  };

  // Load active user profile from Supabase profiles table
  useEffect(() => {
    let isMounted = true;
    let profileChannel: any = null;

    const fetchProfile = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeUser = authData?.user;

        if (activeUser) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, target_score, created_at')
            .eq('id', activeUser.id)
            .maybeSingle();

          const meta = activeUser.user_metadata || {};

          if (isMounted) {
            const resolvedUser: User = {
              id: activeUser.id,
              email: activeUser.email || '',
              fullName: dbProfile?.full_name || meta.full_name || meta.name || user.fullName || 'Talaba',
              username: dbProfile?.username || meta.username || activeUser.email?.split('@')[0] || user.username || 'talaba',
              avatarUrl: dbProfile?.avatar_url || meta.avatar_url || meta.picture || user.avatarUrl || profile?.avatarUrl || '',
              phoneNumber: meta.phone || meta.phoneNumber || user.phoneNumber || '',
              planTier: (meta.plan_tier as any) || user.planTier || 'STANDARD',
              role: (meta.role as any) || user.role || 'STUDENT',
              streakDays: user.streakDays || 0,
              streakFreezes: user.streakFreezes ?? 1,
              xpPoints: user.xpPoints ?? 100,
              totalQuestionsDone: user.totalQuestionsDone || 0,
              overallAccuracy: user.overallAccuracy || 0,
              targetScore: Number(dbProfile?.target_score) || Number(meta.target_score) || user.targetScore || 1550,
              targetExamDate: meta.target_exam_date || user.targetExamDate || '2026-10-03',
              createdAt: dbProfile?.created_at || activeUser.created_at || user.createdAt || new Date().toISOString(),
            };

            setUser(resolvedUser);
            setFullName(resolvedUser.fullName);
            setUsername(resolvedUser.username);
            setEmail(resolvedUser.email);
            setPhoneNumber(resolvedUser.phoneNumber || '');
            setTargetScore(resolvedUser.targetScore || 1550);
            setTargetExamDate(resolvedUser.targetExamDate?.slice(0, 10) || '2026-10-03');
          }

          if (!isMounted) return;

          // Realtime cross-device synchronization (PC <-> Mobile)
          const channel = supabase
            .channel(`profile-sync-${activeUser.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${activeUser.id}`,
              },
              (payload: any) => {
                const newRow = payload.new;
                if (newRow && isMounted) {
                  if (newRow.full_name) setFullName(newRow.full_name);
                  if (newRow.username) setUsername(newRow.username);
                  if (newRow.target_score) setTargetScore(Number(newRow.target_score));
                  setUser((prev) => ({
                    ...prev,
                    fullName: newRow.full_name || prev.fullName,
                    username: newRow.username || prev.username,
                    targetScore: Number(newRow.target_score) || prev.targetScore,
                  }));
                }
              }
            )
            .on(
              'broadcast',
              { event: 'profile-updated' },
              (payload: any) => {
                const data = payload?.payload;
                if (data && isMounted) {
                  if (data.fullName) setFullName(data.fullName);
                  if (data.username) setUsername(data.username);
                  if (data.phoneNumber !== undefined) setPhoneNumber(data.phoneNumber);
                  if (data.targetScore) setTargetScore(Number(data.targetScore));
                  if (data.targetExamDate) setTargetExamDate(data.targetExamDate);
                  setUser((prev) => ({
                    ...prev,
                    fullName: data.fullName || prev.fullName,
                    username: data.username || prev.username,
                    phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : prev.phoneNumber,
                    targetScore: Number(data.targetScore) || prev.targetScore,
                    targetExamDate: data.targetExamDate || prev.targetExamDate,
                  }));
                }
              }
            )
            .subscribe();

          if (!isMounted) {
            supabase.removeChannel(channel);
          } else {
            profileChannel = channel;
          }
        }
      } catch (err) {
        console.warn('Profile fetch warning:', err);
      }
    };

    fetchProfile();

    // Check mock test attempts strictly for active user
    const fetchMockCount = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeUserId = authData?.user?.id || user.id;
        let totalMocks = 0;

        if (activeUserId) {
          const { count, error } = await supabase
            .from('mock_test_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', activeUserId);
          if (!error && typeof count === 'number') {
            totalMocks += count;
          }
        }

        // Add IELTS mock test submissions
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem('asron_ielts_submissions');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                totalMocks += parsed.length;
              }
            }
          } catch {}
        }

        if (isMounted) {
          setMockTestsCompleted(totalMocks);
        }
      } catch (e) {}
    };
    fetchMockCount();

    return () => {
      isMounted = false;
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, []);

  // Save Personal Info directly to Supabase profiles and Auth metadata
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const activeUserId = authData?.user?.id || user.id;

      if (activeUserId) {
        const cleanFullName = fullName.trim();
        const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
        const cleanPhone = phoneNumber.trim();

        // 1. Direct Cloud Upsert into Supabase public.profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: activeUserId,
              full_name: cleanFullName,
              username: cleanUsername,
              avatar_url: user.avatarUrl || null,
              target_score: targetScore,
            },
            { onConflict: 'id' }
          );

        if (profileError) {
          console.warn('Supabase profiles update warning:', profileError.message);
        }

        // 2. Persist to Auth user metadata for immediate cross-device retrieval
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: cleanFullName,
              username: cleanUsername,
              phone: cleanPhone,
              target_score: targetScore,
              target_exam_date: targetExamDate,
            },
          });
        } catch (authMetaErr) {
          console.warn('Auth metadata update notice:', authMetaErr);
        }

        const updatedUser: User = {
          ...user,
          fullName: cleanFullName,
          username: cleanUsername,
          phoneNumber: cleanPhone,
          targetScore: targetScore,
          targetExamDate: targetExamDate,
        };

        setUser(updatedUser);
        await saveUserProfile(updatedUser);

        // 3. Update global reactive profile state & broadcast local events
        await updateProfile({
          fullName: cleanFullName,
          username: cleanUsername,
          targetScore: targetScore,
          phoneNumber: cleanPhone,
          targetExamDate: targetExamDate,
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profileUpdated'));
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
          window.dispatchEvent(new CustomEvent('asron_profile_updated', { detail: updatedUser }));
          window.dispatchEvent(new CustomEvent('profile_updated', { detail: updatedUser }));
        }

        onUpdateUser?.(updatedUser);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Kiritilgan yangi parollar mos kelmadi.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordFeedback({ type: 'error', message: error.message });
      } else {
        setPasswordFeedback({ type: 'success', message: 'Parol muvaffaqiyatli yangilandi.' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Parolni yangilashda xatolik yuz berdi.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Log Out
  const handleLogout = async () => {
    try {
      if (onSignOut) {
        onSignOut();
      } else {
        await signOutUser();
        if (typeof window !== 'undefined') {
          window.location.hash = '#/landing';
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const activeUserId = authData?.user?.id || user.id;

      if (activeUserId) {
        // 1. Attempt RPC delete_user_account first
        try {
          await supabase.rpc('delete_user_account');
        } catch (rpcErr) {
          console.warn('RPC delete_user_account notice:', rpcErr);
        }

        // 2. Direct tables wipe fallback
        try {
          await supabase.from('user_progress').delete().eq('user_id', activeUserId);
          await supabase.from('profiles').delete().eq('id', activeUserId);
        } catch (tableErr) {
          console.warn('Direct tables wipe notice:', tableErr);
        }

        // 3. Clear local storage & cookies
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }

        // 4. Sign out
        await supabase.auth.signOut();

        // 5. Navigate to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?deleted=true';
        }
      }
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setDeleteError(err.message || "Hisobni o'chirishda xatolik yuz berdi.");
      setIsDeleting(false);
    }
  };

  const initialLetter = (fullName || user.fullName || 'T')[0]?.toUpperCase() || 'T';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <Link
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Uyga qaytish</span>
        </Link>

        {/* Apple-style Segmented Theme Controller: [ ☀️ Kunduzgi | 🌙 Tungi ] */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              resolvedTheme === 'light'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            aria-label="Kunduzgi rejim"
          >
            <Sun size={13} className={resolvedTheme === 'light' ? 'text-amber-500' : ''} />
            <span>Kunduzgi</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              resolvedTheme === 'dark'
                ? 'bg-[#1E293B] text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            aria-label="Tungi rejim"
          >
            <Moon size={13} className={resolvedTheme === 'dark' ? 'text-blue-400' : ''} />
            <span>Tungi</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Summary Card: Strict Zero-Badge Minimalism */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Interactive Avatar with Camera Upload Overlay */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xl sm:text-2xl font-bold overflow-hidden shadow-sm border-2 border-white dark:border-[#1E293B] transition-transform group-hover:scale-102">
                {profile?.avatarUrl || user.avatarUrl ? (
                  <img
                    src={profile?.avatarUrl || user.avatarUrl}
                    alt={fullName || user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
                {/* Upload Spinner Overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Camera Icon Overlay Trigger */}
              <label
                htmlFor="avatar-input"
                title="Rasm yuklash / O'zgartirish"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#121A2F] z-20 flex items-center justify-center"
              >
                <Camera size={13} strokeWidth={2.4} />
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  disabled={isUploadingAvatar}
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            {/* Clean User Credentials (Zero Badges) */}
            <div className="min-w-0 leading-snug space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {fullName || user.fullName || 'Foydalanuvchi'}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  title="Profilni tahrirlash"
                  className="p-1 rounded-lg text-slate-400 hover:text-[#E07A5F] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
              </div>
              <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                @{username || user.username || 'user'}
              </p>
              {email && (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate flex items-center gap-1.5 pt-0.5">
                  <Mail size={12} className="shrink-0 text-slate-400" />
                  <span>{email}</span>
                </p>
              )}
              {/* Upload Photo Button & Error Display */}
              <div className="pt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-[#E07A5F]" />
                      <span>Yuklanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      <span>Rasm yuklash</span>
                    </>
                  )}
                </button>
                {avatarUploadError && (
                  <span className="text-[11px] text-rose-500">{avatarUploadError}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Target Indicator & Edit Action */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
              <Target size={15} className={profileTrack === 'IELTS' ? 'text-orange-500' : 'text-[#E07A5F]'} />
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">
                  {profileTrack === 'IELTS' ? 'IELTS Maqsad' : 'SAT Maqsad'}
                </div>
                <div className="text-xs sm:text-sm font-extrabold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                  {profileTrack === 'IELTS' ? `Band ${ieltsTargetBand} / 9.0` : `${targetScore} / 1600`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E07A5F]/10 hover:bg-[#E07A5F]/20 text-[#E07A5F] border border-[#E07A5F]/20 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <Edit3 size={14} />
              <span className="hidden sm:inline">Tahrirlash</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Shaxsiy Ma'lumotlar */}
      <section
        aria-label="Shaxsiy Ma'lumotlar"
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs space-y-4 transition-colors"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E07A5F]/10 text-[#E07A5F]">
              <UserIcon size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Shaxsiy Ma'lumotlar
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Platformadagi asosiy identifikatorlar va aloqa ma'lumotlari
              </p>
            </div>
          </div>

          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold animate-in fade-in">
              <Check size={13} strokeWidth={2.5} />
              <span>Saqlandi</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] font-medium">
                Ism va Familiya
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] transition-colors"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] font-medium">
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
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] transition-colors"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] font-medium">
                Elektron pochta (Email)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC]/50 dark:bg-[#0A0F1D]/50 border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#64748B] cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] font-medium">
                Telefon raqami
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] transition-colors"
              />
            </div>

            {/* Target Score Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] font-medium">
                  Maqsadli SAT Bali
                </label>
                <span className="text-xs font-mono font-bold text-[#E07A5F]">
                  {targetScore} ball
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
              <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] font-medium">
                Imtihon Sanasi
              </label>
              <input
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saqlanmoqda...' : 'Ma\'lumotlarni Saqlash'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: Dual-Exam Akademik Natijalar (SAT & IELTS) */}
      <section
        aria-label="Akademik Natijalar"
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs space-y-5 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <BarChart3 size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Akademik Natijalar &amp; Analitika
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {profileTrack === 'SAT'
                  ? "Digital SAT mashqlari va sinov testlaridagi shaxsiy ko'rsatkichlar"
                  : "IELTS 4-ko'nikma diagnostikasi, band ballari va mock imtihonlar tarixi"}
              </p>
            </div>
          </div>

          {/* Program Switcher Tabs: [ 🏛️ SAT Natijalari | 🇬🇧 IELTS Natijalari ] */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setProfileTrack('SAT')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                profileTrack === 'SAT'
                  ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🏛️ SAT Natijalari</span>
            </button>
            <button
              type="button"
              onClick={() => setProfileTrack('IELTS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                profileTrack === 'IELTS'
                  ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇬🇧 IELTS Natijalari</span>
            </button>
          </div>
        </div>

        {profileTrack === 'SAT' ? (
          /* SAT Track Cards */
          <div className="space-y-4">
            {/* 3 Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Ishlangan Savollar */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Ishlangan Savollar
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {userProg.total_questions_done ?? Object.keys(userProg.completed_questions || {}).length ?? user.totalQuestionsDone ?? 0}
                </div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {(userProg.total_questions_done ?? Object.keys(userProg.completed_questions || {}).length ?? 0) > 0
                    ? 'Savollar banki & Bo‘limlar'
                    : '0 ta savol yechilgan'}
                </div>
              </div>

              {/* Card 2: O'rtacha Aniqlik */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  O'rtacha Aniqlik
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {userProg.overall_accuracy ?? user.overallAccuracy ?? 0}%
                </div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {(userProg.overall_accuracy ?? 0) > 0 ? 'Moslashuvchan diagnostika' : 'Hali savol yechilmadi'}
                </div>
              </div>

              {/* Card 3: Topshirilgan Mock Testlar */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Topshirilgan Mocklar
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {mockTestsCompleted}
                </div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {mockTestsCompleted > 0 ? 'Rasmiy topshirilgan testlar' : 'Mock topshirilmagan'}
                </div>
              </div>
            </div>

            {/* SAT Section Breakdown: Reading & Writing vs Math */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Target size={14} className="text-[#E07A5F]" />
                  <span>SAT Ball Taqsimoti &amp; Maqsad (1600 Standarti)</span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  Maqsad: {targetScore} / 1600
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* RW Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Reading &amp; Writing</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {Math.min(800, Math.round((targetScore || 1550) * 0.49 / 10) * 10)} / 800
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(Math.min(800, Math.round((targetScore || 1550) * 0.49 / 10) * 10) / 800) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Math Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Mathematics</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {Math.min(800, (targetScore || 1550) - Math.min(800, Math.round((targetScore || 1550) * 0.49 / 10) * 10))} / 800
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${(Math.min(800, (targetScore || 1550) - Math.min(800, Math.round((targetScore || 1550) * 0.49 / 10) * 10)) / 800) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* IELTS Track Cards */
          <div className="space-y-4">
            {/* Top IELTS Target Band Selector Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <Award size={15} />
                    <span>IELTS Maqsadli Band (Target Band)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    O'zingiz erishmoqchi bo'lgan maqsadli bandni tanlang — diagnostika shunga moslashadi
                  </p>
                </div>

                {/* Target Band Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleUpdateTargetBand(b)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        ieltsTargetBand === b
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {b.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 Skills Progress Bars Grid */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Layers size={14} className="text-orange-500" />
                <span>4-Ko‘nikma Bo‘yicha Joriy Natijalar (9.0 Shkalasi)</span>
              </div>

              {(() => {
                const latestSub = ieltsSubmissions[0];
                const listBand = Number(latestSub?.listeningBand ?? user.ieltsListeningBand ?? 7.5);
                const readBand = Number(latestSub?.readingBand ?? user.ieltsReadingBand ?? 7.5);
                const writBand = Number(latestSub?.writingBand ?? user.ieltsWritingBand ?? 7.0);
                const spkBand = Number(latestSub?.speakingBand ?? user.ieltsSpeakingBand ?? 7.0);

                const skills = [
                  { name: 'Listening', icon: Headphones, band: listBand, color: 'from-sky-500 to-blue-500' },
                  { name: 'Reading', icon: BookOpen, band: readBand, color: 'from-emerald-500 to-teal-500' },
                  { name: 'Writing', icon: PenTool, band: writBand, color: 'from-amber-500 to-orange-500' },
                  { name: 'Speaking', icon: Mic, band: spkBand, color: 'from-purple-500 to-indigo-500' },
                ];

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skills.map((s) => {
                      const Icon = s.icon;
                      const pct = Math.min(100, Math.round((s.band / 9) * 100));
                      return (
                        <div key={s.name} className="space-y-1.5 p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                              <Icon size={13} className="text-slate-400" />
                              {s.name}
                            </span>
                            <span className="font-bold text-[#0F172A] dark:text-white">
                              Band {s.band.toFixed(1)} <span className="text-slate-400 text-[10px]">/ 9.0</span>
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* 3 Metric Cards Grid for IELTS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Umumiy Baholangan Band
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-orange-600 dark:text-orange-400">
                  {(() => {
                    const sub = ieltsSubmissions[0];
                    const l = Number(sub?.listeningBand ?? user.ieltsListeningBand ?? 7.5);
                    const r = Number(sub?.readingBand ?? user.ieltsReadingBand ?? 7.5);
                    const w = Number(sub?.writingBand ?? user.ieltsWritingBand ?? 7.0);
                    const s = Number(sub?.speakingBand ?? user.ieltsSpeakingBand ?? 7.0);
                    const overall = (l + r + w + s) / 4;
                    return (Math.round(overall * 2) / 2).toFixed(1);
                  })()}
                </div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  4 ta ko'nikma o'rtachasi
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Jami Amaliyot Vaqti
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {Math.max(12, ieltsSubmissions.length * 2.5 + Math.round((userProg.total_questions_done || 0) * 0.1))}h
                </div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  Audio &amp; matn tahlillari
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Topshirilgan Mocklar
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {ieltsSubmissions.length}
                </div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {ieltsSubmissions.length > 0 ? "To'liq simulyatsiyalar" : "Hali topshirilmadi"}
                </div>
              </div>
            </div>

            {/* Recent IELTS Mocks List */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  So'nggi IELTS Mock Natijalari
                </span>
                <span className="text-[11px] text-slate-400 lowercase">
                  {ieltsSubmissions.length} ta yozuv
                </span>
              </div>

              {ieltsSubmissions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-mono space-y-2">
                  <p>Hozircha topshirilgan IELTS mock imtihoni mavjud emas.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') window.location.hash = '#/mocks';
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    <span>IELTS Mock Topshirish</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {ieltsSubmissions.slice(0, 5).map((sub: any, idx: number) => (
                    <div
                      key={sub.testId || idx}
                      className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {sub.testTitle || `IELTS Mock Test #${idx + 1}`}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Yaqinda'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500">
                          <span>L: {sub.listeningBand ?? 7.0}</span>
                          <span>•</span>
                          <span>R: {sub.readingBand ?? 7.0}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-bold text-xs">
                          Band {sub.overallBand ?? '7.0'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: Xavfsizlik & Chiqish */}
      <section
        aria-label="Xavfsizlik va Chiqish"
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs space-y-5 transition-colors"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Shield size={16} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Xavfsizlik & Chiqish
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Parolni yangilash va akkauntdan chiqish boshqaruvi
            </p>
          </div>
        </div>

        {/* Password Update Sub-form */}
        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
            <KeyRound size={14} className="text-[#E07A5F]" />
            <span>Parolni o'zgartirish</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="password"
              placeholder="Yangi parol (kamida 6 belgi)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] transition-colors"
            />
            <input
              type="password"
              placeholder="Yangi parolni tasdiqlang"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] transition-colors"
            />
          </div>

          {passwordFeedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <CheckCircle2 size={14} className="shrink-0" />
              ) : (
                <AlertCircle size={14} className="shrink-0" />
              )}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold hover:bg-[#E07A5F] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
            >
              {isUpdatingPassword ? 'Yangilanmoqda...' : 'Parolni Yangilash'}
            </button>
          </div>
        </form>

        {/* Log Out Button */}
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Tizimdan chiqish
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Joriy qurilmadagi faol sessiyani yakunlash
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Chiqish</span>
          </button>
        </div>

        {/* Danger Zone: Permanent Account Deletion */}
        <div className="pt-4 border-t border-rose-200/60 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Hisobni butunlay o'chirish
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Profilingiz, natijalaringiz va xatolar omborini bulutli bazadan qaytarib bo'lmas tarzda o'chirish
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 size={14} />
            <span>Hisobni o'chirish</span>
          </button>
        </div>
      </section>

      {/* Edit Profile Modal for instant Supabase cloud synchronization */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={{
          ...user,
          fullName,
          username,
          phoneNumber,
          targetScore,
          targetExamDate,
        }}
        onSaveSuccess={(updated) => {
          setUser(updated);
          setFullName(updated.fullName);
          setUsername(updated.username);
          setPhoneNumber(updated.phoneNumber || '');
          setTargetScore(updated.targetScore || 1550);
          setTargetExamDate(updated.targetExamDate?.slice(0, 10) || '2026-10-03');
          onUpdateUser?.(updated);
        }}
      />

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-rose-200 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Hisobni butunlay o'chirish
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Bu amalni ortga qaytarib bo'lmaydi.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Barcha test natijalaringiz, xatolar omboringiz va shaxsiy ma'lumotlaringiz Supabase bulut bazasidan butunlay o'chiriladi.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Tasdiqlash uchun <span className="font-bold text-rose-600">O'CHIRISH</span> so'zini yozing:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="O'CHIRISH"
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-rose-500"
              />
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-400">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== "O'CHIRISH"}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? "O'chirilmoqda..." : "Ha, hisobni o'chirish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
