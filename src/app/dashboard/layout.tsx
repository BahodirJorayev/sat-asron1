'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

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
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/dashboard';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans flex overflow-hidden selection:bg-[#E07A5F] selection:text-white transition-colors duration-150">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Strict 6 Items, No Profile/Settings, No Bottom Toggle)*/}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-200 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center font-mono font-bold text-[#E07A5F] text-base shrink-0 group-hover:border-[#E07A5F]/60 transition-colors shadow-2xs">
              Σ
            </div>
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <div className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  ASRON SAT
                </div>
                <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] font-semibold tracking-wider uppercase">
                  Academic Platform
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

        {/* 6 Clean Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#64748B]">
              Asosiy Bo‘limlar
            </div>
          )}

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

        {/* Minimal Sidebar Footer (Status Only, Zero Redundant Toggles) */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC]/70 dark:bg-[#0A0F1D]/60 shrink-0">
          <div
            className={`p-2 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } gap-2 shadow-2xs`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#E07A5F] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                T
              </div>
              {!isCollapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    Talaba
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                    Digital SAT 2026
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE VIEWPORT                                               */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar with Single Theme Toggle & Profile Avatar Menu */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Menyuni ochish"
              className="md:hidden p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] transition-colors cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">ASRON SAT</span>
              <span>/</span>
              <span className="text-[#475569] dark:text-[#94A3B8]">Boshqaruv Paneli</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Single Official Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar & Dropdown Menu (Sole Access Point for Profile & Settings) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155] transition-all cursor-pointer group"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0B1B3D] text-[#F8FAFC] flex items-center justify-center font-mono text-xs font-bold shadow-xs">
                  T
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Talaba
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    1550+ Maqsad
                  </div>
                </div>
                <ChevronDown size={14} className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC] transition-transform duration-150" />
              </button>

              {/* Profile & Settings Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B] mb-1">
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      Talaba Portfeli
                    </p>
                    <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                      student@asronsat.uz
                    </p>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
                  >
                    <UserIcon size={15} />
                    <span>Mening Profilim</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
                  >
                    <Settings size={15} />
                    <span>Platforma Sozlamalari</span>
                  </Link>

                  <div className="my-1 border-t border-[#E2E8F0] dark:border-[#1E293B]" />

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('sb-auth-token');
                        window.location.href = '/';
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} />
                    <span>Hisobdan Chiqish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE NAVIGATION DRAWER (6 Items Only, No Bottom Toggle)              */}
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
                  <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center font-mono font-bold text-[#E07A5F] text-sm">
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

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              <span>ASRON SAT v2.6</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM BAR (Primary 5 Quick Tabs)                              */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobil Navigatsiya"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0F1D]/95 border-t border-[#E2E8F0] dark:border-[#1E293B] backdrop-blur-lg px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around select-none shadow-2xl transition-colors"
      >
        {OFFICIAL_SIDEBAR_ITEMS.slice(0, 5).map((item) => {
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
