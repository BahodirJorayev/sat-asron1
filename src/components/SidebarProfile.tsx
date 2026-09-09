'use client';

import React from 'react';
import { User } from '../types';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';

export interface SidebarProfileProps {
  user?: User;
  onOpenProfile?: () => void;
  className?: string;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  user: initialUser,
  onOpenProfile,
  className = '',
}) => {
  const { profile } = useUserProfile();
  const { t } = useLanguage();

  const effectiveFullName = profile?.fullName || initialUser?.fullName || 'Student';
  const effectiveUsername = profile?.username || initialUser?.username || 'user';
  const effectiveAvatarUrl = profile?.avatarUrl !== undefined ? profile.avatarUrl : initialUser?.avatarUrl;

  const avatarSrc =
    effectiveAvatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      initialUser?.id || effectiveUsername || 'Student'
    )}`;

  const handleClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/profile';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#F1F5F9]/80 dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all cursor-pointer shadow-2xs group ${className}`}
      title={t('goToProfile', "Mening Profilim sahifasiga o'tish")}
    >
      <div className="relative shrink-0 mr-2.5">
        <img
          src={avatarSrc}
          alt={effectiveFullName}
          className="w-8 h-8 rounded-xl object-cover border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0A0F1D] shadow-2xs"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#121A2F] rounded-full shadow-xs" />
      </div>

      <div className="flex-1 min-w-0 text-left leading-tight pr-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-[#E07A5F] transition-colors">
            {effectiveFullName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono truncate">
            @{effectiveUsername}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;
