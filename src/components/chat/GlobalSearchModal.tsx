'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  User as UserIcon,
  Radio,
  Users,
  MessageSquare,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (user: ProfileSearchResult) => void;
  onSelectChannel?: (channel: ChannelSearchResult) => void;
}

export interface ProfileSearchResult {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  role?: string;
}

export interface ChannelSearchResult {
  id: string;
  name: string;
  username?: string;
  description?: string;
  type: string;
  avatarUrl?: string;
  membersCount?: number;
  isPublic?: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  onSelectChannel,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'USERS' | 'CHANNELS'>('ALL');
  const [loading, setLoading] = useState(false);
  const [userResults, setUserResults] = useState<ProfileSearchResult[]>([]);
  const [channelResults, setChannelResults] = useState<ChannelSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setUserResults([]);
      setChannelResults([]);
      setHasSearched(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search querying Supabase profiles and community_channels
  useEffect(() => {
    const term = query.replace('@', '').trim();
    if (!term) {
      setUserResults([]);
      setChannelResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        // 1. Search Users from live public.profiles
        const cleanTerm = query.replace('@', '').trim();
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .or(`full_name.ilike.%${cleanTerm}%,username.ilike.%${cleanTerm}%`)
          .limit(10);

        // 2. Search Public Channels & Groups from live public.community_channels
        const { data: channels } = await supabase
          .from('community_channels')
          .select('id, name, username, description, avatar_url, type, is_public')
          .eq('is_public', true)
          .or(`name.ilike.%${cleanTerm}%,username.ilike.%${cleanTerm}%`)
          .limit(10);

        const mappedUsers: ProfileSearchResult[] = [];
        if (users && Array.isArray(users)) {
          users.forEach((p: any) => {
            mappedUsers.push({
              id: p.id,
              fullName: p.full_name || p.username || 'Talaba',
              username: p.username || 'user',
              avatarUrl: p.avatar_url,
              role: 'STUDENT',
            });
          });
        }

        const mappedChannels: ChannelSearchResult[] = [];
        if (channels && Array.isArray(channels)) {
          channels.forEach((c: any) => {
            mappedChannels.push({
              id: c.id,
              name: c.name || 'Kanal',
              username: c.username,
              description: c.description || '',
              type: c.type || 'PUBLIC_CHANNEL',
              avatarUrl: c.avatar_url,
              isPublic: true,
            });
          });
        }

        setUserResults(mappedUsers);
        setChannelResults(mappedChannels);
        setHasSearched(true);
      } catch (err) {
        console.warn('Global search execution error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  if (!isOpen) return null;

  const handleOpenDm = (targetUser: ProfileSearchResult) => {
    onClose();
    if (onSelectUser) {
      onSelectUser(targetUser);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('asron_open_chat', {
          detail: {
            dmUserId: targetUser.id,
            fullName: targetUser.fullName,
            username: targetUser.username,
            avatarUrl: targetUser.avatarUrl,
          },
        })
      );
    }
    // Deep-link to Direct Message with this user
    router.push(`/chat?dm=${targetUser.id}`);
  };

  const handleOpenChannel = (targetChannel: ChannelSearchResult) => {
    onClose();
    if (onSelectChannel) {
      onSelectChannel(targetChannel);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('asron_open_chat', {
          detail: {
            chatId: targetChannel.id,
            channelUsername: targetChannel.username,
          },
        })
      );
    }
    const identifier = targetChannel.username ? `@${targetChannel.username.replace(/^@/, '')}` : targetChannel.id;
    router.push(`/chat?c=${encodeURIComponent(identifier)}`);
  };

  const showUsers = activeTab === 'ALL' || activeTab === 'USERS';
  const showChannels = activeTab === 'ALL' || activeTab === 'CHANNELS';
  const totalResultsCount = userResults.length + channelResults.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-[#1E293B] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 transition-colors"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-[#0A0F1D]/40">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#182035] text-slate-500 dark:text-slate-400 shrink-0">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-[#E07A5F]" />
            ) : (
              <Search size={18} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Foydalanuvchilar, guruhlar yoki kanallarni qidiring..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="px-2 py-1 text-[11px] font-mono rounded-lg bg-slate-100 dark:bg-[#182035] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#263148] hover:bg-slate-200 dark:hover:bg-[#202b46] transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-100 dark:border-[#1E293B]/70 flex items-center gap-1.5 sm:gap-2 text-xs font-medium bg-white dark:bg-[#121A2F]">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#E07A5F] text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]'
            }`}
          >
            Barchasi {hasSearched && `(${totalResultsCount})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'USERS'
                ? 'bg-[#E07A5F] text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]'
            }`}
          >
            <UserIcon size={13} />
            <span>Foydalanuvchilar</span>
            {hasSearched && <span className="text-[10px] opacity-80">({userResults.length})</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHANNELS')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CHANNELS'
                ? 'bg-[#E07A5F] text-white font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]'
            }`}
          >
            <Radio size={13} />
            <span>Kanallar & Guruhlar</span>
            {hasSearched && <span className="text-[10px] opacity-80">({channelResults.length})</span>}
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 max-h-[60vh]">
          {/* Initial State (No query yet) */}
          {!query.trim() && (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E07A5F] flex items-center justify-center mx-auto">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  ASRON SAT Global Qidiruv
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Platformadagi talabalar, ustozlar yoki rasmiy hamjamiyat kanallarini ism yoki @username orqali qidiring.
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !hasSearched && (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-[#E07A5F]" />
              <span className="text-xs">Qidirilmoqda...</span>
            </div>
          )}

          {/* Empty State (Query made, zero results) */}
          {hasSearched && !loading && totalResultsCount === 0 && (
            <div className="py-12 text-center space-y-2">
              <div className="text-slate-400 dark:text-slate-500 text-sm font-semibold">
                "{query}" bo'yicha hech narsa topilmadi
              </div>
              <div className="text-xs text-slate-400">
                Imloni tekshiring yoki boshqa so'z bilan urinib ko'ring.
              </div>
            </div>
          )}

          {/* Users Section */}
          {showUsers && userResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Foydalanuvchilar ({userResults.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleOpenDm(u)}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-[#182035]/60 border border-slate-200/80 dark:border-[#263148] hover:border-[#E07A5F]/50 hover:bg-slate-100 dark:hover:bg-[#1d2740] transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[#0B1B3D] dark:bg-[#1E293B] text-[#E07A5F] flex items-center justify-center font-bold text-sm shrink-0 border border-slate-800 dark:border-slate-700">
                          {u.fullName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-[#E07A5F] transition-colors">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          @{u.username}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Xabar yozish"
                      className="p-2 rounded-xl bg-white dark:bg-[#121A2F] text-[#E07A5F] border border-slate-200 dark:border-[#263148] group-hover:bg-[#E07A5F] group-hover:text-white transition-colors shrink-0 shadow-2xs"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channels & Groups Section */}
          {showChannels && channelResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Kanallar & Guruhlar ({channelResults.length})
              </div>
              <div className="space-y-2">
                {channelResults.map((ch) => {
                  const isGroup = ch.type.toUpperCase().includes('GROUP');
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleOpenChannel(ch)}
                      className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#182035]/60 border border-slate-200/80 dark:border-[#263148] hover:border-[#E07A5F]/50 hover:bg-slate-100 dark:hover:bg-[#1d2740] transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#E07A5F] flex items-center justify-center shrink-0 border border-orange-500/20">
                          {isGroup ? <Users size={18} /> : <Radio size={18} />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-[#E07A5F] transition-colors">
                              {ch.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-[#121A2F] text-slate-500 dark:text-slate-400">
                              {isGroup ? 'Guruh' : 'Kanal'}
                            </span>
                          </div>
                          {ch.description && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {ch.description}
                            </div>
                          )}
                          {ch.username && (
                            <div className="text-[10px] font-mono text-[#E07A5F]/90 mt-0.5">
                              @{ch.username.replace(/^@/, '')}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChannel(ch);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#E07A5F] hover:bg-[#c9684f] text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <span>Qo'shilish</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50/70 dark:bg-[#0A0F1D]/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#2A9D8F]" />
            <span>Supabase xavfsiz qidiruv indeksi</span>
          </div>
          <span className="font-mono text-[10px]">ASRON SAT Search v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
