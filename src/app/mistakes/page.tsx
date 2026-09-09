'use client';

import React, { useState, useEffect } from 'react';
import { MistakeVaultView } from '../../components/MistakeVaultView';
import { INITIAL_USERS, INITIAL_MISTAKES } from '../../data/mockDatabase';
import { MistakeVaultItem, User } from '../../types';
import { useUserProgress, syncUserProgressRemote } from '../../hooks/useUserProgress';

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

  // Real-time cross-device user progress sync
  const { progress } = useUserProgress(currentUser);

  useEffect(() => {
    if (progress?.mistakes_log && progress.mistakes_log.length > 0) {
      setMistakes(progress.mistakes_log);
    }
  }, [progress?.mistakes_log]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] py-3 sm:py-4 pb-24 md:pb-8">
      <MistakeVaultView
        mistakes={mistakes}
        user={currentUser}
        onOpenSocraticTutor={() => {}}
        onOpenPaywall={() => {}}
        onUpdateMistakeItem={(updated) => {
          setMistakes((prev) => {
            const next = prev.map((m) => (m.id === updated.id ? updated : m));
            try {
              localStorage.setItem('aurasat_mistakes', JSON.stringify(next));
              if (currentUser.id && currentUser.id !== 'guest-user') {
                syncUserProgressRemote(currentUser.id, { mistakes_log: next });
              }
            } catch (e) {
              console.error('Failed to sync mistake update:', e);
            }
            return next;
          });
        }}
      />
    </main>
  );
}
