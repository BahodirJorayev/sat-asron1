import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Crown,
  Sparkles,
  ShieldAlert,
  Bell,
  UserCheck,
  Send,
  HelpCircle,
  LayoutDashboard,
  BrainCircuit,
  BookMarked,
  Layers,
  Users,
  Compass,
  FileCheck2,
  Globe,
  LogIn,
  UserPlus,
  X,
  Search,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';
import { User, PlanTier } from '../types';
import { SiteBrandingConfig } from '../data/blogAndBrandingData';
import { ThemeToggle } from './ThemeToggle';
import { AsronLogo } from './AsronLogo';

interface Props {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  siteBranding?: SiteBrandingConfig;
  onOpenDailyWorkout: () => void;
  onOpenDiagnostic: () => void;
  onOpenPaywall?: () => void;
  onOpenTelegramLogs: () => void;
  onSwitchUserRole: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenProfileSearch?: () => void;
  onOpenCurrentUserProfile?: () => void;
  onOpenMilestoneModal?: (days?: number) => void;
  unreadAlertCount: number;
}

export const Header: React.FC<Props> = ({
  user,
  activeTab,
  setActiveTab,
  siteBranding,
  onOpenDailyWorkout,
  onOpenDiagnostic,
  onOpenPaywall,
  onOpenTelegramLogs,
  onSwitchUserRole,
  onOpenAuthModal,
  onOpenProfileSearch,
  onOpenCurrentUserProfile,
  onOpenMilestoneModal,
  unreadAlertCount,
}) => {
  const isPro = user.planTier === 'PRO';

  const brandName = siteBranding?.brandName || 'ASRON SAT';
  const brandTagline = siteBranding?.brandTagline || 'Digital SAT Platform';
  const logoIcon = siteBranding?.logoIcon || 'Σ';
  const isLandingOrBlog = activeTab === 'landing' || activeTab === 'blog';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] select-none font-sans transition-colors text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Main Nav Header */}
      <div className="px-4 sm:px-8 flex items-center justify-between h-12 sm:h-14">
        {/* Left Section: Minimal Brand/Logo - Zero Breadcrumbs */}
        <div className="flex items-center gap-3">
          {isLandingOrBlog ? (
            <div
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <AsronLogo size={32} variant="mark-only" />
              <div>
                <div className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none flex items-center gap-1.5">
                  <span>{brandName}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#0B1B3D]/10 dark:bg-blue-900/40 text-[#0F172A] dark:text-blue-400 border border-[#0B1B3D]/20 dark:border-blue-800">
                    {siteBranding?.logoBadgeYear || '2026'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Mobile Viewport: Clickable User Identity Capsule (Navigates to Profile) */}
              <button
                type="button"
                onClick={onOpenCurrentUserProfile}
                aria-label="Profilga o'tish"
                className="flex md:hidden items-center gap-2 p-1 pl-1 pr-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-[#E07A5F]/40 active:scale-95 transition-all cursor-pointer text-left"
              >
                {user.avatarUrl && !user.avatarUrl.startsWith('data:image') ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs shrink-0">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'T'}
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user.fullName?.split(' ')[0] || user.username || 'Talaba'}
                </span>
              </button>

              {/* Desktop Viewport: Brand Logo & Mark (Hidden on Mobile) */}
              <div
                onClick={() => setActiveTab('dashboard')}
                className="hidden md:flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 group-hover:border-[#E07A5F]/60 transition-colors shadow-2xs">
                  <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E07A5F] fill-current" fill="none">
                    <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
                    <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
                    <path d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white">
                  ASRON <span className="text-[#E07A5F]">SAT</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Middle Navigation (Landing / Blog pages) */}
        {isLandingOrBlog && (
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#57534E] dark:text-[#94A3B8]">
            <button
              onClick={() => setActiveTab('landing')}
              className={`hover:text-[#2563EB] dark:hover:text-[#4EA8DE] transition-colors cursor-pointer ${
                activeTab === 'landing' ? 'text-[#2563EB] dark:text-[#4EA8DE] font-bold' : ''
              }`}
            >
              Overview & Features
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-1 hover:text-[#2563EB] dark:hover:text-[#4EA8DE] transition-colors cursor-pointer ${
                activeTab === 'blog' ? 'text-[#2563EB] dark:text-[#4EA8DE] font-bold' : ''
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog & Social</span>
            </button>
            <button
              onClick={onOpenDiagnostic}
              className="hover:text-[#2563EB] dark:hover:text-[#4EA8DE] transition-colors cursor-pointer"
            >
              Diagnostic Test
            </button>
            <button
              onClick={onOpenDailyWorkout}
              className="hover:text-[#2563EB] dark:hover:text-[#4EA8DE] transition-colors cursor-pointer"
            >
              10-Min Drills
            </button>
          </div>
        )}

        {/* Right Section: Controls, Search, Community, Desktop Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {!isLandingOrBlog && (
            <>
              {/* Dedicated Search Action Button */}
              {onOpenProfileSearch && (
                <button
                  type="button"
                  onClick={onOpenProfileSearch}
                  aria-label="Qidiruv"
                  title="Qidiruv"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200/50 dark:border-slate-700/50 active:scale-95 transition-transform cursor-pointer"
                >
                  <Search size={17} />
                </button>
              )}

              {/* Dedicated Mobile-only Hamjamiyat (Community) Action Button (Navigates to /chat or community tab) */}
              <button
                type="button"
                onClick={() => setActiveTab('community')}
                aria-label="Hamjamiyat"
                title="Hamjamiyat"
                className="flex md:hidden w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200/50 dark:border-slate-700/50 active:scale-95 transition-transform cursor-pointer"
              >
                <Users size={17} />
              </button>
            </>
          )}

          {/* Desktop-only Theme Toggle (Mobile toggle moves to /profile) */}
          <div className="hidden md:flex items-center">
            <ThemeToggle />
          </div>

          {isLandingOrBlog ? (
            <>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#181B26] hover:bg-[#F3EFE6] dark:hover:bg-[#202534] border border-[#D6CEBE] dark:border-[#262B3D] text-[#1C1917] dark:text-[#EAEBED] text-xs font-semibold transition-colors cursor-pointer"
              >
                Log In
              </button>

              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <>
              {/* Desktop Current User Quick Profile Capsule */}
              <div
                onClick={onOpenCurrentUserProfile}
                className="hidden md:flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] hover:border-[#E07A5F]/50 transition-all cursor-pointer shadow-2xs"
                title="Mening Profilim sahifasini ochish"
              >
                {user.avatarUrl && !user.avatarUrl.startsWith('data:image') ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200 dark:border-[#1E293B]"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'T'}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
                    <span>{user.fullName}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

