'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Database,
  BookOpen,
  Swords,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { ExamCountdownWidget } from '../../components/dashboard/ExamCountdownWidget';

export default function DashboardPage() {
  const [targetExamDate, setTargetExamDate] = useState<string>('2026-10-03T08:00:00');

  // Baseline 0-state statistics (no mock inflated numbers)
  const streakDays = 0;
  const questionsDone = 0;
  const overallAccuracy = 0;
  const diagnosticScore = 0;
  const mistakesCount = 0;

  const todayFormatted = new Date().toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 font-sans text-[#F8FAFC]">
      {/* 1. Header Strip: Student Identity & Academic Date */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#1E293B]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Talaba Boshqaruv Paneli
          </h1>
          <p className="text-xs font-mono text-[#64748B] mt-0.5 font-medium">
            {todayFormatted} • Digital SAT Tayyorgarlik Markazi
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs font-mono text-[#94A3B8] self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
          <span>MST Adaptiv Tizim Faol</span>
        </div>
      </header>

      {/* 2. Prominent Exam Countdown Timer Widget */}
      <ExamCountdownWidget
        initialTargetDate={targetExamDate}
        onTargetDateChange={(newDate) => setTargetExamDate(newDate)}
      />

      {/* 3. Core Metrics Grid: Clean 0-State Baseline (Zero Emojis, Crisp Monospace) */}
      <section aria-label="Asosiy Metrikalar" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Streak */}
        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
            Ketma-ketlik (Streak)
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#F8FAFC] tracking-tight">
              {streakDays} <span className="text-sm font-normal text-[#64748B]">Kun</span>
            </div>
          </div>
          <div className="text-xs text-[#64748B] font-mono">
            Mashg‘ulotni boshlang va streakni yoqing
          </div>
        </div>

        {/* Metric 2: Questions Done */}
        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
            Ishlangan Savollar
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#F8FAFC] tracking-tight">
              {questionsDone} <span className="text-sm font-normal text-[#64748B]">/ 3,000+</span>
            </div>
          </div>
          <div className="text-xs text-[#64748B] font-mono">
            Savollar bankidan test yechilmagan
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
            O‘rtacha Aniqlik
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#F8FAFC] tracking-tight">
              {overallAccuracy}%
            </div>
          </div>
          <div className="text-xs text-[#64748B] font-mono">
            Diagnostik testdan so‘ng hisoblanadi
          </div>
        </div>
      </section>

      {/* 4. Quick Launch Modules Matrix (Consolidated 4-Action Grid) */}
      <section aria-label="Asosiy Modullar" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
            Asosiy Bo‘limlar
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Module 1: Bluebook Mock Tests */}
          <Link
            href="/dashboard/qbank?tab=mock-tests"
            className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] hover:border-[#334155] transition-all text-left flex items-start justify-between group shadow-xs cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#F8FAFC]">
                  Bluebook Testlar
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Rasmiy MST formatidagi to‘liq adaptiv testlar to‘plami.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </Link>

          {/* Module 2: Question Bank (SQB) */}
          <Link
            href="/dashboard/qbank"
            className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] hover:border-[#334155] transition-all text-left flex items-start justify-between group shadow-xs cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#F8FAFC]">
                  Savollar Banki (SQB)
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                3,000+ filtrlangan rasmiy College Board savollar bazasi.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </Link>

          {/* Module 3: SAT Vocab (400 Words) */}
          <Link
            href="/dashboard/qbank?tab=vocab"
            className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] hover:border-[#334155] transition-all text-left flex items-start justify-between group shadow-xs cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#F8FAFC]">
                  SAT Lug‘at (400 So‘z)
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Spaced Repetition (SRS) orqali so‘z boyligini oshirish.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </Link>

          {/* Module 4: Multiplayer Arena */}
          <Link
            href="/dashboard/community?view=arena"
            className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E293B] hover:border-[#334155] transition-all text-left flex items-start justify-between group shadow-xs cursor-pointer"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#F8FAFC]">
                  Multiplayer Arena
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                1v1 real vaqtdagi tezkor bilim bellashuvi.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </Link>
        </div>
      </section>

      {/* 5. Recent Activity & Mistake Vault Section (Clean Empty State) */}
      <section aria-label="So‘nggi Faoliyat" className="p-5 sm:p-6 rounded-2xl bg-[#0D1527] border border-[#1E293B] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#F8FAFC]">
            So‘nggi Faoliyat
          </h3>
          <Link
            href="/dashboard/vault"
            className="text-xs font-mono font-medium text-[#E07A5F] hover:underline cursor-pointer"
          >
            Xatolar banki ({mistakesCount}) →
          </Link>
        </div>

        <div className="py-8 text-center space-y-2 border border-dashed border-[#1E293B] rounded-xl bg-[#0A0F1D]/40">
          <p className="text-xs text-[#94A3B8] font-mono">
            Hozircha mashqlar bajarilmadi. Savollar bankidan test boshlang.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard/qbank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#2D3748] text-[#F8FAFC] text-xs font-mono font-semibold transition-colors"
            >
              <span>Savollar bankiga o‘tish</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
