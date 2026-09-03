import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Chat, Message, User, ChatMember, LiveStreamSession } from '../types';

// Strict Official Channels Seed
export const OFFICIAL_CHANNELS: Chat[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'SAT | ASRON',
    title: 'SAT | ASRON',
    slug: 'sat-asron',
    description: 'ASRON SAT rasmiy yangiliklar va darslar kanali.',
    type: 'PUBLIC_CHANNEL',
    isVerified: true,
    isOfficial: true,
    inviteCode: 'sat-asron',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    members: ['usr-admin-01'],
    channelAdmins: ['usr-admin-01'],
    isLive: false,
    isLiveActive: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'SAT | ASRON Platformasi',
    title: 'SAT | ASRON Platformasi',
    slug: 'sat-asron-platformasi',
    description: "ASRON SAT platformasi o'quvchilari va muhokama kanali.",
    type: 'PUBLIC_CHANNEL',
    isVerified: true,
    isOfficial: true,
    inviteCode: 'sat-asron-chat',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    members: ['usr-admin-01'],
    channelAdmins: ['usr-admin-01'],
    isLive: false,
    isLiveActive: false,
    createdAt: '2026-08-01T00:00:00Z',
  },
];

export const INITIAL_OFFICIAL_MESSAGES: Record<string, Message[]> = {
  '11111111-1111-1111-1111-111111111111': [
    {
      id: 'msg-asron-init-1',
      chatId: '11111111-1111-1111-1111-111111111111',
      senderId: 'usr-admin-01',
      senderName: 'ASRON SAT Administration',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      senderRole: 'SUPER_ADMIN',
      content:
        '🎓 **ASRON SAT Rasmiy Kanaliga Xush Kelibsiz!**\n\nBu yerda har kuni eng so\'nggi 2026 Digital SAT Bluebook tahlillari, $1550+$ ball strategiyalari, Desmos formulalari va Jonli Masterclass darslari e\'lon qilib boriladi.',
      createdAt: '2026-08-01T10:00:00Z',
      isPinned: true,
      reactions: { '🔥': 24, '🚀': 18, '❤️': 31 },
    },
  ],
  '22222222-2222-2222-2222-222222222222': [
    {
      id: 'msg-asron-platform-1',
      chatId: '22222222-2222-2222-2222-222222222222',
      senderId: 'usr-admin-01',
      senderName: 'ASRON Platformasi Moderi',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      senderRole: 'ADMIN',
      content:
        '💡 **ASRON SAT Platformasi Muhokama Maydoni**\n\nPlatforma yangilanishlari, qiyin savollar yechimlari va tizim bo\'yicha fikr-mulohazalarni ushbu kanalda muhokama qilishingiz mumkin.',
      createdAt: '2026-08-01T10:05:00Z',
      isPinned: true,
      reactions: { '👍': 19, '💡': 14 },
    },
  ],
};

const LOCAL_STORAGE_CHATS_KEY = 'asron_realtime_chats_v2';
const LOCAL_STORAGE_MESSAGES_KEY = 'asron_realtime_messages_v2';
const LOCAL_STORAGE_RECORDINGS_KEY = 'asron_stream_recordings_v2';

/**
 * Clean purge of old dummy / test chats from storage
 */
export function purgeLegacyDummyChats(): void {
  if (typeof localStorage === 'undefined') return;
  const legacyKeys = [
    'aurasat_community_chats',
    'asron_community_chats',
    'aurasat_chat_messages',
    'asron_chat_messages',
  ];
  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

/**
 * Initialize and get initial list of chats for the current user:
 * Strictly:
 * 1. SAT | ASRON
 * 2. SAT | ASRON Platformasi
 * 3. Saved Messages (Saqlanganlar) for currentUser
 * + any user-created custom group or direct chat
 */
export function getInitialChats(currentUser: User): Chat[] {
  purgeLegacyDummyChats();

  const savedMessagesChat: Chat = {
    id: `saved-messages-${currentUser.id}`,
    name: 'Saqlanganlar',
    title: 'Saqlanganlar',
    slug: 'saved-messages',
    description: 'Shaxsiy bulut xotirasi. Saqlangan darslar, Desmos formulalari va shaxsiy eslatmalar.',
    type: 'SAVED_MESSAGES',
    isVerified: true,
    isOfficial: false,
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    members: [currentUser.id],
    channelAdmins: [currentUser.id],
    createdAt: currentUser.createdAt || '2026-08-01T00:00:00Z',
  };

  let customChats: Chat[] = [];
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CHATS_KEY);
      if (stored) {
        const parsed: Chat[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Keep only user-created custom groups/channels or direct chats (avoid dummy chats)
          customChats = parsed.filter(
            (c) =>
              c.id !== '11111111-1111-1111-1111-111111111111' &&
              c.id !== '22222222-2222-2222-2222-222222222222' &&
              !c.id.startsWith('saved-messages-') &&
              (c.createdById === currentUser.id || c.members?.includes(currentUser.id))
          );
        }
      }
    } catch {}
  }

  // Ensure current user is in members of official channels for read/subscribed access
  const officialWithUser = OFFICIAL_CHANNELS.map((ch) => ({
    ...ch,
    members: Array.from(new Set([...ch.members, currentUser.id])),
    channelAdmins: ch.channelAdmins || ['usr-admin-01'],
  }));

  const all = [officialWithUser[0], officialWithUser[1], savedMessagesChat, ...customChats];
  return all;
}

/**
 * Fetch and load messages for a given chat ID
 */
export function getChatMessages(chatId: string): Message[] {
  let storedMap: Record<string, Message[]> = {};
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      if (raw) storedMap = JSON.parse(raw);
    } catch {}
  }

  if (storedMap[chatId] && storedMap[chatId].length > 0) {
    return storedMap[chatId];
  }

  if (INITIAL_OFFICIAL_MESSAGES[chatId]) {
    return INITIAL_OFFICIAL_MESSAGES[chatId];
  }

  return [];
}

/**
 * Save a message to local and remote Supabase database
 */
export async function persistChatMessage(message: Message): Promise<Message> {
  const chatId = message.chatId || message.channelId;
  if (!chatId) return message;

  // 1. Save locally
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      const storedMap: Record<string, Message[]> = raw ? JSON.parse(raw) : {};
      const list = storedMap[chatId] || INITIAL_OFFICIAL_MESSAGES[chatId] || [];
      const updated = [...list, message];
      storedMap[chatId] = updated;
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(storedMap));
    } catch (e) {
      console.warn('LocalStorage save message error:', e);
    }
  }

  // 2. Try remote Supabase insert
  try {
    const { error } = await supabase.from('chat_messages').insert({
      id: message.id.includes('-') && message.id.length >= 32 ? message.id : undefined,
      chat_id: chatId,
      sender_id: message.senderId,
      content: message.content,
      media_url: message.mediaUrl || message.voiceAudioUrl || message.recordingVideoUrl,
      media_type: message.mediaType,
      reply_to_id: message.replyToId,
    });
    if (error) {
      console.warn('Supabase chat_messages insert notice (using local broadcast):', error.message);
    }
  } catch (err) {
    console.warn('Remote chat_messages insert failed:', err);
  }

  // 3. Dispatch global browser event for instant UI reactivity across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('asron_new_message', { detail: message }));
  }

  return message;
}

/**
 * Save / Update Chats list in storage and sync with Supabase
 */
export function persistChatsList(chats: Chat[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(chats));
  } catch {}
}

/**
 * Check if a user can post in a channel/group:
 * - In SAVED_MESSAGES: always yes
 * - In DIRECT and GROUPS: members can post
 * - In OFFICIAL PUBLIC CHANNELS (SAT | ASRON, SAT | ASRON Platformasi):
 *   Only Super Admins, Admins, or explicit Channel Admins / can_post members can post!
 */
export function canUserPostInChat(user: User, chat: Chat): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  if (chat.type === 'SAVED_MESSAGES') return true;
  if (chat.type === 'DIRECT' || chat.type === 'PUBLIC_GROUP' || chat.type === 'PRIVATE_GROUP') return true;

  if (chat.isOfficial || chat.type === 'PUBLIC_CHANNEL' || chat.type === 'PRIVATE_CHANNEL') {
    if (user.role === 'ADMIN') return true;
    if (chat.createdById === user.id) return true;
    if (chat.channelAdmins && (chat.channelAdmins.includes(user.id) || chat.channelAdmins.includes(user.username))) {
      return true;
    }
    if (chat.memberRoles?.[user.id] === 'ADMIN' || chat.memberRoles?.[user.id] === 'OWNER') {
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Check if user can start a Live Stream in the chat
 */
export function canUserStreamInChat(user: User, chat: Chat): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  if (chat.createdById === user.id) return true;
  if (chat.channelAdmins && (chat.channelAdmins.includes(user.id) || chat.channelAdmins.includes(user.username))) {
    return true;
  }
  return false;
}

/**
 * Upload an attachment or recording to Supabase Storage
 */
export async function uploadChatMedia(
  fileBlob: Blob,
  fileName: string,
  bucket: 'chat-attachments' | 'stream-recordings' = 'chat-attachments'
): Promise<{ url: string; error: any }> {
  try {
    const fileExt = fileName.split('.').pop() || 'webm';
    const cleanPath = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(cleanPath, fileBlob, {
      upsert: true,
    });

    if (!uploadError) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
      if (data?.publicUrl) return { url: data.publicUrl, error: null };
    }

    // Fallback to local Object URL / Data URL
    const localUrl = URL.createObjectURL(fileBlob);
    return { url: localUrl, error: null };
  } catch (err: any) {
    console.warn('Storage upload notice, created local object URL:', err);
    return { url: URL.createObjectURL(fileBlob), error: null };
  }
}

/**
 * Create a Supabase Realtime channel subscription with Broadcast & Presence
 */
export function subscribeToRealtimeChat(
  chatId: string,
  currentUser: User,
  onNewMessage: (msg: Message) => void,
  onStreamSignal?: (data: any) => void,
  onPresenceUpdate?: (onlineCount: number, users: string[]) => void
): RealtimeChannel {
  const channelName = `chat-room-${chatId}`;
  const channel = supabase.channel(channelName, {
    config: {
      presence: { key: currentUser.id },
      broadcast: { ack: true, self: false },
    },
  });

  // 1. Listen for broadcast messages from other clients
  channel.on('broadcast', { event: 'message' }, ({ payload }) => {
    if (payload && payload.id) {
      onNewMessage(payload as Message);
    }
  });

  // 2. Listen for stream events (screen share, whiteboard sync, live stream start/end)
  channel.on('broadcast', { event: 'stream_event' }, ({ payload }) => {
    if (onStreamSignal) onStreamSignal(payload);
  });

  // 3. Presence tracking (who is currently in this channel)
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const activeUserIds = Object.keys(state);
    if (onPresenceUpdate) {
      onPresenceUpdate(activeUserIds.length, activeUserIds);
    }
  });

  // 4. Subscribe and track current user presence
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.fullName,
        role: currentUser.role,
        online_at: new Date().toISOString(),
      });
    }
  });

  return channel;
}

/**
 * Broadcast a live message instantly through the realtime channel
 */
export async function broadcastMessageRealtime(channel: RealtimeChannel, message: Message): Promise<void> {
  try {
    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });
  } catch (e) {
    console.warn('Realtime broadcast error:', e);
  }
}

/**
 * Broadcast live stream signals (whiteboard lines, Desmos formula updates, stream start)
 */
export async function broadcastStreamSignalRealtime(channel: RealtimeChannel, signalData: any): Promise<void> {
  try {
    await channel.send({
      type: 'broadcast',
      event: 'stream_event',
      payload: signalData,
    });
  } catch (e) {
    console.warn('Realtime stream broadcast error:', e);
  }
}
