import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  RotateCcw,
  BarChart3,
  Flame,
  Check,
  ChevronRight,
  BrainCircuit,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Eye,
  FileText,
  Calendar,
  Zap,
  SlidersHorizontal,
  X,
  Play
} from 'lucide-react';
import { MockTest, User, TestAttempt, Question, MockTestCategory, MockCategory } from '../types';
import { INITIAL_MOCK_CATEGORIES } from '../lib/adminApi';
import { PreTestModal } from './PreTestModal';
import { MockAccessCodeModal } from './MockAccessCodeModal';
import { FormattedMath } from './WorkoutActiveSession';
import { supabase } from '../lib/supabase';

interface MockTestsCatalogViewProps {
  user: User;
  mockTests: MockTest[];
  categories?: MockCategory[];
  onStartBluebookTest?: (test: MockTest) => void;
  onLaunchTest?: (test: MockTest) => void;
  onOpenPaywall?: () => void;
  onOpenDiagnostic?: () => void;
  onOpenSocraticTutor?: (question: Question, userWrongAnswer?: string) => void;
}

// Clean initial attempts state (populated dynamically from actual tests taken)
const INITIAL_DEMO_ATTEMPTS: Record<string, TestAttempt> = {};

// Enriched mock tests list if the database has only 3
const EXPANDED_MOCK_TESTS: MockTest[] = [
  {
    id: 'mock-official-01',
    title: 'Digital SAT Practice Test #1 — Official Edition',
    description: 'Official 2-Stage Multistage Adaptive Test (MST) replicating exact College Board Bluebook algorithm and domain distribution.',
    category: 'OFFICIAL_MOCK',
    categoryId: 'cat-official',
    categorySlug: 'official',
    isPublished: true,
    isProOnly: false,
    isPrivate: false,
    totalTimeMinutes: 134,
    timeLimitSecs: 8040,
    attemptsCount: 1420,
    averageScore: 1290,
    highestScore: 1600,
    tags: ['Official College Board', 'MST Adaptive', 'Full Length'],
    questions: [],
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'mock-official-02',
    title: 'Digital SAT Practice Test #2 — High-Rigor Edition',
    description: 'Calibrated for students targeting 1450-1600 scores. Contains high-frequency Module 2 Hard questions with advanced Desmos strategies.',
    category: 'OFFICIAL_MOCK',
    categoryId: 'cat-official',
    categorySlug: 'official',
    isPublished: true,
    isProOnly: false,
    isPrivate: true,
    accessCode: 'ASRON-2026',
    totalTimeMinutes: 134,
    timeLimitSecs: 8040,
    attemptsCount: 980,
    averageScore: 1340,
    highestScore: 1590,
    tags: ['Official Blueprint', 'Hard Stage 2', 'High Rigor'],
    questions: [],
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'mock-official-03',
    title: 'Digital SAT Practice Test #3 — Ivy League Diagnostic',
    description: 'Comprehensive adaptive test designed to diagnose micro-vulnerabilities across Craft & Structure and Non-linear Systems.',
    category: 'OFFICIAL_MOCK',
    categoryId: 'cat-official',
    categorySlug: 'official',
    isPublished: true,
    isProOnly: false,
    isPrivate: true,
    accessCode: 'ASRON-2026',
    totalTimeMinutes: 134,
    timeLimitSecs: 8040,
    attemptsCount: 840,
    averageScore: 1365,
    highestScore: 1600,
    tags: ['Ivy League Target', 'Trap Answers', 'Desmos Graphing'],
    questions: [],
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'mock-past-2025-01',
    title: 'May 2025 Real Digital SAT (North America Form A)',
    description: 'Deconstructed real exam paper administered in May 2025. Authentic reading passages and student-produced math responses.',
    category: 'PAST_EXAM',
    categoryId: 'cat-past',
    categorySlug: 'past',
    isPublished: true,
    isProOnly: false,
    isPrivate: false,
    totalTimeMinutes: 134,
    timeLimitSecs: 8040,
    attemptsCount: 2150,
    averageScore: 1315,
    highestScore: 1580,
    tags: ['Real Past Exam', 'May 2025', 'Official Curve'],
    questions: [],
    createdAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'mock-past-2025-02',
    title: 'October 2025 Real Digital SAT (International Form C)',
    description: 'Actual international test form featuring dense historical passages, scientific hypothesis evaluation, and polynomial division.',
    category: 'PAST_EXAM',
    categoryId: 'cat-past',
    categorySlug: 'past',
    isPublished: true,
    isProOnly: false,
    isPrivate: true,
    accessCode: 'ASRON-2026',
    totalTimeMinutes: 134,
    timeLimitSecs: 8040,
    attemptsCount: 1620,
    averageScore: 1330,
    highestScore: 1600,
    tags: ['International Form', 'October 2025', 'Verified Curve'],
    questions: [],
    createdAt: '2026-05-12T00:00:00Z',
  },
  {
    id: 'mock-past-2026-01',
    title: 'March 2026 Real Digital SAT (Predicted Spring Form)',
    description: 'Latest test release from the Spring 2026 cohort with enhanced emphasis on multi-clause punctuation and circle geometry.',
    category: 'PAST_EXAM',
    categoryId: 'cat-past',
    categorySlug: 'past',
    isPublished: true,
    isProOnly: false,
    isPrivate: true,
    accessCode: 'ASRON-2026',
    totalTimeMinutes: 134,
    timeLimitSecs: 8040,
    attemptsCount: 1100,
    averageScore: 1355,
    highestScore: 1600,
    tags: ['March 2026', 'New Syllabus', 'High-Yield'],
    questions: [],
    createdAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'mock-sect-rw-01',
    title: 'Reading & Writing Sprint Mock (54 Questions)',
    description: 'Section-only sprint: 2 adaptive modules of Reading & Writing under official 64-minute countdown timer.',
    category: 'SECTIONAL_PRACTICE',
    categoryId: 'cat-practice',
    categorySlug: 'practice',
    isPublished: true,
    isProOnly: false,
    isPrivate: false,
    totalTimeMinutes: 64,
    timeLimitSecs: 3840,
    attemptsCount: 3400,
    averageScore: 640,
    highestScore: 800,
    tags: ['RW Only', '64 Minutes', 'Adaptive Module 2'],
    questions: [],
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'mock-sect-math-01',
    title: 'Math 800 Mastery Sprint Mock (44 Questions)',
    description: 'Math-only sprint: 2 adaptive modules with full Desmos integration under official 70-minute countdown.',
    category: 'SECTIONAL_PRACTICE',
    categoryId: 'cat-practice',
    categorySlug: 'practice',
    isPublished: true,
    isProOnly: false,
    isPrivate: true,
    accessCode: 'ASRON-2026',
    totalTimeMinutes: 70,
    timeLimitSecs: 4200,
    attemptsCount: 2900,
    averageScore: 680,
    highestScore: 800,
    tags: ['Math Only', '70 Minutes', 'Desmos Speedrun'],
    questions: [],
    createdAt: '2026-06-05T00:00:00Z',
  },
];

export const MockTestsCatalogView: React.FC<MockTestsCatalogViewProps> = ({
  user,
  mockTests,
  categories = INITIAL_MOCK_CATEGORIES,
  onStartBluebookTest,
  onLaunchTest,
  onOpenPaywall,
  onOpenDiagnostic,
  onOpenSocraticTutor,
}) => {
  const startTestHandler = onStartBluebookTest || onLaunchTest || (() => {});

  // Combine passed mockTests with fallback list to ensure full catalog richness
  const allTests = useMemo(() => {
    const existingIds = new Set(mockTests.map((t) => t.id));
    const merged = [...mockTests];
    EXPANDED_MOCK_TESTS.forEach((t) => {
      if (!existingIds.has(t.id)) {
        merged.push(t);
      }
    });
    return merged;
  }, [mockTests]);

  // Attempt records state persisted in localStorage
  const [userAttempts, setUserAttempts] = useState<Record<string, TestAttempt>>(() => {
    try {
      const saved = localStorage.getItem('aurasat_mock_attempts');
      if (saved) {
        return { ...INITIAL_DEMO_ATTEMPTS, ...JSON.parse(saved) };
      }
      return INITIAL_DEMO_ATTEMPTS;
    } catch {
      return INITIAL_DEMO_ATTEMPTS;
    }
  });

  // Filter & Search state (Category tab supports dynamic categories)
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

  // Unlocked Mocks Engine (Stores permanently unlocked private course mocks)
  const [unlockedMockIds, setUnlockedMockIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`asron_unlocked_mocks_${user.id}`);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
      return new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [accessCodeModalTest, setAccessCodeModalTest] = useState<MockTest | null>(null);

  useEffect(() => {
    const loadRemoteUnlockedMocks = async () => {
      try {
        if (supabase && user.id) {
          const { data, error } = await supabase
            .from('user_unlocked_mocks')
            .select('mock_test_id')
            .eq('user_id', user.id);
          if (data && !error) {
            const remoteIds = data.map((d: any) => d.mock_test_id);
            setUnlockedMockIds((prev) => {
              const next = new Set([...prev, ...remoteIds]);
              try {
                localStorage.setItem(`asron_unlocked_mocks_${user.id}`, JSON.stringify(Array.from(next)));
              } catch {}
              return next;
            });
          }
        }
      } catch {}
    };
    loadRemoteUnlockedMocks();
  }, [user.id]);

  // Selected Test for Pre-Test Modal
  const [selectedTestForModal, setSelectedTestForModal] = useState<MockTest | null>(null);

  // Selected Attempt for Review Modal
  const [reviewAttemptTest, setReviewAttemptTest] = useState<{ test: MockTest; attempt: TestAttempt } | null>(null);
  const [aiDiagnosticModalData, setAiDiagnosticModalData] = useState<{ test: MockTest; attempt: TestAttempt } | null>(null);

  // Quick stats calculations: Strict 0-State Baseline
  const stats = useMemo(() => {
    const completedAttempts = (Object.values(userAttempts) as TestAttempt[]).filter(
      (a) => a && (a.status === 'COMPLETED' || a.isCompleted)
    );
    const completedCount = completedAttempts.length;
    const totalCount = allTests.length;

    let highest = 0;
    let sumScore = 0;

    completedAttempts.forEach((a) => {
      const s = a.totalScore || 0;
      if (s > highest) highest = s;
      sumScore += s;
    });

    const average = completedCount > 0 ? Math.round(sumScore / completedCount) : 0;

    return {
      completedCount,
      totalCount,
      highestScore: highest || 0,
      averageScore: average || 0,
    };
  }, [userAttempts, allTests]);

  // Filtered Tests
  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      // Dynamic Category filter
      if (activeCategoryTab !== 'ALL') {
        const matchCategory =
          test.categoryId === activeCategoryTab ||
          test.categorySlug === activeCategoryTab ||
          test.category === activeCategoryTab;
        if (!matchCategory) return false;
      }

      // Access tier filter
      if (accessFilter === 'PUBLIC' && test.isPrivate) return false;
      if (accessFilter === 'PRIVATE' && !test.isPrivate) return false;

      // Status filter
      const attempt = userAttempts[test.id];
      const isCompleted = attempt?.status === 'COMPLETED' || attempt?.isCompleted;
      const isInProgress = attempt?.status === 'IN_PROGRESS' && !isCompleted;
      const isNotStarted = !attempt || attempt.status === 'NOT_STARTED';

      if (statusFilter === 'COMPLETED' && !isCompleted) return false;
      if (statusFilter === 'IN_PROGRESS' && !isInProgress) return false;
      if (statusFilter === 'NOT_STARTED' && !isNotStarted) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(q);
        const matchDesc = test.description?.toLowerCase().includes(q);
        const matchTags = test.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      return true;
    });
  }, [allTests, activeCategoryTab, accessFilter, statusFilter, searchQuery, userAttempts]);

  // Unlock success callback
  const handleUnlockSuccess = async (unlocked: MockTest) => {
    setUnlockedMockIds((prev) => {
      const next = new Set([...prev, unlocked.id]);
      try {
        localStorage.setItem(`asron_unlocked_mocks_${user.id}`, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    try {
      if (supabase && user.id) {
        await supabase.from('user_unlocked_mocks').insert({
          user_id: user.id,
          mock_test_id: unlocked.id,
          access_code_used: unlocked.accessCode || 'ASRON-2026',
        });
      }
    } catch {}

    setSelectedTestForModal(unlocked);
  };

  // Launch test handler
  const handleLaunchTest = (test: MockTest) => {
    setSelectedTestForModal(null);
    startTestHandler(test);
  };

  // Resume in-progress attempt
  const handleResumeTest = (test: MockTest) => {
    startTestHandler(test);
  };

  // Retake completed test
  const handleRetakeTest = (test: MockTest) => {
    setSelectedTestForModal(test);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-[#1E1B18] dark:text-[#F8FAFC] animate-in fade-in duration-300">
      {/* 1. HEADER & EXECUTIVE SUMMARY BANNER (OnePrep Luxury Minimalism) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#121A2F]/90 backdrop-blur-md border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF5F0] dark:bg-[#1E293B] text-[#E07A5F] border border-[#FCD9CE] dark:border-[#334155]">
                Sinov Markazi
              </span>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Rasmiy Format · Moslashuvchan
              </span>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                134 Daqiqa
              </span>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                2 Modul MST
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B18] dark:text-[#F8FAFC] tracking-tight">
              To'liq Formatdagi Mock Testlar
            </h1>
          </div>

          {/* 100% Free Access Status Banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#EBF8F5] dark:bg-[#0A0F1D] border border-[#BCE8DE] dark:border-[#1E293B] shrink-0 self-start lg:self-auto">
            <div className="p-2 rounded-xl bg-[#2A9D8F] text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#2A9D8F] tracking-wider">
                100% Bepul Kirish
              </div>
              <div className="text-xs font-bold text-[#1E1B18] dark:text-[#F8FAFC]">
                Barcha Ommaviy Mocklar Ochiq
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="pt-6 border-t border-[#F0EBE4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {/* Stat 1: Completed */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121A2F] border border-[#EBE5DF] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#1E1B18] dark:text-[#F8FAFC]">
              {stats.completedCount} <span className="text-sm font-normal text-[#78716C] dark:text-[#94A3B8]">/ {stats.totalCount}</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8] tracking-wider mt-0.5">
              Topshirilgan Testlar
            </div>
          </div>

          {/* Stat 2: Highest Score */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121A2F] border border-[#EBE5DF] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#E07A5F]">
              {stats.highestScore} <span className="text-xs font-normal text-[#78716C] dark:text-[#94A3B8]">/ 1600</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8] tracking-wider mt-0.5">
              Eng Yuqori Natija
            </div>
          </div>

          {/* Stat 3: Average Score */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121A2F] border border-[#EBE5DF] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#2A9D8F]">
              {stats.averageScore}
            </div>
            <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8] tracking-wider mt-0.5">
              O'rtacha Ball
            </div>
          </div>

          {/* Stat 4: Adaptive MST Status */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121A2F] border border-[#EBE5DF] dark:border-[#1E293B] flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#3D405B] dark:text-[#F8FAFC] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#2A9D8F] animate-pulse" />
              <span>2-Bosqichli MST Faol</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8] tracking-wider mt-1">
              Rasmiy Bluebook Standarti
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="space-y-4">
        {/* Dynamic Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] w-fit">
          <button
            onClick={() => setActiveCategoryTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeCategoryTab === 'ALL'
                ? 'bg-[#1E1B18] dark:bg-[#E07A5F] text-white shadow-xs'
                : 'text-[#78716C] dark:text-[#94A3B8] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] hover:bg-white/60 dark:hover:bg-[#1E293B]'
            }`}
          >
            <span>Barcha Testlar</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                activeCategoryTab === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#EBE5DF] dark:bg-[#1E293B] text-[#78716C] dark:text-[#94A3B8]'
              }`}
            >
              {allTests.length}
            </span>
          </button>
          {categories.map((tab) => {
            const count = allTests.filter(
              (t) =>
                t.categoryId === tab.id ||
                t.categorySlug === tab.slug ||
                t.category === tab.slug ||
                t.category === tab.id
            ).length;
            const isActive = activeCategoryTab === tab.id || activeCategoryTab === tab.slug;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1E1B18] dark:bg-[#E07A5F] text-white shadow-xs'
                    : 'text-[#78716C] dark:text-[#94A3B8] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] hover:bg-white/60 dark:hover:bg-[#1E293B]'
                }`}
              >
                <span>{tab.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EBE5DF] dark:bg-[#1E293B] text-[#78716C] dark:text-[#94A3B8]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Test nomi, yili yoki mavzu bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] text-xs font-medium text-[#1E1B18] dark:text-[#F8FAFC] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1E1B18] dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status & Access Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Status Selector */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#121A2F] rounded-xl border border-[#E5E0D8] dark:border-[#1E293B] text-xs">
              <span className="text-[10px] font-bold text-[#78716C] dark:text-[#94A3B8] px-2">Holat:</span>
              {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-[#1E1B18] dark:bg-[#E07A5F] text-white'
                      : 'text-[#78716C] dark:text-[#94A3B8] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#1E293B]'
                  }`}
                >
                  {s === 'ALL' ? 'Barchasi' : s === 'NOT_STARTED' ? 'Yangi' : s === 'IN_PROGRESS' ? 'Jarayonda' : 'Tugallangan'}
                </button>
              ))}
            </div>

            {/* Access Selector */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#121A2F] rounded-xl border border-[#E5E0D8] dark:border-[#1E293B] text-xs">
              <span className="text-[10px] font-bold text-[#78716C] dark:text-[#94A3B8] px-2">Kirish:</span>
              {[
                { id: 'ALL', label: 'Barchasi' },
                { id: 'PUBLIC', label: 'Ommaviy' },
                { id: 'PRIVATE', label: 'Maxsus' },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccessFilter(a.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    accessFilter === a.id
                      ? 'bg-[#E07A5F] text-white'
                      : 'text-[#78716C] dark:text-[#94A3B8] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#1E293B]'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ONEPREP-STYLE MOCK TEST CARD GRID */}
      {filteredTests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] text-[#78716C] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E1B18] dark:text-[#F8FAFC]">Mock Testlar Topilmadi</h3>
            <p className="text-xs text-[#78716C] dark:text-[#94A3B8] mt-1">
              Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategoryTab('ALL');
              setStatusFilter('ALL');
              setAccessFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0A0F1D] hover:bg-[#EBE5DF] dark:hover:bg-[#1E293B] text-xs font-bold text-[#1E1B18] dark:text-[#F8FAFC] transition-all cursor-pointer"
          >
            Filtrlarni Tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test) => {
            const attempt = userAttempts[test.id];
            const isCompleted = attempt?.status === 'COMPLETED' || attempt?.isCompleted;
            const isInProgress = attempt?.status === 'IN_PROGRESS' && !isCompleted;
            const isNotStarted = !attempt || attempt.status === 'NOT_STARTED';
            const isPrivate = Boolean(test.isPrivate);
            const isUnlocked = !isPrivate || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || unlockedMockIds.has(test.id);

            // Dynamic category name resolution
            const matchingCat = categories.find((c) => c.id === test.categoryId || c.slug === test.categorySlug);
            const categoryLabel =
              matchingCat?.name ||
              (test.category === 'OFFICIAL_MOCK'
                ? 'Rasmiy Bluebook'
                : test.category === 'PAST_EXAM'
                ? 'Haqiqiy SAT Imtihonlari'
                : 'Sprint Mashqlari');

            return (
              <div
                key={test.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] shadow-xs hover:border-[#E07A5F]/50 dark:hover:border-[#E07A5F]/50 transition-all duration-150 flex flex-col justify-between space-y-4 group"
              >
                {/* 1 & 2. Category Badge & Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF5F0] dark:bg-[#0A0F1D] text-[#E07A5F] border border-[#FCD9CE] dark:border-[#1E293B]">
                      {categoryLabel}
                    </span>
                    {isCompleted && attempt?.totalScore && (
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {attempt.totalScore} / 1600
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#1E1B18] dark:text-[#F8FAFC] group-hover:text-[#E07A5F] transition-colors leading-snug">
                    {test.title}
                  </h3>
                </div>

                {/* 3 & 4. Quick Metrics & Primary Action */}
                <div className="pt-3 border-t border-[#F0ECE6] dark:border-[#1E293B] flex items-center justify-between gap-3">
                  {/* Element 3: Quick Metrics */}
                  <div className="text-xs font-mono text-[#78716C] dark:text-[#94A3B8]">
                    {test.category === 'SECTIONAL_PRACTICE'
                      ? `${test.totalQuestionsCount || 54} Savol · ${test.totalTimeMinutes || 64} Daqiqa`
                      : '98 Savol · 134 Daqiqa'}
                  </div>

                  {/* Element 4: Action Button */}
                  {isPrivate && !isUnlocked ? (
                    <button
                      onClick={() => setAccessCodeModalTest(test)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#FAF5F0] dark:bg-[#1E293B] text-[#E07A5F] border border-[#FCD9CE] dark:border-[#334155] hover:bg-[#FCD9CE]/30"
                    >
                      <Lock size={12} />
                      <span>Qulflangan · Premium</span>
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleRetakeTest(test)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#FAF8F5] dark:bg-[#0A0F1D] hover:bg-[#EBE5DF] dark:hover:bg-[#1E293B] text-[#1E1B18] dark:text-[#F8FAFC] border border-[#E5E0D8] dark:border-[#1E293B]"
                    >
                      <RotateCcw size={12} />
                      <span>Qayta topshirish</span>
                    </button>
                  ) : isInProgress ? (
                    <button
                      onClick={() => handleResumeTest(test)}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#E07A5F] hover:bg-[#c96c53] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play size={12} className="fill-white" />
                      <span>Davom ettirish</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTestForModal(test)}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1E1B18] dark:bg-[#E07A5F] hover:bg-[#3D405B] dark:hover:bg-[#c96c53] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Boshlash</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. PRE-TEST BLUEBOOK INSTRUCTIONS MODAL */}
      <PreTestModal
        isOpen={Boolean(selectedTestForModal)}
        test={selectedTestForModal}
        user={user}
        onClose={() => setSelectedTestForModal(null)}
        onLaunchTest={handleLaunchTest}
      />

      {/* 4.1 ACCESS CODE SECURITY MODAL */}
      <MockAccessCodeModal
        isOpen={Boolean(accessCodeModalTest)}
        test={accessCodeModalTest}
        onClose={() => setAccessCodeModalTest(null)}
        onSuccessUnlock={handleUnlockSuccess}
      />

      {/* 5. DETAILED QUESTION REVIEW MODAL */}
      {reviewAttemptTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl my-8 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EBE4] dark:border-[#1E293B] pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-[#E07A5F]">
                  Test Natijasi Tahlili
                </div>
                <h3 className="text-lg font-bold text-[#1E1B18] dark:text-[#F8FAFC]">
                  {reviewAttemptTest.test.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewAttemptTest(null)}
                className="p-1.5 rounded-xl text-[#78716C] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-[#1E293B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Score Summary Ticker */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#EBE5DF] dark:border-[#1E293B] grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-mono font-extrabold text-[#1E1B18] dark:text-[#F8FAFC]">
                  {reviewAttemptTest.attempt.totalScore || 1440}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8]">Umumiy Ball</div>
              </div>
              <div>
                <div className="text-xl font-mono font-extrabold text-[#3D405B] dark:text-[#94A3B8]">
                  {reviewAttemptTest.attempt.rwScore || 710}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8]">Reading &amp; Writing</div>
              </div>
              <div>
                <div className="text-xl font-mono font-extrabold text-[#E07A5F]">
                  {reviewAttemptTest.attempt.mathScore || 730}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8]">Math (Desmos)</div>
              </div>
            </div>

            {/* Diagnostic Insight Note */}
            <div className="p-4 rounded-2xl bg-[#FFFBF8] dark:bg-[#1E293B]/50 border border-[#FCD9CE] dark:border-[#334155] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E1B18] dark:text-[#F8FAFC]">
                <Sparkles size={14} className="text-[#E07A5F]" />
                <span>AI Kognitiv Diagnostika va Yo'naltirish</span>
              </div>
              <p className="text-xs text-[#3D405B] dark:text-[#CBD5E1] leading-relaxed">
                {reviewAttemptTest.attempt.aiDiagnostic ||
                  'Siz har ikki bo\'limda ham 2-bosqich Murakkab (Hard) modulga yo\'naltirildingiz. Ballingizni yanada oshirish uchun punktuatsiya chegaralari (boundaries) ustida ishlash tavsiya etiladi.'}
              </p>
            </div>

            {/* Simulated Questions Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#78716C] dark:text-[#94A3B8] uppercase tracking-wider">
                Modullar bo'yicha tahlil
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#EBE5DF] dark:border-[#1E293B] space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-[#1E1B18] dark:text-[#F8FAFC]">
                  <span>Reading &amp; Writing (1-modul &amp; 2-modul Qiyin)</span>
                  <span className="text-[#2A9D8F]">24 / 27 To'g'ri (91%)</span>
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-[#94A3B8]">
                  Xato qilingan tushunchalar: <em>Transitions (Contrast)</em>, <em>Boundaries (Comma Splices)</em>. Xatolar avtomatik ravishda <strong>Xatolar Ombori</strong>ga saqlandi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#EBE5DF] dark:border-[#1E293B] space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-[#1E1B18] dark:text-[#F8FAFC]">
                  <span>Math (1-modul &amp; 2-modul Qiyin)</span>
                  <span className="text-[#2A9D8F]">20 / 22 To'g'ri (91%)</span>
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-[#94A3B8]">
                  Xato qilingan tushunchalar: <em>Nonlinear Systems</em>, <em>Circle Tangent Equations</em>.
                </p>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EBE4] dark:border-[#1E293B]">
              <button
                onClick={() => setReviewAttemptTest(null)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E0D8] dark:border-[#1E293B] hover:bg-[#FAF8F5] dark:hover:bg-[#1E293B] text-xs font-bold text-[#78716C] dark:text-[#94A3B8] cursor-pointer"
              >
                Yopish
              </button>

              <button
                onClick={() => {
                  setReviewAttemptTest(null);
                  setSelectedTestForModal(reviewAttemptTest.test);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#1E1B18] dark:bg-[#E07A5F] hover:bg-[#3D405B] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Testni Qayta Topshirish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI DIAGNOSTIC REPORT MODAL */}
      {aiDiagnosticModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121A2F] border border-[#E5E0D8] dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#F0EBE4] dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#FFF4F0] dark:bg-[#1E293B] text-[#E07A5F]">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1E1B18] dark:text-[#F8FAFC]">
                    ASRON SAT AI Psixometrik Diagnostikasi
                  </h3>
                  <div className="text-[11px] text-[#78716C] dark:text-[#94A3B8]">
                    Test: {aiDiagnosticModalData.test.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAiDiagnosticModalData(null)}
                className="p-1.5 text-[#78716C] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Score & Percentile */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#EBE5DF] dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <div className="text-2xl font-mono font-extrabold text-[#1E1B18] dark:text-[#F8FAFC]">
                  {aiDiagnosticModalData.attempt.totalScore || 1440}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#94A3B8]">Rasmiy Baholash Shkalasi</div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-[#2A9D8F]">97-Perzentil</div>
                <div className="text-[11px] text-[#78716C] dark:text-[#94A3B8]">Eng yuqori 3% talaba</div>
              </div>
            </div>

            {/* Domain Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#EBF8F5] dark:bg-[#0A0F1D] border border-[#BCE8DE] dark:border-[#1E293B] space-y-2">
                <div className="font-bold text-[#2A9D8F] flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Kuchli Mavzular (95%+)
                </div>
                <ul className="space-y-1 text-[11px] text-[#3D405B] dark:text-[#94A3B8]">
                  <li>&bull; Expression of Ideas (Rhetorical synthesis)</li>
                  <li>&bull; Algebra &amp; Linear Systems</li>
                  <li>&bull; Advanced Problem Solving</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF4F0] dark:bg-[#0A0F1D] border border-[#FCD9CE] dark:border-[#1E293B] space-y-2">
                <div className="font-bold text-[#E07A5F] flex items-center gap-1.5">
                  <AlertCircle size={14} /> O'stirish Kerak Bo'lgan Sohalar
                </div>
                <ul className="space-y-1 text-[11px] text-[#3D405B] dark:text-[#94A3B8]">
                  <li>&bull; Standard English Conventions (Boundaries)</li>
                  <li>&bull; Kvadrat tenglama diskriminanti ($b^2 - 4ac$)</li>
                  <li>&bull; Aylana urinmasi tenglamalari</li>
                </ul>
              </div>
            </div>

            {/* AI Action Plan */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#EBE5DF] dark:border-[#1E293B] space-y-2 text-xs text-[#3D405B] dark:text-[#CBD5E1]">
              <div className="font-bold text-[#1E1B18] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#2A9D8F]" />
                1550+ Natija Uchun AI Tavsiyasi:
              </div>
              <p className="leading-relaxed">
                Ushbu testdagi xato qilgan savollaringizni <strong>Xatolar Ombori</strong> orqali qayta ishlang. Aylana tenglamalarini Desmos orqali 15 soniyada yechish usullarini mashq qiling.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EBE4] dark:border-[#1E293B]">
              <button
                onClick={() => setAiDiagnosticModalData(null)}
                className="px-6 py-2.5 rounded-xl bg-[#1E1B18] dark:bg-[#E07A5F] hover:bg-[#3D405B] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Hisobotni Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
