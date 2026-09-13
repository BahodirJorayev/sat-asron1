'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Layers,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  Check,
  ChevronRight,
  Flame,
  Award,
  ArrowRight,
  BrainCircuit,
  Tag,
  X
} from 'lucide-react';
import { User } from '../../types';
import {
  IeltsVocabTopic,
  IeltsWord,
  IELTS_VOCAB_TOPICS,
  INITIAL_IELTS_VOCABULARY,
} from '../../data/ieltsVocabularyData';
import { useUserProgress } from '../../hooks/useUserProgress';

interface IeltsVocabularyViewProps {
  user?: User | null;
  onOpenPaywall?: () => void;
}

export const IeltsVocabularyView: React.FC<IeltsVocabularyViewProps> = ({
  user,
  onOpenPaywall,
}) => {
  const { progress, recordVocabMastery } = useUserProgress(user);

  // Filter state
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedBand, setSelectedBand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'flashcards' | 'explorer' | 'quiz'>('flashcards');

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Quiz mode state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizEvaluated, setQuizEvaluated] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Filter words
  const filteredWords = useMemo(() => {
    return INITIAL_IELTS_VOCABULARY.filter((w) => {
      if (selectedTopic !== 'ALL' && w.topic !== selectedTopic) return false;
      if (selectedBand !== 'ALL' && w.bandLevel !== selectedBand) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWord = w.word.toLowerCase().includes(q);
        const matchDef = w.definitionUz.toLowerCase().includes(q) || w.definitionEn.toLowerCase().includes(q);
        const matchSyn = w.synonyms.some((s) => s.toLowerCase().includes(q));
        const matchCol = w.collocations.some((c) => c.toLowerCase().includes(q));
        if (!matchWord && !matchDef && !matchSyn && !matchCol) return false;
      }

      return true;
    });
  }, [selectedTopic, selectedBand, searchQuery]);

  const currentFlashcard: IeltsWord | undefined = filteredWords[flashcardIndex] || filteredWords[0];

  // Pronounce word via Web Speech API
  const speakWord = (wordText: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mark word as learned/mastered in real user_progress
  const handleMarkLearned = async (word: IeltsWord) => {
    try {
      await recordVocabMastery(word.id, 3, true);
      // Next card
      setIsFlipped(false);
      if (flashcardIndex < filteredWords.length - 1) {
        setFlashcardIndex((prev) => prev + 1);
      }
    } catch (e) {
      console.warn('Failed to record vocab mastery:', e);
    }
  };

  // Check if word is mastered by user in user_progress
  const isWordMastered = (wordId: string) => {
    const v = progress?.vocab_mastery?.[wordId];
    return Boolean(v?.isKnown || (v?.srsStage && v.srsStage >= 3));
  };

  const masteredCount = useMemo(() => {
    const vm = progress?.vocab_mastery || {};
    return Object.values(vm).filter((v: any) => Boolean(v?.isKnown || (v?.srsStage && v.srsStage >= 3))).length;
  }, [progress?.vocab_mastery]);

  // Generate quiz questions dynamically from filtered words
  const quizQuestions = useMemo(() => {
    const pool = filteredWords.length >= 4 ? filteredWords : INITIAL_IELTS_VOCABULARY;
    return pool.map((w, idx) => {
      // Create distractors from other words
      const others = pool.filter((other) => other.id !== w.id);
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [w.word, ...shuffledOthers.map((o) => o.word)].sort(() => 0.5 - Math.random());

      // Mask the target word in academic example
      const regex = new RegExp(`\\b${w.word}\\b`, 'gi');
      const questionPrompt = w.academicExample.replace(regex, '__________');

      return {
        id: `quiz-${w.id}`,
        word: w.word,
        prompt: questionPrompt,
        definition: w.definitionUz,
        options,
        correctAnswer: w.word,
        topic: w.topic,
        bandLevel: w.bandLevel,
      };
    });
  }, [filteredWords]);

  const currentQuizItem = quizQuestions[quizIndex] || quizQuestions[0];

  const handleQuizAnswer = async (opt: string) => {
    if (quizEvaluated) return;
    setQuizSelectedOption(opt);
    setQuizEvaluated(true);

    const isCorrect = opt.toLowerCase() === currentQuizItem.correctAnswer.toLowerCase();
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      // Mark as practiced
      const wordObj = INITIAL_IELTS_VOCABULARY.find((w) => w.word.toLowerCase() === opt.toLowerCase());
      if (wordObj) {
        await recordVocabMastery(wordObj.id, 2, true);
      }
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizSelectedOption(null);
    setQuizEvaluated(false);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      {/* 1. Header Banner */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-orange-600 via-amber-600 to-rose-600 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              IELTS Akademik Lug&apos;at Dvigateli
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Band 7.5 – 9.0 Mavzuiy Leksika Markazi
            </h1>
            <p className="text-orange-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              IELTS Writing & Speaking uchun eng yuqori baholanadigan 7 ta global mavzu (Environment, Technology, Health, Education, Crime va boshqalar) kollokatsiyalari va kontekstual namunalari.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="px-3 text-center border-r border-white/15">
              <span className="text-[10px] text-orange-200 uppercase font-mono block">Mavzular</span>
              <span className="text-lg font-black font-mono">7 ta</span>
            </div>
            <div className="px-3 text-center border-r border-white/15">
              <span className="text-[10px] text-orange-200 uppercase font-mono block">O‘rganilgan</span>
              <span className="text-lg font-black font-mono text-emerald-300">{masteredCount}</span>
            </div>
            <div className="px-3 text-center">
              <span className="text-[10px] text-orange-200 uppercase font-mono block">Filtrda</span>
              <span className="text-lg font-black font-mono">{filteredWords.length} ta</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls: Modes, Topics & Band Filter */}
      <div className="max-w-7xl mx-auto space-y-4 mb-6">
        {/* Top Row: Mode Switcher & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveMode('flashcards')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'flashcards'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Flashcards (SRS)
            </button>
            <button
              onClick={() => setActiveMode('explorer')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'explorer'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Leksika Ro‘yxati
            </button>
            <button
              onClick={() => setActiveMode('quiz')}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'quiz'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Kontekst Testi
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="So‘z, tarjima yoki kollokatsiya..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Topic Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedTopic('ALL');
              setFlashcardIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTopic === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Barcha Mavzular
          </button>

          {IELTS_VOCAB_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setFlashcardIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500/40'
                }`}
              >
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Display Workspace */}
      <div className="max-w-7xl mx-auto">
        {/* MODE 1: FLASHCARDS (SRS) */}
        {activeMode === 'flashcards' && (
          <div className="max-w-xl mx-auto space-y-6">
            {currentFlashcard ? (
              <div className="space-y-4">
                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="min-h-[380px] p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between cursor-pointer transition-all hover:border-orange-300 dark:hover:border-orange-500/50 select-none relative overflow-hidden"
                >
                  {/* Top card bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                      {currentFlashcard.topic}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {currentFlashcard.bandLevel}
                      </span>
                      {isWordMastered(currentFlashcard.id) && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> O‘rganilgan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Center */}
                  <div className="text-center py-6">
                    {!isFlipped ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {currentFlashcard.word}
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(currentFlashcard.word);
                            }}
                            className="p-2 rounded-xl bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                            title="Talaffuzni eshitish"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                        <span className="text-xs font-mono text-slate-400 italic block">
                          [{currentFlashcard.partOfSpeech}]
                        </span>
                        <p className="text-xs text-slate-400 mt-6">
                          Kartochkani ag‘darish uchun bosing 👆
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                            O‘zbekcha Ma’nosi
                          </span>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {currentFlashcard.definitionUz}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                            English Definition
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {currentFlashcard.definitionEn}
                          </p>
                        </div>

                        {/* Collocations */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-orange-500 block mb-1">
                            Muhim Kollokatsiyalar (IELTS LR)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentFlashcard.collocations.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40 text-[11px] font-semibold text-orange-700 dark:text-orange-300"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Example */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                            Akademik Jumla
                          </span>
                          <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            &ldquo;{currentFlashcard.academicExample}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Hint */}
                  <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {flashcardIndex + 1} / {filteredWords.length} ta so‘z
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      if (flashcardIndex < filteredWords.length - 1) {
                        setFlashcardIndex((prev) => prev + 1);
                      }
                    }}
                    className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Keyingisi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkLearned(currentFlashcard)}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    O‘rgandim (Mastered)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">Bu filtr boyicha so‘zlar topilmadi.</p>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: LEXICON EXPLORER (Bento Grid) */}
        {activeMode === 'explorer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => {
              const mastered = isWordMastered(word.id);
              return (
                <div
                  key={word.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500/40 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                        {word.topic}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {word.bandLevel}
                        </span>
                        {mastered && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </div>

                    {/* Word & Pronunciation */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {word.word}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400 italic">
                          [{word.partOfSpeech}]
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakWord(word.word)}
                        className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-500/10 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Definition */}
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {word.definitionUz}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                      {word.definitionEn}
                    </p>

                    {/* Collocations */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase text-orange-500 block mb-1">
                        Kollokatsiyalar:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {word.collocations.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Academic Sentence */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-400 leading-snug">
                    &ldquo;{word.academicExample}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODE 3: CONTEXT QUIZ */}
        {activeMode === 'quiz' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                Savol {quizIndex + 1} / {quizQuestions.length}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Ball: {quizScore}
              </span>
            </div>

            {/* Prompt */}
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                {currentQuizItem.topic} • {currentQuizItem.bandLevel}
              </span>
              <h4 className="text-base font-semibold leading-relaxed text-slate-900 dark:text-white">
                {currentQuizItem.prompt}
              </h4>
              <p className="text-xs text-slate-500">
                Qidirilayotgan ma&apos;no: <strong>{currentQuizItem.definition}</strong>
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuizItem.options.map((opt, i) => {
                const isSelected = quizSelectedOption === opt;
                const isCorrect = opt.toLowerCase() === currentQuizItem.correctAnswer.toLowerCase();

                return (
                  <button
                    key={i}
                    disabled={quizEvaluated}
                    onClick={() => handleQuizAnswer(opt)}
                    className={`w-full text-left p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      quizEvaluated
                        ? isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500'
                    }`}
                  >
                    <span>{opt}</span>
                    {quizEvaluated && isCorrect && <Check className="w-4 h-4 text-white" />}
                    {quizEvaluated && isSelected && !isCorrect && <X className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            {quizEvaluated && (
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuizQuestion}
                  className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Keyingi Savol
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
