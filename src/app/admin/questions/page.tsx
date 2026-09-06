'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Terminal, Sparkles, Database } from 'lucide-react';
import { AdminQuestionFixer } from '../../../components/AdminQuestionFixer';
import { AdminPDFIngestion } from '../../../components/AdminPDFIngestion';
import { INITIAL_QUESTIONS } from '../../../data/mockDatabase';
import { Question } from '../../../types';
import {
  fetchQuestionsRemote,
  saveQuestionRemote,
  deleteQuestionRemote,
  bulkImportQuestionsRemote,
  subscribeToQuestions,
} from '../../../lib/adminApi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [questionsSubTab, setQuestionsSubTab] = useState<'list' | 'ingestion'>('list');
  const [syncStatus, setSyncStatus] = useState<string>('Yuklanmoqda...');

  useEffect(() => {
    let isMounted = true;

    // 1. Initial live fetch from Supabase
    fetchQuestionsRemote()
      .then((remote) => {
        if (isMounted && remote && remote.length > 0) {
          const remoteIds = new Set(remote.map((q) => q.id));
          const fallbackRemaining = INITIAL_QUESTIONS.filter((q) => !remoteIds.has(q.id));
          setQuestions([...remote, ...fallbackRemaining]);
          setSyncStatus(`Supabase Jonli: ${remote.length} ta savol`);
        } else if (isMounted) {
          setSyncStatus('Lokal standartlar yuklandi');
        }
      })
      .catch((err) => {
        console.error('Questions fetch error:', err);
        if (isMounted) setSyncStatus('Supabase bilan ulanishda xatolik');
      });

    // 2. Realtime listener
    const unsubscribe = subscribeToQuestions((newQuestions) => {
      if (isMounted && newQuestions && newQuestions.length > 0) {
        const remoteIds = new Set(newQuestions.map((q) => q.id));
        const fallbackRemaining = INITIAL_QUESTIONS.filter((q) => !remoteIds.has(q.id));
        setQuestions([...newQuestions, ...fallbackRemaining]);
        setSyncStatus(`Realtime Yangilandi: ${newQuestions.length} ta savol`);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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

  const handleAddQuestion = async (newQ: Question) => {
    try {
      const saved = await saveQuestionRemote(newQ);
      setQuestions((prev) => [saved, ...prev.filter((q) => q.id !== saved.id)]);
    } catch (e) {
      console.error('Failed to add question to Supabase:', e);
      setQuestions((prev) => [newQ, ...prev]);
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

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
          <button
            onClick={() => setQuestionsSubTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              questionsSubTab === 'list'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#94A3B8] hover:bg-[#1E293B]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Savollar Ro'yxati ({questions.length})</span>
          </button>

          <button
            onClick={() => setQuestionsSubTab('ingestion')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              questionsSubTab === 'ingestion'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#94A3B8] hover:bg-[#1E293B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PDF Orqali Yuklash (AI Ingestion)</span>
          </button>
        </div>

        {/* Dynamic Content */}
        {questionsSubTab === 'list' ? (
          <AdminQuestionFixer
            questions={questions}
            onUpdateQuestion={handleUpdateQuestion}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        ) : (
          <AdminPDFIngestion
            onImportQuestions={(newQs) => handleIngestQuestions(newQs)}
          />
        )}
      </div>
    </div>
  );
}
