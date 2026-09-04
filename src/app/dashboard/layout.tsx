'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  FileText,
  BookOpen,
  BookmarkCheck,
  MessageSquare,
  User as UserIcon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const OFFICIAL_NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Bosh sahifa',
    shortLabel: 'Bosh sahifa',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'practice',
    label: 'Savollar Banki',
    shortLabel: 'Savollar',
    href: '/dashboard/practice',
    icon: Database,
  },
  {
    id: 'mocks',
    label: 'Mock Testlar',
    shortLabel: 'Mocklar',
    href: '/dashboard/mocks',
    icon: FileText,
  },
  {
    id: 'vocabulary',
    label: 'SAT Lug\'at',
    shortLabel: 'Lug\'at',
    href: '/dashboard/vocabulary',
    icon: BookOpen,
  },
  {
    id: 'mistakes',
    label: 'Xatolar Ombori',
    shortLabel: 'Xatolar',
    href: '/dashboard/mistakes',
    icon: BookmarkCheck,
  },
  {
    id: 'community',
    label: 'Hamjamiyat',
    shortLabel: 'Hamjamiyat',
    href: '/dashboard/community',
    icon: MessageSquare,
  },
  {
    id: 'profile',
    label: 'Profil',
    shortLabel: 'Profil',
    href: '/dashboard/profile',
    icon: UserIcon,
  },
  {
    id: 'settings',
    label: 'Sozlamalar',
    shortLabel: 'Sozlamalar',
    href: '/dashboard/settings',
    icon: Settings,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans flex overflow-hidden selection:bg-[#E07A5F] selection:text-white transition-colors duration-150">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Theme Adaptive: Light & Dark)                         */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] transition-all duration-200 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header: Logo & Collapse Toggle */}
        <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center font-mono font-extrabold text-[#E07A5F] text-base shrink-0 group-hover:border-[#E07A5F]/50 transition-colors shadow-2xs">
              Σ
            </div>
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <div className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  ASRON SAT
                </div>
                <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] font-semibold tracking-wider uppercase">
                  Digital Platform
                </div>
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

        {/* 8 Official Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#64748B]">
              Asosiy Bo‘limlar
            </div>
          )}

          {OFFICIAL_NAVIGATION_ITEMS.map((item) => {
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
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2'
                } rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold border border-[#E2E8F0] dark:border-[#334155]/60 shadow-2xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9]/80 dark:hover:bg-[#1E293B]/70'
                }`}
              >
                {/* Active Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#E07A5F]" />
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

        {/* Footer (Theme Toggle & User Status) */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0A0F1D]/60 space-y-2">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <ThemeToggle />
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                ASRON SAT v2.6
              </span>
            )}
          </div>

          <div
            className={`p-2 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } gap-2`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#E07A5F] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                T
              </div>
              {!isCollapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    Talaba
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                    1550+ Maqsad
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('sb-auth-token');
                    window.location.href = '/';
                  }
                }}
                title="Chiqish"
                className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-rose-500 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT VIEWPORT                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/90 dark:bg-[#0A0F1D]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Menyuni ochish"
              className="md:hidden p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#121A2F] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] transition-colors cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">ASRON SAT</span>
              <span>/</span>
              <span className="text-[#64748B] dark:text-[#94A3B8]">Boshqaruv Paneli</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] text-[#0F172A] dark:text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Digital SAT 2026</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE NAVIGATION DRAWER (All 8 Items Accessible on Mobile)           */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="relative w-72 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] h-full flex flex-col justify-between p-4 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#1E293B] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center font-mono font-bold text-[#E07A5F] text-sm">
                    Σ
                  </div>
                  <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                    ASRON SAT
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
                {OFFICIAL_NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold border border-[#E2E8F0] dark:border-[#334155]'
                          : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9]/80 dark:hover:bg-[#1E293B]/70'
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

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <ThemeToggle showLabel={true} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM BAR (Primary Quick Launch Access)                       */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobil Navigatsiya"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0F1D]/95 border-t border-[#E2E8F0] dark:border-[#1E293B] backdrop-blur-lg px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around select-none shadow-2xl transition-colors"
      >
        {OFFICIAL_NAVIGATION_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#E07A5F] font-bold'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <div className="relative">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-[#E07A5F]' : 'text-[#64748B] dark:text-[#94A3B8]'}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
                )}
              </div>
              <span
                className={`text-[9px] tracking-tight mt-1 truncate max-w-[58px] font-mono ${
                  isActive ? 'text-[#0F172A] dark:text-[#F8FAFC]' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
