'use client';

import React, { useState, useEffect } from 'react';
import { CommunityChatHub } from './CommunityChatHub';
import { User } from '../../types';
import { INITIAL_USER, INITIAL_USERS } from '../../data/mockDatabase';
import { supabase } from '../../lib/supabase';

export interface CommunityHubProps {
  currentUser?: User;
  usersList?: User[];
  onOpenQuestionInBank?: (questionId: string) => void;
  onSelectUserProfile?: (selectedUser: User) => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  currentUser: initialUser,
  usersList = INITIAL_USERS,
  onOpenQuestionInBank,
  onSelectUserProfile,
}) => {
  const [activeUser, setActiveUser] = useState<User>(() => initialUser || INITIAL_USER);

  useEffect(() => {
    if (initialUser) {
      setActiveUser(initialUser);
      return;
    }

    let isMounted = true;
    const resolveAuthUser = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (isMounted) {
            setActiveUser({
              id: authData.user.id,
              email: authData.user.email || '',
              fullName: profile?.full_name || dbUser?.full_name || authData.user.user_metadata?.full_name || 'Talaba',
              username: profile?.username || dbUser?.username || authData.user.user_metadata?.username || 'talaba',
              avatarUrl: profile?.avatar_url || authData.user.user_metadata?.avatar_url,
              phoneNumber: dbUser?.phone_number || authData.user.user_metadata?.phone || '',
              planTier: (dbUser?.plan_tier as any) || 'FREE',
              role: (dbUser?.role as any) || 'STUDENT',
              streakDays: dbUser?.streak_days || 0,
              totalQuestionsDone: dbUser?.total_questions_done || 0,
              overallAccuracy: dbUser?.overall_accuracy || 0,
              targetScore: profile?.target_score || dbUser?.target_score || 1550,
              targetExamDate: dbUser?.target_exam_date || '2026-10-03',
              createdAt: profile?.created_at || dbUser?.created_at || new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('CommunityHub auth resolve:', err);
      }
    };

    resolveAuthUser();

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0A0F1D] select-none">
      <CommunityChatHub
        currentUser={activeUser}
        usersList={usersList}
        onOpenQuestionInBank={onOpenQuestionInBank}
        onSelectUserProfile={onSelectUserProfile}
      />
    </div>
  );
};

export default CommunityHub;
