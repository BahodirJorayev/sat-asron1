'use client';

import React, { useState, useEffect } from 'react';
import { QuestionBankView } from '../../components/QuestionBankView';
import { INITIAL_USERS, INITIAL_QUESTIONS } from '../../data/mockDatabase';
import { User, Question } from '../../types';
import { fetchQuestionsRemote, subscribeToQuestions } from '../../lib/adminApi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function QuestionsPage() {
  const [currentUser] = useState<User>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('aurasat_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USERS[0];
  });

  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live Supabase questions immediately with zero stale cache
    fetchQuestionsRemote().then((remoteQuestions) => {
      if (isMounted && remoteQuestions && remoteQuestions.length > 0) {
        const remoteIds = new Set(remoteQuestions.map((q) => q.id));
        const fallbackRemaining = INITIAL_QUESTIONS.filter((q) => !remoteIds.has(q.id));
        setQuestions([...remoteQuestions, ...fallbackRemaining]);
      }
    });

    // 2. Realtime listener for immediate admin question updates
    const unsubscribe = subscribeToQuestions((newQuestions) => {
      if (isMounted && newQuestions && newQuestions.length > 0) {
        const remoteIds = new Set(newQuestions.map((q) => q.id));
        const fallbackRemaining = INITIAL_QUESTIONS.filter((q) => !remoteIds.has(q.id));
        setQuestions([...newQuestions, ...fallbackRemaining]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] py-6 pb-24 md:pb-12">
      <QuestionBankView
        user={currentUser}
        questions={questions}
        onOpenSocraticTutor={() => {}}
        onDepositMistake={() => {}}
        onOpenPaywall={() => {}}
      />
    </main>
  );
}
