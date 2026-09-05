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
  // Exact 6-item minimal navigation array
  const navItems = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: LayoutDashboard,
    },
    {
      id: 'qbank',
      label: 'Savollar',
      icon: Layers,
    },
    {
      id: 'bluebook',
      label: 'Mocklar',
      icon: FileText,
    },
    {
      id: 'vocab',
      label: 'Lug‘at',
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
      className="md:hidden fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md h-16 rounded-full bg-white/80 dark:bg-[#121A2F]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] px-3 flex items-center justify-between select-none transition-all duration-200"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className="group flex-1 flex flex-col items-center justify-center py-1 cursor-pointer active:scale-95 transition-transform"
          >
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
          </button>
        );
      })}
    </nav>
  );
};
