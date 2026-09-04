import React from 'react';
import { Home, Layers, BookmarkCheck, MessageSquare, User as UserIcon } from 'lucide-react';
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
  // Consolidated 5 Minimal Navigation Items
  const navItems = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: Home,
    },
    {
      id: 'qbank',
      label: 'SQB / Testlar',
      icon: Layers,
    },
    {
      id: 'vault',
      label: 'Xatolar',
      icon: BookmarkCheck,
    },
    {
      id: 'community',
      label: 'Hamjamiyat',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F1D]/95 border-t border-[#1E293B] backdrop-blur-lg px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around select-none shadow-2xl transition-all"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeTab === item.id ||
          (item.id === 'qbank' && activeTab === 'bluebook');

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center min-w-[60px] py-1 px-1.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
              isActive
                ? 'text-[#E07A5F] font-bold'
                : 'text-[#64748B] hover:text-[#94A3B8] font-medium'
            }`}
          >
            <div className="relative">
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.6}
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-[#E07A5F]' : 'text-[#94A3B8]'
                }`}
              />

              {/* Unread badge */}
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#E07A5F] text-white ring-2 ring-[#0A0F1D]">
                  {item.badge}
                </span>
              ) : null}

              {/* Active glow pip */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
              )}
            </div>

            <span
              className={`text-[10px] tracking-tight mt-1 truncate max-w-[64px] font-mono ${
                isActive ? 'text-[#F8FAFC]' : 'text-[#64748B]'
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
