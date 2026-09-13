'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllUnreadCounts,
  getTotalUnreadCount,
  getChatUnreadCount,
  markChatAsRead,
  setActiveViewingChatId,
  initGlobalUnreadTracking,
} from '../lib/unreadMessagesService';

export interface UseUnreadMessagesResult {
  unreadMap: Record<string, number>;
  totalUnread: number;
  getChatUnread: (chatId: string) => number;
  markAsRead: (chatId: string) => void;
  setActiveChat: (chatId: string | null) => void;
  refresh: () => void;
}

export function useUnreadMessages(): UseUnreadMessagesResult {
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(() => getAllUnreadCounts());
  const [totalUnread, setTotalUnread] = useState<number>(() => getTotalUnreadCount());

  const refresh = useCallback(() => {
    const counts = getAllUnreadCounts();
    const total = getTotalUnreadCount();
    setUnreadMap(counts);
    setTotalUnread(total);
  }, []);

  useEffect(() => {
    // 1. Initialize global listener singleton if not running
    const cleanupTracking = initGlobalUnreadTracking();

    // 2. Local state sync listener for unread updates
    const handleUnreadChange = (e: any) => {
      if (e?.detail) {
        setUnreadMap(e.detail.unreadMap || {});
        setTotalUnread(typeof e.detail.totalUnread === 'number' ? e.detail.totalUnread : 0);
      } else {
        refresh();
      }
    };

    window.addEventListener('asron_unread_messages_change', handleUnreadChange);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('asron_unread_messages_change', handleUnreadChange);
      window.removeEventListener('storage', refresh);
      cleanupTracking();
    };
  }, [refresh]);

  const handleMarkAsRead = useCallback((chatId: string) => {
    markChatAsRead(chatId);
    setUnreadMap((prev) => {
      if (!prev[chatId]) return prev;
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    setTotalUnread(getTotalUnreadCount());
  }, []);

  const handleGetChatUnread = useCallback(
    (chatId: string) => {
      return unreadMap[chatId] || 0;
    },
    [unreadMap]
  );

  const handleSetActiveChat = useCallback((chatId: string | null) => {
    setActiveViewingChatId(chatId);
  }, []);

  return {
    unreadMap,
    totalUnread,
    getChatUnread: handleGetChatUnread,
    markAsRead: handleMarkAsRead,
    setActiveChat: handleSetActiveChat,
    refresh,
  };
}

export default useUnreadMessages;
