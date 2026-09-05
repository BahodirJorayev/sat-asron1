'use client';

import React from 'react';
import { ProfileView } from '../../components/profile/ProfileView';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] px-4 py-4 sm:px-6 md:px-8 py-6 md:py-8 transition-colors duration-150">
      <ProfileView />
    </div>
  );
}
