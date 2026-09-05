'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  FileText,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

export interface BottomNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  unreadCount?: number;
}

export const navItems = [
  {
    id: 'dashboard',
    label: 'Uy',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'questions',
    label: 'Savollar',
    href: '/questions',
    icon: Layers,
  },
  {
    id: 'mocks',
    label: 'Testlar',
    href: '/mocks',
    icon: FileText,
  },
  {
    id: 'vocabulary',
    label: "Lug'at",
    href: '/vocabulary',
    icon: BookOpen,
  },
  {
    id: 'mistakes',
    label: 'Xatolar',
    href: '/mistakes',
    icon: AlertCircle,
  },
];

export const NAV_ITEMS = navItems;

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const pathname = usePathname() || '';
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    const handleChatState = (e: any) => {
      setIsChatOpen(!!e?.detail?.isOpen);
    };
    window.addEventListener('asron_chat_state_change', handleChatState);
    return () => window.removeEventListener('asron_chat_state_change', handleChatState);
  }, []);

  const isCurrentActive = (item: typeof navItems[0]) => {
    if (activeTab) {
      if (activeTab === item.id) return true;
      if (item.id === 'questions' && (activeTab === 'qbank' || activeTab === 'practice')) return true;
      if (item.id === 'mocks' && activeTab === 'bluebook') return true;
      if (item.id === 'vocabulary' && activeTab === 'vocab') return true;
      if (item.id === 'mistakes' && activeTab === 'vault') return true;
    }
    if (!pathname) return false;
    if (item.href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  // Hide bottom nav entirely when on /chat, /community, or when an active conversation is open on mobile
  if (
    isChatOpen ||
    (pathname && (pathname.startsWith('/chat') || pathname.startsWith('/community')))
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Mobil Navigatsiya"
      className="md:hidden fixed bottom-3 left-4 right-4 z-50 mx-auto max-w-sm rounded-full h-14 bg-white/75 dark:bg-[#0D1527]/75 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex items-center justify-around px-2 select-none transition-all duration-200"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isCurrentActive(item);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (setActiveTab) {
                setActiveTab(item.id);
              }
            }}
            className="group flex-1 flex items-center justify-center py-1 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative flex flex-col items-center justify-center w-full py-0.5">
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

                {/* Active pip */}
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
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
