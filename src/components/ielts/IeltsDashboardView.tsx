'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Lock,
  ArrowRight,
  Flame,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  HelpCircle,
  BarChart3,
  FileText,
  Target
} from 'lucide-react';
import { User, IeltsMockTest } from '../../types';
import { INITIAL_IELTS_MOCK_TESTS, calculateIeltsOverallBand } from '../../data/ieltsDatabase';

interface IeltsDashboardViewProps {
  user: User;
  onNavigateTab: (tab: string) => void;
  onOpenClassroomTest?: () => void;
  onOpenPaywall?: () => void;
}

export const IeltsDashboardView: React.FC<IeltsDashboardViewProps> = ({
  user,
  onNavigateTab,
  onOpenClassroomTest,
  onOpenPaywall,
}) => {
  // Target Band State (persisted)
  const [targetBand, setTargetBand] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asron_ielts_target_band');
      if (saved) return Number(saved);
    }
    return 7.5;
  });

  const handleSelectTargetBand = (band: number) => {
    setTargetBand(band);
    if (typeof window !== 'undefined') {
      localStorage.setItem('asron_ielts_target_band', String(band));
    }
  };

  // Skill Bands (dynamic mock or stored)
  const [skillBands, setSkillBands] = useState({
    listening: 7.5,
    reading: 8.0,
    writing: 6.5,
    speaking: 7.0,
  });

  const currentOverallBand = useMemo(() => {
    return calculateIeltsOverallBand(
      skillBands.listening,
      skillBands.reading,
      skillBands.writing,
      skillBands.speaking
    );
  }, [skillBands]);

  // Daily Action Plan Tasks (with interactive check persistence)
  const [dailyTasks, setDailyTasks] = useState<Array<{ id: string; title: string; skill: string; completed: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asron_ielts_daily_tasks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      { id: 'task-1', title: 'Listening Section 3 & 4 Audio Speedrun (20 savol)', skill: 'Listening', completed: true },
      { id: 'task-2', title: 'Reading T/F/NG Matn Tahlili va 10 ta xato tekshiruvi', skill: 'Reading', completed: false },
      { id: 'task-3', title: 'Writing Task 2: Opinion Essay kirish va 2 ta tana paragraf', skill: 'Writing', completed: false },
      { id: 'task-4', title: 'Speaking Part 2: 2 daqiqalik Audio Monolog Yozish', skill: 'Speaking', completed: false },
    ];
  });

  const toggleTask = (id: string) => {
    setDailyTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('asron_ielts_daily_tasks', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const completedTasksCount = dailyTasks.filter((t) => t.completed).length;

  // Classroom Tests Count
  const classroomTests = useMemo(() => {
    return INITIAL_IELTS_MOCK_TESTS.filter((t) => t.category === 'CLASSROOM_TEST');
  }, []);

  return (
    <div className="space-y-6 pb-12 font-sans select-none text-[#0F172A] dark:text-[#F8FAFC]">
      {/* 1. TOP HERO: Executive IELTS Banner & Target Band Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-[#0C1427] via-[#111C36] to-[#0A0F1D] text-white border border-white/10 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide">
              <Sparkles size={13} />
              <span>IELTS ACADEMIC &amp; GENERAL INTELLIGENCE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assalomu alaykum, {user.fullName || 'Talaba'}! 👋
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              IELTS bo‘yicha shaxsiy o‘quv monitoringingiz. Cambridge 19 rasmiy standartlari, maxsus ustoz testlari va 4 ta asosiy ko‘nikma nazorati.
            </p>
          </div>

          {/* Right Card: Current Band & Target Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            {/* Overall Band Pill */}
            <div className="flex items-center gap-3 pr-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex flex-col items-center justify-center font-mono shadow-inner">
                <span className="text-[10px] uppercase font-bold text-emerald-300">Band</span>
                <span className="text-2xl font-black leading-none">{currentOverallBand.toFixed(1)}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Taxminiy Natija</div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {currentOverallBand >= 8.0 ? 'Expert User' : currentOverallBand >= 7.0 ? 'Good User' : 'Competent User'}
                </div>
              </div>
            </div>

            {/* Target Band Selector */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Maqsadli Ball</span>
                <span className="text-emerald-400 font-bold">{targetBand.toFixed(1)} Band</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[6.5, 7.0, 7.5, 8.0, 8.5].map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => handleSelectTargetBand(band)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      targetBand === band
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {band.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-SKILL PERFORMANCE MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Listening Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Headphones size={16} />
              </div>
              <span>Listening</span>
            </div>
            <span className="text-base font-extrabold font-mono text-sky-600 dark:text-sky-400">
              {skillBands.listening.toFixed(1)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Section 1–4 O‘zlashtirish</span>
              <span className="font-bold">83%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: '83%' }} />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            32/40 to‘g‘ri javob (O‘rtacha)
          </div>
        </div>

        {/* Reading Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <BookOpen size={16} />
              </div>
              <span>Reading</span>
            </div>
            <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {skillBands.reading.toFixed(1)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>T/F/NG &amp; Headings</span>
              <span className="font-bold">88%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            35/40 to‘g‘ri javob (O‘rtacha)
          </div>
        </div>

        {/* Writing Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <PenTool size={16} />
              </div>
              <span>Writing</span>
            </div>
            <span className="text-base font-extrabold font-mono text-purple-600 dark:text-purple-400">
              {skillBands.writing.toFixed(1)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Task 1 &amp; Task 2</span>
              <span className="font-bold">72%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Grammar &amp; Cohesion ustida ishlash
          </div>
        </div>

        {/* Speaking Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Mic size={16} />
              </div>
              <span>Speaking</span>
            </div>
            <span className="text-base font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {skillBands.speaking.toFixed(1)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Fluency &amp; Lexicon</span>
              <span className="font-bold">78%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Part 2 Monologlar mashg‘uloti
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: Score Progression & Daily Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Score Progression Graph */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={18} />
                <span>IELTS Ballar O‘sish Dinamikasi</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Diagnostikadan boshlab so‘nggi topshirilgan mock testlargacha bo‘lgan traektoriya.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold self-start sm:self-auto">
              +1.5 Band O‘sish
            </span>
          </div>

          {/* Clean Interactive SVG Progression Graph */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200 dark:border-[#1E293B]">
            <div className="h-44 w-full flex items-end justify-between gap-2 px-2 pt-6">
              {[
                { label: 'Diag Test', band: 6.0, date: '15-Yan' },
                { label: 'Mock #1', band: 6.5, date: '01-Fev' },
                { label: 'Mock #2', band: 7.0, date: '15-Fev' },
                { label: 'Class W3', band: 7.0, date: '01-Mar' },
                { label: 'Oxirgi Mock', band: 7.5, date: '12-Mar' },
                { label: 'Maqsad', band: targetBand, date: 'Natija', isTarget: true },
              ].map((point, idx) => {
                const heightPercent = Math.min(100, Math.max(20, ((point.band - 5.0) / 4.0) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className={`text-[11px] font-mono font-bold transition-transform group-hover:-translate-y-1 ${
                      point.isTarget ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {point.band.toFixed(1)}
                    </span>

                    <div className="w-full max-w-[36px] bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden h-28 flex items-end">
                      <div
                        className={`w-full transition-all duration-500 rounded-t-lg ${
                          point.isTarget
                            ? 'bg-amber-500/80 border-t-2 border-amber-300'
                            : 'bg-emerald-500/80 hover:bg-emerald-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[55px]">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily Action Plan Checklist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Calendar size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Bugungi Action Plan
                </h3>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {completedTasksCount} / {dailyTasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {dailyTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-slate-500 dark:text-slate-400 line-through'
                      : 'bg-slate-50 dark:bg-[#0A0F1D] border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-[#F8FAFC] hover:border-emerald-500/50'
                  }`}
                >
                  <CheckCircle2
                    size={16}
                    className={`shrink-0 mt-0.5 transition-colors ${
                      task.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium leading-snug">{task.title}</div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-0.5 inline-block">
                      {task.skill}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Start IELTS Mock */}
          <button
            type="button"
            onClick={() => onNavigateTab('bluebook')}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>IELTS Mock Imtihonni Boshlash</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. 🔒 CLASSROOM TESTS SHORTCUT BANNER */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-purple-950/40 via-[#121A2F] to-[#0A0F1D] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
            <Lock size={22} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white">🔒 Maxsus Dars Testlari (Classroom Tests)</h4>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                {classroomTests.length} ta mavjud
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Ustozingiz bergan maxsus 4–8 xonali parol (masalan, <code>CORE-W3</code>) orqali guruh nazorat testlarini topshiring.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenClassroomTest) {
              onOpenClassroomTest();
            } else {
              onNavigateTab('bluebook');
            }
          }}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-md shadow-purple-600/20"
        >
          <span>Dars Testlariga O‘tish</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
