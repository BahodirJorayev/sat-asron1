'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Database, Radio } from 'lucide-react';
import { AdminPanelView } from '../../components/AdminPanelView';
import {
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_MOCK_TESTS,
  INITIAL_PAYMENT_RECEIPTS,
} from '../../data/mockDatabase';
import { User, Question, MockTest, MockCategory, PaymentReceipt, GlobalPlatformSettings } from '../../types';
import {
  fetchQuestionsRemote,
  saveQuestionRemote,
  deleteQuestionRemote,
  bulkImportQuestionsRemote,
  subscribeToQuestions,
  fetchMockTestsRemote,
  saveMockTestRemote,
  deleteMockTestRemote,
  fetchMockCategories,
  saveMockCategoryRemote,
  deleteMockCategoryRemote,
  INITIAL_MOCK_CATEGORIES,
  subscribeToMockTests,
  fetchGlobalPlatformSettings,
  saveGlobalPlatformSettings,
  DEFAULT_GLOBAL_SETTINGS,
} from '../../lib/adminApi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_ADMIN_USER: User = {
  id: 'admin-master',
  email: 'admin@asronsat.uz',
  username: 'Admin',
  fullName: 'Bosh Administrator',
  role: 'ADMIN',
  planTier: 'VIP',
  streakDays: 99,
  targetScore: 1600,
  streakFreezes: 5,
  xpPoints: 9999,
};

export default function AdminPage() {
  const router = useRouter();
  const [currentUser] = useState<User>(DEFAULT_ADMIN_USER);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_PAYMENT_RECEIPTS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [mockTests, setMockTests] = useState<MockTest[]>(INITIAL_MOCK_TESTS);
  const [mockCategories, setMockCategories] = useState<MockCategory[]>(INITIAL_MOCK_CATEGORIES);
  const [globalSettings, setGlobalSettings] = useState<GlobalPlatformSettings>(DEFAULT_GLOBAL_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch remote live data
    fetchQuestionsRemote().then((remoteQs) => {
      if (isMounted && remoteQs && remoteQs.length > 0) {
        const remoteIds = new Set(remoteQs.map((q) => q.id));
        const fallback = INITIAL_QUESTIONS.filter((q) => !remoteIds.has(q.id));
        setQuestions([...remoteQs, ...fallback]);
      }
    }).catch(console.error);

    fetchMockTestsRemote().then((remoteMocks) => {
      if (isMounted && remoteMocks && remoteMocks.length > 0) {
        const remoteIds = new Set(remoteMocks.map((t) => t.id));
        const fallback = INITIAL_MOCK_TESTS.filter((t) => !remoteIds.has(t.id));
        setMockTests([...remoteMocks, ...fallback]);
      }
    }).catch(console.error);

    fetchMockCategories().then((cats) => {
      if (isMounted && cats && cats.length > 0) {
        setMockCategories(cats);
      }
    }).catch(console.error);

    fetchGlobalPlatformSettings().then((settings) => {
      if (isMounted && settings) {
        setGlobalSettings(settings);
      }
    }).catch(console.error);

    // 2. Realtime subscriptions
    const unsubQuestions = subscribeToQuestions((newQs) => {
      if (isMounted && newQs && newQs.length > 0) {
        const remoteIds = new Set(newQs.map((q) => q.id));
        const fallback = INITIAL_QUESTIONS.filter((q) => !remoteIds.has(q.id));
        setQuestions([...newQs, ...fallback]);
      }
    });

    const unsubMocks = subscribeToMockTests((newMocks) => {
      if (isMounted && newMocks && newMocks.length > 0) {
        const remoteIds = new Set(newMocks.map((t) => t.id));
        const fallback = INITIAL_MOCK_TESTS.filter((t) => !remoteIds.has(t.id));
        setMockTests([...newMocks, ...fallback]);
      }
    });

    return () => {
      isMounted = false;
      unsubQuestions();
      unsubMocks();
    };
  }, []);

  // Question CRUD Handlers
  const handleAddQuestion = async (newQ: Question) => {
    try {
      const saved = await saveQuestionRemote(newQ);
      setQuestions((prev) => [saved, ...prev.filter((q) => q.id !== saved.id)]);
    } catch (e) {
      console.error('Failed to save question to Supabase:', e);
      setQuestions((prev) => [newQ, ...prev]);
    }
  };

  const handleUpdateQuestion = async (updatedQ: Question) => {
    try {
      const saved = await saveQuestionRemote(updatedQ);
      setQuestions((prev) =>
        prev.map((q) => (q.id === saved.id || q.id === updatedQ.id ? saved : q))
      );
    } catch (e) {
      console.error('Failed to update question in Supabase:', e);
      setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestionRemote(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (e) {
      console.error('Failed to delete question from Supabase:', e);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  };

  const handleIngestQuestions = async (incoming: Question[]) => {
    try {
      const saved = await bulkImportQuestionsRemote(incoming);
      setQuestions((prev) => {
        const existingIds = new Set(saved.map((q) => q.id));
        return [...saved, ...prev.filter((q) => !existingIds.has(q.id))];
      });
    } catch (e) {
      console.error('Failed to bulk ingest questions to Supabase:', e);
    }
  };

  // Mock Tests CRUD Handlers
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

  const handleSaveGlobalSettings = async (settings: GlobalPlatformSettings) => {
    setGlobalSettings(settings);
    try {
      await saveGlobalPlatformSettings(settings);
    } catch (e) {
      console.error('Failed to save settings to Supabase:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] p-4 sm:p-6 space-y-4 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboardga qaytish</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Supabase Cloud Sync: Faol</span>
          </div>
        </div>

        <AdminPanelView
          currentUser={currentUser}
          usersList={usersList}
          receipts={receipts}
          questions={questions}
          mockTests={mockTests}
          mockCategories={mockCategories}
          globalSettings={globalSettings}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onIngestQuestions={handleIngestQuestions}
          onAddMockTest={handleAddMockTest}
          onUpdateMockTest={handleUpdateMockTest}
          onDeleteMockTest={handleDeleteMockTest}
          onAddMockCategory={handleAddMockCategory}
          onUpdateMockCategory={handleUpdateMockCategory}
          onDeleteMockCategory={handleDeleteMockCategory}
          onSaveGlobalSettings={handleSaveGlobalSettings}
          onApproveReceipt={(rId) => {
            setReceipts((prev) => prev.map((r) => (r.id === rId ? { ...r, status: 'APPROVED' } : r)));
          }}
          onRejectReceipt={(rId) => {
            setReceipts((prev) => prev.map((r) => (r.id === rId ? { ...r, status: 'REJECTED' } : r)));
          }}
          onUpdateUserPlan={(uId, plan) => {
            setUsersList((prev) => prev.map((u) => (u.id === uId ? { ...u, planTier: plan } : u)));
          }}
          onDeleteUser={(uId) => {
            setUsersList((prev) => prev.filter((u) => u.id !== uId));
          }}
          onNavigateToStudentView={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}
