'use client';

import React from 'react';
import {
  Home,
  Layers,
  FileText,
  BookOpen,
  AlertCircle,
  Users,
} from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

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
  const { t } = useLanguage();
  const { totalUnread } = useUnreadMessages();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    const handleChatState = (e: any) => {
      setIsChatOpen(!!e?.detail?.isOpen);
    };
    window.addEventListener('asron_chat_state_change', handleChatState);

    return () => {
      window.removeEventListener('asron_chat_state_change', handleChatState);
    };
  }, []);

  // Hide entirely when inside an active mobile chat conversation viewport
  if (isChatOpen) {
    return null;
  }

  // Exact 6-item minimal navigation array establishing 100% desktop/mobile parity
  const navItems = [
    {
      id: 'dashboard',
      label: t('nav.home', 'Uy'),
      icon: Home,
    },
    {
      id: 'qbank',
      label: t('nav.questions', 'Savollar'),
      icon: Layers,
    },
    {
      id: 'bluebook',
      label: t('nav.mocks', 'Testlar'),
      icon: FileText,
    },
    {
      id: 'vocab',
      label: t('nav.vocabulary', "Lug'at"),
      icon: BookOpen,
    },
    {
      id: 'vault',
      label: t('nav.mistakes', 'Xatolar'),
      icon: AlertCircle,
    },
    {
      id: 'community',
      label: t('nav.community', 'Hamjamiyat'),
      icon: Users,
    },
  ];

  const CANONICAL_HASH_MAP: Record<string, string> = {
    dashboard: '#/dashboard',
    qbank: '#/qbank',
    bluebook: '#/mocks',
    vocab: '#/vocab',
    vault: '#/mistakes',
    community: '#/community',
  };

  const isItemActive = (id: string) => {
    if (id === 'dashboard') {
      return (
        activeTab === 'dashboard' ||
        ![
          'landing',
          'blog',
          'profile',
          'settings',
          'vocab',
          'vocabulary',
          'daily-workout',
          'vault',
          'mistakes',
          'bluebook',
          'mocks',
          'qbank',
          'questions',
          'practice',
          'community',
          'chat',
          'arena',
          'ai-tutor',
          'roadmap',
          'admin',
        ].includes(activeTab)
      );
    }
    if (id === 'qbank') return activeTab === 'qbank' || activeTab === 'questions' || activeTab === 'practice';
    if (id === 'bluebook') return activeTab === 'bluebook' || activeTab === 'mocks';
    if (id === 'vocab') return activeTab === 'vocab' || activeTab === 'vocabulary';
    if (id === 'vault') return activeTab === 'vault' || activeTab === 'mistakes';
    if (id === 'community') return activeTab === 'community' || activeTab === 'chat';
    return activeTab === id;
  };

  return (
    <nav
      aria-label="Mobil Navigatsiya"
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-md rounded-full h-14 bg-white/85 dark:bg-[#0D1527]/85 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] flex items-center justify-around px-2 select-none transition-all duration-200"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.id);
              if (typeof window !== 'undefined') {
                window.location.hash = CANONICAL_HASH_MAP[item.id] || `#/${item.id}`;
              }
            }}
            className="group flex-1 flex flex-col items-center justify-center py-0.5 cursor-pointer active:scale-95 transition-transform relative min-w-0"
          >
            <div className="relative">
              <Icon
                size={18}
                strokeWidth={isActive ? 2.4 : 1.7}
                className={`transition-all duration-150 ${
                  isActive
                    ? 'text-[#E07A5F] scale-105 drop-shadow-[0_2px_8px_rgba(224,122,95,0.35)]'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
              />

              {item.id === 'community' && totalUnread > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}

              {/* Active Pip */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E07A5F]" />
              )}
            </div>

            <span
              className={`text-[9.5px] font-medium tracking-tight mt-0.5 truncate max-w-[50px] transition-colors duration-150 ${
                isActive
                  ? 'text-[#E07A5F] font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t(item.id, item.label)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
