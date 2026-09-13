import { supabase } from './supabase';
import { Message } from '../types';

const STORAGE_UNREAD_KEY = 'asron_chat_unread_counts_v1';
const STORAGE_LAST_READ_KEY = 'asron_chat_last_read_v1';

let activeViewingChatId: string | null = null;
let realtimeChannelInitialized = false;

/**
 * Get the current map of unread counts per chatId
 */
export function getAllUnreadCounts(): Record<string, number> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_UNREAD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get total unread count across all channels and direct chats
 */
export function getTotalUnreadCount(): number {
  const counts = getAllUnreadCounts();
  return Object.values(counts).reduce((sum, c) => sum + (typeof c === 'number' && c > 0 ? c : 0), 0);
}

/**
 * Get unread count for a specific chat ID
 */
export function getChatUnreadCount(chatId: string): number {
  if (!chatId) return 0;
  const counts = getAllUnreadCounts();
  return counts[chatId] || 0;
}

/**
 * Broadcast current unread state across windows and components
 */
function broadcastUnreadChange() {
  if (typeof window === 'undefined') return;
  const counts = getAllUnreadCounts();
  const total = getTotalUnreadCount();
  window.dispatchEvent(
    new CustomEvent('asron_unread_messages_change', {
      detail: { totalUnread: total, unreadMap: counts },
    })
  );
}

/**
 * Set active chat ID being viewed by user right now.
 * When set, any incoming messages for this chat will be immediately marked as read.
 */
export function setActiveViewingChatId(chatId: string | null): void {
  activeViewingChatId = chatId;
  if (chatId) {
    markChatAsRead(chatId);
  }
}

/**
 * Mark a specific channel/chat as completely read
 */
export function markChatAsRead(chatId: string): void {
  if (!chatId || typeof localStorage === 'undefined') return;
  try {
    const counts = getAllUnreadCounts();
    if (counts[chatId] !== undefined && counts[chatId] > 0) {
      delete counts[chatId];
      localStorage.setItem(STORAGE_UNREAD_KEY, JSON.stringify(counts));
    }

    // Save last read timestamp
    const lastReadRaw = localStorage.getItem(STORAGE_LAST_READ_KEY);
    const lastReadMap = lastReadRaw ? JSON.parse(lastReadRaw) : {};
    lastReadMap[chatId] = new Date().toISOString();
    localStorage.setItem(STORAGE_LAST_READ_KEY, JSON.stringify(lastReadMap));

    broadcastUnreadChange();
  } catch (err) {
    console.warn('markChatAsRead error:', err);
  }
}

/**
 * Increment unread count for a chat ID (unless user is currently viewing it)
 */
export function incrementChatUnread(chatId: string, delta: number = 1): void {
  if (!chatId || typeof localStorage === 'undefined') return;
  // If the user is actively viewing this chat, it's considered read immediately
  if (activeViewingChatId === chatId) {
    return;
  }

  try {
    const counts = getAllUnreadCounts();
    counts[chatId] = (counts[chatId] || 0) + delta;
    localStorage.setItem(STORAGE_UNREAD_KEY, JSON.stringify(counts));
    broadcastUnreadChange();
  } catch (err) {
    console.warn('incrementChatUnread error:', err);
  }
}

/**
 * Set explicit unread count for a chat
 */
export function setChatUnreadCount(chatId: string, count: number): void {
  if (!chatId || typeof localStorage === 'undefined') return;
  try {
    const counts = getAllUnreadCounts();
    if (count <= 0) {
      delete counts[chatId];
    } else {
      counts[chatId] = count;
    }
    localStorage.setItem(STORAGE_UNREAD_KEY, JSON.stringify(counts));
    broadcastUnreadChange();
  } catch (err) {
    console.warn('setChatUnreadCount error:', err);
  }
}

/**
 * Initialize global Realtime listener for incoming messages to track unread badges
 */
export function initGlobalUnreadTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Listen for locally broadcast messages (from persistence/broadcast)
  const handleLocalNewMessage = (e: any) => {
    const msg: Message | undefined = e?.detail;
    if (msg) {
      const chatId = msg.chatId || msg.channelId;
      // Do not increment if current user sent this message
      const currentProfileRaw = localStorage.getItem('aurasat_user_profile');
      let currentUserId = '';
      if (currentProfileRaw) {
        try {
          currentUserId = JSON.parse(currentProfileRaw).id;
        } catch {}
      }
      if (chatId && msg.senderId !== currentUserId) {
        incrementChatUnread(chatId);
      }
    }
  };
  window.addEventListener('asron_new_message', handleLocalNewMessage);

  // 2. Setup Supabase Realtime channel listener on community_messages
  let realtimeChannel: any = null;
  if (!realtimeChannelInitialized) {
    realtimeChannelInitialized = true;
    try {
      realtimeChannel = supabase
        .channel('global_unread_messages_tracker')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_messages',
          },
          (payload: any) => {
            const newMsg = payload?.new;
            if (newMsg) {
              const chatId = newMsg.chat_id || newMsg.channel_id;
              const senderId = newMsg.sender_id;
              const currentProfileRaw = localStorage.getItem('aurasat_user_profile');
              let currentUserId = '';
              if (currentProfileRaw) {
                try {
                  currentUserId = JSON.parse(currentProfileRaw).id;
                } catch {}
              }
              if (chatId && senderId !== currentUserId) {
                incrementChatUnread(chatId);
              }
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Unread tracker realtime subscription notice:', e);
    }
  }

  return () => {
    window.removeEventListener('asron_new_message', handleLocalNewMessage);
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannelInitialized = false;
    }
  };
}
