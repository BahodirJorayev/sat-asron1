'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Download,
  Search,
  Layers,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowUpRight,
  Filter,
  Volume2,
  FileText,
  ExternalLink,
  RotateCcw,
  Check,
} from 'lucide-react';
import { VocabularyBook, VocabularyWord, UserVocabProgress, User } from '../../types';
import { FlashcardDeck } from './FlashcardDeck';
import { WordsInContextQuiz } from './WordsInContextQuiz';
import {
  fetchVocabBooks,
  fetchVocabWords,
  fetchUserVocabProgress,
  saveUserVocabProgressRemote,
} from '../../lib/vocabApi';
import { speakWord } from '../../utils/speechUtils';

interface VocabularyHubProps {
  user?: User;
  initialBookSlug?: string;
  onOpenPaywall?: () => void;
}

export const VocabularyHub: React.FC<VocabularyHubProps> = ({
  user,
  initialBookSlug,
  onOpenPaywall,
}) => {
  const [books, setBooks] = useState<VocabularyBook[]>([]);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string>(
    initialBookSlug || 'erica-meltzer'
  );
  const [activeMode, setActiveMode] = useState<'flashcards' | 'context' | 'list'>('flashcards');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserVocabProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load books, words, and student progress on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedBooks, loadedWords] = await Promise.all([
          fetchVocabBooks(),
          fetchVocabWords(),
        ]);

        if (!isMounted) return;
        setBooks(loadedBooks);
        setWords(loadedWords);

        if (user?.id) {
          const progress = await fetchUserVocabProgress(user.id);
          if (isMounted) setUserProgressMap(progress);
        }
      } catch (err) {
        console.warn('Error loading vocabulary data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Active book
  const activeBook = useMemo(() => {
    return books.find((b) => b.slug === selectedBookSlug) || books[0];
  }, [books, selectedBookSlug]);

  // Filter words by active book
  const activeBookWords = useMemo(() => {
    if (!activeBook) return [];
    return words.filter(
      (w) =>
        w.bookId === activeBook.id ||
        (w.bookSource && w.bookSource.toLowerCase().includes(activeBook.title.toLowerCase())) ||
        (activeBook.slug === 'erica-meltzer' && (!w.bookId || w.bookSource?.includes('Erica')))
    );
  }, [words, activeBook]);

  // Filtered words for search query in list mode
  const filteredWordsList = useMemo(() => {
    if (!searchQuery.trim()) return activeBookWords;
    const q = searchQuery.toLowerCase().trim();
    return activeBookWords.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        (w.definitionUz && w.definitionUz.toLowerCase().includes(q)) ||
        w.synonyms.some((s) => s.toLowerCase().includes(q))
    );
  }, [activeBookWords, searchQuery]);

  // Real-time 0-State Metrics
  const stats = useMemo(() => {
    const bookWordIds = new Set(activeBookWords.map((w) => w.id));
    let knownCount = 0;
    let reviewedCount = 0;

    Object.values(userProgressMap).forEach((p) => {
      if (bookWordIds.has(p.wordId)) {
        if (p.isKnown) knownCount++;
        reviewedCount++;
      }
    });

    return {
      totalBookWords: activeBookWords.length,
      knownWordsCount: knownCount,
      toReviewCount: activeBookWords.length - knownCount,
      masteryRate: activeBookWords.length > 0 ? Math.round((knownCount / activeBookWords.length) * 100) : 0,
    };
  }, [activeBookWords, userProgressMap]);

  // Progress update callback
  const handleMarkWordProgress = async (wordId: string, isKnown: boolean) => {
    const currentProg = userProgressMap[wordId];
    const newStage = isKnown ? Math.min((currentProg?.srsStage || 0) + 1, 3) : 0;

    setUserProgressMap((prev) => ({
      ...prev,
      [wordId]: {
        id: currentProg?.id || `prog-${Date.now()}`,
        userId: user?.id || 'guest',
        wordId,
        srsStage: newStage,
        isKnown,
        correctCount: isKnown ? (currentProg?.correctCount || 0) + 1 : currentProg?.correctCount || 0,
        incorrectCount: !isKnown ? (currentProg?.incorrectCount || 0) + 1 : currentProg?.incorrectCount || 0,
        lastReviewedAt: new Date().toISOString(),
      },
    }));

    if (user?.id) {
      await saveUserVocabProgressRemote(user.id, wordId, newStage, isKnown);
    }
  };

  // PDF Downloader
  const handleDownloadPDF = () => {
    if (!activeBook) return;
    if (activeBook.pdfUrl) {
      window.open(activeBook.pdfUrl, '_blank');
    } else {
      // Fallback: trigger synthetic download alert
      alert(`${activeBook.title} qo'llanmasi PDF fayli tayyorlanmoqda.`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans text-[#0F172A] dark:text-[#F8FAFC]">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            SAT Lug'at &amp; So'z Boyligi
          </h1>

          {/* Compact Book Badges (Zero Onboarding Clutter) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {[
              'Erica Meltzer SAT Vocabulary',
              'College Board Essential Words',
              "Barron's SAT 1100",
              "Maxsus Kurs So'zlari",
            ].map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E293B]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* 4 Clean 0-State Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0 w-full lg:w-auto">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#2A9D8F]">
              {stats.knownWordsCount}
            </div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              O'zlashtirildi
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#E07A5F]">
              {stats.toReviewCount}
            </div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Takrorlash Kerak
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {stats.masteryRate}%
            </div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              O'zlashtirish
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#3D405B] dark:text-[#94A3B8]">
              {stats.totalBookWords}
            </div>
            <div className="text-[10px] font-mono uppercase font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Kitobdagi So'zlar
            </div>
          </div>
        </div>
      </div>

      {/* 2. SOURCE / BOOK SELECTOR TABS & ACTION BAR */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] w-full sm:w-fit">
          {books.map((b) => {
            const isActive = b.slug === selectedBookSlug;
            const bookCount = words.filter(
              (w) =>
                w.bookId === b.id ||
                w.bookSource?.toLowerCase().includes(b.title.toLowerCase()) ||
                (b.slug === 'erica-meltzer' && (!w.bookId || w.bookSource?.includes('Erica')))
            ).length;

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBookSlug(b.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#1E293B]'
                }`}
              >
                <span>{b.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-[#0F172A]/20 dark:text-[#0F172A]'
                      : 'bg-[#E2E8F0] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {bookCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Book Detail Bar with Download PDF Button (Clean 0-State Ergonomics) */}
        {activeBook && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {activeBook.title}
              </span>
              {activeBook.author && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E293B]">
                  {activeBook.author}
                </span>
              )}
            </div>

            {/* Clean Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#FAF5F0] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs group"
            >
              <Download size={13} className="text-[#E07A5F] group-hover:translate-y-0.5 transition-transform" />
              <span>PDF Yuklab Olish</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MODE SELECTOR TOOLBAR (Linear Data Toggle) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
        {/* Modes: Lug'at Kartochkalari (SRS Flashcards) | Kontekstda Qo'llash (Quiz) | So'zlar Ro'yxati (Table) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveMode('flashcards')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'flashcards'
                ? 'bg-white dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            <Layers size={13} />
            <span>Lug'at Kartochkalari (SRS Flashcards)</span>
          </button>

          <button
            onClick={() => setActiveMode('context')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'context'
                ? 'bg-white dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            <HelpCircle size={13} />
            <span>Kontekstda Qo'llash (Quiz)</span>
          </button>

          <button
            onClick={() => setActiveMode('list')}
            className={`px-3.5 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'list'
                ? 'bg-white dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            <FileText size={13} />
            <span>So'zlar Ro'yxati (Table)</span>
          </button>
        </div>

        {/* Search for words */}
        {activeMode === 'list' && (
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="So'z yoki ta'rif qidirish..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
            />
          </div>
        )}
      </div>

      {/* 4. ACTIVE VIEW MODE CONTAINER */}
      <div className="py-2">
        {activeMode === 'flashcards' && (
          <FlashcardDeck
            words={activeBookWords}
            activeBook={activeBook}
            userProgressMap={userProgressMap}
            onMarkWordProgress={handleMarkWordProgress}
            onOpenContextQuiz={() => setActiveMode('context')}
          />
        )}

        {activeMode === 'context' && (
          <WordsInContextQuiz
            words={activeBookWords}
            activeBook={activeBook}
            onQuestionCompleted={(isCorrect) => {
              // Quiz completion tracking
            }}
            onSwitchToFlashcards={() => setActiveMode('flashcards')}
          />
        )}

        {activeMode === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              <span>Jami {filteredWordsList.length} ta so'z ko'rsatilmoqda</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWordsList.map((word) => {
                const prog = userProgressMap[word.id];

                return (
                  <div
                    key={word.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                            {word.word}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8]">
                            {word.partOfSpeech}
                          </span>
                          {word.phonetic && (
                            <span className="text-xs font-mono text-[#94A3B8]">
                              {word.phonetic}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => speakWord(word.word, 0.85)}
                          className="p-1.5 rounded-lg text-[#E07A5F] hover:bg-[#FAF5F0] dark:hover:bg-[#1E293B] cursor-pointer"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>

                      {/* English Definition */}
                      <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                        {word.definition}
                      </p>

                      {/* Uzbek Translation */}
                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {word.definitionUz || word.definition}
                      </div>

                      {/* Sample sentence */}
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] italic">
                        "{word.sampleSentence}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-mono">
                      <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                        <span>Sinonimlar: </span>
                        <strong>{word.synonyms.slice(0, 3).join(', ')}</strong>
                      </div>

                      {prog?.isKnown ? (
                        <span className="text-[#2A9D8F] flex items-center gap-1 font-bold">
                          <CheckCircle2 size={12} />
                          <span>Yodlangan</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkWordProgress(word.id, true)}
                          className="text-[#E07A5F] hover:underline cursor-pointer font-bold"
                        >
                          + Yodlandiga kiritish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
