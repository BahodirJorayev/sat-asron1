'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Layers,
  BookOpen,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { ExamCountdownWidget } from '../../components/dashboard/ExamCountdownWidget';
import { AnnouncementBanner } from '../../components/dashboard/AnnouncementBanner';
import { supabase } from '../../lib/supabase';

export default function DashboardPage() {
  const [targetExamDate, setTargetExamDate] = useState<string>('2026-10-03T08:00:00');
  const [stats, setStats] = useState({
    streakDays: 0,
    questionsDone: 0,
    overallAccuracy: 0,
    mistakesCount: 0,
  });

  // Load user data / stats if authenticated
  useEffect(() => {
    let isMounted = true;
    const loadUserStats = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeUser = authData?.user;

        if (activeUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('streak_days, total_questions_done, overall_accuracy, target_exam_date')
            .eq('id', activeUser.id)
            .single();

          if (profile && isMounted) {
            setStats({
              streakDays: profile.streak_days || 0,
              questionsDone: profile.total_questions_done || 0,
              overallAccuracy: profile.overall_accuracy || 0,
              mistakesCount: 0,
            });
            if (profile.target_exam_date) {
              setTargetExamDate(profile.target_exam_date);
            }
          }
        }
      } catch (err) {
        // Fallback to defaults
      }
    };

    loadUserStats();
    return () => {
      isMounted = false;
    };
  }, []);


  return (
    <div className="space-y-4 md:space-y-6 font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors w-full">
      {/* 1. Header Strip: Minimalist Identification */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
          Uy
        </h1>
      </header>

      {/* 2. Dismissible Platform Announcement Banner (Synced with Supabase & localStorage) */}
      <AnnouncementBanner targetRoute="dashboard" />

      {/* 3. Scaled & Optimized Exam Countdown Timer Widget */}
      <ExamCountdownWidget
        initialTargetDate={targetExamDate}
        onTargetDateChange={(newDate) => setTargetExamDate(newDate)}
      />

      {/* 4. Core Metrics: Compact High-Density Triad */}
      <section aria-label="Asosiy Metrikalar" className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Metric 1: Streak */}
        <div className="p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold truncate">
              Streak
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              {stats.streakDays > 0 ? 'Faol' : 'Nol'}
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {stats.streakDays} <span className="text-[10px] sm:text-xs font-normal text-slate-400">Kun</span>
          </div>
        </div>

        {/* Metric 2: Questions Done */}
        <div className="p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold truncate">
              Savollar
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] truncate">
            {stats.questionsDone} <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ 3k</span>
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold truncate">
              Aniqlik
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {stats.overallAccuracy}%
          </div>
        </div>
      </section>

      {/* 5. Quick Launch Modules (Punchy Badges, Zero Text Clutter) */}
      <section aria-label="Asosiy Modullar" className="space-y-2.5 sm:space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Asosiy Modullar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          {/* Module 1: Savollar */}
          <Link
            href="/questions"
            className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 hover:border-[#E07A5F]/50 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 text-[#E07A5F]">
                <Layers size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Savollar
                </div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Module 2: Testlar */}
          <Link
            href="/mocks"
            className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <FileText size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Testlar
                </div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Module 3: Lug'at */}
          <Link
            href="/vocabulary"
            className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <BookOpen size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Lug'at
                </div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Module 4: Hamjamiyat */}
          <Link
            href="/chat"
            className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Hamjamiyat
                </div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>
        </div>
      </section>

      {/* 6. Recent Activity: Xatolar */}
      <section aria-label="Xatolar Ombori" className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Xatolar Ombori
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {stats.mistakesCount > 0 ? `${stats.mistakesCount} ta xato` : 'Xatolar mavjud emas'}
            </div>
          </div>
        </div>

        <Link
          href="/mistakes"
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A0F1D] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors flex items-center gap-1"
        >
          <span>Ko'rish</span>
          <ArrowUpRight size={13} />
        </Link>
      </section>
    </div>
  );
}
