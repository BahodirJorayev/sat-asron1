'use client';

import React, { useState } from 'react';
import { MistakeVaultView } from '../../components/MistakeVaultView';
import { INITIAL_USERS, INITIAL_MISTAKES } from '../../data/mockDatabase';
import { MistakeVaultItem, User } from '../../types';

export default function MistakesPage() {
  const [currentUser] = useState<User>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('aurasat_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USERS[0];
  });

  const [mistakes, setMistakes] = useState<MistakeVaultItem[]>(INITIAL_MISTAKES);

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] py-6 pb-24 md:pb-12">
      <MistakeVaultView
        mistakes={mistakes}
        user={currentUser}
        onOpenSocraticTutor={() => {}}
        onOpenPaywall={() => {}}
        onUpdateMistakeItem={(updated) => {
          setMistakes((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }}
      />
    </main>
  );
}
