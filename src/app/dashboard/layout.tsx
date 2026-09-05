'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileText,
  BookOpen,
  AlertCircle,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronDown,
  Search,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Header } from '../../components/navigation/Header';
import { BottomNav } from '../../components/navigation/BottomNav';
import { GlobalSearchModal } from '../../components/chat/GlobalSearchModal';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const OFFICIAL_SIDEBAR_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Uy',
    shortLabel: 'Uy',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'practice',
    label: 'Savollar',
    shortLabel: 'Savollar',
    href: '/questions',
    icon: Layers,
  },
  {
    id: 'mocks',
    label: 'Testlar',
    shortLabel: 'Testlar',
    href: '/mocks',
    icon: FileText,
  },
  {
    id: 'vocabulary',
    label: "Lug'at",
    shortLabel: "Lug'at",
    href: '/vocabulary',
    icon: BookOpen,
  },
  {
    id: 'mistakes',
    label: 'Xatolar',
    shortLabel: 'Xatolar',
    href: '/mistakes',
    icon: AlertCircle,
  },
  {
    id: 'community',
    label: 'Hamjamiyat',
    shortLabel: 'Hamjamiyat',
    href: '/chat',
    icon: Users,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/dashboard';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  } | null>(null);

  // Clean non-blocking layout guard: fetch auth and listen for changes without blocking children rendering
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', authData.user.id)
            .maybeSingle();

          const meta = authData.user.user_metadata || {};
          setCurrentUser({
            fullName: profile?.full_name || meta.full_name || meta.name || 'Foydalanuvchi',
            username: profile?.username || meta.username || authData.user.email?.split('@')[0] || 'talaba',
            avatarUrl: profile?.avatar_url || meta.avatar_url || meta.picture || '',
          });
        }
      } catch {
        // Non-blocking fallback
      }
    };

    fetchUser();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      isMounted = false;
      authSub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Global search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans flex overflow-hidden selection:bg-[#E07A5F] selection:text-white transition-colors duration-150">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Strict 6 Items, No Profile/Settings Clutter)           */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col justify-between fixed inset-y-0 left-0 z-30 h-screen bg-white dark:bg-[#121A2F] border-r border-slate-200 dark:border-[#1E293B] shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-200 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 group-hover:border-[#E07A5F]/60 transition-colors shadow-2xs">
              <svg viewBox="0 0 100 100" className="w-4 h-4 text-[#E07A5F] fill-current" fill="none">
                <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
                <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
                <path d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-white truncate">
                  ASRON <span className="text-[#E07A5F]">SAT</span>
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Panelni kengaytirish" : "Panelni yig'ish"}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* 6 Clean Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
          {OFFICIAL_SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 ${
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'
                } rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#E2E8F0] dark:border-[#334155]/60 shadow-2xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-[#E07A5F]" />
                )}

                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-[#E07A5F]' : 'text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC]'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Minimal Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1E293B] bg-[#F8FAFC]/70 dark:bg-[#0A0F1D]/60 shrink-0">
          <div
            className={`p-2 rounded-xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-[#1E293B] flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } gap-2 shadow-2xs`}
          >
            <Link
              href="/profile"
              className="flex items-center gap-2 min-w-0 group cursor-pointer"
              title="Profilga o'tish"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName || 'User'}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-2xs">
                  {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : 'T'}
                </div>
              )}
              {!isCollapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-[#E07A5F] transition-colors">
                    {currentUser?.fullName || 'Foydalanuvchi'}
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                    @{currentUser?.username || 'talaba'}
                  </div>
                </div>
              )}
            </Link>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE VIEWPORT (Properly indented from desktop fixed sidebar) */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-200 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header with Apple-grade Mobile Identity Capsule & Desktop Brand */}
        <Header
          user={currentUser}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Page Content with generous desktop padding and symmetric mobile breathing room */}
        <main className="flex-1 w-full min-w-0 px-4 py-4 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SIDEBAR DRAWER (Accessible via Hamburger)                      */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl p-4 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <svg viewBox="0 0 100 100" className="w-4 h-4 text-[#E07A5F] fill-current" fill="none">
                      <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
                      <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
                      <path d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-bold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white">
                    ASRON <span className="text-[#E07A5F]">SAT</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto">
                {OFFICIAL_SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#E2E8F0] dark:border-[#334155]'
                          : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60'
                      }`}
                    >
                      <Icon
                        size={17}
                        className={isActive ? 'text-[#E07A5F]' : 'text-[#64748B] dark:text-[#94A3B8]'}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              ASRON SAT 2026
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. IPHONE-GRADE FLOATING GLASSMORPHISM MOBILE NAVIGATION PILL             */}
      {/* ========================================================================= */}
      <BottomNav />

      {/* Global Search Modal for Profiles & Channels */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
