'use client';

import React, { useState } from 'react';
import { QuestionBankView } from '../../components/QuestionBankView';
import { INITIAL_USERS, INITIAL_QUESTIONS } from '../../data/mockDatabase';
import { User } from '../../types';

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

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] py-6 pb-24 md:pb-12">
      <QuestionBankView
        user={currentUser}
        questions={INITIAL_QUESTIONS}
        onOpenSocraticTutor={() => {}}
        onDepositMistake={() => {}}
        onOpenPaywall={() => {}}
      />
    </main>
  );
}
