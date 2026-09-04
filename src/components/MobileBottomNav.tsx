import React from 'react';
import { Home, Layers, FileText, BookOpen, BookmarkCheck, MessageSquare, User as UserIcon, Settings } from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  unreadCount = 0,
}) => {
  // Mobile Bottom Quick Launch Items (Purged of Daily Practice & AI Repetitor)
  const navItems = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: Home,
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
      label: 'Lug\'at',
      icon: BookOpen,
    },
    {
      id: 'vault',
      label: 'Xatolar',
      icon: BookmarkCheck,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: UserIcon,
    },
  ];

  return (
    <nav
      aria-label="Mobil Navigatsiya"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0F1D]/95 border-t border-[#E2E8F0] dark:border-[#1E293B] backdrop-blur-lg px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around select-none shadow-2xl transition-colors"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 ${
              isActive
                ? 'text-[#E07A5F] font-bold'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <div className="relative">
              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.6}
                className={`transition-transform duration-150 ${
                  isActive ? 'scale-110 text-[#E07A5F]' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              />

              {/* Unread badge */}
              {item.id === 'community' && unreadCount > 0 ? (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#E07A5F] text-white ring-2 ring-white dark:ring-[#0A0F1D]">
                  {unreadCount}
                </span>
              ) : null}

              {/* Active glow pip */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
              )}
            </div>

            <span
              className={`text-[9px] tracking-tight mt-1 truncate max-w-[54px] font-mono ${
                isActive ? 'text-[#0F172A] dark:text-[#F8FAFC] font-bold' : 'text-[#64748B] dark:text-[#94A3B8]'
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
