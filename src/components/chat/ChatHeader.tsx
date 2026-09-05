'use client';

import React from 'react';
import { ChevronLeft, Share2, Info, Radio, Lock, CheckCircle2 } from 'lucide-react';
import { Chat } from '../../types';
import { EntityAvatar } from './EntityAvatar';

export interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  onlinePresenceCount?: number;
  canStream?: boolean;
  onStartLive?: () => void;
  onShareInvite?: () => void;
  onToggleInfo?: () => void;
  isInfoOpen?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBack,
  onlinePresenceCount = 1,
  canStream = false,
  onStartLive,
  onShareInvite,
  onToggleInfo,
  isInfoOpen = false,
}) => {
  return (
    <header className="flex-shrink-0 h-12 px-2.5 sm:px-4 bg-white dark:bg-[#121A2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none z-10">
      {/* Left: Back button + Compact Avatar */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Orqaga"
            className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative shrink-0">
          <EntityAvatar
            name={chat.name}
            avatarUrl={chat.avatarUrl}
            size="sm"
            shape={chat.type === 'DIRECT' ? 'circle' : 'rounded'}
            className="w-8 h-8"
          />
          {chat.isLiveActive && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white dark:border-[#121A2F]"></span>
            </span>
          )}
        </div>

        {/* Center: Title & Status - min-w-0 flex-1 truncate ensures action buttons never push off-screen */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <h2 className="text-xs md:text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
              {chat.name}
            </h2>
            {chat.username && (
              <span className="text-[10px] font-mono text-[#E07A5F] truncate shrink-0 hidden sm:inline">
                @{chat.username}
              </span>
            )}
            {chat.isVerified && (
              <CheckCircle2 className="w-3 h-3 text-[#E07A5F] shrink-0" />
            )}
            {chat.isPublic === false && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded shrink-0">
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 leading-tight mt-0.5">
            <span>{onlinePresenceCount} onlayn</span>
            {chat.isLiveActive && (
              <span className="text-rose-500 font-bold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Jonli Efir
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Compact Action Buttons with tight gap-1 and touch targets */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {canStream && onStartLive && (
          <button
            type="button"
            onClick={onStartLive}
            className="h-7 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Jonli efir boshlash"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="hidden sm:inline">Efir</span>
          </button>
        )}

        {onShareInvite && (
          <button
            type="button"
            onClick={onShareInvite}
            aria-label="Ulashish"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Havola orqali ulashish"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        {onToggleInfo && (
          <button
            type="button"
            onClick={onToggleInfo}
            aria-label="Kanal ma'lumotlari"
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
              isInfoOpen
                ? 'bg-[#E07A5F] text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="A'zolar & Kanal Ma'lumotlari"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
