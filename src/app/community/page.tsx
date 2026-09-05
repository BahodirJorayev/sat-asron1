'use client';

import { CommunityHub } from '../../components/chat/CommunityHub';
import { INITIAL_USERS } from '../../data/mockDatabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CommunityPage() {
  const currentUser = INITIAL_USERS[0];

  return (
    <main className="h-[100dvh] w-full p-0 sm:p-2 md:p-4 bg-slate-50 dark:bg-[#0A0F1D] overflow-hidden flex flex-col">
      <CommunityHub
        currentUser={currentUser}
        usersList={INITIAL_USERS}
      />
    </main>
  );
}
