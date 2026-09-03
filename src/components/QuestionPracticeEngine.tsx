import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Calculator,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Highlighter,
  Sliders,
  Send,
  Loader2,
  FileText,
  BrainCircuit,
  CornerDownRight,
  ArrowRight,
  Check,
  Flame,
  Layers,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import { Question, User, UserQuestionPractice } from '../types';
import { KaTeXRenderer } from './KaTeXRenderer';
import { DesmosCalculator } from './DesmosCalculator';
import { FloatingDesmosWidget } from './FloatingDesmosWidget';
import { FormulaReferenceSheet } from './FormulaReferenceSheet';
import { SocraticTutorDrawer } from './SocraticTutorDrawer';

interface QuestionPracticeEngineProps {
  user: User;
  questions: Question[];
  initialQuestionIndex?: number;
  onExit: () => void;
  onSavePracticeResult: (result: UserQuestionPractice) => void;
  onDepositMistake?: (question: Question, userWrongAnswer: string) => void;
  onOpenPaywall?: () => void;
  existingPractices?: Record<string, UserQuestionPractice>;
}

export const QuestionPracticeEngine: React.FC<QuestionPracticeEngineProps> = ({
  user,
  questions,
  initialQuestionIndex = 0,
  onExit,
  onSavePracticeResult,
  onDepositMistake,
  onOpenPaywall,
  existingPractices = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex);
  const currentQuestion = questions[currentIndex] || questions[0];

  // User Response State
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [gridInInput, setGridInInput] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Strikethrough tool state
  const [isStrikethroughActive, setIsStrikethroughActive] = useState<boolean>(false);
  const [struckOptions, setStruckOptions] = useState<string[]>([]);

  // Count-up Stopwatch (tracks time spent per question)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Tools & Drawers
  const [showDesmos, setShowDesmos] = useState<boolean>(false);
  const [showFormulas, setShowFormulas] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showSocraticCoach, setShowSocraticCoach] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Text highlighting in passage
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  const [isHighlighterActive, setIsHighlighterActive] = useState<boolean>(false);
  const passageRef = useRef<HTMLDivElement>(null);

  // Socratic Coach AI Chat State
  const [coachMessages, setCoachMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);
  const [coachInput, setCoachInput] = useState<string>('');
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);

  // In-Situ 3 AI Action States
  const [isFloatingDesmosOpen, setIsFloatingDesmosOpen] = useState<boolean>(false);
  const [floatingDesmosExpr, setFloatingDesmosExpr] = useState<string>('');
  const [isTrapLoading, setIsTrapLoading] = useState<boolean>(false);
  const [isTwinLoading, setIsTwinLoading] = useState<boolean>(false);
  const [twinQuestion, setTwinQuestion] = useState<Question | null>(null);
  const [showTwinModal, setShowTwinModal] = useState<boolean>(false);
  const [twinSelectedAnswer, setTwinSelectedAnswer] = useState<string>('');
  const [isTwinChecked, setIsTwinChecked] = useState<boolean>(false);

  const isPro = user.planTier === 'PRO';

  // Load existing practice record when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    const prevRecord = existingPractices[currentQuestion.id];
    if (prevRecord) {
      if (currentQuestion.type === 'GRID_IN') {
        setGridInInput(prevRecord.userAnswer);
        setSelectedAnswer('');
      } else {
        setSelectedAnswer(prevRecord.userAnswer);
        setGridInInput('');
      }
      setIsAnswerChecked(true);
      setIsAnswerCorrect(prevRecord.isCorrect);
      setIsBookmarked(prevRecord.isBookmarked);
      setElapsedSeconds(prevRecord.timeSpentSecs || 0);
    } else {
      setSelectedAnswer('');
      setGridInInput('');
      setIsAnswerChecked(false);
      setIsAnswerCorrect(null);
      setIsBookmarked(false);
      setElapsedSeconds(0);
    }

    setStruckOptions([]);
    setShowExplanation(false);
    setShowSocraticCoach(false);
    setCoachMessages([]);
    setIsTimerRunning(true);
  }, [currentIndex, currentQuestion]);

  // Stopwatch Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isAnswerChecked) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isAnswerChecked]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle Strikethrough on choice
  const handleToggleStrike = (optionKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isStrikethroughActive) return;
    setStruckOptions((prev) =>
      prev.includes(optionKey) ? prev.filter((k) => k !== optionKey) : [...prev, optionKey]
    );
  };

  // Handle Option Select
  const handleSelectOption = (key: string) => {
    if (isAnswerChecked) return;
    if (struckOptions.includes(key)) return;
    setSelectedAnswer(key);
  };

  // Handle Check Answer
  const handleCheckAnswer = () => {
    if (!currentQuestion) return;

    let ans = '';
    let correct = false;

    if (currentQuestion.type === 'GRID_IN') {
      ans = gridInInput.trim();
      if (!ans) return;

      const userNum = parseFloat(ans.replace('/', '.'));
      const correctNum = parseFloat(currentQuestion.correctAnswer.replace('/', '.'));

      // Check string equality or numeric equivalence
      if (ans.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
        correct = true;
      } else if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.001) {
        correct = true;
      }
    } else {
      ans = selectedAnswer;
      if (!ans) return;
      correct = ans.trim().toUpperCase() === currentQuestion.correctAnswer.trim().toUpperCase();
    }

    setIsAnswerChecked(true);
    setIsAnswerCorrect(correct);
    setIsTimerRunning(false);

    // Save record
    const resultRecord: UserQuestionPractice = {
      id: `practice-${user.id}-${currentQuestion.id}`,
      userId: user.id,
      questionId: currentQuestion.id,
      userAnswer: ans,
      isCorrect: correct,
      timeSpentSecs: elapsedSeconds,
      isBookmarked: isBookmarked,
      lastAttemptedAt: new Date().toISOString(),
    };
    onSavePracticeResult(resultRecord);

    // If incorrect, automatically deposit into user's Mistake Vault
    if (!correct && onDepositMistake) {
      onDepositMistake(currentQuestion, ans);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);

    if (currentQuestion && isAnswerChecked) {
      const ans = currentQuestion.type === 'GRID_IN' ? gridInInput : selectedAnswer;
      const resultRecord: UserQuestionPractice = {
        id: `practice-${user.id}-${currentQuestion.id}`,
        userId: user.id,
        questionId: currentQuestion.id,
        userAnswer: ans,
        isCorrect: isAnswerCorrect ?? false,
        timeSpentSecs: elapsedSeconds,
        isBookmarked: newBookmarked,
        lastAttemptedAt: new Date().toISOString(),
      };
      onSavePracticeResult(resultRecord);
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Socratic Coach AI Handler
  const handleAskCoach = async (initialHint = false) => {
    if (!isPro && onOpenPaywall) {
      onOpenPaywall();
      return;
    }

    setShowSocraticCoach(true);
    setIsCoachLoading(true);

    const userPrompt = initialHint
      ? 'Please give me a Socratic hint without spoiling the final answer.'
      : coachInput.trim();

    if (!initialHint) {
      setCoachMessages((prev) => [...prev, { sender: 'user', text: userPrompt }]);
      setCoachInput('');
    }

    try {
      const res = await fetch('/api/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          userMessage: userPrompt,
          chatHistory: coachMessages,
          studentScoreTier: `${user.targetScore || 1550}+`,
        }),
      });

      if (!res.ok) throw new Error('Coach service unavailable');
      const data = await res.json();
      const reply = data.reply || 'Focus on the core algebraic constraints or transitional shift in the passage.';
      setCoachMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      // Fallback Socratic guidance
      const isMath = currentQuestion.section === 'MATH';
      const fallbackReply = isMath
        ? `Let's break down this **${currentQuestion.skill}** problem:\n\n1. What is the fundamental formula or constraint given?\n2. Can you isolate the variable or use Desmos to graph the equations and find their intersection or vertex?\n3. What happens if you test the boundary cases?`
        : `Let's analyze this **${currentQuestion.skill}** question:\n\n1. Look at the logical relationship between the sentences (contrast, causality, continuation, or example).\n2. Eliminate choices that introduce unstated relationships.\n3. What is the author's primary communicative purpose in the blank?`;

      setCoachMessages((prev) => [...prev, { sender: 'ai', text: fallbackReply }]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // 1. "⚡ Nega bu xato? (AI Tahlil)" In-Situ Action
  const handleRunTrapAnalysis = async () => {
    setShowSocraticCoach(true);
    setIsCoachLoading(true);

    try {
      const res = await fetch('/api/gemini/trap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          userWrongAnswer: selectedAnswer || gridInInput || 'Student Choice',
          correctAnswer: currentQuestion.correctAnswer,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const trapText = `⚡ **AI Trap Tahlili (${data.analysis?.cognitiveBias || 'Kognitiv Qopqon'}):**\n\n- **E'tibordan chetda qolgan qoida:** ${data.analysis?.coreRuleMissed}\n- **Test tuzuvchi qopqoni:** ${data.analysis?.trapReason}\n- **Imtihondagi himoya strategiyasi:** ${data.analysis?.preventionStrategy}`;
        setCoachMessages((prev) => [...prev, { sender: 'ai', text: trapText }]);
      } else {
        throw new Error('Trap analysis API error');
      }
    } catch {
      const fallbackTrap = `⚡ **Trap Tahlili (${currentQuestion.skill}):**\n\n- **Xato sababi:** Ushbu savolda test tuzuvchi ko'p uchraydigan chalg'ituvchi variantni (distractor) qo'llagan.\n- **To'g'ri strategiya:** Asosiy shartni qayta o'qib, o'zgaruvchining chegaralarini tekshiring.`;
      setCoachMessages((prev) => [...prev, { sender: 'ai', text: fallbackTrap }]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // 2. "🧮 Desmosda Yechish" In-Situ Action
  const handleRunDesmosSolve = async () => {
    try {
      const res = await fetch('/api/gemini/desmos-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (res.ok) {
        const data = await res.json();
        const expr = data.equations?.join('; ') || 'y = 2x^2 - 8x + 6';
        setFloatingDesmosExpr(expr);
        setIsFloatingDesmosOpen(true);

        const desmosTip = `🧮 **Desmosda Yechish:**\n\n${data.instructions}\n\n*Pro-Tip:* ${data.shortcutTip || 'Kalkulyator oynasida tenglamalarni tekshiring.'}`;
        setCoachMessages((prev) => [...prev, { sender: 'ai', text: desmosTip }]);
      } else {
        setIsFloatingDesmosOpen(true);
      }
    } catch {
      setIsFloatingDesmosOpen(true);
    }
  };

  // 3. "🎯 O'xshash Savol Tuzish (Twin Question)" In-Situ Action
  const handleRunTwinQuestion = async () => {
    setIsTwinLoading(true);
    setTwinSelectedAnswer('');
    setIsTwinChecked(false);

    try {
      const res = await fetch('/api/gemini/clone-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuestion: currentQuestion }),
      });

      if (res.ok) {
        const data = await res.json();
        setTwinQuestion(data.clonedQuestion);
        setShowTwinModal(true);
      } else {
        throw new Error('Clone error');
      }
    } catch {
      // Synthetic fallback twin
      const fallbackTwin: Question = {
        ...currentQuestion,
        id: `twin-${Date.now()}`,
        sqbId: `${currentQuestion.sqbId}-TWIN`,
        questionText: `(Twin Drill) ${currentQuestion.questionText}`,
      };
      setTwinQuestion(fallbackTwin);
      setShowTwinModal(true);
    } finally {
      setIsTwinLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-[#1E1B18] font-sans">
        <p>No questions selected for practice.</p>
        <button
          onClick={onExit}
          className="mt-4 px-5 py-2.5 rounded-xl bg-[#1E1B18] text-white text-xs font-bold"
        >
          Return to Question Bank
        </button>
      </div>
    );
  }

  const isRW = currentQuestion.section === 'READING_AND_WRITING';

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col font-sans text-[#1E1B18] overflow-hidden select-text">
      {/* 1. TOP BLUEBOOK-STYLE NAVIGATION BAR */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-[#E5E0D8] flex items-center justify-between shrink-0 select-none shadow-2xs">
        {/* Left: Section and Domain info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-[#78716C]">
              {isRW ? 'Reading and Writing' : 'Math'}
            </span>
            <span className="text-[#D0C9BE] text-xs">/</span>
            <span className="text-xs font-semibold text-[#1E1B18] truncate max-w-[140px] sm:max-w-xs">
              {currentQuestion.domain}
            </span>
          </div>
          <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5E0D8] text-[#3D405B]">
            {currentQuestion.skill}
          </span>
        </div>

        {/* Center: Count-Up Practice Stopwatch */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] shadow-2xs">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-[#78716C] hover:text-[#1E1B18] cursor-pointer transition-colors p-0.5"
            title={isTimerRunning ? 'Pause Stopwatch' : 'Resume Stopwatch'}
          >
            {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#1E1B18]">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-[9px] uppercase font-bold text-[#78716C] tracking-wider hidden sm:inline">
            Elapsed
          </span>
        </div>

        {/* Right: Tools & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Formula Reference */}
          <button
            onClick={() => setShowFormulas(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E5E0D8] hover:bg-[#FAF8F5] text-xs font-bold text-[#3D405B] transition-all cursor-pointer"
            title="SAT Reference Formulas"
          >
            <BookOpen size={14} />
            <span className="hidden lg:inline text-xs">Formulas</span>
          </button>

          {/* Desmos Graphing Calculator */}
          <button
            onClick={() => setShowDesmos(!showDesmos)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showDesmos
                ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                : 'border-[#E5E0D8] hover:bg-[#FAF8F5] text-[#3D405B]'
            }`}
            title="Toggle Desmos Graphing Calculator"
          >
            <Calculator size={14} />
            <span className="hidden lg:inline text-xs">Desmos</span>
          </button>

          {/* Strikethrough Tool */}
          {currentQuestion.type !== 'GRID_IN' && (
            <button
              onClick={() => setIsStrikethroughActive(!isStrikethroughActive)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isStrikethroughActive
                  ? 'bg-[#E07A5F] text-white border-[#E07A5F]'
                  : 'border-[#E5E0D8] hover:bg-[#FAF8F5] text-[#78716C]'
              }`}
              title="ABC Option Strikethrough Tool"
            >
              <span className="font-mono text-xs font-black line-through">ABC</span>
            </button>
          )}

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl border border-[#E5E0D8] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold text-[#78716C] transition-all cursor-pointer flex items-center gap-1"
            title="Exit Practice"
          >
            <X size={15} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT-PANE QUESTION BODY */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D8] overflow-y-auto md:overflow-hidden bg-[#FAF8F5]">
        {/* LEFT PANE: Passage / Context / Stimulus */}
        <div className="md:h-full md:overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[#78716C] tracking-wider">
                {isRW ? 'Reading Passage & Stimulus' : 'Mathematical Context'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E0D8] text-[#78716C]">
                Official Blueprint
              </span>
            </div>
          </div>

          {/* Passage or Mathematical Stimulus Content */}
          <div ref={passageRef} className="space-y-4 text-sm sm:text-base leading-relaxed text-[#1E1B18]">
            {currentQuestion.passage ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xs">
                <KaTeXRenderer text={currentQuestion.passage} className="text-[#1E1B18] font-serif sm:text-[15px] leading-[1.75]" />
              </div>
            ) : (
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xs space-y-3">
                <p className="text-xs text-[#78716C] font-mono uppercase">Problem Statement</p>
                <KaTeXRenderer text={currentQuestion.questionText} className="text-[#1E1B18] text-base sm:text-lg font-medium leading-relaxed" />
              </div>
            )}

            {currentQuestion.imageUrl && (
              <div className="p-3 bg-white rounded-2xl border border-[#E5E0D8] flex justify-center">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Problem figure"
                  className="max-h-60 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Prompt & Answers */}
        <div className="md:h-full md:overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-5">
            {/* Header: ID, Difficulty & Bookmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] text-[#3D405B]">
                  {currentQuestion.sqbId || `#${currentQuestion.id.slice(0, 8)}`}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    currentQuestion.difficulty === 'EASY'
                      ? 'bg-[#EBF8F5] text-[#2A9D8F] border-[#BCE8DE]'
                      : currentQuestion.difficulty === 'MEDIUM'
                      ? 'bg-[#FFF9E6] text-[#B78103] border-[#FBE39D]'
                      : 'bg-[#FFF4F0] text-[#E07A5F] border-[#FCD9CE]'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
                {currentQuestion.globalAccuracy && (
                  <span className="text-[10px] font-mono text-[#78716C]">
                    Global Acc: {currentQuestion.globalAccuracy}%
                  </span>
                )}
              </div>

              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  isBookmarked
                    ? 'bg-[#FFF4F0] text-[#E07A5F] border-[#FCD9CE]'
                    : 'bg-[#FAF8F5] text-[#78716C] border-[#E5E0D8] hover:text-[#1E1B18]'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark & Flag in Vault'}
              >
                {isBookmarked ? <BookmarkCheck size={14} className="fill-[#E07A5F]" /> : <Bookmark size={14} />}
                <span className="text-[11px]">{isBookmarked ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Prompt Text (for RW or when passage is present) */}
            {currentQuestion.passage && (
              <div className="text-sm sm:text-base font-semibold text-[#1E1B18] leading-snug">
                <KaTeXRenderer text={currentQuestion.questionText} />
              </div>
            )}

            {/* CHOICES (Multiple Choice) OR NUMERIC GRID-IN INPUT */}
            {currentQuestion.type === 'GRID_IN' ? (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Student-Produced Response (Numeric Grid-In)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    disabled={isAnswerChecked}
                    value={gridInInput}
                    onChange={(e) => setGridInInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAnswerChecked && gridInInput.trim()) {
                        handleCheckAnswer();
                      }
                    }}
                    placeholder="e.g. 18, 3/4, 0.75, or -2.5"
                    className="w-full sm:w-64 px-4 py-3 rounded-xl bg-white border border-[#E5E0D8] font-mono text-base font-bold text-[#1E1B18] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                  {!isAnswerChecked && (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!gridInInput.trim()}
                      className="px-5 py-3 rounded-xl bg-[#1E1B18] hover:bg-[#3D405B] text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Submit
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#78716C]">
                  Enter fractions (e.g. 7/2) or decimals (e.g. 3.5). No dollar signs, units, or mixed fractions.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentQuestion.options &&
                  Object.entries(currentQuestion.options).map(([key, value]) => {
                    const isSelected = selectedAnswer === key;
                    const isStruck = struckOptions.includes(key);
                    const isCorrect = key === currentQuestion.correctAnswer;

                    // Compute styling based on checked state
                    let itemStyle = 'bg-white border-[#E5E0D8] hover:border-[#78716C]/60';
                    let badgeStyle = 'bg-[#FAF8F5] text-[#1E1B18] border-[#E5E0D8]';

                    if (isAnswerChecked) {
                      if (isCorrect) {
                        itemStyle = 'bg-[#EBF8F5] border-[#2A9D8F] ring-1 ring-[#2A9D8F]';
                        badgeStyle = 'bg-[#2A9D8F] text-white border-[#2A9D8F]';
                      } else if (isSelected && !isCorrect) {
                        itemStyle = 'bg-rose-50 border-rose-400 ring-1 ring-rose-400';
                        badgeStyle = 'bg-rose-600 text-white border-rose-600';
                      } else {
                        itemStyle = 'bg-white opacity-50 border-[#E5E0D8]';
                      }
                    } else if (isSelected) {
                      itemStyle = 'bg-[#FAF8F5] border-[#1E1B18] ring-1 ring-[#1E1B18]';
                      badgeStyle = 'bg-[#1E1B18] text-white border-[#1E1B18]';
                    }

                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectOption(key)}
                        className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${itemStyle} ${
                          isStruck ? 'opacity-35 line-through' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border transition-all ${badgeStyle}`}
                          >
                            {key}
                          </span>
                          <div className="pt-0.5 text-xs sm:text-sm font-medium text-[#1E1B18] leading-relaxed">
                            <KaTeXRenderer text={value} inline />
                          </div>
                        </div>

                        {/* Strikethrough Action Icon on Hover */}
                        {isStrikethroughActive && !isAnswerChecked && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleStrike(key, e)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] hover:bg-[#EBE5DF] text-[#78716C] border border-[#E5E0D8] transition-colors"
                          >
                            {isStruck ? 'Unstrike' : 'Strike'}
                          </button>
                        )}

                        {/* Status Icon when checked */}
                        {isAnswerChecked && isCorrect && (
                          <CheckCircle2 size={18} className="text-[#2A9D8F] shrink-0 mt-0.5" />
                        )}
                        {isAnswerChecked && isSelected && !isCorrect && (
                          <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Answer Result Banner */}
            {isAnswerChecked && (
              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                    isAnswerCorrect
                      ? 'bg-[#EBF8F5] border-[#BCE8DE] text-[#1E1B18]'
                      : 'bg-rose-50 border-rose-200 text-[#1E1B18]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isAnswerCorrect ? 'bg-[#2A9D8F] text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isAnswerCorrect ? <Check size={18} /> : <X size={18} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">
                        {isAnswerCorrect ? 'Correct Answer!' : 'Incorrect — Deposited to Mistake Vault'}
                      </div>
                      <div className="text-[11px] text-[#78716C]">
                        Correct Solution:{' '}
                        <strong className="font-mono text-[#1E1B18]">
                          {currentQuestion.correctAnswer}
                        </strong>{' '}
                        • Time: <strong className="font-mono text-[#1E1B18]">{formatTime(elapsedSeconds)}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E0D8] hover:bg-[#FAF8F5] text-xs font-bold text-[#1E1B18] shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    {showExplanation ? 'Hide Explanation' : 'View Solution'}
                  </button>
                </div>

                {/* 3 Executive In-Situ AI Error Action Buttons */}
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-mono font-bold text-[#78716C] flex items-center gap-1">
                    <Sparkles size={13} className="text-[#E07A5F]" />
                    <span>AI Diagnostic Actions:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleRunTrapAnalysis}
                      disabled={isTrapLoading}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <Zap size={13} className="text-amber-600" />
                      <span>⚡ Nega bu xato?</span>
                    </button>

                    <button
                      onClick={handleRunDesmosSolve}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <Calculator size={13} className="text-blue-600" />
                      <span>🧮 Desmosda Yechish</span>
                    </button>

                    <button
                      onClick={handleRunTwinQuestion}
                      disabled={isTwinLoading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      {isTwinLoading ? (
                        <Loader2 size={13} className="animate-spin text-emerald-600" />
                      ) : (
                        <Target size={13} className="text-emerald-600" />
                      )}
                      <span>🎯 O'xshash Savol (Twin)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-step Solution Drawer */}
          {showExplanation && (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D405B] flex items-center gap-1.5">
                  <FileText size={14} /> Official Step-by-Step Explanation
                </span>
              </div>
              <KaTeXRenderer text={currentQuestion.explanation} className="text-xs sm:text-sm text-[#1E1B18] leading-relaxed" />
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTTOM CONTROL & NAVIGATION FOOTER */}
      <footer className="h-16 px-4 sm:px-8 bg-white border-t border-[#E5E0D8] flex items-center justify-between shrink-0 select-none shadow-2xs">
        {/* Left: Previous / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-3.5 py-2 rounded-xl border border-[#E5E0D8] hover:bg-[#FAF8F5] disabled:opacity-30 text-xs font-bold text-[#1E1B18] transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="px-3.5 py-2 rounded-xl border border-[#E5E0D8] hover:bg-[#FAF8F5] disabled:opacity-30 text-xs font-bold text-[#1E1B18] transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Center: Question index and status dots */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1E1B18] font-mono">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Right: Check Answer / Socratic AI Coach */}
        <div className="flex items-center gap-2">
          {/* Gemini Socratic Coach Button */}
          <button
            onClick={() => handleAskCoach(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF5F0] hover:bg-[#FFF0EB] text-[#E07A5F] border border-[#FCD9CE] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Get Socratic Hint from Gemini AI"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Socratic Coach</span>
          </button>

          {/* Primary Action Button */}
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={currentQuestion.type === 'GRID_IN' ? !gridInInput.trim() : !selectedAnswer}
              className="px-5 py-2 rounded-xl bg-[#1E1B18] hover:bg-[#3D405B] disabled:opacity-30 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="px-5 py-2 rounded-xl bg-[#1E1B18] hover:bg-[#3D405B] disabled:opacity-30 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </footer>

      {/* 4. GEMINI SOCRATIC COACH SLIDE-OVER DRAWER */}
      <SocraticTutorDrawer
        isOpen={showSocraticCoach}
        onClose={() => setShowSocraticCoach(false)}
        question={currentQuestion}
        userWrongAnswer={selectedAnswer || gridInInput}
      />

      {/* 5. FLOATING DESMOS GRAPHING CALCULATOR MODAL */}
      <DesmosCalculator isOpen={showDesmos} onClose={() => setShowDesmos(false)} />

      {/* Floating Desmos Widget for In-Situ Solve */}
      <FloatingDesmosWidget
        isOpen={isFloatingDesmosOpen}
        onClose={() => setIsFloatingDesmosOpen(false)}
        initialExpression={floatingDesmosExpr}
      />

      {/* 6. SAT FORMULA REFERENCE SHEET MODAL */}
      <FormulaReferenceSheet isOpen={showFormulas} onClose={() => setShowFormulas(false)} />

      {/* 7. TWIN QUESTION PRACTICE MODAL */}
      {showTwinModal && twinQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1B3D]">Twin (Egizak) SAT Savol Mashqi</h3>
                  <p className="text-[10px] font-mono text-[#78716C]">{twinQuestion.skill} • {twinQuestion.domain}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTwinModal(false)}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1E1B18] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stimulus */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs sm:text-sm leading-relaxed max-h-60 overflow-y-auto">
              <KaTeXRenderer text={twinQuestion.passage || twinQuestion.questionText} />
            </div>

            {/* Options */}
            {twinQuestion.options && (
              <div className="space-y-2">
                {Object.entries(twinQuestion.options).map(([key, optText]) => {
                  const isSelected = twinSelectedAnswer === key;
                  const isCorrect = isTwinChecked && key === twinQuestion.correctAnswer;
                  const isWrong = isTwinChecked && isSelected && !isCorrect;

                  return (
                    <button
                      key={key}
                      disabled={isTwinChecked}
                      onClick={() => setTwinSelectedAnswer(key)}
                      className={`w-full p-3 rounded-xl border text-left text-xs flex items-start gap-3 transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-[#EBF8F5] border-[#2A9D8F] text-[#1E1B18] font-semibold'
                          : isWrong
                          ? 'bg-rose-50 border-rose-400 text-rose-900'
                          : isSelected
                          ? 'bg-[#0B1B3D] border-[#0B1B3D] text-white'
                          : 'bg-white border-[#E5E0D8] hover:bg-[#FAF8F5] text-[#1E1B18]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                        {key}
                      </span>
                      <span className="flex-1">
                        <KaTeXRenderer text={optText} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D8]">
              {isTwinChecked ? (
                <div className="flex items-center gap-2 text-xs">
                  {twinSelectedAnswer === twinQuestion.correctAnswer ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={16} /> Ajoyib! Xatoni to'liq o'zlashtirdingiz.
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <XCircle size={16} /> To'g'ri javob: Choice {twinQuestion.correctAnswer}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-[#78716C]">
                  To'g'ri variantni tanlang va tekshiring.
                </span>
              )}

              <div className="flex items-center gap-2">
                {!isTwinChecked ? (
                  <button
                    disabled={!twinSelectedAnswer}
                    onClick={() => setIsTwinChecked(true)}
                    className="px-4 py-2 rounded-xl bg-[#0B1B3D] hover:bg-[#122756] disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Javobni Tekshirish
                  </button>
                ) : (
                  <button
                    onClick={() => setShowTwinModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Yopish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
