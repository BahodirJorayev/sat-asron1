'use client';

import React, { useState } from 'react';
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

export default function DashboardPage() {
  const [targetExamDate, setTargetExamDate] = useState<string>('2026-10-03T08:00:00');

  // Baseline metrics
  const streakDays = 0;
  const questionsDone = 0;
  const overallAccuracy = 0;
  const mistakesCount = 0;

  const todayFormatted = new Date().toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors pb-12 max-w-6xl mx-auto">
      {/* 1. Header Strip: Minimalist Identification */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Uy
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {todayFormatted}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>MST Adaptiv</span>
        </div>
      </header>

      {/* 2. Prominent Exam Countdown Timer Widget */}
      <ExamCountdownWidget
        initialTargetDate={targetExamDate}
        onTargetDateChange={(newDate) => setTargetExamDate(newDate)}
      />

      {/* 3. Core Metrics: Data-Dense Triad (Zero Descriptive Noise) */}
      <section aria-label="Asosiy Metrikalar" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Streak
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              {streakDays > 0 ? 'Faol' : 'Nol'}
            </span>
          </div>
          <div className="my-2 text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {streakDays} <span className="text-xs font-normal text-slate-400">Kun</span>
          </div>
        </div>

        {/* Metric 2: Questions Done */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Savollar
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              3,000+
            </span>
          </div>
          <div className="my-2 text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {questionsDone} <span className="text-xs font-normal text-slate-400">/ 3,000</span>
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Aniqlik
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              MST
            </span>
          </div>
          <div className="my-2 text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {overallAccuracy}%
          </div>
        </div>
      </section>

      {/* 4. Quick Launch Modules (Punchy 1-3 Word Badges, Zero Text Clutter) */}
      <section aria-label="Asosiy Modullar" className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Asosiy Modullar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Module 1: Savollar */}
          <Link
            href="/dashboard/practice"
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#E07A5F]">
                <Layers size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Savollar
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  3,000+ Savol
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Module 2: Testlar */}
          <Link
            href="/mocks"
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <FileText size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Testlar
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  Rasmiy MST
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Module 3: Lug'at */}
          <Link
            href="/vocabulary"
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <BookOpen size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Lug'at
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  SRS Flashcard
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>

          {/* Module 4: Hamjamiyat */}
          <Link
            href="/chat"
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Hamjamiyat
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  Kanallar & Guruhlar
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>
        </div>
      </section>

      {/* 5. Recent Activity: Xatolar */}
      <section aria-label="Xatolar" className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Xatolar
            </div>
            <div className="text-xs font-mono text-slate-400">
              {mistakesCount > 0 ? `${mistakesCount} ta xato` : 'Xatolar mavjud emas'}
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/mistakes"
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A0F1D] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors flex items-center gap-1"
        >
          <span>Ko'rish</span>
          <ArrowUpRight size={13} />
        </Link>
      </section>
    </div>
  );
}
