'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, UserCheck, Eye, LogOut } from 'lucide-react';
import { User } from '../../types';

export interface AdminLayoutProps {
  currentUser: User;
  children: React.ReactNode;
  onNavigateToStudentView?: () => void;
  onLogout?: () => void;
  brandTitle?: string;
}

/**
 * AdminLayout - Enforces strict session shield for Admin workspace.
 * Completely eliminates any "Kirish" or "Ro'yxatdan o'tish" auth prompts when an admin session is active.
 * Displays official Admin Badge and management privileges.
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  children,
  onNavigateToStudentView,
  onLogout,
  brandTitle = 'ASRON SAT',
}) => {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] font-sans flex flex-col selection:bg-[#E07A5F] selection:text-white">
      {/* Top Admin Security Header Bar */}
      <header className="h-14 px-4 sm:px-6 bg-[#121A2F] border-b border-[#1E293B] flex items-center justify-between shrink-0 select-none z-30">
        {/* Left: Platform Admin Title & Security Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#C86247] flex items-center justify-center text-white shadow-md shadow-[#E07A5F]/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2 truncate">
              <span>{brandTitle}</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MASTER ADMIN
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Super Admin Console • Barcha boshqaruv vakolatlari faol
            </div>
          </div>
        </div>

        {/* Right: Authenticated Admin Profile Badge (Zero Auth Prompts) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Active Admin Identity Badge */}
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[#1A233D] border border-slate-700/60 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[#E07A5F]/20 border border-[#E07A5F]/40 text-[#E07A5F] flex items-center justify-center font-bold text-xs font-mono">
              {(currentUser.fullName || currentUser.username || 'A')[0].toUpperCase()}
            </div>
            <div className="text-left hidden xs:block">
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.fullName || currentUser.username || 'Bosh Administrator'}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
              </div>
            </div>
          </div>

          {/* Switch to Student Mode */}
          {onNavigateToStudentView && (
            <button
              type="button"
              onClick={onNavigateToStudentView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono font-medium border border-slate-700 transition-colors cursor-pointer"
              title="O'quvchi ko'rinishiga o'tish"
            >
              <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span className="hidden md:inline">O'quvchi Ko'rinishi</span>
            </button>
          )}

          {/* Secure Logout */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Sessiyani yakunlash"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
