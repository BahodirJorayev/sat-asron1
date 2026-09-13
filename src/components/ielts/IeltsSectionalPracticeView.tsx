'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Award,
  ChevronRight,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  Play,
  Lightbulb,
  BookmarkPlus,
  Volume2
} from 'lucide-react';
import { User } from '../../types';
import {
  IeltsModuleType,
  IeltsPracticeItem,
  IeltsSubQuestion,
  IELTS_QUESTION_TYPES,
  INITIAL_IELTS_PRACTICE_ITEMS,
} from '../../data/ieltsPracticeData';
import { useUserProgress } from '../../hooks/useUserProgress';

interface IeltsSectionalPracticeViewProps {
  user?: User | null;
  onOpenPaywall?: () => void;
  onOpenMistakeVault?: () => void;
}

export const IeltsSectionalPracticeView: React.FC<IeltsSectionalPracticeViewProps> = ({
  user,
  onOpenPaywall,
  onOpenMistakeVault,
}) => {
  const { recordQuestionAnswer, recordMistake } = useUserProgress(user);

  // Module state
  const [activeModule, setActiveModule] = useState<IeltsModuleType>('Reading');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // User responses state for active item: questionId -> selectedOption
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  // Submitted evaluation state: questionId -> boolean (true: correct, false: incorrect)
  const [evaluatedAnswers, setEvaluatedAnswers] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Filter items by module, questionType, and search query
  const filteredItems = useMemo(() => {
    return INITIAL_IELTS_PRACTICE_ITEMS.filter((item) => {
      if (item.module !== activeModule) return false;
      if (selectedQuestionType !== 'ALL' && item.questionType !== selectedQuestionType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchContext = item.academicContext.toLowerCase().includes(q);
        const matchPassage = item.passageOrPrompt.toLowerCase().includes(q);
        if (!matchTitle && !matchContext && !matchPassage) return false;
      }
      return true;
    });
  }, [activeModule, selectedQuestionType, searchQuery]);

  const activeItem: IeltsPracticeItem | undefined = filteredItems[activeItemIndex] || filteredItems[0];

  // Handle module change
  const handleSelectModule = (mod: IeltsModuleType) => {
    setActiveModule(mod);
    setSelectedQuestionType('ALL');
    setActiveItemIndex(0);
    setUserAnswers({});
    setEvaluatedAnswers({});
    setShowExplanation({});
  };

  // Handle answering a sub-question
  const handleSelectOption = (questionId: string, option: string) => {
    // If already evaluated, don't allow change
    if (evaluatedAnswers[questionId] !== undefined) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Check answer for a sub-question
  const handleCheckAnswer = async (subQ: IeltsSubQuestion) => {
    const selected = userAnswers[subQ.id];
    if (!selected) return;

    const isCorrect = selected.trim().toUpperCase() === subQ.correctAnswer.trim().toUpperCase();

    setEvaluatedAnswers((prev) => ({ ...prev, [subQ.id]: isCorrect }));
    setShowExplanation((prev) => ({ ...prev, [subQ.id]: true }));

    // Record answer in real user_progress
    try {
      await recordQuestionAnswer(subQ.id, isCorrect, selected);

      // If incorrect, deposit into Mistake Vault
      if (!isCorrect && activeItem) {
        await recordMistake({
          questionId: subQ.id,
          questionText: subQ.questionText,
          selectedAnswer: selected,
          correctAnswer: subQ.correctAnswer,
          explanation: subQ.explanation,
          skillDomain: activeItem.module,
          subSkill: activeItem.questionType,
          difficulty: activeItem.difficulty,
        });
      }
    } catch (err) {
      console.warn('Error recording answer:', err);
    }
  };

  // Reset active exercise
  const handleResetCurrent = () => {
    setUserAnswers({});
    setEvaluatedAnswers({});
    setShowExplanation({});
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-orange-600 via-amber-600 to-rose-600 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              IELTS Bo&apos;limlar Boyicha Praktika
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Savol Turlari Boyicha Maqsadli Mashg&apos;ulot
            </h1>
            <p className="text-orange-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              True/False/Not Given, Matching Headings, Task 1 grafikalari va Speaking Part 2-3 savol turlari boyicha haqiqiy Cambridge akademik savollari bilan mashq qiling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetCurrent}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Qayta Boshlash
            </button>
          </div>
        </div>
      </div>

      {/* 2. Controls: Module Switcher & Question-Type Filter Chips */}
      <div className="max-w-7xl mx-auto space-y-4 mb-6">
        {/* Module Segmented Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {[
            { id: 'Reading', label: 'Reading (O‘qish)', icon: BookOpen },
            { id: 'Listening', label: 'Listening (Eshitish)', icon: Headphones },
            { id: 'Writing', label: 'Writing (Yozish)', icon: PenTool },
            { id: 'Speaking', label: 'Speaking (So‘zlashuv)', icon: Mic },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectModule(item.id as IeltsModuleType)}
                className={`py-3 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Granular Question-Type Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedQuestionType('ALL');
              setActiveItemIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedQuestionType === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Barcha Savol Turlari
          </button>

          {IELTS_QUESTION_TYPES[activeModule].map((qType) => {
            const isSelected = selectedQuestionType === qType;
            return (
              <button
                key={qType}
                onClick={() => {
                  setSelectedQuestionType(qType);
                  setActiveItemIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500/40'
                }`}
              >
                <span>{qType}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Practice Interactive Workspace */}
      <div className="max-w-7xl mx-auto">
        {activeItem ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Pane: Passage / Audio transcript / Writing Prompt (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                      {activeItem.questionType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {activeItem.academicContext}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                    {activeItem.title}
                  </h2>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Target Band {activeItem.targetBand.toFixed(1)}
                </span>
              </div>

              {/* Audio Player Indicator if Listening */}
              {activeItem.module === 'Listening' && (
                <div className="p-4 bg-orange-50/60 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Audio Simulyator (Haqiqiy Imtihon Tempida)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Davomiyligi: {activeItem.audioDurationSeconds || 120} soniya • 1 marta yangraydi
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                    FAOL
                  </span>
                </div>
              )}

              {/* Content Body */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[620px] leading-relaxed text-sm md:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line font-serif selection:bg-orange-200 dark:selection:bg-orange-900">
                {activeItem.passageOrPrompt}
              </div>

              {/* Footer navigation between practice sets */}
              {filteredItems.length > 1 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">
                    Mashq {activeItemIndex + 1} / {filteredItems.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeItemIndex === 0}
                      onClick={() => {
                        setActiveItemIndex((prev) => Math.max(0, prev - 1));
                        handleResetCurrent();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600 disabled:opacity-40 cursor-pointer"
                    >
                      Oldingisi
                    </button>
                    <button
                      disabled={activeItemIndex >= filteredItems.length - 1}
                      onClick={() => {
                        setActiveItemIndex((prev) => Math.min(filteredItems.length - 1, prev + 1));
                        handleResetCurrent();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Keyingisi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane: Interactive Question Answering & Verification (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    Savollar & Javobni Tekshirish
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {activeItem.questions.length} ta savol
                  </span>
                </div>

                <div className="space-y-6">
                  {activeItem.questions.map((subQ) => {
                    const selected = userAnswers[subQ.id];
                    const isEvaluated = evaluatedAnswers[subQ.id] !== undefined;
                    const isCorrect = evaluatedAnswers[subQ.id] === true;
                    const isOpenExp = showExplanation[subQ.id] === true;

                    return (
                      <div
                        key={subQ.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isEvaluated
                            ? isCorrect
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                              : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Question Text */}
                        <div className="flex items-start gap-2.5 mb-3">
                          <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {subQ.questionNumber}
                          </span>
                          <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                            {subQ.questionText}
                          </p>
                        </div>

                        {/* Options */}
                        {subQ.options && subQ.options.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {subQ.options.map((opt, i) => {
                              const isThisSelected = selected === opt;
                              const isThisCorrect = subQ.correctAnswer === opt;

                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleSelectOption(subQ.id, opt)}
                                  disabled={isEvaluated}
                                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                    isEvaluated
                                      ? isThisCorrect
                                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                        : isThisSelected
                                        ? 'bg-rose-500 text-white font-bold'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                      : isThisSelected
                                      ? 'bg-orange-500/15 border-2 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isEvaluated && isThisCorrect && (
                                    <Check className="w-4 h-4 text-white shrink-0" />
                                  )}
                                  {isEvaluated && isThisSelected && !isThisCorrect && (
                                    <X className="w-4 h-4 text-white shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Action Button: Check Answer */}
                        {!isEvaluated ? (
                          <button
                            type="button"
                            disabled={!selected}
                            onClick={() => handleCheckAnswer(subQ)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Javobni Tekshirish
                          </button>
                        ) : (
                          <div className="pt-2">
                            {/* Result Indicator */}
                            <div className="flex items-center justify-between text-xs font-bold mb-2">
                              <span
                                className={`flex items-center gap-1 ${
                                  isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {isCorrect ? 'To‘g‘ri javob!' : 'Noto‘g‘ri javob'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowExplanation((prev) => ({ ...prev, [subQ.id]: !isOpenExp }))
                                }
                                className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                              >
                                {isOpenExp ? 'Tushuntirishni yashirish' : 'Tushuntirishni ko‘rish'}
                              </button>
                            </div>

                            {/* Detailed Explanation & Proof */}
                            {isOpenExp && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                                    To‘g‘ri javob:
                                  </span>
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {subQ.correctAnswer}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                                    Akademik tahlil:
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {subQ.explanation}
                                  </p>
                                </div>
                                {subQ.userTip && (
                                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Band 8+ Maslahati:</strong> {subQ.userTip}
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Ushbu savol turi bo‘yicha mashq topilmadi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Boshqa modul yoki savol turini tanlang.
            </p>
            <button
              onClick={() => setSelectedQuestionType('ALL')}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
            >
              Barcha savol turlarini ko‘rsatish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
