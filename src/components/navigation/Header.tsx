'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Users,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Menu,
  Lock,
} from 'lucide-react';
import { GlobalSearchModal } from '../chat/GlobalSearchModal';
import { supabase } from '../../lib/supabase';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';

export interface HeaderProps {
  onOpenMobileDrawer?: () => void;
  onOpenSearch?: () => void;
  onSignOut?: () => void;
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
  onSignOut,
  activeTab,
  setActiveTab,
  user: propUser,
}) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { settings, isModuleHidden, isModuleLocked, showLockedNotice } = usePlatformSettings();
  const [currentUser, setCurrentUser] = useState<{
    fullName?: string;
    username?: string;
    avatarUrl?: string;
    role?: string;
  } | null>(() => {
    if (propUser) return propUser;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('aurasat_user_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            fullName: parsed.fullName || parsed.full_name || 'Talaba',
            username: parsed.username || 'talaba',
            avatarUrl: parsed.avatarUrl || parsed.avatar_url || '',
          };
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize propUser and live Supabase auth / profile
  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
      return;
    }

    let isMounted = true;
    const fetchAuthUser = async () => {
      try {
        const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { user: null } }), 1500)
        );
        const { data: authData } = (await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise,
        ])) as any;

        if (authData?.user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', authData.user.id)
            .maybeSingle();

          const meta = authData.user.user_metadata || {};
          setCurrentUser({
            fullName: profile?.full_name || meta.full_name || meta.name || 'Talaba',
            username: profile?.username || meta.username || authData.user.email?.split('@')[0] || 'talaba',
            avatarUrl: profile?.avatar_url || meta.avatar_url || meta.picture || '',
          });
        }
      } catch {
        // Safe fallback
      }
    };

    fetchAuthUser();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      fetchAuthUser();
    });

    return () => {
      isMounted = false;
      authSub?.subscription?.unsubscribe?.();
    };
  }, [propUser]);

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

  const safeFullName =
    (typeof currentUser?.fullName === 'string' && currentUser.fullName.trim()) ||
    'Talaba';
  const safeUsername =
    (typeof currentUser?.username === 'string' && currentUser.username.trim()) ||
    'talaba';
  const safeAvatarUrl =
    typeof currentUser?.avatarUrl === 'string' ? currentUser.avatarUrl.trim() : '';

  const displayName = safeFullName.split(' ')[0] || `@${safeUsername}`;
  const monogram = (safeFullName || safeUsername || 'T')[0]?.toUpperCase() || 'T';
  const hasAvatar = Boolean(safeAvatarUrl && !safeAvatarUrl.startsWith('data:image'));

  const handleOpenSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsSearchModalOpen(true);
    }
  };

  const handleOpenProfile = () => {
    if (setActiveTab) {
      setActiveTab('profile');
    } else {
      router.push('/profile');
    }
  };

  const handleOpenCommunity = () => {
    if (setActiveTab) {
      setActiveTab('community');
    } else {
      router.push('/chat');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-white/70 dark:bg-[#0A0F1D]/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 select-none transition-colors">
        {/* ========================================================================= */}
        {/* LEFT SECTION: Dedicated Mobile User Capsule & Desktop Brand                */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile-only Drawer trigger (if provided) */}
          {onOpenMobileDrawer && (
            <button
              type="button"
              onClick={onOpenMobileDrawer}
              aria-label="Menyuni ochish"
              className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Menu size={16} />
            </button>
          )}

          {/* MOBILE VIEWPORT: Sleek Clickable User Identity Capsule (Navigates to /profile) */}
          <Link
            href="/profile"
            onClick={() => {
              if (setActiveTab) setActiveTab('profile');
            }}
            aria-label="Profilga o'tish"
            className="flex md:hidden items-center gap-2 p-1 pl-1 pr-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-[#E07A5F]/40 active:scale-95 transition-all cursor-pointer text-left"
          >
            {hasAvatar ? (
              <img
                src={safeAvatarUrl}
                alt={safeFullName}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs shrink-0">
                {monogram}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
              {displayName}
            </span>
          </Link>

          {/* DESKTOP VIEWPORT: Dynamic Brand Logo & Mark (Hidden on Mobile) */}
          <Link
            href="/dashboard"
            onClick={() => setActiveTab?.('dashboard')}
            className="hidden md:flex items-center gap-2.5 group cursor-pointer"
          >
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 group-hover:border-[#E07A5F]/60 transition-colors shadow-2xs">
                <svg
                  viewBox="0 0 100 100"
                  className="w-4 h-4 text-[#E07A5F] fill-current"
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
            )}
            <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-white">
              {settings.platform_title || 'ASRON SAT'}
            </span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SECTION: Action Icons (Search, Community, Desktop Dropdown)         */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dedicated Search Action Button (Opens GlobalSearchModal) */}
          <button
            type="button"
            onClick={handleOpenSearch}
            aria-label="Qidiruv"
            title="Qidiruv"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200/50 dark:border-slate-700/50 active:scale-95 transition-transform cursor-pointer"
          >
            <Search size={17} />
          </button>

          {/* Dedicated Mobile-only Hamjamiyat (Community) Action Button */}
          {!isModuleHidden('community') && (
            <button
              type="button"
              onClick={() => {
                if (isModuleLocked('community')) {
                  showLockedNotice('Hamjamiyat');
                  return;
                }
                if (setActiveTab) setActiveTab('community');
                else router.push('/chat');
              }}
              aria-label="Hamjamiyat"
              title="Hamjamiyat"
              className="relative flex md:hidden w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200/50 dark:border-slate-700/50 active:scale-95 transition-transform cursor-pointer"
            >
              <Users size={17} />
              {isModuleLocked('community') && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white text-[8px] shadow-xs">
                  <Lock size={8} />
                </span>
              )}
            </button>
          )}

          {/* Desktop-only Profile Menu */}
          <div className="relative hidden md:block" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-transparent hover:border-slate-200 dark:hover:border-[#334155] transition-all cursor-pointer group"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              {hasAvatar ? (
                <img
                  src={safeAvatarUrl}
                  alt={safeFullName}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  {monogram}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[110px]">
                {displayName}
              </span>
              <ChevronDown
                size={13}
                className={`text-slate-500 transition-transform duration-150 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {safeFullName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    @{safeUsername}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <UserIcon size={14} className="text-[#E07A5F]" />
                    <span>Profil & Sozlamalar</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onSignOut) {
                        onSignOut();
                      } else if (typeof window !== 'undefined') {
                        localStorage.removeItem('sb-auth-token');
                        window.location.href = '/';
                      }
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal Overlay */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUser={(u) => {
          setIsSearchModalOpen(false);
          router.push(`/u/@${u.username}`);
        }}
        onSelectChannel={(ch) => {
          setIsSearchModalOpen(false);
          router.push(`/chat?channel=${ch.id}`);
        }}
      />
    </>
  );
};

export default Header;
