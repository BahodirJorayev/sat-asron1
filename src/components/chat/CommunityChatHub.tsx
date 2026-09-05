import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Pencil,
  Users,
  Radio,
  Bookmark,
  MessageSquare,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  MicOff,
  Send,
  Check,
  CheckCheck,
  Pin,
  Lock,
  Unlock,
  Play,
  Pause,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Share2,
  Trash2,
  CornerUpLeft,
  Volume2,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  UserPlus,
  BarChart2,
  Eye,
  Info,
  Edit2,
  Forward,
  CornerDownRight,
  Loader2,
  Globe
} from 'lucide-react';
import {
  Chat,
  Message,
  User,
  ChatType,
  Question,
  LiveStreamSession,
  InteractivePoll
} from '../../types';
import { KaTeXRenderer } from '../KaTeXRenderer';
import { RichTextRenderer } from './RichTextRenderer';
import { CreateEntityModal } from './CreateEntityModal';
import { MediaCaptionModal } from './MediaCaptionModal';
import { ChannelInfoDrawer } from './ChannelInfoDrawer';
import { ForwardMessageModal } from './ForwardMessageModal';
import { LiveStreamStudio } from './LiveStreamStudio';
import { InviteLinkModal } from '../InviteLinkModal';
import { EntityAvatar } from './EntityAvatar';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import {
  searchGlobalCommunity,
  joinChannelByToken,
  fetchChannelByUsername,
  SearchUserResult,
  SearchChannelResult,
  GlobalCommunitySearchResults
} from '../../lib/communityApi';
import {
  getInitialChats,
  getChatMessages,
  persistChatMessage,
  persistChatsList,
  canUserPostInChat,
  canUserStreamInChat,
  subscribeToRealtimeChat,
  broadcastMessageRealtime,
  uploadChatMedia,
  editChatMessage,
  deleteChatMessage
} from '../../lib/chatRealtimeService';

interface Props {
  currentUser: User;
  usersList?: User[];
  onOpenQuestionInBank?: (questionId: string) => void;
  onSelectUserProfile?: (selectedUser: User) => void;
}

export const CommunityChatHub: React.FC<Props> = ({
  currentUser,
  usersList = [],
  onOpenQuestionInBank,
  onSelectUserProfile,
}) => {
  // 1. Initial State Initialization & Clean Baseline Chats
  const [chats, setChats] = useState<Chat[]>(() => getInitialChats(currentUser));
  const [activeChatId, setActiveChatId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [isMobileChatViewOpen, setIsMobileChatViewOpen] = useState<boolean>(false);
  const [activeTabFolder, setActiveTabFolder] = useState<
    'ALL' | 'DIRECT' | 'GROUPS' | 'CHANNELS' | 'SAVED'
  >('ALL');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GlobalCommunitySearchResults | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [previewChannel, setPreviewChannel] = useState<SearchChannelResult | null>(null);
  const [isJoiningChannel, setIsJoiningChannel] = useState<boolean>(false);
  const searchDebounceRef = useRef<any>(null);

  // 2. Active Chat & Messages
  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || chats[0];
  }, [chats, activeChatId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

  // 3. Modals & Drawers
  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState<boolean>(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);

  // 4. Voice Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<any>(null);

  // 5. Live Stream Studio Trigger
  const [isLiveStudioOpen, setIsLiveStudioOpen] = useState<boolean>(false);

  // 6. Online Presence Count & User IDs
  const [onlinePresenceCount, setOnlinePresenceCount] = useState<number>(1);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([currentUser.id]);

  // 7. Media Attachment & Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // FIX 1: Pinned to top-level viewport upon navigating (prevents page jump to footer)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  // Load messages whenever activeChatId changes
  useEffect(() => {
    if (activeChat) {
      const initialMsgs = getChatMessages(activeChat.id);
      setMessages(initialMsgs);
      setReplyingTo(null);
      setEditingMessage(null);
    }
  }, [activeChat?.id]);

  // Realtime Supabase Subscription
  useEffect(() => {
    if (!activeChat) return;

    const channel = subscribeToRealtimeChat(
      activeChat.id,
      currentUser,
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      },
      (streamSignal) => {
        if (streamSignal?.type === 'STREAM_STARTED') {
          setChats((prev) =>
            prev.map((c) => (c.id === activeChat.id ? { ...c, isLiveActive: true, isLive: true } : c))
          );
        } else if (streamSignal?.type === 'STREAM_ENDED') {
          setChats((prev) =>
            prev.map((c) => (c.id === activeChat.id ? { ...c, isLiveActive: false, isLive: false } : c))
          );
        }
      },
      (count, userIds) => {
        setOnlinePresenceCount(Math.max(1, count));
        if (userIds && userIds.length > 0) {
          setOnlineUserIds(userIds);
        }
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [activeChat?.id, currentUser.id]);

  // FIX 2: Isolated scroll inside message container (no whole-window jump!)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // 300ms Debounced Global Search (Supabase Profiles + Users + Public Channels + Local Fallbacks)
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchGlobalCommunity(globalSearchQuery, usersList, chats);
        setSearchResults(results);
      } catch (err) {
        console.warn('Global search notice:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [globalSearchQuery, usersList, chats]);

  // Handle Telegram-style URL params (?c=@username, ?join=token, /chat/join/:token)
  useEffect(() => {
    const handleUrlDeepLink = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      let channelUsername = urlParams.get('c');
      let joinToken = urlParams.get('join');

      // Check pathname: /chat/join/[token] or /join/[token]
      const path = window.location.pathname;
      if (path.includes('/chat/join/')) {
        const parts = path.split('/chat/join/');
        if (parts[1]) joinToken = parts[1].split('/')[0].split('?')[0];
      } else if (path.includes('/join/')) {
        const parts = path.split('/join/');
        if (parts[1]) joinToken = parts[1].split('/')[0].split('?')[0];
      }

      // Check hash query params: #/community?c=@username or #/community?join=token
      if (window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        if (!channelUsername) channelUsername = hashParams.get('c');
        if (!joinToken) joinToken = hashParams.get('join');
      }

      if (joinToken) {
        const res = await joinChannelByToken(joinToken, currentUser, chats);
        if (res.success && res.channel) {
          setChats((prev) => {
            if (prev.some((c) => c.id === res.channel!.id)) {
              return prev.map((c) => (c.id === res.channel!.id ? res.channel! : c));
            }
            return [res.channel!, ...prev];
          });
          persistChatsList([res.channel, ...chats]);
          setActiveChatId(res.channel.id);
          setIsMobileChatViewOpen(true);
        }
      } else if (channelUsername) {
        const cleanUser = channelUsername.replace(/^@/, '').toLowerCase();
        const localMatch = chats.find(
          (c) => c.username?.toLowerCase() === cleanUser || c.slug?.toLowerCase() === cleanUser
        );
        if (localMatch) {
          setActiveChatId(localMatch.id);
          setIsMobileChatViewOpen(true);
        } else {
          const remote = await fetchChannelByUsername(cleanUser);
          if (remote) {
            setChats((prev) => [remote, ...prev]);
            persistChatsList([remote, ...chats]);
            setActiveChatId(remote.id);
            setIsMobileChatViewOpen(true);
          }
        }
      }
    };

    handleUrlDeepLink();
  }, [currentUser.id]);

  // Listen for asron_open_chat event (e.g. from InviteCard join button)
  useEffect(() => {
    const handleOpenChatEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.chat) {
        setChats((prev) => {
          if (prev.some((c) => c.id === detail.chat.id)) {
            return prev.map((c) => (c.id === detail.chat.id ? detail.chat : c));
          }
          return [detail.chat, ...prev];
        });
        persistChatsList([detail.chat, ...chats]);
      }
      if (detail.chatId) {
        setActiveChatId(detail.chatId);
        setIsMobileChatViewOpen(true);
      }
    };

    window.addEventListener('asron_open_chat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('asron_open_chat', handleOpenChatEvent);
    };
  }, [chats]);

  // Select User from Search Results (Open or create Direct Message)
  const handleSelectUserFromSearch = (userItem: SearchUserResult) => {
    const existingDm = chats.find(
      (c) =>
        c.type === 'DIRECT' &&
        (c.members?.includes(userItem.id) ||
          c.id === `dm_${currentUser.id}_${userItem.id}` ||
          c.id === `dm_${userItem.id}_${currentUser.id}` ||
          c.userId === userItem.id)
    );

    if (existingDm) {
      setActiveChatId(existingDm.id);
    } else {
      const newDmChat: Chat = {
        id: `dm_${currentUser.id}_${userItem.id}`,
        name: userItem.fullName,
        title: userItem.fullName,
        type: 'DIRECT',
        username: userItem.username,
        members: [currentUser.id, userItem.id],
        isPublic: false,
        avatarUrl: userItem.avatarUrl,
        createdAt: new Date().toISOString(),
      };
      const updatedChats = [newDmChat, ...chats];
      setChats(updatedChats);
      persistChatsList(updatedChats);
      setActiveChatId(newDmChat.id);
    }

    setGlobalSearchQuery('');
    setSearchResults(null);
    setIsMobileChatViewOpen(true);
  };

  // Select Channel from Search Results (Open if member, or preview to join)
  const handleSelectChannelFromSearch = (channelItem: SearchChannelResult) => {
    const existing = chats.find(
      (c) =>
        c.id === channelItem.id ||
        (channelItem.username && c.username?.toLowerCase() === channelItem.username.toLowerCase())
    );

    if (existing) {
      setActiveChatId(existing.id);
      setGlobalSearchQuery('');
      setSearchResults(null);
      setIsMobileChatViewOpen(true);
    } else {
      setPreviewChannel(channelItem);
    }
  };

  // Join Channel from Preview Modal
  const handleJoinPreviewChannel = async () => {
    if (!previewChannel) return;
    setIsJoiningChannel(true);
    try {
      const res = await joinChannelByToken(
        previewChannel.inviteToken || previewChannel.username || previewChannel.id,
        currentUser,
        chats
      );
      if (res.success && res.channel) {
        setChats((prev) => {
          if (prev.some((c) => c.id === res.channel!.id)) {
            return prev.map((c) => (c.id === res.channel!.id ? res.channel! : c));
          }
          return [res.channel!, ...prev];
        });
        persistChatsList([res.channel, ...chats]);
        setActiveChatId(res.channel.id);
        setPreviewChannel(null);
        setGlobalSearchQuery('');
        setSearchResults(null);
        setIsMobileChatViewOpen(true);
      }
    } catch (err) {
      console.error('Join channel error:', err);
    } finally {
      setIsJoiningChannel(false);
    }
  };

  // Filtered Chats by Folder & Search
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      // 1. Search Query
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        const matchesSlug = c.slug?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSlug) return false;
      }

      // 2. Folder Tabs
      if (activeTabFolder === 'SAVED') return c.type === 'SAVED_MESSAGES';
      if (activeTabFolder === 'DIRECT') return c.type === 'DIRECT';
      if (activeTabFolder === 'GROUPS') return c.type === 'PUBLIC_GROUP' || c.type === 'PRIVATE_GROUP';
      if (activeTabFolder === 'CHANNELS')
        return c.type === 'PUBLIC_CHANNEL' || c.type === 'PRIVATE_CHANNEL';

      return true;
    });
  }, [chats, globalSearchQuery, activeTabFolder]);

  // Check if current user can post
  const canPost = useMemo(() => {
    if (!activeChat) return false;
    return canUserPostInChat(currentUser, activeChat);
  }, [currentUser, activeChat]);

  const canStream = useMemo(() => {
    if (!activeChat) return false;
    return canUserStreamInChat(currentUser, activeChat);
  }, [currentUser, activeChat]);

  // Handle Send Message or Save Edit
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    // Handle Edit Mode
    if (editingMessage) {
      const updatedText = messageInput.trim();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessage.id
            ? {
                ...m,
                content: updatedText,
                caption: m.mediaUrl ? updatedText : undefined,
                isEdited: true,
              }
            : m
        )
      );
      await editChatMessage(
        editingMessage.id,
        activeChat.id,
        updatedText,
        editingMessage.mediaUrl ? updatedText : undefined
      );
      setEditingMessage(null);
      setMessageInput('');
      return;
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chatId: activeChat.id,
      channelId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderRole: currentUser.role,
      content: messageInput.trim(),
      replyToId: replyingTo?.id,
      replyToMessage: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            content: replyingTo.caption || replyingTo.content || 'Biriktirilgan fayl',
          }
        : undefined,
      createdAt: new Date().toISOString(),
      reactions: {},
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    setReplyingTo(null);

    // Save & Broadcast
    await persistChatMessage(newMsg);
  };

  // Voice Note Recorder Engine
  const handleToggleVoiceRecord = async () => {
    if (isRecordingVoice) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      clearInterval(voiceTimerRef.current);
      setIsRecordingVoice(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          voiceChunksRef.current = [];
          const recorder = new MediaRecorder(stream);

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) voiceChunksRef.current.push(e.data);
          };

          recorder.onstop = async () => {
            const audioBlob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
            const uploadRes = await uploadChatMedia(
              audioBlob,
              `voice-${Date.now()}.webm`,
              'community-media'
            );

            const voiceMsg: Message = {
              id: `msg-voice-${Date.now()}`,
              chatId: activeChat.id,
              channelId: activeChat.id,
              senderId: currentUser.id,
              senderName: currentUser.fullName,
              senderAvatar: currentUser.avatarUrl,
              senderRole: currentUser.role,
              mediaType: 'voice',
              voiceAudioUrl: uploadRes.url,
              voiceDuration: voiceSeconds || 5,
              content: 'Ovozli xabar',
              createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, voiceMsg]);
            await persistChatMessage(voiceMsg);
            setVoiceSeconds(0);
            stream.getTracks().forEach((t) => t.stop());
          };

          recorder.start();
          mediaRecorderRef.current = recorder;
          setIsRecordingVoice(true);
          setVoiceSeconds(0);
          voiceTimerRef.current = setInterval(() => {
            setVoiceSeconds((prev) => prev + 1);
          }, 1000);
        }
      } catch (err) {
        console.warn('Microphone permission notice:', err);
      }
    }
  };

  // Pick file -> open MediaCaptionModal for Rich Caption
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingUploadFile(file);
    }
    e.target.value = '';
  };

  // Upload file + rich caption
  const handleSendMediaWithCaption = async (file: File, caption: string) => {
    if (!activeChat) return;
    const isImg = file.type.startsWith('image/');
    const uploadRes = await uploadChatMedia(file, file.name, 'community-media');

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chatId: activeChat.id,
      channelId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderRole: currentUser.role,
      content: caption || file.name,
      caption: caption || undefined,
      mediaUrl: uploadRes.url,
      mediaType: isImg ? 'image' : 'document',
      mediaName: file.name,
      replyToId: replyingTo?.id,
      replyToMessage: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            content: replyingTo.caption || replyingTo.content || 'Biriktirilgan fayl',
          }
        : undefined,
      createdAt: new Date().toISOString(),
      reactions: {},
    };

    setMessages((prev) => [...prev, newMsg]);
    setPendingUploadFile(null);
    setReplyingTo(null);
    await persistChatMessage(newMsg);
  };

  // Edit Message
  const handleStartEdit = (msg: Message) => {
    setEditingMessage(msg);
    setMessageInput(msg.caption || msg.content || '');
    setReplyingTo(null);
  };

  // Delete Message
  const handleDeleteMessage = async (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    if (activeChat) {
      await deleteChatMessage(msgId, activeChat.id);
    }
  };

  // Forward Message
  const handleForwardMessage = async (targetChatId: string, msg: Message) => {
    const forwardedMsg: Message = {
      ...msg,
      id: `msg-fwd-${Date.now()}`,
      chatId: targetChatId,
      channelId: targetChatId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    if (targetChatId === activeChat?.id) {
      setMessages((prev) => [...prev, forwardedMsg]);
    }
    await persistChatMessage(forwardedMsg);
  };

  // Create new custom entity (Channel, Group public/private, Direct)
  const handleCreateNewEntity = (data: {
    name: string;
    username?: string;
    inviteToken?: string;
    isPublic?: boolean;
    description: string;
    type: ChatType;
    avatarUrl?: string;
    targetUserId?: string;
  }) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: data.name,
      title: data.name,
      slug: data.username || data.name.toLowerCase().replace(/\s+/g, '-'),
      username: data.username,
      inviteToken: data.inviteToken,
      isPublic: data.isPublic !== false,
      description: data.description,
      type: data.type,
      isVerified: false,
      isOfficial: false,
      avatarUrl: data.avatarUrl || undefined,
      members: data.targetUserId
        ? [currentUser.id, data.targetUserId]
        : [currentUser.id],
      channelAdmins: [currentUser.id],
      createdById: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const nextChats = [newChat, ...chats];
    setChats(nextChats);
    persistChatsList(nextChats);
    setActiveChatId(newChat.id);
    setIsCreateChatModalOpen(false);
  };

  // Update Chat Metadata (Avatar, Name, Desc)
  const handleUpdateChatMetadata = (updated: Partial<Chat>) => {
    const next = chats.map((c) => (c.id === activeChat.id ? { ...c, ...updated } : c));
    setChats(next);
    persistChatsList(next);
  };

  return (
    <div className="h-full w-full flex bg-slate-50 dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans overflow-hidden select-none border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-2xl shadow-xs">
      {/* ============================================================= */}
      {/* 1. LEFT SIDEBAR: FOLDERS & CLEAN CHATS LIST                   */}
      {/* ============================================================= */}
      <aside
        className={`${
          isMobileChatViewOpen ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 bg-white dark:bg-[#121A2F] border-r border-[#E2E8F0] dark:border-[#1E293B] flex-col shrink-0 overflow-hidden`}
      >
        {/* Top Hub Bar */}
        <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Qidiruv (@username, kanal yoki ism)..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setGlobalSearchQuery('');
                  setSearchResults(null);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCreateChatModalOpen(true)}
            className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] hover:bg-[#E2E8F0] dark:hover:bg-[#1A233A] border border-[#E2E8F0] dark:border-[#1E293B] text-[#E07A5F] transition-colors cursor-pointer"
            title="Yangi Muloqot Yaratish (Kanal / Guruh / Shaxsiy)"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Dropdown Overlay or Feed */}
        {globalSearchQuery.trim() ? (
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 font-sans">
            {isSearching ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-[#64748B] dark:text-[#94A3B8] gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#E07A5F]" />
                <span className="text-xs font-mono">Qidirilmoqda...</span>
              </div>
            ) : searchResults && (searchResults.users.length > 0 || searchResults.channels.length > 0) ? (
              <>
                {/* 1. USERS PARTITION */}
                {searchResults.users.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="px-2 py-1 text-[11px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#E07A5F]" />
                        <span>Odamlar (Foydalanuvchilar)</span>
                      </span>
                      <span className="text-[10px] opacity-75">{searchResults.users.length}</span>
                    </div>

                    <div className="space-y-0.5">
                      {searchResults.users.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUserFromSearch(u)}
                          className="p-2.5 rounded-xl flex items-center gap-3 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer transition-colors"
                        >
                          <EntityAvatar
                            name={u.fullName}
                            avatarUrl={u.avatarUrl}
                            size="md"
                            shape="circle"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate text-[#0F172A] dark:text-[#F8FAFC]">
                              {u.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-[#E07A5F] truncate">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. CHANNELS & GROUPS PARTITION */}
                {searchResults.channels.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                    <div className="px-2 py-1 text-[11px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-500" />
                        <span>Ommaviy Guruhlar & Kanallar</span>
                      </span>
                      <span className="text-[10px] opacity-75">{searchResults.channels.length}</span>
                    </div>

                    <div className="space-y-0.5">
                      {searchResults.channels.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => handleSelectChannelFromSearch(ch)}
                          className="p-2.5 rounded-xl flex items-center gap-3 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer transition-colors"
                        >
                          <EntityAvatar
                            name={ch.name}
                            avatarUrl={ch.avatarUrl}
                            size="md"
                            shape="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1">
                              <span>{ch.name}</span>
                              {ch.isVerified && (
                                <CheckCircle2 className="w-3 h-3 text-[#E07A5F] shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                              {ch.username && (
                                <span className="text-[#E07A5F]">@{ch.username}</span>
                              )}
                              {ch.membersCount && (
                                <span>{ch.membersCount} a'zo</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center space-y-1 text-[#64748B] dark:text-[#94A3B8]">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Natija topilmadi
                </div>
                <div className="text-[11px] font-mono">
                  Foydalanuvchi yoki ommaviy kanal nomini tekshiring
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Folder Tabs Strip */}
            <div className="px-3 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono">
              {[
                { id: 'ALL', label: 'Barchasi' },
                { id: 'CHANNELS', label: 'Kanallar' },
                { id: 'GROUPS', label: 'Guruhlar' },
                { id: 'DIRECT', label: 'Shaxsiy' },
                { id: 'SAVED', label: 'Saqlanganlar' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabFolder(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    activeTabFolder === tab.id
                      ? 'bg-[#E07A5F] text-white font-bold shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chats Feed */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-[#E2E8F0] dark:divide-[#1E293B]/40">
              {filteredChats.map((chat) => {
                const isSelected = chat.id === activeChat?.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setIsMobileChatViewOpen(true);
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {/* Chat Avatar with Live Ring */}
                    <div className="relative shrink-0">
                      <EntityAvatar
                        name={chat.name}
                        avatarUrl={chat.avatarUrl}
                        size="md"
                        shape={chat.type === 'DIRECT' ? 'circle' : 'rounded'}
                      />
                      {chat.isLiveActive && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white dark:border-[#121A2F]"></span>
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                          <span>{chat.name}</span>
                          {chat.username && (
                            <span className="text-[10px] font-mono text-[#E07A5F] font-normal">
                              @{chat.username}
                            </span>
                          )}
                          {chat.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                          )}
                        </h4>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          {chat.lastMessage?.createdAt
                            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                        {chat.lastMessage?.content || chat.description || 'Muloqot boshlanmadi'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </aside>

      {/* ============================================================= */}
      {/* 2. MAIN ACTIVE CHAT VIEWPORT                                  */}
      {/* ============================================================= */}
      <main
        className={`${
          isMobileChatViewOpen ? 'flex' : 'hidden md:flex'
        } flex-1 flex flex-col bg-slate-50 dark:bg-[#0A0F1D] overflow-hidden relative min-w-0`}
      >
        {activeChat ? (
          <>
            {/* 1. Top Pinned Header (flex-shrink-0 h-12) */}
            <ChatHeader
              chat={activeChat}
              onBack={() => setIsMobileChatViewOpen(false)}
              onlinePresenceCount={onlinePresenceCount}
              canStream={canStream}
              onStartLive={() => setIsLiveStudioOpen(true)}
              onShareInvite={() => setIsInviteModalOpen(true)}
              onToggleInfo={() => setIsChannelInfoOpen((prev) => !prev)}
              isInfoOpen={isChannelInfoOpen}
            />

            {/* Active Live Stream Sticky Banner */}
            {activeChat.isLiveActive && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-rose-950/80 to-[#121A2F] border-b border-rose-900/60 flex items-center justify-between text-xs font-mono shrink-0">
                <div className="flex items-center gap-2 text-rose-300">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="font-bold">Jonli Dars Efirda</span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] hidden sm:inline">| Masterclass olib borilmoqda</span>
                </div>
                <button
                  onClick={() => setIsLiveStudioOpen(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                >
                  Efirga Qo'shilish →
                </button>
              </div>
            )}

            {/* 2. Middle Scrollable Message Feed */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain space-y-3 bg-slate-50 dark:bg-[#0A0F1D]"
            >
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.senderId === currentUser.id}
                  currentUser={currentUser}
                  onReply={(m) => setReplyingTo(m)}
                  onForward={(m) => setForwardingMessage(m)}
                  onEdit={(m) => handleStartEdit(m)}
                  onDelete={(id) => handleDeleteMessage(id)}
                  onSelectUserProfile={(uid) => {
                    if (onSelectUserProfile) {
                      const found = usersList.find((u) => u.id === uid);
                      if (found) onSelectUserProfile(found);
                    }
                  }}
                  onJoinSuccess={(joinedChat) => {
                    setChats((prev) => {
                      if (prev.some((c) => c.id === joinedChat.id)) {
                        return prev.map((c) => (c.id === joinedChat.id ? joinedChat : c));
                      }
                      return [joinedChat, ...prev];
                    });
                    persistChatsList([joinedChat, ...chats]);
                    setActiveChatId(joinedChat.id);
                  }}
                />
              ))}
            </div>

            {/* 3. Bottom Pinned Composer (pb-16 md:pb-2 so floating BottomNav never obscures input) */}
            <MessageComposer
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
              onPickFile={() => fileInputRef.current?.click()}
              onFilePicked={handleFilePicked}
              fileInputRef={fileInputRef}
              onToggleVoice={handleToggleVoiceRecord}
              isRecordingVoice={isRecordingVoice}
              voiceSeconds={voiceSeconds}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              editingMessage={editingMessage}
              onCancelEdit={() => {
                setEditingMessage(null);
                setMessageInput('');
              }}
              canPost={canPost}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
            Muloqotni boshlash uchun chatni tanlang.
          </div>
        )}
      </main>

      {/* ============================================================= */}
      {/* 3. RIGHT SIDEBAR: CHANNEL METRICS, METADATA & MEMBERS DRAWER */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isChannelInfoOpen && activeChat && (
          <ChannelInfoDrawer
            isOpen={isChannelInfoOpen}
            chat={activeChat}
            currentUser={currentUser}
            usersList={usersList}
            onlineUserIds={onlineUserIds}
            onClose={() => setIsChannelInfoOpen(false)}
            onUpdateChat={handleUpdateChatMetadata}
          />
        )}
      </AnimatePresence>

      {/* Telegram-style Create Entity Modal (Channel, Group public/private, Direct) */}
      <AnimatePresence>
        {isCreateChatModalOpen && (
          <CreateEntityModal
            isOpen={isCreateChatModalOpen}
            currentUser={currentUser}
            usersList={usersList}
            onClose={() => setIsCreateChatModalOpen(false)}
            onCreateChat={handleCreateNewEntity}
          />
        )}
      </AnimatePresence>

      {/* Rich Media Caption Attachment Modal */}
      <AnimatePresence>
        {pendingUploadFile && (
          <MediaCaptionModal
            file={pendingUploadFile}
            onSend={handleSendMediaWithCaption}
            onCancel={() => setPendingUploadFile(null)}
          />
        )}
      </AnimatePresence>

      {/* Forward Message Modal */}
      <AnimatePresence>
        {forwardingMessage && (
          <ForwardMessageModal
            isOpen={!!forwardingMessage}
            messageToForward={forwardingMessage}
            chats={chats}
            onClose={() => setForwardingMessage(null)}
            onForward={handleForwardMessage}
          />
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      {isInviteModalOpen && activeChat && (
        <InviteLinkModal
          isOpen={isInviteModalOpen}
          chat={activeChat}
          currentUser={currentUser}
          onClose={() => setIsInviteModalOpen(false)}
          onUpdateChat={handleUpdateChatMetadata}
        />
      )}

      {/* Full-Screen Live Stream Studio */}
      {isLiveStudioOpen && (
        <LiveStreamStudio
          user={currentUser}
          activeChat={activeChat}
          onClose={() => setIsLiveStudioOpen(false)}
          onLessonRecordedAndSaved={(savedMsg, targetChatId) => {
            const destChatId = targetChatId || `saved-messages-${currentUser.id}`;
            persistChatMessage({ ...savedMsg, chatId: destChatId });
          }}
        />
      )}

      {/* Channel Preview & Join Modal */}
      {previewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans select-none">
          <div className="w-full max-w-sm bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-5 text-[#0F172A] dark:text-[#F8FAFC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8]">
                Kanalga a'zo bo'lish
              </span>
              <button
                type="button"
                onClick={() => setPreviewChannel(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 py-2">
              <EntityAvatar
                name={previewChannel.name}
                avatarUrl={previewChannel.avatarUrl}
                size="xl"
                shape="rounded"
              />
              <div className="text-sm font-bold flex items-center gap-1.5 justify-center">
                <span>{previewChannel.name}</span>
                {previewChannel.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[#E07A5F]" />
                )}
              </div>
              {previewChannel.username && (
                <div className="text-xs font-mono text-[#E07A5F]">
                  @{previewChannel.username}
                </div>
              )}
              {previewChannel.description && (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-3">
                  {previewChannel.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewChannel(null)}
                className="flex-1 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#E2E8F0] dark:hover:bg-[#2A3756] cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleJoinPreviewChannel}
                disabled={isJoiningChannel}
                className="flex-1 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-xs font-mono font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isJoiningChannel ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Qo'shilmoqda...</span>
                  </>
                ) : (
                  <span>Qo'shilish</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
