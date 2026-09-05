'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileText,
  BookOpen,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export interface BottomNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  unreadCount?: number;
}

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Bosh sahifa',
    icon: LayoutDashboard,
  },
  {
    id: 'qbank',
    href: '/questions',
    label: 'Savollar',
    icon: Layers,
  },
  {
    id: 'bluebook',
    href: '/mocks',
    label: 'Mocklar',
    icon: FileText,
  },
  {
    id: 'vocab',
    href: '/vocabulary',
    label: 'Lug‘at',
    icon: BookOpen,
  },
  {
    id: 'vault',
    href: '/mistakes',
    label: 'Xatolar',
    icon: AlertCircle,
  },
  {
    id: 'community',
    href: '/chat',
    label: 'Hamjamiyat',
    icon: MessageSquare,
  },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
}) => {
  let pathname = '';
  try {
    pathname = usePathname() || '';
  } catch {
    pathname = '';
  }

  const isCurrentActive = (item: typeof NAV_ITEMS[0]) => {
    if (activeTab) {
      return activeTab === item.id;
    }
    if (!pathname) return false;
    if (item.href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Mobil Navigatsiya"
      className="md:hidden fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md h-16 rounded-full bg-white/80 dark:bg-[#121A2F]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] px-3 flex items-center justify-between select-none transition-all duration-200"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = isCurrentActive(item);

        const content = (
          <div className="relative flex flex-col items-center justify-center w-full py-1">
            <div className="relative">
              <Icon
                size={18}
                strokeWidth={isActive ? 2.4 : 1.7}
                className={`transition-all duration-150 ${
                  isActive
                    ? 'text-[#E07A5F] scale-110'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}
              />

              {/* Unread badge on Community */}
              {item.id === 'community' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#E07A5F] text-white ring-2 ring-white dark:ring-[#121A2F]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

              {/* Active glow pip */}
              {isActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
              )}
            </div>

            <span
              className={`text-[10px] tracking-tight mt-1 truncate font-mono transition-colors duration-150 ${
                isActive
                  ? 'text-slate-950 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </div>
        );

        if (setActiveTab) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className="group flex-1 flex items-center justify-center py-1 cursor-pointer active:scale-95 transition-transform"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className="group flex-1 flex items-center justify-center py-1 cursor-pointer active:scale-95 transition-transform"
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
