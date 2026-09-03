import React, { useState, useEffect } from 'react';
import {
  FileText,
  Database,
  BookOpen,
  Swords,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Flame,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { User, MistakeVaultItem, MockTest, Question } from '../../types';
import { VocabTrainerModal } from '../VocabTrainerModal';
import { MultiplayerArenaModal } from '../MultiplayerArenaModal';

interface Props {
  user: User;
  mistakes?: MistakeVaultItem[];
  mockTests?: MockTest[];
  onOpenDailyWorkout: () => void;
  onOpenDiagnostic: () => void;
  onOpenMistakeVault: () => void;
  onStartBluebookTest: (test: MockTest) => void;
  onOpenQuestionBank: (subSkill?: string) => void;
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
  onOpenDailyWorkout,
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

  // Live Exam Countdown Timer
  const [countdownString, setCountdownString] = useState<string>('000K : 00S : 00D');

  useEffect(() => {
    const targetDateStr = user.targetExamDate || '2026-10-04T08:00:00';
    const targetTime = new Date(targetDateStr).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      const pad = (n: number, digits = 2) => n.toString().padStart(digits, '0');
      setCountdownString(`${pad(days, 3)}K : ${pad(hours)}S : ${pad(minutes)}D`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user.targetExamDate]);

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
    if (mockTests && mockTests.length > 0) {
      onStartBluebookTest(mockTests[0]);
    } else {
      onOpenQuestionBank();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans text-[#1E1B18] dark:text-[#F8FAFC]">
      {/* 1. Header Strip: Student Identity & Official Exam Clock */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1B18] dark:text-[#F8FAFC]">
            Salom, {studentName}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-medium">
            {todayFormatted} • Digital SAT Boshqaruv Markazi
          </p>
        </div>

        {/* SAT Countdown Box */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs self-start sm:self-auto">
          <Clock size={15} className="text-[#64748B] dark:text-[#94A3B8] shrink-0 stroke-[1.5]" />
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium text-[11px]">IMTIHON:</span>
            <span className="font-bold text-[#1E1B18] dark:text-[#F8FAFC] tracking-wider">{countdownString}</span>
          </div>
        </div>
      </header>

      {/* 2. Primary Focus Card: Daily Adaptive Workout */}
      <section className="bg-[#1E1B18] text-white dark:bg-[#121A2F] dark:border dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-semibold">
                Tavsiya
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Bugungi Reja
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Kunlik Adaptiv Mashq
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
                5 ta saralangan savol — O'zlashtirish va xatolarni tahlil qilish uchun
              </p>
            </div>

            {/* Meta Badges (Monospace) */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-neutral-300">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">10 daqiqa</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">Aralash Mavzular</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">SRS Leitner Faol</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenDailyWorkout}
              className="bg-[#E07A5F] hover:bg-[#d06d53] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs text-center"
            >
              Mashqni Boshlash
            </button>
          </div>
        </div>
      </section>

      {/* 3. Core Metrics Grid: Clean 0-State Baseline */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Ketma-ketlik (Streak)
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1E1B18] dark:text-[#F8FAFC]">
              {streakDays} Kun
            </div>
          </div>
          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {streakDays > 0 ? 'Mashg\'ulotlar davom etmoqda' : 'Mashqni boshlang va streakni yoqing'}
          </div>
        </div>

        {/* Metric 2: Questions Done */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Ishlangan Savollar
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1E1B18] dark:text-[#F8FAFC]">
              {questionsDone} <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">/ 3,000+</span>
            </div>
          </div>
          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {questionsDone > 0 ? `${questionsDone} ta savol yechildi` : 'Hali savol yechilmadi'}
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            O'rtacha Aniqlik
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1E1B18] dark:text-[#F8FAFC]">
              {accuracy}%
            </div>
          </div>
          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {accuracy > 0 ? 'Hozirgi o\'rtacha ko\'rsatkich' : 'Diagnostik testdan so\'ng hisoblanadi'}
          </div>
        </div>
      </section>

      {/* 4. Quick Launch Modules Matrix */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-mono">
            Asosiy Bo'limlar
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Bluebook Mock Tests */}
          <button
            onClick={handleLaunchFirstBluebook}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] hover:border-[#1E1B18] dark:hover:border-[#F8FAFC] transition-colors text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#1E1B18] dark:text-[#F8FAFC] stroke-[1.5]" />
                <span className="font-bold text-sm text-[#1E1B18] dark:text-[#F8FAFC]">
                  Bluebook Testlar
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Rasmiy MST formatidagi to'liq mock testlar.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E1B18] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>

          {/* Tile 2: Question Bank (SQB) */}
          <button
            onClick={() => onOpenQuestionBank()}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] hover:border-[#1E1B18] dark:hover:border-[#F8FAFC] transition-colors text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#1E1B18] dark:text-[#F8FAFC] stroke-[1.5]" />
                <span className="font-bold text-sm text-[#1E1B18] dark:text-[#F8FAFC]">
                  Savollar Banki (SQB)
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                3,000+ saralangan rasmiy savollar bazasi.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E1B18] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>

          {/* Tile 3: SAT Vocab (400 Words) */}
          <button
            onClick={() => setIsVocabModalOpen(true)}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] hover:border-[#1E1B18] dark:hover:border-[#F8FAFC] transition-colors text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#1E1B18] dark:text-[#F8FAFC] stroke-[1.5]" />
                <span className="font-bold text-sm text-[#1E1B18] dark:text-[#F8FAFC]">
                  SAT Lug'at (400 Words)
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Spaced Repetition (SRS) so'z kartochkalari.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E1B18] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>

          {/* Tile 4: Multiplayer Arena */}
          <button
            onClick={() => setIsArenaModalOpen(true)}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] hover:border-[#1E1B18] dark:hover:border-[#F8FAFC] transition-colors text-left flex items-start justify-between group cursor-pointer shadow-xs"
          >
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-[#1E1B18] dark:text-[#F8FAFC] stroke-[1.5]" />
                <span className="font-bold text-sm text-[#1E1B18] dark:text-[#F8FAFC]">
                  Multiplayer Arena
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                1v1 tezkor bilim bellashuvi.
              </p>
            </div>
            <ArrowUpRight size={16} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#1E1B18] dark:group-hover:text-[#F8FAFC] transition-colors shrink-0 stroke-[1.5]" />
          </button>
        </div>
      </section>

      {/* 5. Recent Activity & Mistake Vault Status */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1E1B18] dark:text-[#F8FAFC]">
            So'nggi Faoliyat
          </h3>
          {mistakes.length > 0 ? (
            <button
              onClick={onOpenMistakeVault}
              className="text-xs font-mono font-medium text-[#E07A5F] hover:underline cursor-pointer"
            >
              Xatolar sandig'i ({mistakes.length}) →
            </button>
          ) : (
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              Xatolar mavjud emas
            </span>
          )}
        </div>

        {questionsDone === 0 && mistakes.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Hali mashq bajarilmadi. Boshlash uchun yuqoridagi "Mashqni Boshlash" tugmasini bosing.
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#E5E0D8] dark:border-[#1E293B] flex items-center justify-between">
              <span className="font-medium text-[#1E1B18] dark:text-[#F8FAFC]">Umumiy Mashqlar</span>
              <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">{questionsDone} ta savol yechilgan</span>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
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
