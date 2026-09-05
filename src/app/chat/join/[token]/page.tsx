'use client';

import React from 'react';
import { CommunityChatHub } from '../../../../components/chat/CommunityChatHub';
import { INITIAL_USERS } from '../../../../data/mockDatabase';

interface PageProps {
  params?: Promise<{ token: string }> | { token: string };
}

export default function ChatJoinPage(props: PageProps) {
  const currentUser = INITIAL_USERS[0];

  return (
    <main className="h-screen w-screen p-2 sm:p-4 bg-[#F8FAFC] dark:bg-[#0A0F1D] overflow-hidden">
      <CommunityChatHub
        currentUser={currentUser}
        usersList={INITIAL_USERS}
      />
    </main>
  );
}
