import { supabase } from './supabase';
import { User, Chat, ChatType } from '../types';
import { OFFICIAL_CHANNELS, persistChatsList } from './chatRealtimeService';

export interface SearchUserResult {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

export interface SearchChannelResult {
  id: string;
  name: string;
  username?: string;
  description?: string;
  type: ChatType;
  avatarUrl?: string;
  membersCount?: number;
  isPublic: boolean;
  isVerified?: boolean;
  inviteToken?: string;
}

export interface GlobalCommunitySearchResults {
  users: SearchUserResult[];
  channels: SearchChannelResult[];
}

/**
 * Generates a crypto-safe random hex invite token (32 characters)
 */
export function generateSecureInviteToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `asron_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
}

/**
 * Unified Global Search Engine across Users and Public Channels/Groups.
 * Queries Supabase PostgreSQL with case-insensitive ILIKE and fulltext indexes,
 * and merges with local registered users/chats for zero empty states.
 */
export async function searchGlobalCommunity(
  rawQuery: string,
  localUsers: User[] = [],
  localChats: Chat[] = []
): Promise<GlobalCommunitySearchResults> {
  const cleanQuery = rawQuery.trim().replace(/^@+/, '').replace(/[%(),]/g, '');
  if (!cleanQuery) {
    return { users: [], channels: [] };
  }

  const qLower = cleanQuery.toLowerCase();
  const foundUserIds = new Set<string>();
  const usersResults: SearchUserResult[] = [];

  const foundChannelIds = new Set<string>();
  const channelResults: SearchChannelResult[] = [];

  // 1. Query Remote Supabase for Users (profiles table)
  try {
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role')
      .or(`full_name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`)
      .limit(20);

    if (!profileErr && Array.isArray(profileData)) {
      profileData.forEach((p) => {
        if (!foundUserIds.has(p.id)) {
          const matchName = (p.full_name || '').toLowerCase().includes(qLower);
          const matchUsername = (p.username || '').toLowerCase().includes(qLower);
          if (matchName || matchUsername) {
            foundUserIds.add(p.id);
            usersResults.push({
              id: p.id,
              fullName: p.full_name || p.username || 'Talaba',
              username: p.username || 'user',
              avatarUrl: p.avatar_url,
              role: p.role,
            });
          }
        }
      });
    }
  } catch (err) {
    console.warn('Supabase profiles search notice:', err);
  }

  // 2. Query Remote Supabase for Public Groups & Channels
  try {
    const { data: channelData, error: channelErr } = await supabase
      .from('community_channels')
      .select('*')
      .eq('is_public', true)
      .or(`name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`)
      .limit(15);

    if (!channelErr && Array.isArray(channelData)) {
      channelData.forEach((ch) => {
        // Exclude private channels from global search unless the user is member
        const isPublicEntity = ch.is_public !== false && ch.type !== 'private_group' && ch.type !== 'PRIVATE_GROUP';
        const matchName = (ch.name || '').toLowerCase().includes(qLower);
        const matchUsername = (ch.username || '').toLowerCase().includes(qLower);
        if (isPublicEntity && !foundChannelIds.has(ch.id) && (matchName || matchUsername)) {
          foundChannelIds.add(ch.id);
          channelResults.push({
            id: ch.id,
            name: ch.name || 'Kanal',
            username: ch.username,
            description: ch.description,
            type: (ch.type?.toUpperCase() as ChatType) || 'PUBLIC_CHANNEL',
            avatarUrl: ch.avatar_url,
            inviteToken: ch.invite_token,
            isPublic: true,
          });
        }
      });
    }
  } catch (err) {
    console.warn('Supabase community_channels search notice:', err);
  }

  // 3. Search and merge local/seed Users (strictly matching query)
  localUsers.forEach((u) => {
    if (foundUserIds.has(u.id)) return;
    const matchName = (u.fullName || '').toLowerCase().includes(qLower);
    const matchUser = (u.username || '').toLowerCase().includes(qLower);

    if (matchName || matchUser) {
      foundUserIds.add(u.id);
      usersResults.push({
        id: u.id,
        fullName: u.fullName || u.username,
        username: u.username || 'user',
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: u.role,
      });
    }
  });

  // 4. Search and merge local/seed Public Channels & Groups
  const combinedChats = [...OFFICIAL_CHANNELS, ...localChats];
  combinedChats.forEach((c) => {
    if (foundChannelIds.has(c.id)) return;
    // Strictly only public channels/groups in search
    const isPublic =
      c.isPublic !== false &&
      (c.type === 'PUBLIC_CHANNEL' || c.type === 'PUBLIC_GROUP' || c.isOfficial);

    if (!isPublic) return;

    const matchName = c.name?.toLowerCase().includes(qLower);
    const matchDesc = c.description?.toLowerCase().includes(qLower);
    const matchUser = c.username?.toLowerCase().includes(qLower);
    const matchSlug = c.slug?.toLowerCase().includes(qLower);

    if (matchName || matchDesc || matchUser || matchSlug) {
      foundChannelIds.add(c.id);
      channelResults.push({
        id: c.id,
        name: c.name,
        username: c.username || c.slug,
        description: c.description,
        type: c.type,
        avatarUrl: c.avatarUrl,
        membersCount: c.members?.length || 1,
        isPublic: true,
        isVerified: c.isVerified,
        inviteToken: c.inviteToken || c.inviteCode,
      });
    }
  });

  return {
    users: usersResults.slice(0, 8),
    channels: channelResults.slice(0, 8),
  };
}

/**
 * Join a private or public channel via a secure invite token
 */
export async function joinChannelByToken(
  tokenInput: string,
  currentUser: User,
  existingChats: Chat[] = []
): Promise<{ success: boolean; channel?: Chat; error?: string }> {
  const cleanToken = tokenInput.trim().replace(/^.*\/(?:join|chat)\//, '').replace(/^@/, '');
  if (!cleanToken) {
    return { success: false, error: 'Yaroqsiz taklif kodi' };
  }

  // 1. Try Supabase RPC function
  try {
    const { data: channelId, error: rpcError } = await supabase.rpc('join_channel_by_token', {
      token_input: cleanToken,
    });

    if (!rpcError && channelId) {
      // Fetch channel details
      const { data: ch } = await supabase
        .from('community_channels')
        .select('*')
        .eq('id', channelId)
        .maybeSingle();

      if (ch) {
        const joinedChat: Chat = {
          id: ch.id,
          name: ch.name || ch.title || 'Guruh',
          title: ch.title || ch.name,
          slug: ch.slug || ch.username,
          username: ch.username,
          description: ch.description,
          type: (ch.type?.toUpperCase() as ChatType) || 'PRIVATE_GROUP',
          avatarUrl: ch.avatar_url,
          inviteToken: ch.invite_token,
          inviteCode: ch.invite_code,
          isPublic: ch.is_public,
          members: [currentUser.id],
          channelAdmins: ch.created_by ? [ch.created_by] : [],
          createdById: ch.created_by,
          createdAt: ch.created_at || new Date().toISOString(),
        };

        return { success: true, channel: joinedChat };
      }
    }
  } catch (err) {
    console.warn('RPC join notice, trying direct lookup:', err);
  }

  // 2. Direct Supabase query fallback
  try {
    const { data: ch } = await supabase
      .from('community_channels')
      .select('*')
      .or(`invite_token.eq.${cleanToken},username.eq.${cleanToken}`)
      .maybeSingle();

    if (ch) {
      // Add member to community_members
      await supabase.from('community_members').insert({
        channel_id: ch.id,
        user_id: currentUser.id,
        role: 'member',
      });

      const joinedChat: Chat = {
        id: ch.id,
        name: ch.name || ch.title || 'Guruh',
        title: ch.title || ch.name,
        slug: ch.slug || ch.username,
        username: ch.username,
        description: ch.description,
        type: (ch.type?.toUpperCase() as ChatType) || 'PRIVATE_GROUP',
        avatarUrl: ch.avatar_url,
        inviteToken: ch.invite_token,
        isPublic: ch.is_public,
        members: [currentUser.id],
        channelAdmins: ch.created_by ? [ch.created_by] : [],
        createdById: ch.created_by,
        createdAt: ch.created_at || new Date().toISOString(),
      };

      return { success: true, channel: joinedChat };
    }
  } catch (err) {
    console.warn('Direct query join notice:', err);
  }

  // 3. Fallback to local chats
  const localMatch = existingChats.find(
    (c) =>
      c.inviteToken === cleanToken ||
      c.inviteCode === cleanToken ||
      c.slug === cleanToken ||
      c.username === cleanToken
  );

  if (localMatch) {
    const updatedChat: Chat = {
      ...localMatch,
      members: Array.from(new Set([...(localMatch.members || []), currentUser.id])),
    };
    return { success: true, channel: updatedChat };
  }

  return { success: false, error: 'Taklif havolasi eskirgan yoki topilmadi' };
}

/**
 * Fetch channel details by invite token for rich invite card preview
 */
export async function fetchChannelByInviteToken(token: string): Promise<Chat | null> {
  const clean = token.trim();
  if (!clean) return null;

  try {
    const { data } = await supabase
      .from('community_channels')
      .select('*')
      .eq('invite_token', clean)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        name: data.name || data.title || 'Guruh',
        username: data.username,
        description: data.description,
        type: (data.type?.toUpperCase() as ChatType) || 'PRIVATE_GROUP',
        avatarUrl: data.avatar_url,
        inviteToken: data.invite_token,
        isPublic: data.is_public !== false,
        members: [],
        createdAt: data.created_at || new Date().toISOString(),
      };
    }
  } catch {}

  return null;
}

/**
 * Fetch public channel by @username
 */
export async function fetchChannelByUsername(username: string): Promise<Chat | null> {
  const clean = username.trim().replace(/^@/, '').toLowerCase();
  if (!clean) return null;

  try {
    const { data } = await supabase
      .from('community_channels')
      .select('*')
      .ilike('username', clean)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        name: data.name || data.title || 'Kanal',
        username: data.username,
        description: data.description,
        type: (data.type?.toUpperCase() as ChatType) || 'PUBLIC_CHANNEL',
        avatarUrl: data.avatar_url,
        inviteToken: data.invite_token,
        isPublic: data.is_public !== false,
        members: [],
        createdAt: data.created_at || new Date().toISOString(),
      };
    }
  } catch {}

  return null;
}
