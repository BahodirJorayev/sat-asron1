'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Question, TestAttempt, MistakeVaultItem } from '../types';

export interface UserProgressData {
  user_id: string;
  completed_questions: Record<string, { answeredAt: string; isCorrect: boolean; selectedOption?: string }>;
  mock_results: Record<string, any>;
  mistakes_log: any[];
  vocab_mastery: Record<string, { srsStage: number; isKnown: boolean; lastReviewedAt: string }>;
  streak_days: number;
  total_questions_done: number;
  overall_accuracy: number;
  updated_at?: string;
}

const DEFAULT_PROGRESS: UserProgressData = {
  user_id: '',
  completed_questions: {},
  mock_results: {},
  mistakes_log: [],
  vocab_mastery: {},
  streak_days: 0,
  total_questions_done: 0,
  overall_accuracy: 0,
};

const getStorageKey = (userId: string) => `asron_user_progress_${userId}`;
const BROADCAST_EVENT = 'asron_user_progress_updated';

/**
 * Real-Time Cross-Device Progress Synchronization Hook
 * Syncs questions, mock attempts, mistake vault, and vocabulary mastery
 * across PC, tablet, and mobile devices instantly via Supabase `user_progress`.
 */
export function useUserProgress(activeUser?: User | null) {
  const [userId, setUserId] = useState<string>(activeUser?.id || '');
  const [progress, setProgress] = useState<UserProgressData>(() => {
    if (typeof window !== 'undefined' && activeUser?.id) {
      try {
        const cached = localStorage.getItem(getStorageKey(activeUser.id));
        if (cached) {
          return { ...DEFAULT_PROGRESS, ...JSON.parse(cached), user_id: activeUser.id };
        }
      } catch {}
    }
    return { ...DEFAULT_PROGRESS, user_id: activeUser?.id || '' };
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSyncingRef = useRef<boolean>(false);

  // Sync active userId when prop changes or on auth state check
  useEffect(() => {
    if (activeUser?.id) {
      setUserId(activeUser.id);
      return;
    }

    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id && isMounted) {
        setUserId(data.user.id);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeUser?.id]);

  // Fetch from Supabase cloud
  const fetchProgress = useCallback(async (targetUserId?: string) => {
    const id = targetUserId || userId;
    if (!id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      if (!error && data) {
        const cloudProgress: UserProgressData = {
          user_id: id,
          completed_questions: data.completed_questions || {},
          mock_results: data.mock_results || {},
          mistakes_log: Array.isArray(data.mistakes_log) ? data.mistakes_log : [],
          vocab_mastery: data.vocab_mastery || {},
          streak_days: data.streak_days ?? 0,
          total_questions_done: data.total_questions_done ?? Object.keys(data.completed_questions || {}).length,
          overall_accuracy: data.overall_accuracy ?? 0,
          updated_at: data.updated_at,
        };

        setProgress(cloudProgress);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(getStorageKey(id), JSON.stringify(cloudProgress));
            localStorage.setItem('aurasat_mock_attempts', JSON.stringify(cloudProgress.mock_results));
            localStorage.setItem('aurasat_mistakes', JSON.stringify(cloudProgress.mistakes_log));
          } catch {}
        }
      } else if (!data && !error) {
        const initialRow: UserProgressData = {
          ...DEFAULT_PROGRESS,
          user_id: id,
          updated_at: new Date().toISOString(),
        };
        await supabase.from('user_progress').upsert(initialRow, { onConflict: 'user_id' });
        setProgress(initialRow);
      }
    } catch (err) {
      console.warn('Error fetching user_progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Push updates to Supabase cloud and broadcast locally
  const syncToCloud = useCallback(async (fresh: UserProgressData) => {
    if (!fresh.user_id || isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      setProgress(fresh);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(getStorageKey(fresh.user_id), JSON.stringify(fresh));
          localStorage.setItem('aurasat_mock_attempts', JSON.stringify(fresh.mock_results));
          localStorage.setItem('aurasat_mistakes', JSON.stringify(fresh.mistakes_log));
          window.dispatchEvent(new CustomEvent(BROADCAST_EVENT, { detail: fresh }));
        } catch {}
      }

      await supabase.from('user_progress').upsert(
        {
          user_id: fresh.user_id,
          completed_questions: fresh.completed_questions,
          mock_results: fresh.mock_results,
          mistakes_log: fresh.mistakes_log,
          vocab_mastery: fresh.vocab_mastery,
          streak_days: fresh.streak_days,
          total_questions_done: fresh.total_questions_done,
          overall_accuracy: fresh.overall_accuracy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (err) {
      console.warn('Notice syncing user_progress to Supabase:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Initial fetch and Realtime sync
  useEffect(() => {
    if (!userId) return;

    fetchProgress(userId);

    const channel = supabase
      .channel(`user_progress_sync_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.user_id === userId && !isSyncingRef.current) {
            const remote: UserProgressData = {
              user_id: userId,
              completed_questions: payload.new.completed_questions || {},
              mock_results: payload.new.mock_results || {},
              mistakes_log: Array.isArray(payload.new.mistakes_log) ? payload.new.mistakes_log : [],
              vocab_mastery: payload.new.vocab_mastery || {},
              streak_days: payload.new.streak_days ?? 0,
              total_questions_done: payload.new.total_questions_done ?? 0,
              overall_accuracy: payload.new.overall_accuracy ?? 0,
              updated_at: payload.new.updated_at,
            };
            setProgress(remote);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(getStorageKey(userId), JSON.stringify(remote));
                localStorage.setItem('aurasat_mock_attempts', JSON.stringify(remote.mock_results));
                localStorage.setItem('aurasat_mistakes', JSON.stringify(remote.mistakes_log));
              } catch {}
            }
          }
        }
      )
      .subscribe();

    const handleLocalBroadcast = (e: any) => {
      if (e.detail && e.detail.user_id === userId) {
        setProgress(e.detail);
      }
    };
    window.addEventListener(BROADCAST_EVENT, handleLocalBroadcast);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(BROADCAST_EVENT, handleLocalBroadcast);
    };
  }, [userId, fetchProgress]);

  // 1. Record single question answer
  const recordQuestionAnswer = useCallback(
    async (questionId: string, isCorrect: boolean, selectedOption?: string) => {
      if (!userId) return;

      const updatedQuestions = {
        ...progress.completed_questions,
        [questionId]: {
          answeredAt: new Date().toISOString(),
          isCorrect,
          selectedOption,
        },
      };

      const totalDone = Object.keys(updatedQuestions).length;
      const correctCount = (Object.values(updatedQuestions) as any[]).filter((q) => q?.isCorrect).length;
      const accuracy = totalDone > 0 ? Math.round((correctCount / totalDone) * 100) : 0;

      const updated: UserProgressData = {
        ...progress,
        completed_questions: updatedQuestions,
        total_questions_done: totalDone,
        overall_accuracy: accuracy,
      };

      await syncToCloud(updated);
    },
    [userId, progress, syncToCloud]
  );

  // 2. Record mock test completion
  const recordMockAttempt = useCallback(
    async (attempt: TestAttempt, missedQuestions: Question[] = []) => {
      if (!userId) return;

      const testKey = attempt.mockTestId || attempt.testId || `mock-${Date.now()}`;
      const updatedMockResults = {
        ...progress.mock_results,
        [testKey]: attempt,
      };

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);

      const existingMistakeIds = new Set((progress.mistakes_log || []).map((m: any) => m.question?.id || m.id));
      const newMistakes = [...(progress.mistakes_log || [])];

      missedQuestions.forEach((q) => {
        if (!existingMistakeIds.has(q.id)) {
          newMistakes.unshift({
            id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            userId,
            question: q,
            userWrongAnswer: attempt.answers?.[q.id] || 'N/A',
            stage: 1,
            nextReviewAt: nextDate.toISOString(),
            isMastered: false,
            createdAt: new Date().toISOString(),
          });
        }
      });

      const updated: UserProgressData = {
        ...progress,
        mock_results: updatedMockResults,
        mistakes_log: newMistakes,
        streak_days: Math.max(progress.streak_days, 1),
      };

      await syncToCloud(updated);
    },
    [userId, progress, syncToCloud]
  );

  // 3. Record a mistake
  const recordMistake = useCallback(
    async (question: Question, userWrongAnswer: string) => {
      if (!userId) return;

      const existing = (progress.mistakes_log || []).find((m: any) => m.question?.id === question.id);
      if (existing) return;

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);

      const newMistake = {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId,
        question,
        userWrongAnswer,
        stage: 1,
        nextReviewAt: nextDate.toISOString(),
        isMastered: false,
        createdAt: new Date().toISOString(),
      };

      const updated: UserProgressData = {
        ...progress,
        mistakes_log: [newMistake, ...(progress.mistakes_log || [])],
      };

      await syncToCloud(updated);
    },
    [userId, progress, syncToCloud]
  );

  // 4. Mark mistake as mastered
  const masterMistake = useCallback(
    async (mistakeId: string) => {
      if (!userId) return;

      const updatedMistakes = (progress.mistakes_log || []).map((m: any) =>
        m.id === mistakeId ? { ...m, isMastered: true, stage: 3 } : m
      );

      const updated: UserProgressData = {
        ...progress,
        mistakes_log: updatedMistakes,
      };

      await syncToCloud(updated);
    },
    [userId, progress, syncToCloud]
  );

  // 5. Record vocabulary progress
  const recordVocabMastery = useCallback(
    async (wordId: string, srsStage: number, isKnown: boolean) => {
      if (!userId) return;

      const updatedVocab = {
        ...progress.vocab_mastery,
        [wordId]: {
          srsStage,
          isKnown,
          lastReviewedAt: new Date().toISOString(),
        },
      };

      const updated: UserProgressData = {
        ...progress,
        vocab_mastery: updatedVocab,
      };

      await syncToCloud(updated);
    },
    [userId, progress, syncToCloud]
  );

  return {
    progress,
    isLoading,
    recordQuestionAnswer,
    recordMockAttempt,
    recordMistake,
    masterMistake,
    recordVocabMastery,
    refreshProgress: fetchProgress,
  };
}

/**
 * Direct remote helper to update user_progress table from any context
 */
export async function syncUserProgressRemote(
  userId: string,
  updates: Partial<UserProgressData>
): Promise<void> {
  if (!userId) return;
  try {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const merged: UserProgressData = {
      user_id: userId,
      completed_questions: { ...(existing?.completed_questions || {}), ...(updates.completed_questions || {}) },
      mock_results: { ...(existing?.mock_results || {}), ...(updates.mock_results || {}) },
      mistakes_log: updates.mistakes_log || existing?.mistakes_log || [],
      vocab_mastery: { ...(existing?.vocab_mastery || {}), ...(updates.vocab_mastery || {}) },
      streak_days: updates.streak_days ?? existing?.streak_days ?? 0,
      total_questions_done: updates.total_questions_done ?? existing?.total_questions_done ?? 0,
      overall_accuracy: updates.overall_accuracy ?? existing?.overall_accuracy ?? 0,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('user_progress').upsert(merged, { onConflict: 'user_id' });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`asron_user_progress_${userId}`, JSON.stringify(merged));
        localStorage.setItem('aurasat_mock_attempts', JSON.stringify(merged.mock_results));
        localStorage.setItem('aurasat_mistakes', JSON.stringify(merged.mistakes_log));
        window.dispatchEvent(new CustomEvent('asron_user_progress_updated', { detail: merged }));
      } catch {}
    }
  } catch (err) {
    console.warn('syncUserProgressRemote error:', err);
  }
}

export default useUserProgress;
