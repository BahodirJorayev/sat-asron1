import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Lock,
  Check,
  X,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  FileText,
  AlertCircle,
  Tag,
  Hash,
  HelpCircle,
  KeyRound,
  ArrowUpDown
} from 'lucide-react';
import { 
  MockTest, 
  MockTestQuestion, 
  Question, 
  MockCategory, 
  MockModuleType, 
  Difficulty 
} from '../types';
import { INITIAL_MOCK_CATEGORIES } from '../lib/adminApi';

interface AdminMockManagerProps {
  mockTests: MockTest[];
  questions: Question[];
  mockCategories?: MockCategory[];
  onAddMockTest?: (newTest: MockTest) => void;
  onUpdateMockTest?: (updatedTest: MockTest) => void;
  onDeleteMockTest?: (testId: string) => void;
  onPreviewMockTest?: (test: MockTest) => void;
  onAddMockCategory?: (newCategory: MockCategory) => void;
  onUpdateMockCategory?: (updatedCategory: MockCategory) => void;
  onDeleteMockCategory?: (categoryId: string) => void;
}

export const AdminMockManager: React.FC<AdminMockManagerProps> = ({
  mockTests,
  questions,
  mockCategories = INITIAL_MOCK_CATEGORIES,
  onAddMockTest,
  onUpdateMockTest,
  onDeleteMockTest,
  onPreviewMockTest,
  onAddMockCategory,
  onUpdateMockCategory,
  onDeleteMockCategory,
}) => {
  // Navigation sub-tab: Mocks List vs Categories CMS
  const [activeSubTab, setActiveSubTab] = useState<'mocks' | 'categories'>('mocks');

  // Search and Category Filter for Mocks table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Mock Test Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MockCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    orderIndex: 1,
  });

  // Mock Form State
  const [mockFormData, setMockFormData] = useState<{
    title: string;
    description: string;
    categoryId: string;
    isPublished: boolean;
    isPrivate: boolean;
    accessCode: string;
    totalTimeMinutes: number;
    tags: string;
    assignedQuestions: MockTestQuestion[];
  }>({
    title: '',
    description: '',
    categoryId: mockCategories[0]?.id || '11111111-c001-4000-8000-000000000001',
    isPublished: true,
    isPrivate: false,
    accessCode: 'ASRON-2026',
    totalTimeMinutes: 134,
    tags: 'Rasmiy Bluebook, Adaptiv MST, To‘liq format',
    assignedQuestions: [],
  });

  // Active module tab in Question Assignor Drawer
  const [activeModuleTab, setActiveModuleTab] = useState<MockModuleType>('RW_M1');
  const [assignorSearch, setAssignorSearch] = useState('');
  const [assignorDomainFilter, setAssignorDomainFilter] = useState('ALL');

  // Summary Metrics
  const totalTests = mockTests.length;
  const publishedTests = mockTests.filter((t) => t.isPublished).length;
  const privateTests = mockTests.filter((t) => t.isPrivate).length;
  const totalAttempts = mockTests.reduce((acc, t) => acc + (t.attemptsCount || 0), 0);

  // Filtered mock tests
  const filteredTests = useMemo(() => {
    return mockTests.filter((test) => {
      if (selectedCategoryFilter !== 'ALL') {
        const matchesId = test.categoryId === selectedCategoryFilter;
        const matchesSlug = test.categorySlug === selectedCategoryFilter;
        if (!matchesId && !matchesSlug) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(q);
        const matchDesc = test.description?.toLowerCase().includes(q);
        const matchTags = test.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [mockTests, selectedCategoryFilter, searchQuery]);

  // Helper to find category name for a mock
  const getCategoryName = (categoryId?: string, categorySlug?: string) => {
    const found = mockCategories.find((c) => c.id === categoryId || c.slug === categorySlug);
    return found ? found.name : 'Boshqa toifa';
  };

  // -------------------------------------------------------------
  // MOCK TEST CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddMock = () => {
    setEditingTest(null);
    setMockFormData({
      title: '',
      description: 'Rasmiy 2-bosqichli College Board adaptiv Bluebook simulyatsiyasi.',
      categoryId: mockCategories[0]?.id || '11111111-c001-4000-8000-000000000001',
      isPublished: true,
      isPrivate: false,
      accessCode: 'ASRON-2026',
      totalTimeMinutes: 134,
      tags: 'Rasmiy Bluebook, Adaptiv MST, 2026 Yangi',
      assignedQuestions: [],
    });
    setIsTestModalOpen(true);
  };

  const handleOpenEditMock = (test: MockTest) => {
    setEditingTest(test);
    setMockFormData({
      title: test.title,
      description: test.description || '',
      categoryId: test.categoryId || mockCategories[0]?.id || '',
      isPublished: test.isPublished,
      isPrivate: Boolean(test.isPrivate),
      accessCode: test.accessCode || 'ASRON-2026',
      totalTimeMinutes: test.totalTimeMinutes || 134,
      tags: test.tags ? test.tags.join(', ') : 'Rasmiy Bluebook, Adaptiv MST',
      assignedQuestions: test.questions || [],
    });
    setIsTestModalOpen(true);
  };

  const handleSaveMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFormData.title.trim()) return;

    const parsedTags = mockFormData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const selectedCategory = mockCategories.find((c) => c.id === mockFormData.categoryId);

    if (editingTest) {
      const updated: MockTest = {
        ...editingTest,
        title: mockFormData.title.trim(),
        description: mockFormData.description.trim(),
        categoryId: mockFormData.categoryId,
        categorySlug: selectedCategory?.slug,
        isPublished: mockFormData.isPublished,
        isProOnly: false,
        isPrivate: mockFormData.isPrivate,
        accessCode: mockFormData.isPrivate
          ? mockFormData.accessCode.trim().toUpperCase() || 'ASRON-2026'
          : undefined,
        totalTimeMinutes: Number(mockFormData.totalTimeMinutes) || 134,
        timeLimitSecs: (Number(mockFormData.totalTimeMinutes) || 134) * 60,
        tags: parsedTags,
        questions: mockFormData.assignedQuestions,
        updatedAt: new Date().toISOString(),
      };
      onUpdateMockTest?.(updated);
    } else {
      const newTest: MockTest = {
        id: `mock-${Date.now()}`,
        title: mockFormData.title.trim(),
        description: mockFormData.description.trim(),
        categoryId: mockFormData.categoryId,
        categorySlug: selectedCategory?.slug,
        isPublished: mockFormData.isPublished,
        isProOnly: false,
        isPrivate: mockFormData.isPrivate,
        accessCode: mockFormData.isPrivate
          ? mockFormData.accessCode.trim().toUpperCase() || 'ASRON-2026'
          : undefined,
        totalTimeMinutes: Number(mockFormData.totalTimeMinutes) || 134,
        timeLimitSecs: (Number(mockFormData.totalTimeMinutes) || 134) * 60,
        tags: parsedTags,
        questions: mockFormData.assignedQuestions,
        attemptsCount: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
      };
      onAddMockTest?.(newTest);
    }

    setIsTestModalOpen(false);
  };

  const handleTogglePublish = (test: MockTest) => {
    onUpdateMockTest?.({ ...test, isPublished: !test.isPublished });
  };

  // Auto-Fill algorithm from Question Bank
  const handleAutoFillEntireTest = () => {
    const modules: MockModuleType[] = [
      'RW_M1',
      'RW_M2_EASY',
      'RW_M2_HARD',
      'MATH_M1',
      'MATH_M2_EASY',
      'MATH_M2_HARD',
    ];
    let allAssigned: MockTestQuestion[] = [];

    modules.forEach((mod) => {
      const isRW = mod.startsWith('RW');
      const targetSection = isRW ? 'READING_AND_WRITING' : 'MATH';
      const targetCount = isRW ? 27 : 22;

      const pool = questions.filter((q) => q.section === targetSection);
      let subPool = pool;
      if (mod.includes('EASY')) {
        subPool = pool.filter((q) => q.difficulty === 'EASY' || q.difficulty === 'MEDIUM');
      } else if (mod.includes('HARD')) {
        subPool = pool.filter((q) => q.difficulty === 'HARD' || q.difficulty === 'MEDIUM');
      }
      if (subPool.length === 0) subPool = pool;

      const chosen = subPool.slice(0, targetCount);
      const generated = chosen.map((q, idx) => ({
        id: `mq-${mod}-${Date.now()}-${idx}`,
        mockTestId: editingTest?.id || 'new-mock',
        questionId: q.id,
        question: q,
        moduleType: mod,
        moduleNumber: (mod.includes('M1') ? 1 : 2) as 1 | 2,
        section: targetSection,
        difficultyTier: q.difficulty,
        orderIndex: idx + 1,
      }));

      allAssigned = [...allAssigned, ...generated];
    });

    setMockFormData((prev) => ({
      ...prev,
      assignedQuestions: allAssigned,
    }));
  };

  // -------------------------------------------------------------
  // CATEGORY CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      orderIndex: mockCategories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: MockCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      orderIndex: cat.orderIndex,
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setCategoryFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    const slugClean =
      categoryFormData.slug.trim() ||
      categoryFormData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

    if (editingCategory) {
      const updated: MockCategory = {
        ...editingCategory,
        name: categoryFormData.name.trim(),
        slug: slugClean,
        description: categoryFormData.description.trim(),
        orderIndex: Number(categoryFormData.orderIndex) || 1,
      };
      onUpdateMockCategory?.(updated);
    } else {
      const newCat: MockCategory = {
        id: `cat-${Date.now()}`,
        name: categoryFormData.name.trim(),
        slug: slugClean,
        description: categoryFormData.description.trim(),
        orderIndex: Number(categoryFormData.orderIndex) || mockCategories.length + 1,
        createdAt: new Date().toISOString(),
      };
      onAddMockCategory?.(newCat);
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (cat: MockCategory) => {
    const linkedCount = mockTests.filter(
      (t) => t.categoryId === cat.id || t.categorySlug === cat.slug
    ).length;

    let confirmMsg = `Haqiqatan ham "${cat.name}" toifasini o‘chirmoqchimisiz?`;
    if (linkedCount > 0) {
      confirmMsg = `DIQQAT: Ushbu toifaga ${linkedCount} ta mock test biriktirilgan. Toifani o‘chirish testlarning toifasiz qolishiga olib keladi. Davom etasizmi?`;
    }

    if (window.confirm(confirmMsg)) {
      onDeleteMockCategory?.(cat.id);
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#0F172A] dark:text-[#F8FAFC]">
      {/* 1. Header & Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="text-2xl font-extrabold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {totalTests}
          </div>
          <div className="text-[10px] uppercase font-bold font-mono text-[#64748B] dark:text-[#94A3B8] tracking-wider mt-0.5">
            Jami Mock Testlar
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="text-2xl font-extrabold font-mono text-emerald-500">
            {publishedTests}
          </div>
          <div className="text-[10px] uppercase font-bold font-mono text-[#64748B] dark:text-[#94A3B8] tracking-wider mt-0.5">
            Faol va Jonli
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="text-2xl font-extrabold font-mono text-[#E07A5F]">
            {privateTests}
          </div>
          <div className="text-[10px] uppercase font-bold font-mono text-[#64748B] dark:text-[#94A3B8] tracking-wider mt-0.5">
            Maxsus Kurs Mocklari
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="text-2xl font-extrabold font-mono text-indigo-500">
            {mockCategories.length}
          </div>
          <div className="text-[10px] uppercase font-bold font-mono text-[#64748B] dark:text-[#94A3B8] tracking-wider mt-0.5">
            Mavjud Toifalar
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher (Linear / Apple Minimalist Pill Strip) */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('mocks')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'mocks'
                ? 'bg-white dark:bg-[#121A2F] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Mock Testlar Ro'yxati</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E2E8F0] dark:bg-[#1E293B]">
              {mockTests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'categories'
                ? 'bg-white dark:bg-[#121A2F] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kategoriyalar & Filtrlar CMS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E2E8F0] dark:bg-[#1E293B]">
              {mockCategories.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'mocks' ? (
          <button
            id="btn-add-new-mock"
            onClick={handleOpenAddMock}
            className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi Mock Test Qo'shish</span>
          </button>
        ) : (
          <button
            id="btn-add-new-category"
            onClick={handleOpenAddCategory}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi Toifa Yaratish</span>
          </button>
        )}
      </div>

      {/* ============================================================= */}
      {/* SECTION 1: MOCK TESTS LIST & QUESTION ASSIGNOR                */}
      {/* ============================================================= */}
      {activeSubTab === 'mocks' && (
        <div className="space-y-4">
          {/* Search & Dynamic Category Filter Pill Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mock test nomi yoki kalit so'zlar bo'yicha qidirish..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>

            {/* Dynamic Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedCategoryFilter === 'ALL'
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                }`}
              >
                Barchasi ({mockTests.length})
              </button>

              {mockCategories.map((cat) => {
                const count = mockTests.filter(
                  (t) => t.categoryId === cat.id || t.categorySlug === cat.slug
                ).length;
                const isSelected = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#E07A5F] text-white'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mock Tests Table */}
          <div className="rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] font-mono border-b border-[#E2E8F0] dark:border-[#1E293B]">
                  <tr>
                    <th className="px-5 py-3.5 font-bold uppercase">Test Nomi</th>
                    <th className="px-4 py-3.5 font-bold uppercase">Toifasi</th>
                    <th className="px-4 py-3.5 font-bold uppercase">Savollar</th>
                    <th className="px-4 py-3.5 font-bold uppercase">Kirish Turi</th>
                    <th className="px-4 py-3.5 font-bold uppercase">Holati</th>
                    <th className="px-5 py-3.5 font-bold uppercase text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {filteredTests.map((test) => {
                    const assignedCount = test.questions?.length || 0;
                    const catTitle = getCategoryName(test.categoryId, test.categorySlug);

                    return (
                      <tr
                        key={test.id}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#1A233A]/50 transition-colors"
                      >
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {test.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                            {test.description || 'College Board adaptiv simulyatsiyasi'}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155]">
                            {catTitle}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              assignedCount >= 98
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {assignedCount} / 98 ta savol
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {test.isPrivate ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Lock className="w-3 h-3" />
                              <span>Kod: {test.accessCode || 'ASRON-2026'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span>Ochiq (1-bosishda bepul)</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePublish(test)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                              test.isPublished
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            {test.isPublished ? 'Faol (Chop etilgan)' : 'Qoralama'}
                          </button>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onPreviewMockTest && (
                              <button
                                onClick={() => onPreviewMockTest(test)}
                                title="Sinovdan o'tkazish"
                                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditMock(test)}
                              title="Tahrirlash"
                              className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`"${test.title}" mock testini o'chirishni tasdiqlaysizmi?`)) {
                                  onDeleteMockTest?.(test.id);
                                }
                              }}
                              title="O'chirish"
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[#64748B] dark:text-[#94A3B8] hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[#64748B] dark:text-[#94A3B8] font-mono">
                        Mock testlar topilmadi. Yangi test yaratish uchun yuqoridagi tugmani bosing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: CATEGORIES & FILTER CMS                             */}
      {/* ============================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-mono font-bold uppercase">
                <Tag className="w-3 h-3 text-indigo-500" />
                <span>Dinamik Mock Toifalari Boshqaruvi</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Mock Test Toifalari va Filtrlar
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-2xl">
                Bu yerdagi toifalar o‘quvchilar sahifasida (`/mocks`) yuqori filtr tugmalari sifatida avtomatik aks etadi. Istalgan toifani erkin qo‘shishingiz, tahrirlashingiz yoki o‘chirishingiz mumkin.
              </p>
            </div>

            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yangi Toifa Qo'shish</span>
            </button>
          </div>

          {/* Categories List Table */}
          <div className="rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] font-mono border-b border-[#E2E8F0] dark:border-[#1E293B]">
                  <tr>
                    <th className="px-5 py-3.5 font-bold uppercase w-16">Tartib</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Toifa Nomi</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Slug (Identifikator)</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Tavsif</th>
                    <th className="px-4 py-3.5 font-bold uppercase">Bog'langan Testlar</th>
                    <th className="px-5 py-3.5 font-bold uppercase text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {mockCategories.map((cat) => {
                    const linkedCount = mockTests.filter(
                      (t) => t.categoryId === cat.id || t.categorySlug === cat.slug
                    ).length;

                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#1A233A]/50 transition-colors"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          #{cat.orderIndex}
                        </td>

                        <td className="px-5 py-4 font-bold text-[#0F172A] dark:text-[#F8FAFC] whitespace-nowrap">
                          {cat.name}
                        </td>

                        <td className="px-5 py-4 font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {cat.slug}
                        </td>

                        <td className="px-5 py-4 text-[#64748B] dark:text-[#94A3B8] max-w-sm">
                          {cat.description || 'Standart mock toifasi'}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap font-mono font-bold">
                          <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155]">
                            {linkedCount} ta test
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              title="Tahrirlash"
                              className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              title="O'chirish"
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[#64748B] dark:text-[#94A3B8] hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {mockCategories.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-[#64748B] dark:text-[#94A3B8] font-mono">
                        Hozircha birorta toifa mavjud emas. Yangi toifa qo‘shing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: MOCK TEST CREATE / EDIT MODAL                         */}
      {/* ============================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-3xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#E07A5F]/10 border border-[#E07A5F]/20 text-[#E07A5F]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {editingTest ? 'Mock Testni Tahrirlash' : 'Yangi Mock Test Yaratish'}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    College Board 2-bosqichli adaptiv MST spetsifikatsiyasi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMock} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  Mock Test Nomi
                </label>
                <input
                  type="text"
                  required
                  value={mockFormData.title}
                  onChange={(e) => setMockFormData({ ...mockFormData, title: e.target.value })}
                  placeholder="Masalan: Bluebook Official Practice Test #4"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  Tavsif
                </label>
                <textarea
                  rows={2}
                  value={mockFormData.description}
                  onChange={(e) => setMockFormData({ ...mockFormData, description: e.target.value })}
                  placeholder="Test haqida qisqacha ma'lumot va qiyinlik darajasi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DYNAMIC CATEGORY SELECTION */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Toifasi (Kategoriya)</span>
                  </label>
                  <select
                    value={mockFormData.categoryId}
                    onChange={(e) => setMockFormData({ ...mockFormData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] cursor-pointer"
                  >
                    {mockCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                    Ajratilgan Vaqt (daqiqa)
                  </label>
                  <input
                    type="number"
                    value={mockFormData.totalTimeMinutes}
                    onChange={(e) =>
                      setMockFormData({
                        ...mockFormData,
                        totalTimeMinutes: Number(e.target.value) || 134,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              {/* Private Mock / Access Code Card */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#E07A5F]" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Maxsus Kurs Mock Testi (Kod bilan himoyalangan)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mockFormData.isPrivate}
                    onChange={(e) => setMockFormData({ ...mockFormData, isPrivate: e.target.checked })}
                    className="w-4 h-4 accent-[#E07A5F] cursor-pointer"
                  />
                </div>

                {mockFormData.isPrivate && (
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                    <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                      <span>Maxsus Kirish Kodi:</span>
                      <span className="text-[10px] text-emerald-500 font-bold">Talaba kiritishi shart</span>
                    </label>
                    <input
                      type="text"
                      value={mockFormData.accessCode}
                      onChange={(e) =>
                        setMockFormData({ ...mockFormData, accessCode: e.target.value.toUpperCase() })
                      }
                      placeholder="ASRON-2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold uppercase tracking-wider text-[#E07A5F] focus:outline-hidden focus:border-[#E07A5F]"
                    />
                  </div>
                )}
              </div>

              {/* Questions Management & Auto-Fill Toolbar */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Savollar Majmuasi: {mockFormData.assignedQuestions.length} ta savol
                    </span>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Standart to‘liq format: 98 ta savol (54 ta RW + 44 ta Math)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFillEntireTest}
                    className="px-3 py-1.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>Avto-To'ldirish (98 ta)</span>
                  </button>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <input
                    type="checkbox"
                    checked={mockFormData.isPublished}
                    onChange={(e) => setMockFormData({ ...mockFormData, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-[#E07A5F]"
                  />
                  <span>Chop etish (Talabalar ko‘rishi mumkin)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] cursor-pointer"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold cursor-pointer shadow-xs"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: CATEGORY CREATE / EDIT MODAL                          */}
      {/* ============================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]"
          >
            <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {editingCategory ? 'Toifani Tahrirlash' : 'Yangi Mock Toifasi Yaratish'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Dinamik filtr menyusi uchun toifa
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  Toifa Nomi
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="Masalan: Mini Mock Testlar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  Slug (URL identifikatori)
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.slug}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, slug: e.target.value.toLowerCase() })
                  }
                  placeholder="mini-mock-testlar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-indigo-600 dark:text-indigo-400 placeholder-[#94A3B8] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  Tartib Raqami
                </label>
                <input
                  type="number"
                  required
                  value={categoryFormData.orderIndex}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      orderIndex: Number(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                  Tavsif (Ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, description: e.target.value })
                  }
                  placeholder="Toifa haqida qisqacha ma'lumot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold cursor-pointer shadow-xs"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
