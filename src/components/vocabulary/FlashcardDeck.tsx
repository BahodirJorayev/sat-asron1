'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Check,
  RotateCcw,
  BookOpen,
  Award,
  ArrowRight,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { VocabularyWord, UserVocabProgress, VocabularyBook } from '../../types';
import { speakWord, playAudioFeedback } from '../../utils/speechUtils';

interface FlashcardDeckProps {
  words: VocabularyWord[];
  activeBook?: VocabularyBook;
  userProgressMap: Record<string, UserVocabProgress>;
  onMarkWordProgress: (wordId: string, isKnown: boolean) => void;
  onOpenContextQuiz?: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  words,
  activeBook,
  userProgressMap,
  onMarkWordProgress,
  onOpenContextQuiz,
}) => {
  const [deck, setDeck] = useState<VocabularyWord[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [sessionKnownCount, setSessionKnownCount] = useState(0);

  // Sync internal deck when word list changes
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [words]);

  const currentWord = deck[currentIndex] || deck[0];
  const currentProgress = currentWord ? userProgressMap[currentWord.id] : undefined;

  // Pronunciation handler
  const handlePronounce = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentWord || isSpeaking) return;
    setIsSpeaking(true);
    await speakWord(currentWord.word, 0.85);
    setIsSpeaking(false);
  };

  // Flip handler with audio feedback
  const handleFlip = () => {
    playAudioFeedback('flip');
    setIsFlipped((prev) => !prev);
  };

  // Next Card
  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      playAudioFeedback('victory');
    }
  }, [currentIndex, deck.length]);

  // Prev Card
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  // Spaced Repetition action: Review again ("Qayta takrorlash")
  const handleReviewAgain = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentWord) return;
    playAudioFeedback('wrong');
    setSessionReviewedCount((prev) => prev + 1);
    onMarkWordProgress(currentWord.id, false);
    handleNext();
  };

  // Spaced Repetition action: I know it ("Bilaman")
  const handleKnowIt = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentWord) return;
    playAudioFeedback('correct');
    setSessionKnownCount((prev) => prev + 1);
    onMarkWordProgress(currentWord.id, true);
    handleNext();
  };

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  // Restart deck
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setSessionReviewedCount(0);
    setSessionKnownCount(0);
  };

  // Keyboard accessibility: Space to flip, Arrows to navigate, 1/2 for actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleReviewAgain();
      } else if (e.key === '2') {
        e.preventDefault();
        handleKnowIt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped, currentWord]);

  if (!currentWord || deck.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] flex items-center justify-center mx-auto">
          <BookOpen size={22} />
        </div>
        <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Ushbu kitob bo'yicha so'zlar topilmadi
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Boshqa kitob manbasini tanlang yoki Admin panel orqali yangi so'zlar yuklang.
        </p>
      </div>
    );
  }

  // Session Completed State
  if (isCompleted) {
    const totalProcessed = sessionKnownCount + sessionReviewedCount;
    const accuracy = totalProcessed > 0 ? Math.round((sessionKnownCount / totalProcessed) * 100) : 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-6 shadow-sm"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#EBF8F5] dark:bg-[#0A0F1D] text-[#2A9D8F] flex items-center justify-center mx-auto shadow-xs">
          <Award size={32} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            Fleshkarta Mashg'uloti Yakunlandi!
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {activeBook?.title || 'SAT Vocabulary'} bo'yicha sessiyani muvaffaqiyatli yakunladingiz.
          </p>
        </div>

        {/* Score Summary Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-center">
          <div>
            <div className="text-xl font-mono font-extrabold text-[#2A9D8F]">{sessionKnownCount}</div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">O'zlashtirildi</div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-[#E07A5F]">{sessionReviewedCount}</div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Takrorlash Kerak</div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">{accuracy}%</div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Aniqlik</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Qaytadan Boshlash</span>
          </button>

          {onOpenContextQuiz && (
            <button
              onClick={onOpenContextQuiz}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Kontekst Testi (Quiz)</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 font-sans select-none">
      {/* 1. Header Toolbar & Progress */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {currentIndex + 1} <span className="text-[#94A3B8]">/ {deck.length}</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF5F0] dark:bg-[#1E293B] text-[#E07A5F] font-mono font-bold">
            {activeBook?.title || currentWord.bookSource || 'SAT Words'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="So'zlarni aralashtirish"
            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#121A2F] transition-colors cursor-pointer"
          >
            <Shuffle size={14} />
          </button>
          <button
            onClick={() => handlePronounce()}
            title="Talaffuzni eshitish"
            className={`p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-[#E07A5F] text-white border-[#E07A5F]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#121A2F]'
            }`}
          >
            <Volume2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
        <div
          className="h-full bg-[#E07A5F] transition-all duration-300 rounded-full"
          style={{ width: `${Math.round(((currentIndex + 1) / deck.length) * 100)}%` }}
        />
      </div>

      {/* 2. 3D FLIPPING FLASHCARD CONTAINER */}
      <div
        onClick={handleFlip}
        style={{ perspective: 1000 }}
        className="relative w-full h-[360px] sm:h-[380px] cursor-pointer"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative"
        >
          {/* ======================================================== */}
          {/* CARD FRONT FACE                                          */}
          {/* ======================================================== */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between"
          >
            {/* Front Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8]">
                {currentWord.partOfSpeech}
              </span>

              {currentProgress?.isKnown && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#2A9D8F] bg-[#EBF8F5] dark:bg-[#0A0F1D] px-2 py-0.5 rounded-md border border-[#BCE8DE] dark:border-[#1E293B]">
                  <CheckCircle2 size={11} />
                  <span>O'zlashtirilgan</span>
                </span>
              )}
            </div>

            {/* Front Center: Word & Phonetic */}
            <div className="text-center space-y-2.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {currentWord.word}
              </h1>

              {currentWord.phonetic && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                    {currentWord.phonetic}
                  </span>
                  <button
                    type="button"
                    onClick={handlePronounce}
                    className="p-1 rounded-md text-[#E07A5F] hover:bg-[#FAF5F0] dark:hover:bg-[#1E293B] transition-colors"
                  >
                    <Volume2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Front Footer: Tap prompt */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#94A3B8] text-center">
              <RotateCw size={12} className="animate-spin-slow" />
              <span>Ta'rif va misolni ko'rish uchun bosing (Space)</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD BACK FACE (FLIPPED)                                 */}
          {/* ======================================================== */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 p-6 sm:p-7 rounded-3xl bg-[#FAF8F5] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between overflow-y-auto"
          >
            {/* Back Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                  {currentWord.word}
                </span>
                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                  ({currentWord.partOfSpeech})
                </span>
              </div>

              <button
                type="button"
                onClick={handlePronounce}
                className="p-1 rounded-md text-[#E07A5F] hover:bg-white dark:hover:bg-[#1E293B]"
              >
                <Volume2 size={14} />
              </button>
            </div>

            {/* Back Body: Definitions & Context */}
            <div className="space-y-3 py-2 text-xs">
              {/* English Academic Definition */}
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider mb-0.5">
                  Ta'rifi (English):
                </div>
                <p className="text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium leading-relaxed">
                  {currentWord.definition}
                </p>
              </div>

              {/* Uzbek Translation */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="text-[10px] font-mono uppercase font-bold text-[#E07A5F] tracking-wider mb-0.5">
                  O'zbekcha Ma'nosi:
                </div>
                <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {currentWord.definitionUz || currentWord.definition}
                </p>
              </div>

              {/* Sample Context Sentence */}
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider mb-0.5">
                  Kontekst Jumlasi:
                </div>
                <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] italic leading-relaxed">
                  "{currentWord.sampleSentence}"
                </p>
              </div>

              {/* Synonyms & Antonyms */}
              {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8]">
                    Sinonimlar:
                  </span>
                  {currentWord.synonyms.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Back Footer: Spaced Repetition Buttons */}
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleReviewAgain}
                className="py-2 px-3 rounded-xl border border-[#FCD9CE] dark:border-[#7F1D1D] bg-[#FFF5F2] dark:bg-[#1E1215] text-[#E07A5F] hover:bg-[#FEEAE3] dark:hover:bg-[#2A171B] text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Qayta takrorlash [1]</span>
              </button>

              <button
                type="button"
                onClick={handleKnowIt}
                className="py-2 px-3 rounded-xl border border-[#BCE8DE] dark:border-[#064E3B] bg-[#EBF8F5] dark:bg-[#08241F] text-[#2A9D8F] hover:bg-[#D5F2EC] dark:hover:bg-[#0E352D] text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={12} />
                <span>Bilaman [2]</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Bottom Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#121A2F] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Oldingi (←)</span>
        </button>

        <button
          onClick={handleNext}
          className="px-5 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold hover:bg-[#1E293B] dark:hover:bg-[#F1F5F9] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Keyingi (→)</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
