'use client';

import React from 'react';
import { CommunityChatHub } from '../../src/components/chat/CommunityChatHub';
import { User } from '../../src/types';

interface CommunityHubProps {
  currentUser: User;
  usersList?: User[];
  onOpenQuestionInBank?: (questionId: string) => void;
  onSelectUserProfile?: (selectedUser: User) => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  currentUser,
  usersList = [],
  onOpenQuestionInBank,
  onSelectUserProfile,
}) => {
  return (
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] w-full overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-[#0A0F1D]">
      <CommunityChatHub
        currentUser={currentUser}
        usersList={usersList}
        onOpenQuestionInBank={onOpenQuestionInBank}
        onSelectUserProfile={onSelectUserProfile}
      />
    </div>
  );
};

export default CommunityHub;
