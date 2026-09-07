'use client';

import { CommunityHub } from '../../components/chat/CommunityHub';
import { INITIAL_USERS } from '../../data/mockDatabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CommunityPage() {
  const currentUser = INITIAL_USERS[0];

  return (
    <main className="h-[100dvh] w-full p-0 bg-slate-50 dark:bg-[#070D1E] overflow-hidden overflow-x-hidden overflow-y-hidden flex flex-col select-none">
      <CommunityHub
        currentUser={currentUser}
        usersList={INITIAL_USERS}
      />
    </main>
  );
}
