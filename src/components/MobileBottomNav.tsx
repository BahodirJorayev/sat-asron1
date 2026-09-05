import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileText,
  BookOpen,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  unreadCount = 0,
}) => {
  // Exact 6-item Apple iOS minimal navigation array
  const navItems = [
    {
      id: 'dashboard',
      label: 'Uy',
      icon: LayoutDashboard,
    },
    {
      id: 'qbank',
      label: 'Savollar',
      icon: Layers,
    },
    {
      id: 'bluebook',
      label: 'Testlar',
      icon: FileText,
    },
    {
      id: 'vocab',
      label: "Lug'at",
      icon: BookOpen,
    },
    {
      id: 'vault',
      label: 'Xatolar',
      icon: AlertCircle,
    },
    {
      id: 'community',
      label: 'Hamjamiyat',
      icon: MessageSquare,
    },
  ];

  return (
    <nav
      aria-label="Mobil Navigatsiya"
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-sm h-14 rounded-full bg-white/70 dark:bg-[#0D1527]/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.35)] px-2.5 flex items-center justify-between select-none transition-all duration-200"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className="group flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative">
              <Icon
                size={19}
                strokeWidth={isActive ? 2.4 : 1.7}
                className={`transition-transform duration-150 ${
                  isActive
                    ? 'text-[#E07A5F] scale-105'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              />

              {/* Unread badge on Community */}
              {item.id === 'community' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[8px] font-mono font-bold bg-[#E07A5F] text-white ring-2 ring-white dark:ring-[#0D1527]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

              {/* Active Pip */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
              )}
            </div>

            <span
              className={`text-[9px] font-medium tracking-tight mt-0.5 truncate transition-colors duration-150 ${
                isActive
                  ? 'text-slate-950 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
