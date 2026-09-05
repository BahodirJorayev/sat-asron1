import React, { useState, useEffect } from 'react';
import { Users, Lock, Radio, Check, ArrowRight, Loader2, Globe } from 'lucide-react';
import { Chat, User } from '../../types';
import { EntityAvatar } from './EntityAvatar';
import { fetchChannelByInviteToken, fetchChannelByUsername, joinChannelByToken } from '../../lib/communityApi';

interface InviteCardProps {
  url: string;
  currentUser?: User;
  onJoinSuccess?: (joinedChat: Chat) => void;
}

export const InviteCard: React.FC<InviteCardProps> = ({
  url,
  currentUser,
  onJoinSuccess,
}) => {
  const [channel, setChannel] = useState<Partial<Chat> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse token or username from URL
  const tokenMatch = url.match(/(?:chat\/join\/|join\/|\?join=)([a-zA-Z0-9_-]+)/);
  const usernameMatch = url.match(/(?:\?c=@|\?c=)([a-zA-Z0-9_]+)/);

  const token = tokenMatch ? tokenMatch[1] : null;
  const username = usernameMatch ? usernameMatch[1] : null;

  useEffect(() => {
    let isMounted = true;

    async function loadEntity() {
      setIsLoading(true);
      try {
        if (token) {
          const ch = await fetchChannelByInviteToken(token);
          if (isMounted && ch) setChannel(ch);
        } else if (username) {
          const ch = await fetchChannelByUsername(username);
          if (isMounted && ch) setChannel(ch);
        }
      } catch (err) {
        // Non-critical
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (token || username) {
      loadEntity();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token, username]);

  if (!token && !username) return null;

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || isJoining || hasJoined) return;

    setIsJoining(true);
    setErrorMessage(null);

    const targetToken = token || username || '';
    const res = await joinChannelByToken(targetToken, currentUser);

    setIsJoining(false);
    if (res.success && res.channel) {
      setHasJoined(true);
      if (onJoinSuccess) {
        onJoinSuccess(res.channel);
      }
      // Broadcast event so active CommunityChatHub can switch to this chat
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('asron_open_chat', { detail: { chatId: res.channel.id, chat: res.channel } })
        );
      }
    } else {
      setErrorMessage(res.error || "Ulanishda xatolik yuz berdi");
    }
  };

  const entityName = channel?.name || (username ? `@${username}` : 'ASRON Hamjamiyat');
  const isChannel = channel?.type === 'PUBLIC_CHANNEL' || channel?.type === 'PRIVATE_CHANNEL';
  const isPublic = channel?.isPublic !== false;

  return (
    <div className="my-2 max-w-sm rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] p-3.5 shadow-md font-sans text-[#0F172A] dark:text-[#F8FAFC] select-none transition-all">
      <div className="flex items-center gap-3">
        <EntityAvatar
          name={entityName}
          avatarUrl={channel?.avatarUrl}
          size="md"
          shape="rounded"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold truncate">{entityName}</span>
            {isPublic ? (
              <Globe size={11} className="text-[#94A3B8] shrink-0" />
            ) : (
              <Lock size={11} className="text-[#E07A5F] shrink-0" />
            )}
          </div>
          <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
            {channel?.username ? `@${channel.username}` : isPublic ? 'Ommaviy hamjamiyat' : 'Maxsus taklif havolasi'}
          </p>
        </div>
      </div>

      {channel?.description && (
        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]/60">
          {channel.description}
        </p>
      )}

      {errorMessage && (
        <p className="text-[10px] font-mono text-rose-500 mt-1">{errorMessage}</p>
      )}

      <div className="mt-3 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-[#94A3B8]">
          {isChannel ? 'Kanalga taklifnoma' : 'Guruhga taklifnoma'}
        </span>

        <button
          type="button"
          onClick={handleJoin}
          disabled={isJoining || hasJoined}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            hasJoined
              ? 'bg-emerald-500 text-white'
              : 'bg-[#E07A5F] hover:bg-[#c96c53] text-white'
          }`}
        >
          {isJoining ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Ulanmoqda...</span>
            </>
          ) : hasJoined ? (
            <>
              <Check size={12} />
              <span>A'zo bo'lindi</span>
            </>
          ) : (
            <>
              <span>{isChannel ? "Kanalga a'zo bo'lish" : "Guruhga a'zo bo'lish"}</span>
              <ArrowRight size={12} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
