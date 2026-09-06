'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Database } from 'lucide-react';
import { AdminMockManager } from '../../../components/AdminMockManager';
import { INITIAL_MOCK_TESTS, INITIAL_QUESTIONS } from '../../../data/mockDatabase';
import { MockTest, MockCategory, Question } from '../../../types';
import {
  fetchMockTestsRemote,
  saveMockTestRemote,
  deleteMockTestRemote,
  fetchMockCategories,
  saveMockCategoryRemote,
  deleteMockCategoryRemote,
  INITIAL_MOCK_CATEGORIES,
  subscribeToMockTests,
  fetchQuestionsRemote,
} from '../../../lib/adminApi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminMocksPage() {
  const [mockTests, setMockTests] = useState<MockTest[]>(INITIAL_MOCK_TESTS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [mockCategories, setMockCategories] = useState<MockCategory[]>(INITIAL_MOCK_CATEGORIES);
  const [syncStatus, setSyncStatus] = useState<string>('Yuklanmoqda...');

  useEffect(() => {
    let isMounted = true;

    // 1. Initial live fetch from Supabase
    fetchMockTestsRemote()
      .then((remote) => {
        if (isMounted && remote && remote.length > 0) {
          const remoteIds = new Set(remote.map((t) => t.id));
          const fallbackRemaining = INITIAL_MOCK_TESTS.filter((t) => !remoteIds.has(t.id));
          setMockTests([...remote, ...fallbackRemaining]);
          setSyncStatus(`Supabase Jonli: ${remote.length} ta mock test`);
        } else if (isMounted) {
          setSyncStatus('Lokal standartlar yuklandi');
        }
      })
      .catch((err) => {
        console.error('Mock tests fetch error:', err);
        if (isMounted) setSyncStatus('Supabase bilan ulanishda xatolik');
      });

    fetchMockCategories()
      .then((cats) => {
        if (isMounted && cats && cats.length > 0) {
          setMockCategories(cats);
        }
      })
      .catch(console.error);

    fetchQuestionsRemote()
      .then((qs) => {
        if (isMounted && qs && qs.length > 0) {
          setQuestions(qs);
        }
      })
      .catch(console.error);

    // 2. Realtime subscription for instant updates
    const unsubscribe = subscribeToMockTests((updatedTests) => {
      if (isMounted && updatedTests && updatedTests.length > 0) {
        const remoteIds = new Set(updatedTests.map((t) => t.id));
        const fallbackRemaining = INITIAL_MOCK_TESTS.filter((t) => !remoteIds.has(t.id));
        setMockTests([...updatedTests, ...fallbackRemaining]);
        setSyncStatus(`Realtime Yangilandi: ${updatedTests.length} ta mock test`);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleAddMockTest = async (newTest: MockTest) => {
    setMockTests((prev) => [newTest, ...prev]);
    try {
      await saveMockTestRemote(newTest);
    } catch (e) {
      console.error('Failed to save mock test to Supabase:', e);
    }
  };

  const handleUpdateMockTest = async (updatedTest: MockTest) => {
    setMockTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
    try {
      await saveMockTestRemote(updatedTest);
    } catch (e) {
      console.error('Failed to update mock test in Supabase:', e);
    }
  };

  const handleDeleteMockTest = async (testId: string) => {
    setMockTests((prev) => prev.filter((t) => t.id !== testId));
    try {
      await deleteMockTestRemote(testId);
    } catch (e) {
      console.error('Failed to delete mock test from Supabase:', e);
    }
  };

  const handleAddMockCategory = async (newCat: MockCategory) => {
    setMockCategories((prev) => [...prev, newCat]);
    try {
      await saveMockCategoryRemote(newCat);
    } catch (e) {
      console.error('Failed to save category:', e);
    }
  };

  const handleUpdateMockCategory = async (updatedCat: MockCategory) => {
    setMockCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    try {
      await saveMockCategoryRemote(updatedCat);
    } catch (e) {
      console.error('Failed to update category:', e);
    }
  };

  const handleDeleteMockCategory = async (categoryId: string) => {
    setMockCategories((prev) => prev.filter((c) => c.id !== categoryId));
    try {
      await deleteMockCategoryRemote(categoryId);
    } catch (e) {
      console.error('Failed to delete category:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] p-4 sm:p-8 space-y-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboardga qaytish</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
            >
              <span>Admin Boshqaruv</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            <Database className="w-3.5 h-3.5" />
            <span>{syncStatus}</span>
          </div>
        </div>

        {/* Mock Tests Manager */}
        <AdminMockManager
          mockTests={mockTests}
          questions={questions}
          mockCategories={mockCategories}
          onAddMockTest={handleAddMockTest}
          onUpdateMockTest={handleUpdateMockTest}
          onDeleteMockTest={handleDeleteMockTest}
          onAddMockCategory={handleAddMockCategory}
          onUpdateMockCategory={handleUpdateMockCategory}
          onDeleteMockCategory={handleDeleteMockCategory}
        />
      </div>
    </div>
  );
}
