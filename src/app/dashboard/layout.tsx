'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Lock } from 'lucide-react';
import { Header } from '../../components/navigation/Header';
import { BottomNav } from '../../components/navigation/BottomNav';
import { Sidebar, SIDEBAR_ITEMS, type NavItem } from '../../components/navigation/Sidebar';
import { GlobalSearchModal } from '../../components/chat/GlobalSearchModal';
import { PwaInstallPrompt } from '../../components/pwa/PwaInstallPrompt';
import { PwaSplashScreen } from '../../components/pwa/PwaSplashScreen';
import { supabase } from '../../lib/supabase';
import { PlatformSettingsProvider, usePlatformSettings } from '../../contexts/PlatformSettingsContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type { NavItem };
export const OFFICIAL_SIDEBAR_ITEMS = SIDEBAR_ITEMS;

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/dashboard';
  const { settings, isModuleHidden, isModuleLocked, showLockedNotice } = usePlatformSettings();
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

    const handleProfileUpdated = (e: any) => {
      if (e.detail && isMounted) {
        setCurrentUser({
          fullName: e.detail.fullName || e.detail.full_name,
          username: e.detail.username,
          avatarUrl: e.detail.avatarUrl || e.detail.avatar_url,
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('profile_updated', handleProfileUpdated);
    }

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('asron_profile_channel');
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'profile_updated' && msg.data.user && isMounted) {
          setCurrentUser({
            fullName: msg.data.user.fullName || msg.data.user.full_name,
            username: msg.data.user.username,
            avatarUrl: msg.data.user.avatarUrl || msg.data.user.avatar_url,
          });
        }
      };
    } catch {}

    const profileChannel = supabase
      .channel('dashboard-layout-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (isMounted) fetchUser();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      authSub?.subscription?.unsubscribe?.();
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile_updated', handleProfileUpdated);
      }
      try {
        bc?.close();
      } catch {}
      try {
        supabase.removeChannel(profileChannel);
      } catch {}
    };
  }, []);

  return (
    <div
      id="dashboard-application-shell"
      className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans antialiased selection:bg-[#E07A5F] selection:text-white"
    >
      {/* 1. Desktop Left Nav: Persistent, Non-blocking Sidebar */}
      <Sidebar
        currentPath={pathname}
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

        {/* Page Content with guaranteed mounting */}
        <main className="flex-1 w-full min-w-0 px-4 py-4 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer */}
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
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-[#1E293B] shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-[#0B1B3D] dark:bg-[#0F172A] border border-slate-800 dark:border-[#1E293B] flex items-center justify-center text-white shrink-0 shadow-2xs">
                      <svg viewBox="0 0 100 100" className="w-4 h-4 text-[#E07A5F] fill-current" fill="none">
                        <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
                        <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
                        <path d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <span className="font-bold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white">
                    {settings.platform_title || 'ASRON SAT'}
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
                {SIDEBAR_ITEMS.filter(
                  (item) => item.id === 'dashboard' || !isModuleHidden(item.id as any)
                ).map((item) => {
                  const Icon = item.icon;
                  const isLocked = item.id !== 'dashboard' && isModuleLocked(item.id as any);
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.id}
                      href={isLocked ? '#' : item.href}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          showLockedNotice(item.label);
                          return;
                        }
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#E2E8F0] dark:border-[#334155]'
                          : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={17}
                          className={isActive ? 'text-[#E07A5F]' : 'text-[#64748B] dark:text-[#94A3B8]'}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isLocked && <Lock size={13} className="text-amber-500 shrink-0" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              {settings.platform_title || 'ASRON SAT'}
            </div>
          </div>
        </div>
      )}

      {/* 4. Floating Mobile Navigation Pill */}
      <BottomNav />

      {/* 5. Global Search Modal for Profiles & Channels */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 6. PWA Standalone Launch Splash Screen */}
      <PwaSplashScreen />

      {/* 7. PWA Automatic Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformSettingsProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </PlatformSettingsProvider>
  );
}
