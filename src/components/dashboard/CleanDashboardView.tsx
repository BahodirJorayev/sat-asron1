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
}

export const CleanDashboardView: React.FC<Props> = ({
  user,
  mistakes = [],
  mockTests = [],
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Salom, {studentName}
          </h1>
          <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-medium">
            {todayFormatted} • Digital SAT Boshqaruv Markazi
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8] self-start sm:self-auto shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
          <span>MST Adaptiv Tizim Faol</span>
        </div>
      </header>

      {/* 2. Prominent Exam Countdown Timer Widget */}
      <ExamCountdownWidget
        initialTargetDate={user.targetExamDate || '2026-10-03T08:00:00'}
        userId={user.id}
      />

      {/* 3. Core Metrics Grid: Clean 0-State Baseline (Zero Emojis, Crisp Monospace) */}
      <section aria-label="Asosiy Metrikalar" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-semibold">
            Ketma-ketlik (Streak)
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {streakDays} <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">Kun</span>
            </div>
          </div>
          <div className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            {streakDays > 0 ? 'Mashg‘ulotlar davom etmoqda' : 'Mashqni boshlang va streakni yoqing'}
          </div>
        </div>

        {/* Metric 2: Questions Done */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-semibold">
            Ishlangan Savollar
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {questionsDone} <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">/ 3,000+</span>
            </div>
          </div>
          <div className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            {questionsDone > 0 ? `${questionsDone} ta savol yechildi` : 'Hali savol yechilmadi'}
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between transition-colors">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-semibold">
            O‘rtacha Aniqlik
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {accuracy}%
            </div>
          </div>
          <div className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            {accuracy > 0 ? 'Hozirgi o‘rtacha ko‘rsatkich' : 'Diagnostik testdan so‘ng hisoblanadi'}
          </div>
        </div>
      </section>

      {/* 4. Quick Launch Matrix (4 Consolidated Rectangular Action Tiles) */}
      <section aria-label="Asosiy Modullar" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Asosiy Bo‘limlar
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Bluebook Mock Tests */}
          <button
            type="button"
            onClick={handleLaunchFirstBluebook}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Bluebook Testlar
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Rasmiy MST formatidagi to‘liq adaptiv testlar to‘plami.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>

          {/* Tile 2: Question Bank (SQB) */}
          <button
            type="button"
            onClick={() => onOpenQuestionBank && onOpenQuestionBank()}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Savollar Banki (SQB)
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                3,000+ saralangan rasmiy College Board savollar bazasi.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>

          {/* Tile 3: SAT Vocab (400 Words) */}
          <button
            type="button"
            onClick={() => setIsVocabModalOpen(true)}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  SAT Lug‘at (400 So‘z)
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Spaced Repetition (SRS) orqali so‘z boyligini oshirish.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>

          {/* Tile 4: Multiplayer Arena */}
          <button
            type="button"
            onClick={() => setIsArenaModalOpen(true)}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-[#E07A5F] stroke-[1.8]" />
                <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Multiplayer Arena
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                1v1 real vaqtdagi tezkor bilim bellashuvi.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>
        </div>
      </section>

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
