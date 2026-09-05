import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Database,
  Layers,
  BookOpen,
  Users,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { User, MistakeVaultItem, MockTest, Question } from '../../types';
import { VocabTrainerModal } from '../VocabTrainerModal';
import { MultiplayerArenaModal } from '../MultiplayerArenaModal';
import { ExamCountdownWidget } from './ExamCountdownWidget';
import { supabase } from '../../lib/supabase';


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
  const router = useRouter();
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);

  const [supabaseAnnouncements, setSupabaseAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .in('target_route', ['dashboard', 'all'])
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && isMounted) {
          setSupabaseAnnouncements(
            data.map((d: any) => ({
              id: d.id,
              title: d.title,
              text: d.content,
              date: d.created_at ? new Date(d.created_at).toLocaleDateString('uz-UZ') : 'Bugun',
              link: d.action_link,
              is_active: true,
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic Dashboard Content from Supabase platform_content & announcements table
  const dAnn = platformContent?.dashboard_announcements;
  const activeAnnouncements = useMemo(() => {
    const fromMap = Array.isArray(dAnn?.content)
      ? dAnn.content.filter((a: any) => a.is_active !== false)
      : [];
    const seenIds = new Set(fromMap.map((a: any) => a.id));
    const extra = supabaseAnnouncements.filter((a: any) => !seenIds.has(a.id));
    return [...extra, ...fromMap];
  }, [dAnn?.content, supabaseAnnouncements]);

  const dRes = platformContent?.recommended_resources;
  const activeResources = Array.isArray(dRes?.content)
    ? dRes.content.filter((r: any) => r.is_active !== false)
    : [];


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
      <header className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
          Salom, {studentName}
        </h1>
      </header>

      {/* 2. Prominent Exam Countdown Timer Widget */}
      <ExamCountdownWidget
        initialTargetDate={user.targetExamDate || '2026-10-03T08:00:00'}
        userId={user.id}
      />

      {/* 3. Core Metrics: Data-Dense Triad */}
      <section aria-label="Asosiy Metrikalar" className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Metric 1: Streak */}
        <div className="p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold truncate">
              Streak
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0A0F1D] text-slate-500">
              {streakDays > 0 ? 'Faol' : 'Nol'}
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
            {streakDays} <span className="text-[10px] sm:text-xs font-normal text-slate-400">Kun</span>
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
            {questionsDone} <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ 3k</span>
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
            {accuracy}%
          </div>
        </div>
      </section>

      {/* 4. Quick Launch Modules (Punchy 1-3 Word Badges, Zero Text Clutter) */}
      <section aria-label="Asosiy Modullar" className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Asosiy Modullar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Testlar */}
          <Link
            href="/mocks"
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F]/40 transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <FileText size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Testlar
                </div>
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
            />
          </Link>

          {/* Tile 2: Savollar */}
          <Link
            href="/questions"
            onClick={() => {
              if (onOpenQuestionBank) onOpenQuestionBank();
            }}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F]/40 transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#E07A5F]">
                <Layers size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Savollar
                </div>
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
            />
          </Link>

          {/* Tile 3: Lug'at */}
          <Link
            href="/vocabulary"
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F]/40 transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <BookOpen size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Lug'at
                </div>
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
            />
          </Link>

          {/* Tile 4: Hamjamiyat */}
          <Link
            href="/chat"
            onClick={() => {
              if (onOpenCommunity) onOpenCommunity();
            }}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F]/40 transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                <Users size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Hamjamiyat
                </div>
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150"
            />
          </Link>
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
