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

  return (
    <header className="h-12 sm:h-14 px-3 sm:px-6 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 select-none transition-colors">
      {/* Left: Minimal Brand/Logo - Zero Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        {onOpenMobileDrawer && (
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            aria-label="Menyuni ochish"
            className="md:hidden p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] transition-colors cursor-pointer"
          >
            <Menu size={16} />
          </button>
        )}

        <Link
          href="/dashboard"
          onClick={() => setActiveTab?.('dashboard')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center font-mono font-bold text-[#E07A5F] text-xs sm:text-sm group-hover:border-[#E07A5F]/60 transition-colors shadow-2xs">
            Σ
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            ASRON SAT
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
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] bg-[#FAF8F5] dark:bg-[#181B26] hover:bg-[#F0EBE4] dark:hover:bg-[#202534] border border-[#E5E0D8] dark:border-[#262B3D] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Search size={15} />
            <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
              Qidirish
            </span>
          </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Badge */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155] transition-all cursor-pointer group"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Foydalanuvchi'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#E2E8F0] dark:border-[#1E293B]"
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
