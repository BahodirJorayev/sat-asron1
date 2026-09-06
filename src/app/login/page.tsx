'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase, setAuthCookie, mapSupabaseUserToAppUser } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Hisob topilmadi yoki parol noto‘g‘ri kiritildi. Iltimos, qayta tekshiring yoki ro‘yxatdan o‘ting.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error || !data.user) {
        setErrorMessage("Hisob topilmadi yoki parol noto‘g‘ri kiritildi. Iltimos, qayta tekshiring yoki ro‘yxatdan o‘ting.");
        setIsLoading(false);
        return; // HARD STOP - DO NOT REDIRECT
      }

      // Fetch live cloud profile to ensure instant multi-device hydration
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, target_score')
        .eq('id', data.user.id)
        .maybeSingle();

      const appUser = mapSupabaseUserToAppUser(data.user, {
        fullName: profile?.full_name,
        username: profile?.username,
        avatarUrl: profile?.avatar_url,
        targetScore: profile?.target_score,
      });

      setAuthCookie(appUser);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aurasat_user_profile', JSON.stringify(appUser));
        localStorage.setItem('aura_sat_auth_user', JSON.stringify(appUser));
      }

      // Force client navigation to dashboard
      router.push('/dashboard');
      router.refresh();
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setErrorMessage("Hisob topilmadi yoki parol noto‘g‘ri kiritildi. Iltimos, qayta tekshiring yoki ro‘yxatdan o‘ting.");
      setIsLoading(false);
      return; // HARD STOP
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage('');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google OAuth Error:', err);
      setErrorMessage(err.message || 'Google orqali kirishda xatolik yuz berdi.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:border-[#E07A5F]/60 transition-colors">
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-[#E07A5F] fill-current" fill="none">
                <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
                <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
                <path d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white">
              ASRON <span className="text-[#E07A5F]">SAT</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Platformaga Kirish
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Digital SAT tayyorgarligingizni davom ettiring
          </p>
        </div>

        {/* Card Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
          {/* Explicit Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Manzili
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="talaba@asronsat.uz"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Parol
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white font-bold text-xs shadow-md shadow-[#E07A5F]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-3 gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[11px] text-slate-400 font-medium">yoki</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1D] hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#E07A5F]" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Google orqali kirish</span>
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Hisobingiz yo'qmi? </span>
            <Link
              href="/register"
              className="font-bold text-[#E07A5F] hover:underline cursor-pointer"
            >
              Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
