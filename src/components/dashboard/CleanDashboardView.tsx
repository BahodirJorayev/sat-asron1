import React, { useState } from 'react';
import {
  FileText,
  Database,
  BookOpen,
  Swords,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { User, MistakeVaultItem, MockTest, Question } from '../../types';
import { VocabTrainerModal } from '../VocabTrainerModal';
import { MultiplayerArenaModal } from '../MultiplayerArenaModal';
import { ExamCountdownWidget } from './ExamCountdownWidget';

interface Props {
  user: User;
  mistakes?: MistakeVaultItem[];
  mockTests?: MockTest[];
  onOpenDailyWorkout?: () => void;
  onOpenDiagnostic?: () => void;
  onOpenMistakeVault?: () => void;
  onStartBluebookTest?: (test: MockTest) => void;
  onOpenQuestionBank?: (subSkill?: string) => void;
  onOpenCommunity?: () => void;
  onOpenRoadmap?: () => void;
  onOpenPaywall?: () => void;
  onOpenSocraticTutor?: (question: Question) => void;
  onOpenMilestoneModal?: (days?: number) => void;
  onOpenProfile?: () => void;
  siteBranding?: any;
  platformContent?: Record<string, any>;
}

export const CleanDashboardView: React.FC<Props> = ({
  user,
  mistakes = [],
  mockTests = [],
  platformContent,
  onOpenDiagnostic,
  onOpenMistakeVault,
  onStartBluebookTest,
  onOpenQuestionBank,
  onOpenCommunity,
  onOpenRoadmap,
  onOpenPaywall,
  onOpenSocraticTutor,
  onOpenMilestoneModal,
  onOpenProfile,
  siteBranding,
}) => {
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);

  // Dynamic Dashboard Content from Supabase platform_content
  const dAnn = platformContent?.dashboard_announcements;
  const activeAnnouncements = Array.isArray(dAnn?.content)
    ? dAnn.content.filter((a: any) => a.is_active !== false)
    : [];

  const dRes = platformContent?.recommended_resources;
  const activeResources = Array.isArray(dRes?.content)
    ? dRes.content.filter((r: any) => r.is_active !== false)
    : [];

  const todayFormatted = new Date().toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const studentName = user.fullName || user.username || 'Talaba';
  const streakDays = user.streakDays || 0;
  const questionsDone = user.totalQuestionsDone || 0;
  const accuracy = user.overallAccuracy || 0;

  const handleLaunchFirstBluebook = () => {
    if (mockTests && mockTests.length > 0 && onStartBluebookTest) {
      onStartBluebookTest(mockTests[0]);
    } else if (onOpenQuestionBank) {
      onOpenQuestionBank();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      {/* 1. Header Strip: Student Identity & Portal Context */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Salom, {studentName}
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
        initialTargetDate={user.targetExamDate || '2026-10-03T08:00:00'}
        userId={user.id}
      />

      {/* Dynamic Official Announcements from Supabase platform_content */}
      {activeAnnouncements.length > 0 && (
        <section aria-label="Rasmiy E'lonlar" className="space-y-3">
          {activeAnnouncements.map((ann: any) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border-l-4 border-l-[#E07A5F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E07A5F]/15 text-[#E07A5F]">
                    E'LON
                  </span>
                  {ann.date && (
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {ann.date}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  {ann.title}
                </h4>
                {ann.text && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-3xl">
                    {ann.text}
                  </p>
                )}
              </div>
              {ann.link && (
                <button
                  type="button"
                  onClick={() => {
                    if (ann.link === 'mocks' && onStartBluebookTest && mockTests.length > 0) {
                      onStartBluebookTest(mockTests[0]);
                    } else if (onOpenQuestionBank) {
                      onOpenQuestionBank();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold shrink-0 self-start sm:self-auto cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
                >
                  O'tish →
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 3. Core Metrics: Data-Dense Triad */}
      <section aria-label="Asosiy Metrikalar" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-semibold">
              Streak
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              {streakDays > 0 ? 'Faol' : 'Nol holat'}
            </span>
          </div>
          <div className="my-2 text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            {streakDays} <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">Kun</span>
          </div>
          <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            Kundalik maqsad: 1 mashq
          </div>
        </div>

        {/* Metric 2: Questions Done */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-semibold">
              Ishlangan
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              3,000+ Baza
            </span>
          </div>
          <div className="my-2 text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            {questionsDone} <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">/ 3,000</span>
          </div>
          <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            College Board bazasi
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-semibold">
              Aniqlik
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              MST
            </span>
          </div>
          <div className="my-2 text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            {accuracy}%
          </div>
          <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            Diagnostik natija
          </div>
        </div>
      </section>

      {/* 4. Quick Launch Modules (Punchy 1-3 Word Badges, Zero Text Clutter) */}
      <section aria-label="Asosiy Modullar" className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Asosiy Modullar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Bluebook Mock Tests */}
          <button
            type="button"
            onClick={handleLaunchFirstBluebook}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <FileText size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Bluebook Mocklar
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  Rasmiy Format · Moslashuvchan
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>

          {/* Tile 2: Question Bank (SQB) */}
          <button
            type="button"
            onClick={() => onOpenQuestionBank && onOpenQuestionBank()}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#E07A5F]">
                <Database size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Savollar Banki
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  3,000+ Savol · Rasmiy Filtrlar
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>

          {/* Tile 3: SAT Vocab */}
          <button
            type="button"
            onClick={() => setIsVocabModalOpen(true)}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <BookOpen size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  SAT Lug‘at
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  SRS Flashcard · 4 Kitob
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>

          {/* Tile 4: Multiplayer Arena */}
          <button
            type="button"
            onClick={() => setIsArenaModalOpen(true)}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Swords size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Multiplayer Arena
                </div>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-400">
                  1v1 Jonli Bellashuv
                </span>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>
      </section>

      {/* Dynamic Recommended Resources from Supabase platform_content */}
      {activeResources.length > 0 && (
        <section aria-label="Tavsiya Etiladigan Resurslar" className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Tavsiya Etiladigan Resurslar & Qo'llanmalar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeResources.map((res: any) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors"
              >
                <div className="space-y-1.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30">
                    {res.tag || "TAVSIYA"}
                  </span>
                  <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                    {res.title}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Recent Activity & Mistake Vault Section (Clean Empty State) */}
      <section aria-label="So‘nggi Faoliyat" className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            So‘nggi Faoliyat
          </h3>
          {mistakes.length > 0 ? (
            <button
              type="button"
              onClick={onOpenMistakeVault}
              className="text-xs font-mono font-medium text-[#E07A5F] hover:underline cursor-pointer"
            >
              Xatolar ombori ({mistakes.length}) →
            </button>
          ) : (
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              Xatolar mavjud emas
            </span>
          )}
        </div>

        {questionsDone === 0 && mistakes.length === 0 ? (
          <div className="py-8 text-center space-y-2 border border-dashed border-[#E2E8F0] dark:border-[#1E293B] rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D]/40">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
              Hozircha mashqlar bajarilmadi. Savollar bankidan test boshlang.
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">Umumiy Mashqlar</span>
              <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">{questionsDone} ta savol yechilgan</span>
            </div>
          </div>
        )}
      </section>

      {/* Modals for Quick Hubs */}
      <VocabTrainerModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
      />

      <MultiplayerArenaModal
        isOpen={isArenaModalOpen}
        onClose={() => setIsArenaModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
};
