'use client';

import React, { useState } from 'react';
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
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const EXACT_SIDEBAR_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Uy',
    shortLabel: 'Uy',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'questions',
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

export const SIDEBAR_ITEMS = EXACT_SIDEBAR_ITEMS;

interface SidebarProps {
  currentPath?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isAdmin?: boolean;
  className?: string;
  user?: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  activeTab,
  setActiveTab,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isAdmin = false,
  className = '',
  user,
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
      className={`hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-200 select-none text-[#0F172A] dark:text-[#F8FAFC] ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* 1. Brand Header & Collapse Toggle */}
      <div className="h-16 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-2 shrink-0">
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

      {/* 2. Strict 6 Navigation Items (No Profile, No Settings) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#64748B]">
            Asosiy Bo‘limlar
          </div>
        )}

        {EXACT_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCurrentActive = () => {
            if (activeTab) {
              if (activeTab === item.id) return true;
              if (item.id === 'questions' && (activeTab === 'qbank' || activeTab === 'practice')) return true;
              if (item.id === 'mocks' && activeTab === 'bluebook') return true;
              if (item.id === 'vocabulary' && activeTab === 'vocab') return true;
              if (item.id === 'mistakes' && activeTab === 'vault') return true;
              if (item.id === 'community' && activeTab === 'community') return true;
            }
            if (!pathname) return false;
            if (item.href === '/dashboard') {
              return pathname === '/dashboard' || pathname === '/';
            }
            return pathname === item.href || pathname.startsWith(item.href + '/');
          };

          const isActive = isCurrentActive();

          return (
            <div key={item.id} className="relative group">
              <Link
                href={item.href}
                onClick={() => {
                  if (setActiveTab) {
                    setActiveTab(item.id);
                  }
                }}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 ${
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'
                } rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#E2E8F0] dark:border-[#334155]/60 shadow-2xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60'
                }`}
              >
                {/* Minimal Active Bar */}
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

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0F172A] dark:bg-[#1E293B] text-[#F8FAFC] text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Admin Staff Access if Applicable */}
        {isAdmin && (
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <Link
              href="/dashboard/admin"
              className={`flex items-center gap-3 ${
                isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'
              } rounded-xl text-xs font-medium transition-all text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}
            >
              <ShieldAlert size={17} />
              {!isCollapsed && <span>Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* 3. Footer Strip (NO Redundant Theme Toggle, Clean Status Bar) */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC]/70 dark:bg-[#0A0F1D]/60 shrink-0">
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
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'User'}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#E07A5F] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-2xs">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-[#E07A5F] transition-colors">
                  {user?.fullName || 'Foydalanuvchi'}
                </div>
                <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                  @{user?.username || 'user'}
                </div>
              </div>
            )}
          </Link>

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
