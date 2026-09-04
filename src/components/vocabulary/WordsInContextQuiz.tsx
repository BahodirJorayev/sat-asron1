'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  BookOpen,
  Award,
  Zap,
  Flame,
  Volume2,
} from 'lucide-react';
import { VocabularyWord, VocabularyBook, VocabContextQuestion } from '../../types';
import { INITIAL_CONTEXT_QUESTIONS } from '../../data/vocabularyDatabase';
import { playAudioFeedback, speakWord } from '../../utils/speechUtils';

interface WordsInContextQuizProps {
  words: VocabularyWord[];
  activeBook?: VocabularyBook;
  onQuestionCompleted?: (isCorrect: boolean) => void;
  onSwitchToFlashcards?: () => void;
}

export const WordsInContextQuiz: React.FC<WordsInContextQuizProps> = ({
  words,
  activeBook,
  onQuestionCompleted,
  onSwitchToFlashcards,
}) => {
  // Generate question bank from curated questions + dynamically synthesized questions from word sentences
  const questionsList = useMemo<VocabContextQuestion[]>(() => {
    const list: VocabContextQuestion[] = [];
    const wordMap = new Map(words.map((w) => [w.word.toLowerCase(), w]));

    // 1. Include curated questions matching words in the current pool
    INITIAL_CONTEXT_QUESTIONS.forEach((q) => {
      if (wordMap.has(q.correctWord.toLowerCase())) {
        list.push(q);
      }
    });

    // 2. Synthesize context questions for any words lacking a pre-made question
    const wordsWithSentence = words.filter((w) => w.sampleSentence && w.sampleSentence.includes(w.word));
    wordsWithSentence.forEach((w, idx) => {
      // Avoid duplicate question if already added from curated list
      if (list.some((q) => q.correctWord.toLowerCase() === w.word.toLowerCase())) return;

      // Replace target word (case-insensitive) with blank
      const regex = new RegExp(`\\b${w.word}\\b`, 'gi');
      const passageWithBlank = w.sampleSentence.replace(regex, '________');

      // Pick 3 random distractor words from the same pool
      const otherWords = words.filter((ow) => ow.word.toLowerCase() !== w.word.toLowerCase());
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
      const distractors = shuffledOthers.map((ow) => ow.word);

      // Randomize options
      const options = [w.word, ...distractors].sort(() => Math.random() - 0.5);

      list.push({
        id: `dyn-q-${w.id}-${idx}`,
        passage: passageWithBlank,
        correctWord: w.word,
        options,
        explanation: `Kontekst tahlili: "${w.word}" (${w.partOfSpeech}) — ${w.definitionUz || w.definition}. Gap mazmuni va uslubiy ohangi ushbu so'zning qo'llanilishini to'liq oqlaydi.`,
        difficulty: w.difficulty || 'MEDIUM',
        domain: 'Reading & Writing / Words in Context',
      });
    });

    return list.length > 0 ? list : INITIAL_CONTEXT_QUESTIONS;
  }, [words]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questionsList[currentIndex] || questionsList[0];

  // Reset when question list or book changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setIsFinished(false);
  }, [activeBook?.id]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.toLowerCase() === currentQ.correctWord.toLowerCase();

    if (isCorrect) {
      playAudioFeedback('correct');
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
    } else {
      playAudioFeedback('wrong');
      setStreak(0);
    }

    if (onQuestionCompleted) {
      onQuestionCompleted(isCorrect);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questionsList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      playAudioFeedback('victory');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setIsFinished(false);
  };

  if (!currentQ || questionsList.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] flex items-center justify-center mx-auto">
          <BookOpen size={22} />
        </div>
        <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Savollar Topilmadi
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          Ushbu kitob bo'yicha mashq savollari shakllantirilmoqda.
        </p>
      </div>
    );
  }

  // Finished State
  if (isFinished) {
    const accuracy = Math.round((score / questionsList.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-6 shadow-sm font-sans"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#EBF8F5] dark:bg-[#0A0F1D] text-[#2A9D8F] flex items-center justify-center mx-auto">
          <Award size={32} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            Kontekst Testi Yakunlandi!
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {activeBook?.title || 'SAT Vocabulary'} bo'yicha topshiriq natijangiz
          </p>
        </div>

        {/* Results Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-center">
          <div>
            <div className="text-xl font-mono font-extrabold text-[#2A9D8F]">
              {score} <span className="text-xs font-normal text-[#64748B]">/ {questionsList.length}</span>
            </div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">To'g'ri Javob</div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-[#E07A5F]">{accuracy}%</div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Aniqlik</div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-amber-500">{highestStreak}</div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">Maks Streak</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestartQuiz}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Qayta Topshirish</span>
          </button>

          {onSwitchToFlashcards && (
            <button
              onClick={onSwitchToFlashcards}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Fleshkartalarga Qaytish</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 font-sans select-none">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Savol {currentIndex + 1} <span className="text-[#94A3B8]">/ {questionsList.length}</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF5F0] dark:bg-[#1E293B] text-[#E07A5F] font-mono font-bold">
            Words in Context
          </span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              <Flame size={12} className="fill-amber-500" />
              <span>{streak} Streak</span>
            </div>
          )}
          <div className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
            Ball: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{score}</strong>
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
        <div
          className="h-full bg-[#E07A5F] transition-all duration-300 rounded-full"
          style={{ width: `${Math.round(((currentIndex + 1) / questionsList.length) * 100)}%` }}
        />
      </div>

      {/* 2. Question Passage Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
        <div className="text-[11px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
          <span>{currentQ.domain || 'Digital SAT Reading & Writing'}</span>
          <span className="text-[#E07A5F] font-semibold">{currentQ.difficulty || 'MEDIUM'}</span>
        </div>

        {/* Passage with blank */}
        <p className="text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC] font-serif leading-relaxed">
          {currentQ.passage}
        </p>

        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
          <span>Bo'sh joyga eng mos keluvchi so'zni tanlang:</span>
        </div>

        {/* 3. 4 Multiple Choice Options */}
        <div className="space-y-2 pt-1">
          {currentQ.options.map((option, idx) => {
            const letter = optionLetters[idx];
            const isSelected = selectedOption === option;
            const isCorrect = option.toLowerCase() === currentQ.correctWord.toLowerCase();

            let optionStyle =
              'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E07A5F] hover:bg-white dark:hover:bg-[#121A2F]';

            if (isAnswered) {
              if (isCorrect) {
                optionStyle =
                  'border-[#BCE8DE] dark:border-[#064E3B] bg-[#EBF8F5] dark:bg-[#08241F] text-[#2A9D8F] font-bold';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'border-[#FCD9CE] dark:border-[#7F1D1D] bg-[#FFF5F2] dark:bg-[#1E1215] text-[#E07A5F] font-bold';
              } else {
                optionStyle = 'opacity-50 border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0A0F1D]';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-mono text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-[#2A9D8F] text-white'
                          : 'bg-[#E07A5F] text-white'
                        : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="font-sans font-semibold text-sm">{option}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(option, 0.85);
                    }}
                    className="p-1 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  >
                    <Volume2 size={13} />
                  </button>

                  {isAnswered && isCorrect && <CheckCircle2 size={16} className="text-[#2A9D8F] shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={16} className="text-[#E07A5F] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. Instant Explanation Card */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#E07A5F] flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Javob Tahlili &amp; Izohi</span>
                </span>
                <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                  To'g'ri javob: <strong>{currentQ.correctWord}</strong>
                </span>
              </div>

              <p className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {currentQ.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Bottom Navigation */}
      {isAnswered && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold hover:bg-[#1E293B] dark:hover:bg-[#F1F5F9] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{currentIndex < questionsList.length - 1 ? 'Keyingi Savol' : 'Natijani Ko\'rish'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
