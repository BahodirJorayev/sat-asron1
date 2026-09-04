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
  CornerDownRight
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
    description: string;
    type: ChatType;
    avatarUrl?: string;
    targetUserId?: string;
  }) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: data.name,
      title: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      type: data.type,
      isVerified: false,
      isOfficial: false,
      avatarUrl:
        data.avatarUrl ||
        (data.type === 'DIRECT'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'),
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
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] flex bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] font-sans overflow-hidden select-none border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl">
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
              placeholder="Qidiruv..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
            />
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
        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#1E293B]/40">
          {filteredChats.map((chat) => {
            const isSelected = chat.id === activeChat?.id;
            const isSaved = chat.type === 'SAVED_MESSAGES';

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
                  <img
                    src={
                      chat.avatarUrl ||
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
                    }
                    alt={chat.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-[#E2E8F0] dark:border-[#1E293B]"
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
      </aside>

      {/* ============================================================= */}
      {/* 2. MAIN ACTIVE CHAT VIEWPORT                                  */}
      {/* ============================================================= */}
      <main
        className={`${
          isMobileChatViewOpen ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col bg-white dark:bg-[#0A0F1D] overflow-hidden relative`}
      >
        {activeChat ? (
          <>
            {/* Header */}
            <header className="h-16 px-4 sm:px-6 bg-white dark:bg-[#121A2F] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setIsMobileChatViewOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={
                      activeChat.avatarUrl ||
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
                    }
                    alt={activeChat.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-[#E2E8F0] dark:border-[#1E293B]"
                  />
                  {activeChat.isLiveActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold truncate text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <span>{activeChat.name}</span>
                    {activeChat.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                    )}
                  </h3>
                  <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                    <span>{onlinePresenceCount} nafar onlayn</span>
                    {activeChat.isLiveActive && (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Jonli Efirda
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {canStream && (
                  <button
                    onClick={() => setIsLiveStudioOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Jonli efir boshlash"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden sm:inline">Jonli Efir</span>
                  </button>
                )}

                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                  title="Havola orqali ulashish"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsChannelInfoOpen((prev) => !prev)}
                  className={`p-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] transition-colors cursor-pointer ${
                    isChannelInfoOpen
                      ? 'bg-[#E07A5F] text-white'
                      : 'bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                  title="A'zolar & Kanal Ma'lumotlari"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Active Live Stream Sticky Banner */}
            {activeChat.isLiveActive && (
              <div className="px-4 py-2.5 bg-gradient-to-r from-rose-950/80 to-[#121A2F] border-b border-rose-900/60 flex items-center justify-between text-xs font-mono shrink-0">
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

            {/* Messages Scroll Area (Isolated Scroll Container) */}
            <div ref={messagesContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start gap-2.5 max-w-2xl relative ${
                      isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    {!isMe && (
                      <img
                        src={
                          msg.senderAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                        }
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] dark:border-[#1E293B] shrink-0 mt-0.5 cursor-pointer"
                        onClick={() => {
                          if (onSelectUserProfile) {
                            const found = usersList.find((u) => u.id === msg.senderId);
                            if (found) onSelectUserProfile(found);
                          }
                        }}
                      />
                    )}

                    <div className="relative group/msg max-w-full">
                      <div
                        className={`p-3.5 rounded-2xl text-xs space-y-2 relative shadow-xs ${
                          isMe
                            ? 'bg-[#E07A5F] text-white border border-[#E07A5F]'
                            : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155]/60'
                        }`}
                      >
                        {/* Sender Tag */}
                        {!isMe && (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono mb-1">
                            <span className="font-bold text-[#E07A5F]">{msg.senderName}</span>
                            {msg.senderRole === 'SUPER_ADMIN' && (
                              <span className="px-1 py-0.2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-300 text-[9px] font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                        )}

                        {/* Reply Reference Header */}
                        {msg.replyToMessage && (
                          <div className={`p-2 rounded-lg border-l-2 border-[#E07A5F] text-[11px] ${
                            isMe
                              ? 'bg-black/10 text-white/90'
                              : 'bg-white/80 dark:bg-[#0A0F1D]/80 text-[#64748B] dark:text-[#94A3B8]'
                          }`}>
                            <div className={`font-bold ${isMe ? 'text-white' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>
                              {msg.replyToMessage.senderName}
                            </div>
                            <div className="truncate">{msg.replyToMessage.content}</div>
                          </div>
                        )}

                        {/* Video Recording Attachment */}
                        {msg.recordingVideoUrl && (
                          <div className="rounded-xl overflow-hidden bg-black border border-[#E2E8F0] dark:border-[#1E293B] p-1 space-y-2">
                            <video
                              src={msg.recordingVideoUrl}
                              controls
                              className="w-full rounded-lg max-h-64 object-contain"
                            />
                            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                              <span>{msg.recordingTitle || 'Live Lesson Recording'}</span>
                              <a
                                href={msg.recordingVideoUrl}
                                download
                                className="text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Yuklash</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Media Attachment: Image with Framed Box */}
                        {msg.mediaUrl && msg.mediaType === 'image' && (
                          <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/20">
                            <img
                              src={msg.mediaUrl}
                              alt={msg.mediaName || "Biriktirilgan rasm"}
                              className="rounded-xl max-h-80 w-full object-cover"
                            />
                          </div>
                        )}

                        {/* Media Attachment: Document */}
                        {msg.mediaUrl && msg.mediaType === 'document' && (
                          <div className="p-3 rounded-xl bg-white/20 dark:bg-[#0A0F1D]/60 border border-white/20 dark:border-[#1E293B] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={20} className={isMe ? 'text-white' : 'text-[#E07A5F]'} />
                              <div className="min-w-0">
                                <div className="font-bold truncate text-xs">{msg.mediaName || 'Hujjat'}</div>
                                <div className="text-[10px] font-mono opacity-80">PDF / Fayl</div>
                              </div>
                            </div>
                            <a
                              href={msg.mediaUrl}
                              download={msg.mediaName}
                              target="_blank"
                              rel="noreferrer"
                              className={`p-1.5 rounded-lg ${isMe ? 'bg-white/20 text-white' : 'bg-[#E07A5F] text-white'}`}
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        )}

                        {/* Voice Note Player */}
                        {msg.voiceAudioUrl && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/40 dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                            <Volume2 className={`w-4 h-4 ${isMe ? 'text-white' : 'text-[#E07A5F]'}`} />
                            <audio src={msg.voiceAudioUrl} controls className="h-8 max-w-[200px]" />
                          </div>
                        )}

                        {/* Rich Telegram Formatted Text / Caption */}
                        {(msg.caption || msg.content) && (
                          <RichTextRenderer
                            content={msg.caption || msg.content}
                            className="leading-relaxed"
                          />
                        )}

                        {/* Timestamp & Flags */}
                        <div className={`text-[10px] font-mono flex items-center justify-end gap-1.5 ${
                          isMe ? 'text-white/80' : 'text-[#64748B] dark:text-[#94A3B8]'
                        }`}>
                          {msg.isEdited && <span className="italic">(tahrirlandi)</span>}
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck size={11} className="text-white" />}
                        </div>
                      </div>

                      {/* Floating Message Action Buttons */}
                      <div className={`absolute -top-3 ${isMe ? 'left-0' : 'right-0'} opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-0.5 p-1 bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-lg z-10 select-none`}>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                          title="Javob qaytarish"
                        >
                          <CornerUpLeft size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setForwardingMessage(msg)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                          title="Uzatish (Forward)"
                        >
                          <Forward size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(msg.caption || msg.content || '');
                            }
                          }}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                          title="Nusxa olish"
                        >
                          <Copy size={12} />
                        </button>

                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(msg)}
                            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}

                        {(isMe || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Replying Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-[#F1F5F9] dark:bg-[#1E293B] border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2 border-l-2 border-[#E07A5F] pl-2 min-w-0">
                  <CornerUpLeft size={13} className="text-[#E07A5F] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#E07A5F]">{replyingTo.senderName}: </span>
                    <span className="truncate text-[#64748B] dark:text-[#94A3B8]">
                      {replyingTo.caption || replyingTo.content || 'Biriktirilgan fayl'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Editing Banner */}
            {editingMessage && (
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono shrink-0">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Edit2 size={13} />
                  <span>Xabarni tahrirlash</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessage(null);
                    setMessageInput('');
                  }}
                  className="p-1 text-amber-600 dark:text-amber-400 hover:text-rose-500 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Message Input Bottom Bar */}
            {canPost ? (
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white dark:bg-[#121A2F] border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center gap-2 shrink-0"
              >
                {/* Media Attachment Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                    title="Fayl yoki Rasm biriktirish (Tagyozuv bilan)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFilePicked}
                  />
                </div>

                {/* Voice Note Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#F1F5F9] dark:bg-[#0A0F1D] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                  title="Ovozli xabar"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Text Field */}
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    isRecordingVoice
                      ? `Ovoz yozilmoqda (${voiceSeconds}s)...`
                      : editingMessage
                      ? "Tahrirlangan xabarni kiriting..."
                      : "Xabar yozing (Formula: $x^2$, spoiler: ||javob||)..."
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white font-bold transition-colors cursor-pointer disabled:opacity-40"
                  title={editingMessage ? "Saqlash" : "Yuborish"}
                >
                  {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <div className="p-3.5 bg-white dark:bg-[#121A2F] border-t border-[#E2E8F0] dark:border-[#1E293B] text-center text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                Faqat kanal ma'murlari xabar yuborishi mumkin.
              </div>
            )}
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
    </div>
  );
};
