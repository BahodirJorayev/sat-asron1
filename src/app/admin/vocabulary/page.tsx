'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Volume2,
  Download,
  Filter,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { VocabularyBook, VocabularyWord } from '../../../types';
import {
  fetchVocabBooks,
  saveVocabBookRemote,
  deleteVocabBookRemote,
  fetchVocabWords,
  saveVocabWordRemote,
  deleteVocabWordRemote,
  bulkImportVocabWordsRemote,
} from '../../../lib/vocabApi';
import { speakWord } from '../../../utils/speechUtils';

export default function AdminVocabularyPage() {
  const [books, setBooks] = useState<VocabularyBook[]>([]);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [activeTab, setActiveTab] = useState<'words' | 'books'>('words');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<VocabularyBook | null>(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    slug: '',
    author: '',
    description: '',
    pdfUrl: '',
    orderIndex: 1,
  });

  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [wordFormData, setWordFormData] = useState({
    word: '',
    bookId: '',
    partOfSpeech: 'adj.',
    phonetic: '',
    definition: '',
    definitionUz: '',
    sampleSentence: '',
    synonyms: '',
    antonyms: '',
    difficulty: 'MEDIUM' as const,
  });

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkBookId, setBulkBookId] = useState('');
  const [bulkFormat, setBulkFormat] = useState<'csv' | 'json'>('csv');
  const [bulkRawText, setBulkRawText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedBooks, loadedWords] = await Promise.all([
        fetchVocabBooks(),
        fetchVocabWords(),
      ]);
      setBooks(loadedBooks);
      setWords(loadedWords);
      if (loadedBooks.length > 0 && !bulkBookId) {
        setBulkBookId(loadedBooks[0].id);
      }
    } catch (err) {
      console.warn('Error loading admin vocab data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      if (selectedBookFilter !== 'ALL' && w.bookId !== selectedBookFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesWord = w.word.toLowerCase().includes(q);
        const matchesDef = w.definition.toLowerCase().includes(q);
        const matchesUz = w.definitionUz?.toLowerCase().includes(q);
        if (!matchesWord && !matchesDef && !matchesUz) return false;
      }
      return true;
    });
  }, [words, selectedBookFilter, searchQuery]);

  // ==============================================================
  // BOOK CRUD HANDLERS
  // ==============================================================
  const handleOpenBookModal = (book?: VocabularyBook) => {
    if (book) {
      setEditingBook(book);
      setBookFormData({
        title: book.title,
        slug: book.slug,
        author: book.author || '',
        description: book.description,
        pdfUrl: book.pdfUrl || '',
        orderIndex: book.orderIndex,
      });
    } else {
      setEditingBook(null);
      setBookFormData({
        title: '',
        slug: '',
        author: '',
        description: '',
        pdfUrl: '',
        orderIndex: books.length + 1,
      });
    }
    setIsBookModalOpen(true);
  };

  const handleBookTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setBookFormData((prev) => ({
      ...prev,
      title,
      slug: editingBook ? prev.slug : slug,
    }));
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title.trim()) return;

    const bookToSave: VocabularyBook = {
      id: editingBook?.id || `b-${Date.now()}`,
      title: bookFormData.title.trim(),
      slug: bookFormData.slug.trim(),
      author: bookFormData.author.trim(),
      description: bookFormData.description.trim(),
      pdfUrl: bookFormData.pdfUrl.trim(),
      orderIndex: Number(bookFormData.orderIndex) || 1,
      totalWordsCount: editingBook?.totalWordsCount || 0,
      createdAt: editingBook?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveVocabBookRemote(bookToSave);
    setIsBookModalOpen(false);
    loadData();
  };

  const handleDeleteBook = async (bookId: string) => {
    const linkedWordsCount = words.filter((w) => w.bookId === bookId).length;
    if (
      !confirm(
        `Ushbu kitobni o'chirishni tasdiqlaysizmi? ${
          linkedWordsCount > 0 ? `Undagi ${linkedWordsCount} ta so'z ham o'chiriladi.` : ''
        }`
      )
    ) {
      return;
    }

    await deleteVocabBookRemote(bookId);
    loadData();
  };

  // ==============================================================
  // WORD CRUD HANDLERS
  // ==============================================================
  const handleOpenWordModal = (word?: VocabularyWord) => {
    if (word) {
      setEditingWord(word);
      setWordFormData({
        word: word.word,
        bookId: word.bookId || books[0]?.id || '',
        partOfSpeech: word.partOfSpeech || 'adj.',
        phonetic: word.phonetic || '',
        definition: word.definition,
        definitionUz: word.definitionUz || '',
        sampleSentence: word.sampleSentence,
        synonyms: word.synonyms?.join(', ') || '',
        antonyms: word.antonyms?.join(', ') || '',
        difficulty: word.difficulty || 'MEDIUM',
      });
    } else {
      setEditingWord(null);
      setWordFormData({
        word: '',
        bookId: selectedBookFilter !== 'ALL' ? selectedBookFilter : books[0]?.id || '',
        partOfSpeech: 'adj.',
        phonetic: '',
        definition: '',
        definitionUz: '',
        sampleSentence: '',
        synonyms: '',
        antonyms: '',
        difficulty: 'MEDIUM',
      });
    }
    setIsWordModalOpen(true);
  };

  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordFormData.word.trim() || !wordFormData.definition.trim()) return;

    const assignedBook = books.find((b) => b.id === wordFormData.bookId) || books[0];

    const wordToSave: VocabularyWord = {
      id: editingWord?.id || `w-${Date.now()}`,
      bookId: wordFormData.bookId,
      bookSource: assignedBook?.title || 'Erica Meltzer SAT Vocabulary',
      word: wordFormData.word.trim().toLowerCase(),
      partOfSpeech: wordFormData.partOfSpeech,
      phonetic: wordFormData.phonetic.trim(),
      definition: wordFormData.definition.trim(),
      definitionUz: wordFormData.definitionUz.trim(),
      sampleSentence: wordFormData.sampleSentence.trim(),
      synonyms: wordFormData.synonyms
        ? wordFormData.synonyms.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      antonyms: wordFormData.antonyms
        ? wordFormData.antonyms.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      difficulty: wordFormData.difficulty,
      createdAt: editingWord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveVocabWordRemote(wordToSave);
    setIsWordModalOpen(false);
    loadData();
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm("Ushbu so'zni o'chirishni tasdiqlaysizmi?")) return;
    await deleteVocabWordRemote(wordId);
    loadData();
  };

  // ==============================================================
  // FAST BULK IMPORT HANDLERS
  // ==============================================================
  useEffect(() => {
    if (!bulkRawText.trim()) {
      setBulkPreview([]);
      setBulkError(null);
      return;
    }

    try {
      if (bulkFormat === 'json') {
        const parsed = JSON.parse(bulkRawText);
        if (Array.isArray(parsed)) {
          setBulkPreview(parsed.slice(0, 5));
          setBulkError(null);
        } else {
          setBulkError('JSON ma\'lumotlar massiv shaklida bo\'lishi shart [ {...} ].');
        }
      } else {
        // CSV parsing (header: word,partOfSpeech,definition,definitionUz,sampleSentence,synonyms)
        const lines = bulkRawText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const parsedRows = lines.map((line, idx) => {
          // Naive CSV split with quotes support
          const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
          return {
            word: parts[0] || `word-${idx + 1}`,
            partOfSpeech: parts[1] || 'adj.',
            definition: parts[2] || '',
            definitionUz: parts[3] || '',
            sampleSentence: parts[4] || '',
            synonyms: parts[5] ? parts[5].split(';').map((s) => s.trim()) : [],
          };
        });
        setBulkPreview(parsedRows.slice(0, 5));
        setBulkError(null);
      }
    } catch (err: any) {
      setBulkError(`Format xatosi: ${err.message || 'Noto\'g\'ri sintaksis'}`);
    }
  }, [bulkRawText, bulkFormat]);

  const handleCommitBulkImport = async () => {
    if (!bulkRawText.trim()) return;
    const targetBook = books.find((b) => b.id === bulkBookId) || books[0];

    try {
      let itemsToImport: any[] = [];
      if (bulkFormat === 'json') {
        itemsToImport = JSON.parse(bulkRawText);
      } else {
        const lines = bulkRawText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        itemsToImport = lines.map((line, idx) => {
          const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
          return {
            id: `bulk-${Date.now()}-${idx}`,
            bookId: targetBook.id,
            bookSource: targetBook.title,
            word: (parts[0] || '').toLowerCase(),
            partOfSpeech: parts[1] || 'adj.',
            phonetic: parts[2] || '',
            definition: parts[3] || '',
            definitionUz: parts[4] || '',
            sampleSentence: parts[5] || '',
            synonyms: parts[6] ? parts[6].split(';').map((s) => s.trim()) : [],
            antonyms: parts[7] ? parts[7].split(';').map((s) => s.trim()) : [],
            difficulty: 'MEDIUM',
          };
        });
      }

      const formattedWords: VocabularyWord[] = itemsToImport.map((item, idx) => ({
        id: item.id || `bulk-${Date.now()}-${idx}`,
        bookId: targetBook.id,
        bookSource: targetBook.title,
        word: (item.word || '').toLowerCase(),
        partOfSpeech: item.partOfSpeech || 'adj.',
        phonetic: item.phonetic || '',
        definition: item.definition || '',
        definitionUz: item.definitionUz || item.definition || '',
        sampleSentence: item.sampleSentence || '',
        synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
        antonyms: Array.isArray(item.antonyms) ? item.antonyms : [],
        difficulty: item.difficulty || 'MEDIUM',
        createdAt: new Date().toISOString(),
      }));

      await bulkImportVocabWordsRemote(formattedWords);
      setIsBulkModalOpen(false);
      setBulkRawText('');
      alert(`${formattedWords.length} ta so'z muvaffaqiyatli import qilindi!`);
      loadData();
    } catch (err: any) {
      alert(`Import xatoligi: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] py-8 font-sans text-[#0F172A] dark:text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb & Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              <Link
                href="/dashboard"
                className="hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft size={12} />
                <span>Boshqaruv Markazi</span>
              </Link>
              <span>/</span>
              <span className="text-[#E07A5F] font-bold">SAT Lug'at CMS</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Lug'at &amp; Kitoblar Boshqaruvi
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenWordModal()}
              className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Yangi So'z Qo'shish</span>
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#121A2F] text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UploadCloud size={14} className="text-[#E07A5F]" />
              <span>Tezkor CSV/JSON Import</span>
            </button>
          </div>
        </div>

        {/* Section Tabs: So'zlar vs Kitoblar */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2">
          <button
            onClick={() => setActiveTab('words')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'words'
                ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            <FileText size={14} />
            <span>So'zlar Ro'yxati ({words.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'books'
                ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            <BookOpen size={14} />
            <span>Kitoblar / Manbalar ({books.length})</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: WORDS LIST & CRUD TABLE                               */}
        {/* ============================================================ */}
        {activeTab === 'words' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedBookFilter}
                  onChange={(e) => setSelectedBookFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                >
                  <option value="ALL">Barcha Kitoblar ({words.length})</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="So'z yoki ma'nosini qidirish..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>

            {/* Words Table */}
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#121A2F] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A0F1D] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">So'z</th>
                      <th className="py-3 px-3">Nutq qismi</th>
                      <th className="py-3 px-3">Kitob Manbasi</th>
                      <th className="py-3 px-4">Ta'rifi (EN + UZ)</th>
                      <th className="py-3 px-3">Sinonimlar</th>
                      <th className="py-3 px-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                    {filteredWords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                          Hech qanday so'z topilmadi.
                        </td>
                      </tr>
                    ) : (
                      filteredWords.map((word) => (
                        <tr
                          key={word.id}
                          className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                            <span>{word.word}</span>
                            <button
                              type="button"
                              onClick={() => speakWord(word.word, 0.85)}
                              className="text-[#94A3B8] hover:text-[#E07A5F] cursor-pointer"
                            >
                              <Volume2 size={13} />
                            </button>
                            {word.phonetic && (
                              <span className="text-[11px] font-normal text-[#94A3B8]">
                                {word.phonetic}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8]">
                              {word.partOfSpeech}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#64748B] dark:text-[#94A3B8]">
                            {word.bookSource}
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] line-clamp-1">
                              {word.definition}
                            </div>
                            <div className="font-sans text-[11px] text-[#E07A5F] font-medium line-clamp-1">
                              {word.definitionUz}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#64748B] dark:text-[#94A3B8]">
                            {word.synonyms.slice(0, 2).join(', ') || '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenWordModal(word)}
                                className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-md cursor-pointer"
                                title="Tahrirlash"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteWord(word.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md cursor-pointer"
                                title="O'chirish"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: BOOKS LIST & CRUD TABLE                               */}
        {/* ============================================================ */}
        {activeTab === 'books' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenBookModal()}
                className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Yangi Kitob Qo'shish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {books.map((book) => {
                const bookWordsCount = words.filter(
                  (w) =>
                    w.bookId === book.id ||
                    w.bookSource?.toLowerCase().includes(book.title.toLowerCase())
                ).length;

                return (
                  <div
                    key={book.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF5F0] dark:bg-[#1E293B] text-[#E07A5F] font-bold">
                          Tartib: #{book.orderIndex}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenBookModal(book)}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-md cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                          Muallif: {book.author}
                        </p>
                      )}
                      <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                        {book.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">
                        Jami so'zlar: <strong>{bookWordsCount}</strong>
                      </span>
                      {book.pdfUrl && (
                        <a
                          href={book.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#E07A5F] hover:underline flex items-center gap-1 font-bold"
                        >
                          <FileText size={13} />
                          <span>PDF Manzili</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 1: ADD / EDIT WORD                                     */}
        {/* ============================================================ */}
        {isWordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <div className="w-full max-w-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden text-[#0F172A] dark:text-[#F8FAFC] max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {editingWord ? "So'zni Tahrirlash" : "Yangi So'z Qo'shish"}
                </h3>
                <button
                  onClick={() => setIsWordModalOpen(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveWord} className="p-6 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">SO'Z (ENGLISH)</label>
                    <input
                      type="text"
                      required
                      value={wordFormData.word}
                      onChange={(e) => setWordFormData({ ...wordFormData, word: e.target.value })}
                      placeholder="e.g. equivocal"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">NUTQ QISMI</label>
                    <select
                      value={wordFormData.partOfSpeech}
                      onChange={(e) => setWordFormData({ ...wordFormData, partOfSpeech: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    >
                      <option value="adj.">adj. (Sifat)</option>
                      <option value="verb">verb (Fe'l)</option>
                      <option value="noun">noun (Ot)</option>
                      <option value="adv.">adv. (Ravish)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">FONETIK TALAFFUZ</label>
                    <input
                      type="text"
                      value={wordFormData.phonetic}
                      onChange={(e) => setWordFormData({ ...wordFormData, phonetic: e.target.value })}
                      placeholder="/ɪˈkwɪv.ə.kəl/"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">KITOB MANBASI</label>
                    <select
                      value={wordFormData.bookId}
                      onChange={(e) => setWordFormData({ ...wordFormData, bookId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">INGLIZCHA TA'RIF</label>
                  <textarea
                    required
                    rows={2}
                    value={wordFormData.definition}
                    onChange={(e) => setWordFormData({ ...wordFormData, definition: e.target.value })}
                    placeholder="Academic English definition..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-sans text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#E07A5F]">O'ZBEKCHA MA'NOSI VA TA'RIFI</label>
                  <input
                    type="text"
                    required
                    value={wordFormData.definitionUz}
                    onChange={(e) => setWordFormData({ ...wordFormData, definitionUz: e.target.value })}
                    placeholder="Ikki xil ma'noli, noaniq..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-sans text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">KONTEKST JUMLASI</label>
                  <textarea
                    required
                    rows={2}
                    value={wordFormData.sampleSentence}
                    onChange={(e) => setWordFormData({ ...wordFormData, sampleSentence: e.target.value })}
                    placeholder="The politician offered an equivocal response..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-sans italic text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">SINONIMLAR (VERGUL BILAN)</label>
                    <input
                      type="text"
                      value={wordFormData.synonyms}
                      onChange={(e) => setWordFormData({ ...wordFormData, synonyms: e.target.value })}
                      placeholder="ambiguous, cryptic, vague"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">ANTONIMLAR (VERGUL BILAN)</label>
                    <input
                      type="text"
                      value={wordFormData.antonyms}
                      onChange={(e) => setWordFormData({ ...wordFormData, antonyms: e.target.value })}
                      placeholder="explicit, definite"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setIsWordModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8]"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 2: ADD / EDIT BOOK                                     */}
        {/* ============================================================ */}
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <div className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]">
              <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {editingBook ? "Kitobni Tahrirlash" : "Yangi Kitob Qo'shish"}
                </h3>
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBook} className="p-6 space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">KITOB NOMI</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.title}
                    onChange={(e) => handleBookTitleChange(e.target.value)}
                    placeholder="Masalan: Erica Meltzer SAT Vocabulary"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-sans text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">SLUG</label>
                    <input
                      type="text"
                      required
                      value={bookFormData.slug}
                      onChange={(e) => setBookFormData({ ...bookFormData, slug: e.target.value })}
                      placeholder="erica-meltzer"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">MUALLIF</label>
                    <input
                      type="text"
                      value={bookFormData.author}
                      onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                      placeholder="Erica L. Meltzer"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-sans text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">TAVSIF</label>
                  <textarea
                    rows={2}
                    value={bookFormData.description}
                    onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                    placeholder="Kitob haqida qisqacha ma'lumot..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-sans text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">PDF FAYL MANZILI (URL)</label>
                  <input
                    type="text"
                    value={bookFormData.pdfUrl}
                    onChange={(e) => setBookFormData({ ...bookFormData, pdfUrl: e.target.value })}
                    placeholder="https://example.com/book.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8]"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 3: FAST BULK IMPORT                                    */}
        {/* ============================================================ */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <div className="w-full max-w-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden text-[#0F172A] dark:text-[#F8FAFC] max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud size={18} className="text-[#E07A5F]" />
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Tezkor CSV / JSON Bulk Import
                  </h3>
                </div>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">KITOB TANLASH</label>
                    <select
                      value={bulkBookId}
                      onChange={(e) => setBulkBookId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">FORMAT</label>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setBulkFormat('csv')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                          bulkFormat === 'csv'
                            ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
                            : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        CSV Format
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkFormat('json')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                          bulkFormat === 'json'
                            ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
                            : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B]'
                        }`}
                      >
                        JSON Format
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] text-[#64748B] dark:text-[#94A3B8] space-y-1">
                  <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {bulkFormat === 'csv' ? 'CSV Shabloni (Har bir qatorda):' : 'JSON Shabloni:'}
                  </div>
                  <code className="text-[#E07A5F] block font-mono text-[10px] break-all">
                    {bulkFormat === 'csv'
                      ? 'word,partOfSpeech,phonetic,definition,definitionUz,sampleSentence,synonym1;synonym2'
                      : '[ {"word": "fastidious", "partOfSpeech": "adj.", "definition": "...", "definitionUz": "...", "sampleSentence": "..."} ]'}
                  </code>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8]">
                    MA'LUMOTLARNI SHU YERGA JOYLANG (PASTE)
                  </label>
                  <textarea
                    rows={6}
                    value={bulkRawText}
                    onChange={(e) => setBulkRawText(e.target.value)}
                    placeholder={
                      bulkFormat === 'csv'
                        ? 'fastidious,adj.,/fæsˈtɪd.i.əs/,Hard to please,O\'ta talabchan,The editor was fastidious,meticulous;scrupulous'
                        : '[{"word": "fastidious", ...}]'
                    }
                    className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden"
                  />
                </div>

                {bulkError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{bulkError}</span>
                  </div>
                )}

                {bulkPreview.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-[#2A9D8F] flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Ko'rib chiqish (Birinchi {bulkPreview.length} ta qator):</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-[10px] space-y-1">
                      {bulkPreview.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC]">
                          <strong className="text-[#E07A5F]">{row.word}</strong>
                          <span className="text-[#94A3B8]">({row.partOfSpeech})</span>
                          <span className="truncate">{row.definitionUz || row.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8]"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    disabled={bulkPreview.length === 0 || !!bulkError}
                    onClick={handleCommitBulkImport}
                    className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Importni Tasdiqlash
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
