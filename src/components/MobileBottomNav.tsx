'use client';

import React from 'react';
import {
  Home,
  Layers,
  FileText,
  BookOpen,
  AlertCircle,
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
}) => {
  // Exact 5-item Apple iOS minimal navigation array (Hamjamiyat moved to top-right header)
  const navItems = [
    {
      id: 'dashboard',
      label: 'Uy',
      icon: Home,
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
  ];

  return (
    <nav
      aria-label="Mobil Navigatsiya"
      className="md:hidden fixed bottom-3 left-4 right-4 z-50 mx-auto max-w-sm rounded-full h-14 bg-white/75 dark:bg-[#0D1527]/75 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex items-center justify-around px-2 select-none transition-all duration-200"
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
                className={`transition-all duration-150 ${
                  isActive
                    ? 'text-[#E07A5F] scale-105 drop-shadow-[0_2px_8px_rgba(224,122,95,0.35)]'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
              />

              {/* Active Pip */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
              )}
            </div>

            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 truncate transition-colors duration-150 ${
                isActive
                  ? 'text-[#E07A5F] font-semibold'
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

export default MobileBottomNav;
