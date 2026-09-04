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
  ShieldAlert,
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

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
    shortLabel: 'Savollar Banki',
    href: '/dashboard/practice',
    icon: Database,
  },
  {
    id: 'mocks',
    label: 'Mock Testlar',
    shortLabel: 'Mock Testlar',
    href: '/dashboard/mocks',
    icon: FileText,
  },
  {
    id: 'vocabulary',
    label: 'SAT Lug\'at',
    shortLabel: 'SAT Lug\'at',
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

interface SidebarProps {
  currentPath?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isAdmin?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isAdmin = false,
  className = '',
}) => {
  const pathname = usePathname() || currentPath || '/dashboard';
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] transition-all duration-200 select-none text-[#0F172A] dark:text-[#F8FAFC] ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* 1. Header (Brand & Collapse Toggle) */}
      <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-2 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 min-w-0 group cursor-pointer"
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
                Digital Suite
              </div>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCollapsed ? "Panelni kengaytirish" : "Panelni yig'ish"}
          className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* 2. Navigation Items (Exactly 8 Official Modules) */}
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
            <div key={item.id} className="relative group">
              <Link
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

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0F172A] dark:bg-[#1E293B] text-[#F8FAFC] text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Admin Panel Link if Admin */}
        {isAdmin && (
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <Link
              href="/dashboard/admin"
              className={`flex items-center gap-3 ${
                isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2'
              } rounded-xl text-xs font-medium transition-all text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}
            >
              <ShieldAlert size={17} />
              {!isCollapsed && <span>Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* 3. Footer (Theme Toggle & Profile Strip) */}
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
  );
};

export default Sidebar;
