import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  BookmarkCheck,
  MessageSquare,
  UserCog,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
} from 'lucide-react';
import { User } from '../types';
import { SiteBrandingConfig } from '../data/blogAndBrandingData';
import { SidebarFooter } from './SidebarFooter';
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
  onOpenDailyWorkout,
  onOpenDiagnostic,
  onOpenPaywall,
  onOpenVocabTrainer,
  onOpenMultiplayerArena,
  onOpenSocraticTutor,
  onOpenSettings,
  onOpenProfile,
  onOpenTelegramLogs,
  onSwitchUserRole,
  onOpenAuthModal,
  onOpenAdminLogin,
  onLogout,
  unreadAlertCount = 0,
}) => {
  // Local state with localStorage persistence for fallback / controlled syncing
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

  const brandName = siteBranding?.brandName || 'ASRON SAT';
  const brandTagline = siteBranding?.brandTagline || 'Digital SAT Platform';

  // 5 Consolidated Minimal Navigation Items (Purged of Daily Practice & AI Repetitor)
  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: LayoutDashboard,
      onClick: () => setActiveTab('dashboard'),
    },
    {
      id: 'qbank',
      label: 'Savollar Banki / Mock Testlar',
      icon: Layers,
      onClick: () => setActiveTab('qbank'),
    },
    {
      id: 'vault',
      label: 'Xatolar Banki',
      icon: BookmarkCheck,
      onClick: () => setActiveTab('vault'),
    },
    {
      id: 'community',
      label: 'Hamjamiyat',
      icon: MessageSquare,
      onClick: () => setActiveTab('community'),
    },
    {
      id: 'profile',
      label: 'Profil & Sozlamalar',
      icon: UserCog,
      onClick: () => (onOpenProfile ? onOpenProfile() : setActiveTab('profile')),
    },
    ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      ? [
          {
            id: 'admin',
            label: 'Admin Panel',
            icon: ShieldAlert,
            onClick: () => setActiveTab('admin'),
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`hidden md:flex relative h-screen sticky top-0 shrink-0 z-30 select-none flex-col justify-between transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#0D1527] border-r border-[#1E293B] text-[#F8FAFC] overflow-visible`}
    >
      {/* ========================================================================= */}
      {/* 1. HEADER (Brand & Collapse/Expand Toggle)                                */}
      {/* ========================================================================= */}
      {isCollapsed ? (
        <div className="relative h-16 py-4 flex items-center justify-center border-b border-[#1E293B] group">
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label="Kengaytirish (Expand sidebar)"
            className="w-10 h-10 rounded-xl bg-[#121A2F] text-white flex items-center justify-center font-extrabold text-sm shadow-xs border border-[#1E293B] hover:border-[#E07A5F]/50 transition-all cursor-pointer relative overflow-hidden p-1.5"
          >
            <span className="transition-all duration-200 group-hover:opacity-0 group-hover:scale-75 w-full h-full flex items-center justify-center font-mono text-[#E07A5F]">
              Σ
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all text-[#F8FAFC]">
              <PanelLeftOpen size={18} />
            </span>
          </button>

          {/* Collapsed Header Tooltip */}
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 border border-[#1E293B] flex items-center gap-1.5">
            <span>Kengaytirish</span>
          </div>
        </div>
      ) : (
        <div className="h-16 px-4 py-4 border-b border-[#1E293B] bg-[#0D1527] flex items-center justify-between gap-2 shrink-0">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
            title={`${brandName} - Bosh Sahifa`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#121A2F] text-[#E07A5F] border border-[#1E293B] flex items-center justify-center font-mono font-bold text-base group-hover:border-[#E07A5F]/50 transition-colors shrink-0">
              Σ
            </div>

            <div className="min-w-0 leading-tight">
              <div className="font-bold text-sm tracking-tight text-[#F8FAFC] truncate">
                {brandName}
              </div>
              <p className="text-[10px] font-mono text-[#64748B] font-medium truncate mt-0.5">
                Executive Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label="Panelni yig'ish"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#121A2F] transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONSOLIDATED MINIMAL NAVIGATION LIST                                   */}
      {/* ========================================================================= */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-none">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
            Asosiy Bo‘limlar
          </div>
        )}

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center h-11 w-11 mx-auto' : 'justify-start px-3.5 py-2.5'
                } rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1E293B] text-[#F8FAFC] font-bold shadow-xs border border-[#334155]/60'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#121A2F] font-medium'
                }`}
              >
                {/* Active Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#E07A5F]" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#E07A5F]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate tracking-tight">{item.label}</span>}
                </div>
              </button>

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 border border-[#1E293B] flex items-center gap-1.5">
                  <span>{item.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ========================================================================= */}
      {/* 3. PINNED FOOTER PROFILE                                                  */}
      {/* ========================================================================= */}
      <SidebarFooter
        user={user}
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        onOpenProfile={onOpenProfile || (() => setActiveTab('profile'))}
        onOpenSettings={onOpenSettings || (() => setActiveTab('profile'))}
        onOpenPaywall={onOpenPaywall}
        onOpenAdminLogin={onOpenAdminLogin}
        onLogout={onLogout}
      />
    </aside>
  );
};
