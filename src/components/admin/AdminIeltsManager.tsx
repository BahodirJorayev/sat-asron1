'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Lock,
  Unlock,
  Key,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  User as UserIcon,
  Filter,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { IeltsMockTest, IeltsTestSubmission, IeltsExamType } from '../../types';
import { INITIAL_IELTS_MOCK_TESTS, INITIAL_IELTS_SUBMISSIONS } from '../../data/ieltsDatabase';

interface AdminIeltsManagerProps {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const AdminIeltsManager: React.FC<AdminIeltsManagerProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'submissions'>('tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // IELTS Tests State
  const [tests, setTests] = useState<IeltsMockTest[]>(() => {
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

  // Submissions State
  const [submissions, setSubmissions] = useState<IeltsTestSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('asron_ielts_submissions');
        if (saved) {
          const parsed = JSON.parse(saved);
          return [...parsed, ...INITIAL_IELTS_SUBMISSIONS];
        }
      } catch (err) {
        console.error('Error loading submissions:', err);
      }
    }
    return INITIAL_IELTS_SUBMISSIONS;
  });

  // Modal State for Test Creation / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<IeltsMockTest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    examType: 'ACADEMIC' as IeltsExamType,
    category: 'CLASSROOM_TEST' as 'FULL_MOCK' | 'SECTIONAL_PRACTICE' | 'CLASSROOM_TEST',
    isPrivate: true,
    accessCode: '',
    totalTimeMinutes: 75,
    targetBand: 7.5,
    listeningAudioUrl: '',
    readingPassagesCount: 2,
    writingTasksCount: 1,
    speakingPartsCount: 0,
    description: '',
    teacherNote: '',
  });

  // Save tests to storage
  const persistTests = (updated: IeltsMockTest[]) => {
    setTests(updated);
    if (typeof window !== 'undefined') {
      const customOnly = updated.filter(
        (t) => !INITIAL_IELTS_MOCK_TESTS.some((init) => init.id === t.id)
      );
      localStorage.setItem('asron_custom_ielts_tests', JSON.stringify(customOnly));
    }
  };

  // Open modal for new test
  const handleOpenCreateModal = () => {
    setEditingTest(null);
    setFormData({
      title: '',
      examType: 'ACADEMIC',
      category: 'CLASSROOM_TEST',
      isPrivate: true,
      accessCode: 'CORE-' + Math.floor(100 + Math.random() * 900),
      totalTimeMinutes: 75,
      targetBand: 7.5,
      listeningAudioUrl: '',
      readingPassagesCount: 2,
      writingTasksCount: 1,
      speakingPartsCount: 0,
      description: "O'quv markaz dars nazorat testi.",
      teacherNote: "Ustozingiz bergan kod bilan kiring.",
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing test
  const handleOpenEditModal = (test: IeltsMockTest) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      examType: test.examType,
      category: test.category,
      isPrivate: test.isPrivate,
      accessCode: test.accessCode || test.passcode || '',
      totalTimeMinutes: test.totalTimeMinutes,
      targetBand: test.targetBand,
      listeningAudioUrl: test.listeningAudioUrl || '',
      readingPassagesCount: test.readingPassagesCount || 0,
      writingTasksCount: test.writingTasksCount || 0,
      speakingPartsCount: test.speakingPartsCount || 0,
      description: test.description,
      teacherNote: test.teacherNote || '',
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Iltimos, test nomini kiriting');
      return;
    }

    if (formData.category === 'CLASSROOM_TEST' && !formData.accessCode.trim()) {
      alert('Maxsus dars testi uchun passkod kiritish shart!');
      return;
    }

    if (editingTest) {
      // Update existing
      const updated = tests.map((t) => {
        if (t.id === editingTest.id) {
          return {
            ...t,
            title: formData.title,
            examType: formData.examType,
            category: formData.category,
            isPrivate: formData.isPrivate,
            accessCode: formData.accessCode.trim().toUpperCase(),
            passcode: formData.accessCode.trim().toUpperCase(),
            totalTimeMinutes: Number(formData.totalTimeMinutes),
            targetBand: Number(formData.targetBand),
            listeningAudioUrl: formData.listeningAudioUrl || undefined,
            readingPassagesCount: Number(formData.readingPassagesCount),
            writingTasksCount: Number(formData.writingTasksCount),
            speakingPartsCount: Number(formData.speakingPartsCount),
            description: formData.description,
            teacherNote: formData.teacherNote,
          };
        }
        return t;
      });
      persistTests(updated);
      onNotify?.('IELTS testi muvaffaqiyatli yangilandi', 'success');
    } else {
      // Create new
      const newTest: IeltsMockTest = {
        id: 'ielts-custom-' + Date.now(),
        title: formData.title,
        examType: formData.examType,
        category: formData.category,
        isPrivate: formData.isPrivate,
        accessCode: formData.accessCode.trim().toUpperCase(),
        passcode: formData.accessCode.trim().toUpperCase(),
        totalTimeMinutes: Number(formData.totalTimeMinutes),
        targetBand: Number(formData.targetBand),
        attemptsCount: 0,
        averageBand: 6.5,
        listeningAudioUrl: formData.listeningAudioUrl || undefined,
        readingPassagesCount: Number(formData.readingPassagesCount),
        writingTasksCount: Number(formData.writingTasksCount),
        speakingPartsCount: Number(formData.speakingPartsCount),
        description: formData.description,
        teacherNote: formData.teacherNote,
        tags: [formData.examType, formData.category === 'CLASSROOM_TEST' ? 'Classroom' : 'Full Mock'],
        createdAt: new Date().toISOString(),
      };
      persistTests([newTest, ...tests]);
      onNotify?.('Yangi IELTS dars testi qo‘shildi!', 'success');
    }

    setIsModalOpen(false);
    setEditingTest(null);
  };

  // Delete test
  const handleDeleteTest = (testId: string) => {
    if (confirm('Ushbu IELTS testini o‘chirishni xohlaysizmi?')) {
      const updated = tests.filter((t) => t.id !== testId);
      persistTests(updated);
      onNotify?.('Test o‘chirildi', 'success');
    }
  };

  // Filtered Tests
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (filterCategory === 'CLASSROOM' && t.category !== 'CLASSROOM_TEST') return false;
      if (filterCategory === 'FULL_MOCK' && t.category !== 'FULL_MOCK') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCode = (t.accessCode || t.passcode || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode) return false;
      }
      return true;
    });
  }, [tests, filterCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase">
              Admin Boshqaruvi
            </span>
            <span className="text-xs text-slate-400">• IELTS Tizimi</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            IELTS Mock & Maxsus Dars Testlari Boshqaruvi
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Passkodli sinf testlarini yaratish, boshqarish va talabalar natijalarini kuzatish.
          </p>
        </div>

        {/* Create Test Button */}
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yangi Test / Passkod Qo&apos;shish
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          IELTS Testlar Ro&apos;yxati ({tests.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Talabalar Topshiriqlari ({submissions.length})
        </button>
      </div>

      {/* TAB 1: IELTS Tests List */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto">
              {['ALL', 'CLASSROOM', 'FULL_MOCK'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat === 'ALL' && 'Barchasi'}
                  {cat === 'CLASSROOM' && '🔒 Maxsus Dars Testlari'}
                  {cat === 'FULL_MOCK' && 'Standart Mocklar'}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Test nomi yoki passkod..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Test Nomi</th>
                    <th className="py-3.5 px-4">Turi / Kategoriya</th>
                    <th className="py-3.5 px-4">Passkod (Parol)</th>
                    <th className="py-3.5 px-4">Vaqti</th>
                    <th className="py-3.5 px-4">Target Band</th>
                    <th className="py-3.5 px-4">Urinishlar</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTests.map((test) => {
                    const isClass = test.category === 'CLASSROOM_TEST' || test.isPrivate;
                    const code = test.accessCode || test.passcode;

                    return (
                      <tr key={test.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                          {test.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                              {test.examType}
                            </span>
                            {isClass ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Maxsus Dars
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                Ochiq Mock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {code ? (
                            <span className="px-2 py-1 rounded-md bg-slate-900 text-amber-400 dark:bg-amber-950/60 dark:text-amber-300 tracking-wider">
                              {code}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {test.totalTimeMinutes} daqiqa
                        </td>
                        <td className="py-3.5 px-4 font-bold text-orange-600 dark:text-orange-400">
                          {test.targetBand.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {test.attemptsCount} ta
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(test)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Tahrirlash"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Student Submissions List */}
      {activeTab === 'submissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Oxirgi topshirilgan IELTS natijalari
            </h3>
            <span className="text-xs text-slate-400">
              Jami topshirishlar: {submissions.length} ta
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Talaba</th>
                  <th className="py-3.5 px-4">Test Nomi</th>
                  <th className="py-3.5 px-4 text-center">Listening</th>
                  <th className="py-3.5 px-4 text-center">Reading</th>
                  <th className="py-3.5 px-4 text-center">Writing</th>
                  <th className="py-3.5 px-4 text-center">Speaking</th>
                  <th className="py-3.5 px-4 text-center font-bold text-orange-600 dark:text-orange-400">
                    Overall Band
                  </th>
                  <th className="py-3.5 px-4">Topshirilgan Vaqt</th>
                  <th className="py-3.5 px-4">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{sub.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{sub.username}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {sub.testTitle}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {sub.listeningBand.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {sub.readingBand.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {sub.writingBand?.toFixed(1) || '7.0'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {sub.speakingBand?.toFixed(1) || '7.0'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-sm">
                        {sub.overallBand.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        Baholangan
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit Test */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingTest ? "IELTS Testini Tahrirlash" : "Yangi Maxsus Dars Testi Yaratish"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    O&apos;quvchilar ushbu testga faqat siz bergan passkod orqali kira oladilar.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Test Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masalan: Maxsus Dars Testi: CORE-W3 Writing Masterclass"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Exam Type & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Imtihon Turi
                    </label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value as IeltsExamType })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    >
                      <option value="ACADEMIC">Academic</option>
                      <option value="GENERAL_TRAINING">General Training</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kategoriya
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setFormData({
                          ...formData,
                          category: val,
                          isPrivate: val === 'CLASSROOM_TEST',
                        });
                      }}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    >
                      <option value="CLASSROOM_TEST">🔒 Maxsus Dars Testi (Passkodli)</option>
                      <option value="FULL_MOCK">Standart To&apos;liq Mock</option>
                      <option value="SECTIONAL_PRACTICE">Alohida Bo&apos;lim Praktikasi</option>
                    </select>
                  </div>
                </div>

                {/* Passcode (Required for classroom) */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <label className="block font-bold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                    <Key className="w-4 h-4" />
                    Dars Passkodi (Masalan: CORE-W3, CAMP-2026)
                  </label>
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                    placeholder="CORE-W3"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 font-mono font-bold uppercase text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    Ushbu kodni talabalarga darsda bering. O&apos;quvchilar testni yechishdan oldin shu kodni kiritishadi.
                  </p>
                </div>

                {/* Duration & Target Band */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Davomiyligi (Daqiqa)
                    </label>
                    <input
                      type="number"
                      value={formData.totalTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, totalTimeMinutes: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Band
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.targetBand}
                      onChange={(e) => setFormData({ ...formData, targetBand: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Teacher Note */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ustoz Eslatmasi (Talabaga ko&apos;rinadi)
                  </label>
                  <input
                    type="text"
                    value={formData.teacherNote}
                    onChange={(e) => setFormData({ ...formData, teacherNote: e.target.value })}
                    placeholder="Masalan: Testni 75 daqiqa ichida yakunlang. Lug'atdan foydalanmang."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Test Tavsifi
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Test haqida qisqacha ma'lumot..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/20"
                  >
                    {editingTest ? "O'zgarishlarni Saqlash" : "Testni Saqlash & Faollashtirish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
