'use client';

import React, { useState, useEffect } from 'react';
import { MockTestsCatalogView } from '../../components/MockTestsCatalogView';
import { BluebookTestEngine } from '../../components/BluebookTestEngine';
import { MockTest, MockCategory, User } from '../../types';
import { INITIAL_MOCK_TESTS } from '../../data/mockDatabase';
import {
  fetchMockTestsRemote,
  fetchMockCategories,
  INITIAL_MOCK_CATEGORIES,
  subscribeToMockTests,
} from '../../lib/adminApi';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_GUEST_USER: User = {
  id: 'guest-user',
  email: 'student@asronsat.uz',
  username: 'Talaba',
  fullName: 'Talaba',
  role: 'STUDENT',
  planTier: 'FREE',
  streakDays: 0,
  targetScore: 1550,
  streakFreezes: 0,
  xpPoints: 0,
};

export default function MocksPage() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('aurasat_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_GUEST_USER;
  });

  const [mockTests, setMockTests] = useState<MockTest[]>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('aurasat_mock_tests');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_MOCK_TESTS;
  });

  const [mockCategories, setMockCategories] = useState<MockCategory[]>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('asron_mock_categories');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_MOCK_CATEGORIES;
  });

  const [activeBluebookTest, setActiveBluebookTest] = useState<MockTest | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Live zero-stale remote fetch from Supabase
    fetchMockTestsRemote().then((remoteTests) => {
      if (isMounted && remoteTests && remoteTests.length > 0) {
        setMockTests((prev) => {
          const remoteIds = new Set(remoteTests.map((t) => t.id));
          const localOnly = prev.filter((t) => !remoteIds.has(t.id));
          return [...remoteTests, ...localOnly];
        });
      }
    });

    fetchMockCategories().then((remoteCats) => {
      if (isMounted && remoteCats && remoteCats.length > 0) {
        setMockCategories(remoteCats);
      }
    });

    // 2. Realtime subscription to public.mock_tests table
    const unsubscribe = subscribeToMockTests((updatedTests) => {
      if (isMounted && updatedTests && updatedTests.length > 0) {
        setMockTests((prev) => {
          const remoteIds = new Set(updatedTests.map((t) => t.id));
          const localOnly = prev.filter((t) => !remoteIds.has(t.id));
          return [...updatedTests, ...localOnly];
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] py-6 pb-24 md:pb-12">
      <MockTestsCatalogView
        user={currentUser}
        mockTests={mockTests}
        categories={mockCategories}
        onLaunchTest={(test) => setActiveBluebookTest(test)}
        onStartBluebookTest={(test) => setActiveBluebookTest(test)}
      />

      {activeBluebookTest && (
        <BluebookTestEngine
          test={activeBluebookTest}
          user={currentUser}
          onExit={() => setActiveBluebookTest(null)}
          onCompleteTest={() => {
            setActiveBluebookTest(null);
          }}
        />
      )}
    </main>
  );
}
