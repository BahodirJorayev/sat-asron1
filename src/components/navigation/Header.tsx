'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

export interface HeaderProps {
  onOpenMobileDrawer?: () => void;
  onOpenSearch?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  user?: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
    role?: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileDrawer,
  onOpenSearch,
  activeTab,
  setActiveTab,
  user,
}) => {
  const pathname = usePathname() || '';
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Contextual search: ONLY render search on the 'Uy' (/dashboard) route
  const isUy = pathname === '/dashboard' || activeTab === 'dashboard';

  // Safe avatar URL validation to prevent raw base64 or broken strings from leaking
  const safeAvatarUrl =
    user?.avatarUrl &&
    !user.avatarUrl.startsWith('data:image') &&
    (user.avatarUrl.startsWith('http://') ||
      user.avatarUrl.startsWith('https://') ||
      user.avatarUrl.startsWith('/'))
      ? user.avatarUrl
      : null;

  return (
    <header className="h-12 sm:h-14 px-3 sm:px-6 border-b border-slate-200 dark:border-[#1E293B] bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 select-none transition-colors">
      {/* Left: Minimal Clean Brand Logo - Zero Breadcrumbs, No Base64 Text */}
      <div className="flex items-center gap-2.5">
        {onOpenMobileDrawer && (
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            aria-label="Menyuni ochish"
            className="md:hidden p-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-slate-200 dark:border-[#1E293B] transition-colors cursor-pointer"
          >
            <Menu size={16} />
          </button>
        )}

        <Link
          href="/dashboard"
          onClick={() => setActiveTab?.('dashboard')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          {/* Official Geometric Ascend Mark */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 group-hover:border-[#E07A5F]/60 transition-colors shadow-2xs">
            <svg
              viewBox="0 0 100 100"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E07A5F] fill-current"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
              <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
              <path
                d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5"
                stroke="currentColor"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white">
            ASRON <span className="text-[#E07A5F]">SAT</span>
          </span>
        </Link>
      </div>

      {/* Right: Contextual Search (Uy only), Theme Toggle, Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Contextual Search Icon - rendered ONLY when on 'Uy' route */}
        {isUy && (
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Qidiruv"
            title="Qidiruv"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] bg-[#FAF8F5] dark:bg-[#181B26] hover:bg-[#F0EBE4] dark:hover:bg-[#202534] border border-slate-200 dark:border-[#262B3D] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Search size={15} />
            <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
              Qidirish
            </span>
          </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Badge with Fallback Protection */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#1E293B] border border-transparent hover:border-slate-200 dark:hover:border-[#334155] transition-all cursor-pointer group"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            {safeAvatarUrl && !avatarFailed ? (
              <img
                src={safeAvatarUrl}
                alt={user?.fullName || 'Foydalanuvchi'}
                onError={() => setAvatarFailed(true)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-slate-200 dark:border-[#1E293B]"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs group-hover:scale-105 transition-transform">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'T'}
              </div>
            )}
            <ChevronDown
              size={13}
              className={`text-[#64748B] dark:text-[#94A3B8] transition-transform duration-150 hidden sm:block ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
