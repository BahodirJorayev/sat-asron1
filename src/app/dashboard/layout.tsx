'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  BookmarkCheck,
  MessageSquare,
  UserCog,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  shortLabel: string;
}

export const CONSOLIDATED_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Bosh sahifa',
    shortLabel: 'Bosh sahifa',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'qbank',
    label: 'Savollar Banki / Mock Testlar',
    shortLabel: 'SQB / Testlar',
    href: '/dashboard/qbank',
    icon: Layers,
  },
  {
    id: 'vault',
    label: 'Xatolar Banki',
    shortLabel: 'Xatolar',
    href: '/dashboard/vault',
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
    label: 'Profil & Sozlamalar',
    shortLabel: 'Profil',
    href: '/dashboard/profile',
    icon: UserCog,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/dashboard';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] font-sans flex overflow-hidden selection:bg-[#E07A5F] selection:text-[#0A0F1D]">
      {/* ========================================================================= */}
      {/* 1. DESKTOP MINIMAL SIDEBAR                                               */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 bg-[#0D1527] border-r border-[#1E293B] transition-all duration-200 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header: Brand & Collapse Toggle */}
        <div className="h-16 px-4 border-b border-[#1E293B] flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#121A2F] border border-[#1E293B] flex items-center justify-center font-mono font-extrabold text-[#E07A5F] text-sm shrink-0 shadow-xs group-hover:border-[#E07A5F]/50 transition-colors">
              Σ
            </div>
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <div className="text-sm font-bold tracking-tight text-[#F8FAFC] truncate">
                  ASRON SAT
                </div>
                <div className="text-[10px] font-mono text-[#64748B] tracking-wider uppercase font-semibold">
                  Executive Suite
                </div>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? "Panelni kengaytirish" : "Panelni yig'ish"}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#121A2F] transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Sidebar Nav Items (Purged of Daily Practice and AI Repetitor) */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
            {!isCollapsed ? 'Asosiy Bo‘limlar' : 'Bo‘limlar'}
          </div>

          {CONSOLIDATED_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? 'bg-[#1E293B] text-[#F8FAFC] font-bold shadow-xs border border-[#334155]/60'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#121A2F] font-medium'
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
                    isActive ? 'text-[#E07A5F]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: User Status & Signout */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0A0F1D]/50">
          <div
            className={`p-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } gap-2.5`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1E293B] border border-[#334155] flex items-center justify-center font-mono text-xs font-bold text-[#E07A5F] shrink-0">
                A
              </div>
              {!isCollapsed && (
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">
                    Talaba
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] truncate">
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
                className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-400 hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTENT VIEWPORT                                       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Executive Minimal Header Strip */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#1E293B] bg-[#0A0F1D]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#64748B]">
            <span className="text-[#94A3B8] font-bold">ASRON SAT</span>
            <span>/</span>
            <span className="text-[#F8FAFC] font-medium">Boshqaruv Paneli</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#121A2F] border border-[#1E293B] text-[11px] text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Digital SAT 2026</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (5 CONSOLIDATED ITEMS)                       */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobil Navigatsiya"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F1D]/95 border-t border-[#1E293B] backdrop-blur-lg px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around select-none shadow-2xl"
      >
        {CONSOLIDATED_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[60px] py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#E07A5F] font-bold'
                  : 'text-[#64748B] hover:text-[#94A3B8] font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-[#E07A5F]' : 'text-[#94A3B8]'}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[64px] font-mono ${
                  isActive ? 'text-[#F8FAFC]' : 'text-[#64748B]'
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
