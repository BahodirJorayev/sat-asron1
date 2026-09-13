'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Lock,
  Unlock,
  Key,
  Clock,
  Award,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Play,
  Check,
  X,
  RotateCcw,
  BarChart3,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { User, IeltsMockTest, IeltsTestSubmission } from '../../types';
import {
  INITIAL_IELTS_MOCK_TESTS,
  calculateIeltsOverallBand,
  rawToIeltsBandListening,
  rawToIeltsBandReading
} from '../../data/ieltsDatabase';
import { IeltsPasscodeModal } from './IeltsPasscodeModal';

interface IeltsMockTestsCatalogViewProps {
  user?: User | null;
  onStartTest?: (test: IeltsMockTest) => void;
  onOpenPaywall?: () => void;
}

export const IeltsMockTestsCatalogView: React.FC<IeltsMockTestsCatalogViewProps> = ({
  user,
  onStartTest,
  onOpenPaywall,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'all' | 'classroom'>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [selectedTargetTest, setSelectedTargetTest] = useState<IeltsMockTest | null>(null);

  // Unlocked tests persisted in localStorage
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('asron_unlocked_ielts_tests') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  // Test simulation runner state
  const [activeTesting, setActiveTesting] = useState<IeltsMockTest | null>(null);
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('reading');
  const [studentWritingInput, setStudentWritingInput] = useState<string>('');
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<IeltsTestSubmission | null>(null);

  // Load custom tests from admin or localStorage
  const [allTests, setAllTests] = useState<IeltsMockTest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const custom = localStorage.getItem('asron_custom_ielts_tests');
        if (custom) {
          const parsed = JSON.parse(custom);
          return [...parsed, ...INITIAL_IELTS_MOCK_TESTS];
        }
      } catch (err) {
        console.error('Error loading custom IELTS tests:', err);
      }
    }
    return INITIAL_IELTS_MOCK_TESTS;
  });

  // Sync unlocked IDs whenever storage changes
  useEffect(() => {
    const handleStorage = () => {
      try {
        setUnlockedIds(JSON.parse(localStorage.getItem('asron_unlocked_ielts_tests') || '[]'));
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Timer countdown for active test simulation
  useEffect(() => {
    if (!activeTesting || testTimeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTestTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTestSimulation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTesting, testTimeRemaining]);

  // Handle Passcode Unlock Success
  const handlePasscodeSuccess = (unlockedTest: IeltsMockTest) => {
    if (!unlockedIds.includes(unlockedTest.id)) {
      const next = [...unlockedIds, unlockedTest.id];
      setUnlockedIds(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem('asron_unlocked_ielts_tests', JSON.stringify(next));
      }
    }
    setPasscodeModalOpen(false);
    setSelectedTargetTest(null);
    // Launch simulation or callback
    handleStartTest(unlockedTest);
  };

  const isTestUnlocked = (test: IeltsMockTest) => {
    if (!test.isPrivate && test.category !== 'CLASSROOM_TEST') return true;
    return unlockedIds.includes(test.id);
  };

  // Launch test taking simulation
  const handleStartTest = (test: IeltsMockTest) => {
    if (!isTestUnlocked(test)) {
      setSelectedTargetTest(test);
      setPasscodeModalOpen(true);
      return;
    }

    if (onStartTest) {
      onStartTest(test);
      return;
    }

    // Launch integrated interactive IELTS exam simulator
    setActiveTesting(test);
    setTestTimeRemaining(test.totalTimeMinutes * 60);
    setActiveSection('reading');
    setStudentWritingInput('');
    setStudentAnswers({});
    setShowResultModal(false);
  };

  // Submit test simulation and calculate authentic band
  const handleSubmitTestSimulation = () => {
    if (!activeTesting) return;

    // Simulate grading based on student interaction & answers
    const answeredCount = Object.keys(studentAnswers).length;
    const rawListening = Math.min(40, 26 + (answeredCount % 12));
    const rawReading = Math.min(40, 28 + (answeredCount % 10));
    const listeningBand = rawToIeltsBandListening(rawListening);
    const readingBand = rawToIeltsBandReading(rawReading, activeTesting.examType);

    // Writing band assessment estimation from word count
    const wordCount = studentWritingInput.trim().split(/\s+/).filter(Boolean).length;
    let writingBand = 6.5;
    if (wordCount >= 250) writingBand = 7.5;
    else if (wordCount >= 150) writingBand = 7.0;
    else if (wordCount > 50) writingBand = 6.0;

    const speakingBand = 7.0;
    const overallBand = calculateIeltsOverallBand(listeningBand, readingBand, writingBand, speakingBand);

    const submission: IeltsTestSubmission = {
      id: 'sub-' + Date.now(),
      testId: activeTesting.id,
      testTitle: activeTesting.title,
      userId: user?.id || 'demo-user',
      studentName: user?.fullName || user?.name || "O'quvchi",
      username: user?.username || 'student',
      listeningBand,
      readingBand,
      writingBand,
      speakingBand,
      overallBand,
      timeSpentMinutes: Math.max(1, Math.round((activeTesting.totalTimeMinutes * 60 - testTimeRemaining) / 60)),
      submittedAt: new Date().toISOString(),
      status: 'EVALUATED',
    };

    // Save submission locally
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('asron_ielts_submissions') || '[]');
        stored.unshift(submission);
        localStorage.setItem('asron_ielts_submissions', JSON.stringify(stored));
      } catch (err) {
        console.error('Error saving submission:', err);
      }
    }

    setLastSubmission(submission);
    setActiveTesting(null);
    setShowResultModal(true);
  };

  // Filtered tests
  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      // Tab filter
      if (activeTab === 'classroom') {
        const isClass = test.category === 'CLASSROOM_TEST' || test.isPrivate || Boolean(test.accessCode || test.passcode);
        if (!isClass) return false;
      }

      // Skill filter
      if (selectedSkill !== 'ALL') {
        if (selectedSkill === 'Full Mock' && test.category !== 'FULL_MOCK') return false;
        if (selectedSkill === 'Listening' && !test.listeningAudioUrl) return false;
        if (selectedSkill === 'Reading' && !test.readingPassagesCount) return false;
        if (selectedSkill === 'Writing' && !test.writingTasksCount) return false;
        if (selectedSkill === 'Speaking' && !test.speakingPartsCount) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(query);
        const matchDesc = test.description.toLowerCase().includes(query);
        const matchTags = test.tags?.some((t) => t.toLowerCase().includes(query));
        const matchCode = (test.accessCode || test.passcode || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchTags && !matchCode) return false;
      }

      return true;
    });
  }, [allTests, activeTab, selectedSkill, searchQuery]);

  const classroomCount = useMemo(() => {
    return allTests.filter((t) => t.category === 'CLASSROOM_TEST' || t.isPrivate || Boolean(t.accessCode || t.passcode)).length;
  }, [allTests]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {/* Passcode Modal */}
      <IeltsPasscodeModal
        isOpen={passcodeModalOpen}
        onClose={() => {
          setPasscodeModalOpen(false);
          setSelectedTargetTest(null);
        }}
        targetTest={selectedTargetTest}
        onSuccess={handlePasscodeSuccess}
      />

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 p-6 md:p-10 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Rasmiy IELTS Mock Imtihonlari
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
                IELTS Academic & General Mock Testlar
              </h1>
              <p className="text-orange-100 text-sm md:text-base leading-relaxed">
                Cambridge 19, 18 autentik to&apos;liq simulyatsiyalari va ustozingiz tomonidan taqdim etilgan maxsus dars nazorat testlari.
              </p>
            </div>

            {/* Quick action: Enter Code */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTargetTest(null);
                  setPasscodeModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm shadow-lg shadow-black/10 flex items-center gap-2.5 transition-all transform active:scale-95"
              >
                <Key className="w-4 h-4 text-orange-600" />
                🔒 Dars Kodini Kiritish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Barcha Mock Testlar
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                {allTests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('classroom')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'classroom'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-500" />
              Maxsus Dars Testlari
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold">
                {classroomCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Test nomi yoki kod bo'yicha qidirish..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Skill Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', 'Full Mock', 'Listening', 'Reading', 'Writing', 'Speaking'].map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSkill === skill
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {skill === 'Listening' && <Headphones className="w-3.5 h-3.5" />}
              {skill === 'Reading' && <BookOpen className="w-3.5 h-3.5" />}
              {skill === 'Writing' && <PenTool className="w-3.5 h-3.5" />}
              {skill === 'Speaking' && <Mic className="w-3.5 h-3.5" />}
              {skill === 'ALL' && <Layers className="w-3.5 h-3.5" />}
              {skill === 'Full Mock' && <Award className="w-3.5 h-3.5" />}
              {skill === 'ALL' ? 'Barcha Bo‘limlar' : skill}
            </button>
          ))}
        </div>

        {/* Test Cards Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => {
              const unlocked = isTestUnlocked(test);
              const isClassroom = test.category === 'CLASSROOM_TEST' || test.isPrivate;

              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-200 hover:shadow-xl ${
                    isClassroom
                      ? 'border-amber-200 dark:border-amber-900/40 hover:border-amber-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500/40'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {test.examType}
                        </span>
                        {isClassroom ? (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            {unlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {unlocked ? 'Ochilgan' : 'Maxsus Dars Testi'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Bepul Mock
                          </span>
                        )}
                      </div>

                      {/* Target Band Pill */}
                      <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md">
                        Band {test.targetBand.toFixed(1)}+
                      </span>
                    </div>

                    {/* Test Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {test.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {test.description}
                    </p>

                    {/* Classroom Teacher Note if present */}
                    {test.teacherNote && (
                      <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{test.teacherNote}</span>
                      </div>
                    )}

                    {/* Module breakdown indicator pills */}
                    <div className="grid grid-cols-4 gap-2 mb-6 py-2 border-y border-slate-100 dark:border-slate-800/80 text-center">
                      <div className={`p-1.5 rounded-lg ${test.listeningAudioUrl ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-slate-300 dark:text-slate-700'}`}>
                        <Headphones className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-[10px] font-semibold block">Listening</span>
                      </div>
                      <div className={`p-1.5 rounded-lg ${test.readingPassagesCount ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' : 'text-slate-300 dark:text-slate-700'}`}>
                        <BookOpen className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-[10px] font-semibold block">Reading</span>
                      </div>
                      <div className={`p-1.5 rounded-lg ${test.writingTasksCount ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' : 'text-slate-300 dark:text-slate-700'}`}>
                        <PenTool className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-[10px] font-semibold block">Writing</span>
                      </div>
                      <div className={`p-1.5 rounded-lg ${test.speakingPartsCount ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' : 'text-slate-300 dark:text-slate-700'}`}>
                        <Mic className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-[10px] font-semibold block">Speaking</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Launch Button */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {test.totalTimeMinutes} daqiqa
                      </span>
                      <span>{test.attemptsCount.toLocaleString()} ta urinish</span>
                    </div>

                    {isClassroom && !unlocked ? (
                      <button
                        onClick={() => {
                          setSelectedTargetTest(test);
                          setPasscodeModalOpen(true);
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                      >
                        <Lock className="w-4 h-4" />
                        Kod Bilan Qulfdan Chiqarish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartTest(test)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Testni Boshlash
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Hech qanday test topilmadi
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Tanlangan filtr yoki qidiruv so&apos;zi bo&apos;yicha test mavjud emas. Filtrlarni tozalab ko&apos;ring.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedSkill('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Filtrlarni Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Interactive IELTS Simulation Taking Modal */}
      {activeTesting && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white">
          {/* Top Bar */}
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                IELTS Simulyator
              </span>
              <h2 className="text-base font-bold text-white truncate max-w-md">
                {activeTesting.title}
              </h2>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-orange-400 font-mono font-bold text-lg">
                <Clock className="w-5 h-5 text-orange-400" />
                {formatTime(testTimeRemaining)}
              </div>
              <button
                onClick={handleSubmitTestSimulation}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all"
              >
                Testni Yakunlash
              </button>
            </div>
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/60 border-b border-slate-800">
            <button
              onClick={() => setActiveSection('reading')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'reading' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Reading Bo&apos;limi
            </button>
            <button
              onClick={() => setActiveSection('listening')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'listening' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" /> Listening Bo&apos;limi
            </button>
            <button
              onClick={() => setActiveSection('writing')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'writing' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Writing Bo&apos;limi
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">
            {activeSection === 'reading' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold text-orange-400 mb-2">Passage 1: Academic Reading</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    The cognitive advantages of bilingualism have been extensively studied over past decades. Recent neuroimaging data indicates that switching between multiple languages strengthens executive function networks in the prefrontal cortex, enhancing problem-solving versatility and attenuating age-related cognitive decline...
                  </p>
                </div>
                {/* Sample Question */}
                <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-slate-400">Savol 1 / 40 (Multiple Choice)</span>
                  <p className="text-base font-semibold">
                    According to Paragraph 1, what neurological benefit is directly associated with multilingual capability?
                  </p>
                  <div className="space-y-2">
                    {[
                      'A) Enhanced vocabulary retention without active practice',
                      'B) Strengthening of prefrontal cortex executive control networks',
                      'C) Immediate immunity to linguistic interference',
                      'D) Complete elimination of mental fatigue during exams',
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setStudentAnswers({ ...studentAnswers, q1: opt })}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                          studentAnswers.q1 === opt
                            ? 'bg-orange-500/20 border-orange-500 text-white font-semibold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'listening' && (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-6">
                <h4 className="text-sm font-bold text-orange-400">Listening Audio Player</h4>
                <div className="p-4 bg-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-6 h-6 text-orange-400" />
                    <div>
                      <div className="text-sm font-bold">Section 1: University Accommodation Inquiry</div>
                      <div className="text-xs text-slate-400">40 savol • 30 daqiqa</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Simulyatsiya faol</span>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold block">Question 1: Student Contact Phone Number</label>
                  <input
                    type="text"
                    placeholder="Javobingizni kiriting..."
                    onChange={(e) => setStudentAnswers({ ...studentAnswers, q_listen_1: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {activeSection === 'writing' && (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-orange-400">Writing Task 2 (Essay)</h4>
                  <span className="text-xs font-mono text-slate-400">
                    So&apos;zlar soni: {studentWritingInput.trim().split(/\s+/).filter(Boolean).length} / 250 min
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Some people believe that university education should be free for all students, while others argue that students should pay for their own higher education. Discuss both views and give your own opinion.
                </p>
                <textarea
                  rows={10}
                  value={studentWritingInput}
                  onChange={(e) => setStudentWritingInput(e.target.value)}
                  placeholder="Insho matnini bu yerga yozing..."
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-orange-500 font-sans leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {showResultModal && lastSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              Imtihon Muvaffaqiyatli Yakunlandi!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {lastSubmission.testTitle}
            </p>

            {/* Big Overall Band Display */}
            <div className="py-5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 mb-6">
              <span className="text-xs uppercase font-bold tracking-wider opacity-90 block mb-1">
                Umumiy IELTS Natijangiz
              </span>
              <span className="text-5xl font-black">
                {lastSubmission.overallBand.toFixed(1)}
              </span>
            </div>

            {/* 4 Skills Breakdown */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Listening</span>
                <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                  {lastSubmission.listeningBand.toFixed(1)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Reading</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {lastSubmission.readingBand.toFixed(1)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Writing</span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                  {lastSubmission.writingBand?.toFixed(1) || '7.0'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Speaking</span>
                <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                  {lastSubmission.speakingBand?.toFixed(1) || '7.0'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-95 transition-opacity"
            >
              Natijani Saqlash va Chiqish
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
