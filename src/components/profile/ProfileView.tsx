'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { User } from '../../types';
import { supabase, saveUserProfile } from '../../lib/supabase';
import { ThemeToggle } from '../ThemeToggle';

interface ProfileViewProps {
  initialUser?: User;
  onSignOut?: () => void;
  onUpdateUser?: (updated: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialUser,
  onSignOut,
  onUpdateUser,
}) => {
  // 1. User State
  const [user, setUser] = useState<User>(() => {
    if (initialUser) return initialUser;
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
              phoneNumber: meta.phone || meta.phoneNumber || user.phoneNumber || '',
              planTier: (meta.plan_tier as any) || user.planTier || 'STANDARD',
              role: (meta.role as any) || user.role || 'STUDENT',
              streakDays: user.streakDays || 0,
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

          // Realtime cross-device synchronization (PC <-> Mobile)
          profileChannel = supabase
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
            .subscribe();
        }
      } catch (err) {
        console.warn('Profile fetch warning:', err);
      }
    };

    fetchProfile();

    // Check mock test attempts
    const fetchMockCount = async () => {
      try {
        const { count, error } = await supabase
          .from('mock_test_attempts')
          .select('*', { count: 'exact', head: true });
        if (!error && typeof count === 'number' && isMounted) {
          setMockTestsCompleted(count);
        }
      } catch (e) {}
    };
    fetchMockCount();

    return () => {
      isMounted = false;
      if (profileChannel) profileChannel.unsubscribe();
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
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-auth-token');
          window.location.href = '/';
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const initialLetter = (fullName || user.fullName || 'T')[0]?.toUpperCase() || 'T';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Dashboardga qaytish</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Profile Summary Card: Strict Zero-Badge Minimalism */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Clean Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xl sm:text-2xl font-bold shrink-0 shadow-2xs">
              {initialLetter}
            </div>

            {/* Clean User Credentials (Zero Badges) */}
            <div className="min-w-0 leading-snug space-y-0.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] truncate">
                {fullName || user.fullName || 'Foydalanuvchi'}
              </h1>
              <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                @{username || user.username || 'user'}
              </p>
              {email && (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate flex items-center gap-1.5 pt-0.5">
                  <Mail size={12} className="shrink-0 text-slate-400" />
                  <span>{email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Target Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] self-start sm:self-auto">
            <Target size={15} className="text-[#E07A5F]" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">
                Maqsadli Ball
              </div>
              <div className="text-xs sm:text-sm font-extrabold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                {targetScore} / 1600
              </div>
            </div>
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

      {/* SECTION 2: Akademik Natijalar (0-State Safe, Pure Academic Minimalism) */}
      <section
        aria-label="Akademik Natijalar"
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xs space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <BarChart3 size={16} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Akademik Natijalar
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Digital SAT mashqlari va sinov testlaridagi shaxsiy ko'rsatkichlar
            </p>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Ishlangan Savollar */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
            <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
              Ishlangan Savollar
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
              {user.totalQuestionsDone || 0}
            </div>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              3,000+ rasmiy savollar bazasidan
            </div>
          </div>

          {/* Card 2: O'rtacha Aniqlik */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
            <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
              O'rtacha Aniqlik
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
              {user.overallAccuracy || 0}%
            </div>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Moslashuvchan MST diagnostikasi
            </div>
          </div>

          {/* Card 3: Topshirilgan Mock Testlar */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
            <div className="text-[10px] font-mono uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">
              Mock Testlar
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
              {mockTestsCompleted}
            </div>
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Rasmiy 2-bosqichli simulyator
            </div>
          </div>
        </div>
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
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Chiqish</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
