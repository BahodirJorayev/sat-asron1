'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Header } from '../../components/navigation/Header';
import { BottomNav } from '../../components/navigation/BottomNav';
import { Sidebar, SIDEBAR_ITEMS, type NavItem } from '../../components/navigation/Sidebar';
import { GlobalSearchModal } from '../../components/chat/GlobalSearchModal';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type { NavItem };
export const OFFICIAL_SIDEBAR_ITEMS = SIDEBAR_ITEMS;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/dashboard';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Initialize currentUser immediately from local storage if available to prevent flash
  const [currentUser, setCurrentUser] = useState<{
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('aurasat_user_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            fullName: parsed.fullName || parsed.full_name || 'Foydalanuvchi',
            username: parsed.username || 'talaba',
            avatarUrl: parsed.avatarUrl || parsed.avatar_url || '',
          };
        }
      } catch {
        // Safe fallback
      }
    }
    return null;
  });

  // Non-blocking auth fetch with strict 1.5s timeout
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
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
            .select('full_name, username, avatar_url')
            .eq('id', authData.user.id)
            .maybeSingle();

          const meta = authData.user.user_metadata || {};
          const safeFullName = profile?.full_name || meta.full_name || meta.name || 'Foydalanuvchi';
          const safeUsername = profile?.username || meta.username || authData.user.email?.split('@')[0] || 'talaba';
          const safeAvatarUrl = profile?.avatar_url || meta.avatar_url || meta.picture || '';

          if (isMounted) {
            setCurrentUser({
              fullName: safeFullName,
              username: safeUsername,
              avatarUrl: safeAvatarUrl,
            });
          }
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans flex overflow-x-hidden selection:bg-[#E07A5F] selection:text-white transition-colors duration-150">
      {/* 1. Desktop Sidebar (Unified component, strictly 6 items, collapsible) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        user={currentUser}
        className="hidden md:flex"
      />

      {/* 2. Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header with Apple-grade Mobile Identity Capsule & Desktop Brand */}
        <Header
          user={currentUser}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Page Content with guaranteed mounting: NEVER blocked by loading */}
        <main className="flex-1 w-full min-w-0 px-4 py-4 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer (Accessible via hamburger in header) */}
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
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

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

      {/* 4. iPhone-grade Floating Glassmorphism Mobile Navigation Pill */}
      <BottomNav />

      {/* 5. Global Search Modal for Profiles & Channels */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
