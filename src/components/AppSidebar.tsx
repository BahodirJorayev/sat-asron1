import React, { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  FileText,
  BookOpen,
  BookmarkCheck,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { User } from '../types';
import { SiteBrandingConfig } from '../data/blogAndBrandingData';
import { SidebarFooter } from './SidebarFooter';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { useLanguage } from '../context/LanguageContext';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { AsronLogo } from './AsronLogo';

export interface AppSidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  siteBranding?: SiteBrandingConfig;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenDailyWorkout?: () => void;
  onOpenDiagnostic?: () => void;
  onOpenPaywall?: () => void;
  onOpenVocabTrainer?: () => void;
  onOpenMultiplayerArena?: () => void;
  onOpenSocraticTutor?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  onOpenTelegramLogs?: () => void;
  onSwitchUserRole?: () => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onOpenAdminLogin?: () => void;
  onLogout?: () => void;
  unreadAlertCount?: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  siteBranding,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
  onOpenPaywall,
  onOpenVocabTrainer,
  onOpenSettings,
  onOpenProfile,
  onOpenAdminLogin,
  onLogout,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('aurasat_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return controlledIsCollapsed ?? false;
  });

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const nextVal = !isCollapsed;
    setInternalCollapsed(nextVal);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aurasat_sidebar_collapsed', String(nextVal));
    }
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const { settings, isModuleHidden, isModuleLocked, showLockedNotice } = usePlatformSettings();
  const { t } = useLanguage();
  const { totalUnread } = useUnreadMessages();
  const brandName = settings.platform_title || siteBranding?.brandName || 'ASRON SAT';

  const moduleMap: Record<string, 'questions' | 'mocks' | 'vocabulary' | 'mistakes' | 'community'> = {
    qbank: 'questions',
    bluebook: 'mocks',
    vocab: 'vocabulary',
    vault: 'mistakes',
    community: 'community',
  };

  // EXACT 6 NAVIGATION ITEMS with Module Governance
  const allNavItems = [
    {
      id: 'dashboard',
      label: t('nav.home', 'Uy'),
      icon: LayoutDashboard,
      onClick: () => {
        setActiveTab('dashboard');
        if (typeof window !== 'undefined') window.location.hash = '#/dashboard';
      },
    },
    {
      id: 'qbank',
      label: t('nav.questions', 'Savollar'),
      icon: Database,
      onClick: () => {
        if (isModuleLocked('questions')) {
          showLockedNotice(t('nav.questions', 'Savollar'));
          return;
        }
        setActiveTab('qbank');
        if (typeof window !== 'undefined') window.location.hash = '#/qbank';
      },
      isLocked: isModuleLocked('questions'),
    },
    {
      id: 'bluebook',
      label: t('nav.mocks', 'Testlar'),
      icon: FileText,
      onClick: () => {
        if (isModuleLocked('mocks')) {
          showLockedNotice(t('nav.mocks', 'Testlar'));
          return;
        }
        setActiveTab('bluebook');
        if (typeof window !== 'undefined') window.location.hash = '#/mocks';
      },
      isLocked: isModuleLocked('mocks'),
    },
    {
      id: 'vocab',
      label: t('nav.vocabulary', "Lug'at"),
      icon: BookOpen,
      onClick: () => {
        if (isModuleLocked('vocabulary')) {
          showLockedNotice(t('nav.vocabulary', "Lug'at"));
          return;
        }
        setActiveTab('vocab');
        if (typeof window !== 'undefined') window.location.hash = '#/vocab';
      },
      isLocked: isModuleLocked('vocabulary'),
    },
    {
      id: 'vault',
      label: t('nav.mistakes', 'Xatolar'),
      icon: BookmarkCheck,
      onClick: () => {
        if (isModuleLocked('mistakes')) {
          showLockedNotice(t('nav.mistakes', 'Xatolar'));
          return;
        }
        setActiveTab('vault');
        if (typeof window !== 'undefined') window.location.hash = '#/mistakes';
      },
      isLocked: isModuleLocked('mistakes'),
    },
    {
      id: 'community',
      label: t('nav.community', 'Hamjamiyat'),
      icon: Users,
      onClick: () => {
        if (isModuleLocked('community')) {
          showLockedNotice(t('nav.community', 'Hamjamiyat'));
          return;
        }
        setActiveTab('community');
        if (typeof window !== 'undefined') window.location.hash = '#/community';
      },
      isLocked: isModuleLocked('community'),
    },
    ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      ? [
          {
            id: 'admin',
            label: t('nav.admin', 'Admin'),
            icon: ShieldAlert,
            onClick: () => {
              setActiveTab('admin');
              if (typeof window !== 'undefined') window.location.hash = '#/admin';
            },
            isLocked: false,
          },
        ]
      : []),
  ];

  const navigationItems = allNavItems.filter((item) => {
    const mod = moduleMap[item.id];
    return !mod || !isModuleHidden(mod);
  });

  return (
    <aside
      className={`hidden md:flex relative h-screen sticky top-0 shrink-0 z-30 select-none flex-col justify-between transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none text-[#0F172A] dark:text-[#F8FAFC] overflow-visible`}
    >
      {/* 1. Header (Brand & Collapse/Expand Toggle) */}
      {isCollapsed ? (
        <div className="relative h-16 py-4 flex items-center justify-center border-b border-[#E2E8F0] dark:border-[#1E293B] group">
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label={t('expandSidebar', 'Kengaytirish')}
            className="w-10 h-10 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-white flex items-center justify-center font-extrabold text-sm shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F]/60 transition-all cursor-pointer relative overflow-hidden p-1.5"
          >
            {settings.logo_url && settings.logo_url !== '/brand/logo.svg' ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg transition-all duration-200 group-hover:opacity-0 group-hover:scale-75"
              />
            ) : (
              <span className="transition-all duration-200 group-hover:opacity-0 group-hover:scale-75 w-full h-full flex items-center justify-center">
                <AsronLogo size={24} variant="mark-only" />
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all text-[#0F172A] dark:text-[#F8FAFC]">
              <PanelLeftOpen size={18} />
            </span>
          </button>

          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] dark:bg-[#1E293B] text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1.5">
            <span>{t('expandSidebar', 'Kengaytirish')}</span>
          </div>
        </div>
      ) : (
        <div className="h-16 px-4 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#121A2F] flex items-center justify-between gap-2 shrink-0">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
            title={`${brandName} - ${t('nav.home', 'Uy')}`}
          >
            {settings.logo_url && settings.logo_url !== '/brand/logo.svg' ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-contain border border-[#E2E8F0] dark:border-[#1E293B] shrink-0 shadow-2xs"
              />
            ) : (
              <AsronLogo size={36} variant="mark-only" />
            )}

            <div className="min-w-0 leading-tight">
              <div className="font-bold text-sm tracking-tight text-[#0F172A] dark:text-[#F8FAFC] truncate">
                {brandName}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label={t('collapseSidebar', "Panelni yig'ish")}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      )}

      {/* 2. Official 6 Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#64748B]">
            {t('mainSections', 'Asosiy Bo‘limlar')}
          </div>
        )}

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'dashboard' &&
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
              ].includes(activeTab)) ||
            (item.id === 'qbank' && (activeTab === 'questions' || activeTab === 'practice')) ||
            (item.id === 'bluebook' && activeTab === 'mocks') ||
            (item.id === 'vocab' && activeTab === 'vocabulary') ||
            (item.id === 'vault' && activeTab === 'mistakes') ||
            (item.id === 'community' && activeTab === 'chat');

          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold border border-[#E2E8F0] dark:border-[#334155]/60 shadow-2xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60'
                }`}
              >
                {/* Active Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-[#E07A5F]" />
                )}

                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#E07A5F]' : 'text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate tracking-tight">{item.label}</span>}
                </div>

                {item.id === 'community' && totalUnread > 0 && (
                  isCollapsed ? (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  ) : (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-4 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs shrink-0">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )
                )}

                {item.isLocked && (
                  isCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                  ) : (
                    <Lock size={12} className="text-amber-500 shrink-0 ml-1.5" />
                  )
                )}
              </button>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0F172A] dark:bg-[#1E293B] text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. Clean Footer Profile Strip (NO Redundant Theme Toggle) */}
      <SidebarFooter
        user={user}
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        onOpenProfile={onOpenProfile || (() => {
          setActiveTab('profile');
          if (typeof window !== 'undefined') window.location.hash = '#/profile';
        })}
        onOpenSettings={onOpenSettings || (() => {
          setActiveTab('settings');
          if (typeof window !== 'undefined') window.location.hash = '#/profile';
        })}
        onOpenPaywall={onOpenPaywall}
        onOpenAdminLogin={onOpenAdminLogin}
        onLogout={onLogout}
      />
    </aside>
  );
};
