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
  Info
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
  uploadChatMedia
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

  // 3. Modals & Sidebars
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState<boolean>(false);
  const [createChatTab, setCreateChatTab] = useState<'DIRECT' | 'GROUP' | 'CHANNEL'>('DIRECT');

  // 4. Voice Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<any>(null);

  // 5. Live Stream Studio Trigger
  const [isLiveStudioOpen, setIsLiveStudioOpen] = useState<boolean>(false);

  // 6. Online Presence Count
  const [onlinePresenceCount, setOnlinePresenceCount] = useState<number>(1);

  // 7. Media Attachment & Audio
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load messages whenever activeChatId changes
  useEffect(() => {
    if (activeChat) {
      const initialMsgs = getChatMessages(activeChat.id);
      setMessages(initialMsgs);
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
      (count) => {
        setOnlinePresenceCount(Math.max(1, count));
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [activeChat?.id, currentUser.id]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

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
            content: replyingTo.content || 'Biriktirilgan fayl',
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
              'chat-attachments'
            );

            const voiceMsg: Message = {
              id: `msg-voice-${Date.now()}`,
              chatId: activeChat.id,
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

  // File Attachment Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    try {
      const uploadRes = await uploadChatMedia(file, file.name, 'chat-attachments');
      const isImg = file.type.startsWith('image/');
      const newMsg: Message = {
        id: `msg-file-${Date.now()}`,
        chatId: activeChat.id,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl,
        senderRole: currentUser.role,
        content: file.name,
        mediaUrl: uploadRes.url,
        mediaType: isImg ? 'image' : 'document',
        mediaName: file.name,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      await persistChatMessage(newMsg);
      setIsAttachmentMenuOpen(false);
    } catch (err) {
      console.warn('File upload notice:', err);
    }
  };

  // Create new custom chat / group
  const handleCreateNewChat = (data: {
    name: string;
    description: string;
    type: ChatType;
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
        data.type === 'DIRECT'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
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

  return (
    <div className="h-[calc(100vh-4.5rem)] flex bg-[#0A0F1D] text-[#F8FAFC] font-sans overflow-hidden select-none border border-[#1E293B] rounded-2xl">
      {/* ============================================================= */}
      {/* 1. LEFT SIDEBAR: FOLDERS & CLEAN CHATS LIST                   */}
      {/* ============================================================= */}
      <aside
        className={`${
          isMobileChatViewOpen ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 bg-[#121A2F] border-r border-[#1E293B] flex-col shrink-0 overflow-hidden`}
      >
        {/* Top Hub Bar */}
        <div className="p-3.5 border-b border-[#1E293B] flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Qidiruv..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
            />
          </div>

          <button
            onClick={() => setIsCreateChatModalOpen(true)}
            className="p-2 rounded-xl bg-[#0A0F1D] hover:bg-[#1A233A] border border-[#1E293B] text-[#E07A5F] transition-colors cursor-pointer"
            title="Yangi Muloqot Yaratish"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Folder Tabs Strip */}
        <div className="px-3 py-2 border-b border-[#1E293B] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono">
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
                  ? 'bg-[#E07A5F] text-[#0A0F1D] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chats Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1E293B]/40">
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
                    ? 'bg-[#1E293B] text-[#F8FAFC]'
                    : 'hover:bg-[#1E293B]/40 text-[#94A3B8]'
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
                    className="w-11 h-11 rounded-2xl object-cover border border-[#1E293B]"
                  />
                  {chat.isLiveActive && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-[#121A2F]"></span>
                    </span>
                  )}
                </div>

                {/* Chat Title & Last Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold truncate text-[#F8FAFC]">
                        {chat.name}
                      </span>
                      {chat.isOfficial && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0B1B3D] text-[#E07A5F] border border-[#1E293B]">
                          RASMIY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                      {chat.isLiveActive ? 'JONLI' : 'Bugun'}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] truncate font-medium">
                    {chat.description || 'Xabarlar tarixi'}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-xs text-[#64748B] font-mono">
              Hozircha chatlar mavjud emas
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================= */}
      {/* 2. MAIN CENTER WORKSPACE: ACTIVE CHAT & STREAM BANNER         */}
      {/* ============================================================= */}
      <main
        className={`${
          !isMobileChatViewOpen ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col bg-[#0A0F1D] overflow-hidden min-w-0 relative`}
      >
        {activeChat ? (
          <>
            {/* Top Workspace Header */}
            <header className="h-16 px-4 sm:px-6 bg-[#121A2F] border-b border-[#1E293B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setIsMobileChatViewOpen(false)}
                  className="md:hidden p-1.5 text-[#64748B] hover:text-[#F8FAFC]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={
                      activeChat.avatarUrl ||
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
                    }
                    alt={activeChat.name}
                    className="w-9 h-9 rounded-xl object-cover border border-[#1E293B]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xs sm:text-sm font-bold truncate text-[#F8FAFC]">
                        {activeChat.name}
                      </h2>
                      {activeChat.isOfficial && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-2 truncate">
                      <span>
                        {activeChat.type === 'SAVED_MESSAGES'
                          ? 'Shaxsiy bulut xotirasi'
                          : `${onlinePresenceCount} a'zo faol`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Live Stream Launcher */}
                {canStream && (
                  <button
                    onClick={() => setIsLiveStudioOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden sm:inline">Jonli Efir</span>
                  </button>
                )}

                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="p-2 rounded-xl bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                  title="Havola orqali ulashish"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsRightSidebarOpen((prev) => !prev)}
                  className={`p-2 rounded-xl border border-[#1E293B] transition-colors cursor-pointer ${
                    isRightSidebarOpen
                      ? 'bg-[#E07A5F] text-[#0A0F1D]'
                      : 'bg-[#0A0F1D] text-[#64748B] hover:text-[#F8FAFC]'
                  }`}
                  title="Kanal Ma'lumotlari"
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
                  <span className="text-[#64748B] hidden sm:inline">| Masterclass olib borilmoqda</span>
                </div>
                <button
                  onClick={() => setIsLiveStudioOpen(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                >
                  Efirga Qo'shilish →
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-2xl ${
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
                        className="w-8 h-8 rounded-full object-cover border border-[#1E293B] shrink-0 mt-0.5"
                      />
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 relative shadow-xs ${
                        isMe
                          ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#334155]/60'
                          : 'bg-[#121A2F] text-[#F8FAFC] border border-[#1E293B]'
                      }`}
                    >
                      {/* Sender Tag */}
                      {!isMe && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono mb-1">
                          <span className="font-bold text-[#E07A5F]">{msg.senderName}</span>
                          {msg.senderRole === 'SUPER_ADMIN' && (
                            <span className="px-1 py-0.2 rounded bg-rose-950 text-rose-300 text-[9px]">
                              ADMIN
                            </span>
                          )}
                        </div>
                      )}

                      {/* Reply Reference */}
                      {msg.replyToMessage && (
                        <div className="p-2 rounded-lg bg-[#0A0F1D]/80 border-l-2 border-[#E07A5F] text-[11px] text-[#94A3B8]">
                          <div className="font-bold text-[#F8FAFC]">
                            {msg.replyToMessage.senderName}
                          </div>
                          <div className="truncate">{msg.replyToMessage.content}</div>
                        </div>
                      )}

                      {/* Video Recording Attachment (Directly Playable & Downloadable) */}
                      {msg.recordingVideoUrl && (
                        <div className="rounded-xl overflow-hidden bg-black/80 border border-[#1E293B] p-1 space-y-2">
                          <video
                            src={msg.recordingVideoUrl}
                            controls
                            className="w-full rounded-lg max-h-64 object-contain"
                          />
                          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
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

                      {/* Image Attachment */}
                      {msg.mediaUrl && msg.mediaType === 'image' && (
                        <img
                          src={msg.mediaUrl}
                          alt="Attachment"
                          className="rounded-xl max-h-64 object-cover border border-[#1E293B]"
                        />
                      )}

                      {/* Voice Note Player */}
                      {msg.voiceAudioUrl && (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0A0F1D] border border-[#1E293B]">
                          <Volume2 className="w-4 h-4 text-[#E07A5F]" />
                          <audio src={msg.voiceAudioUrl} controls className="h-8 max-w-[200px]" />
                        </div>
                      )}

                      {/* Message Text with KaTeX Math Rendering */}
                      {msg.content && (
                        <div className="leading-relaxed">
                          <KaTeXRenderer text={msg.content} />
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-[10px] font-mono text-[#64748B] text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bottom Bar */}
            {canPost ? (
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-[#121A2F] border-t border-[#1E293B] flex items-center gap-2 shrink-0"
              >
                {/* Media Attachment Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAttachmentMenuOpen((prev) => !prev)}
                    className="p-2.5 rounded-xl bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Attachment Dropdown */}
                  {isAttachmentMenuOpen && (
                    <div className="absolute bottom-12 left-0 w-44 p-1.5 bg-[#121A2F] border border-[#1E293B] rounded-xl shadow-2xl space-y-1 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-2 rounded-lg hover:bg-[#1E293B] flex items-center gap-2 text-left cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#E07A5F]" />
                        <span>Rasm / Fayl</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Voice Note Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-[#64748B] hover:text-[#F8FAFC]'
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
                      : "Xabar yozing (Formula uchun $x^2+y^2=r^2$)..."
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-3.5 bg-[#121A2F] border-t border-[#1E293B] text-center text-xs font-mono text-[#64748B]">
                Faqat kanal ma'murlari xabar yuborishi mumkin.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-[#64748B]">
            Muloqotni boshlash uchun chatni tanlang.
          </div>
        )}
      </main>

      {/* ============================================================= */}
      {/* 3. RIGHT SIDEBAR: CHANNEL METRICS & DETAILS                   */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isRightSidebarOpen && activeChat && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-[#121A2F] border-l border-[#1E293B] flex flex-col shrink-0 overflow-hidden font-sans"
          >
            <div className="h-16 px-4 border-b border-[#1E293B] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#F8FAFC]">Kanal Ma'lumotlari</h3>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="text-center space-y-2">
                <img
                  src={
                    activeChat.avatarUrl ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
                  }
                  alt={activeChat.name}
                  className="w-16 h-16 rounded-2xl mx-auto object-cover border border-[#1E293B]"
                />
                <h4 className="text-sm font-bold text-[#F8FAFC]">{activeChat.name}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {activeChat.description || 'ASRON SAT rasmiy kanali.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Turi:</span>
                  <span className="text-[#F8FAFC]">{activeChat.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Holati:</span>
                  <span className="text-emerald-400 font-bold">Faol</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      {isInviteModalOpen && activeChat && (
        <InviteLinkModal
          isOpen={isInviteModalOpen}
          chat={activeChat}
          currentUser={currentUser}
          onClose={() => setIsInviteModalOpen(false)}
          onUpdateChat={(updated) => {
            const next = chats.map((c) => (c.id === activeChat.id ? { ...c, ...updated } : c));
            setChats(next);
            persistChatsList(next);
          }}
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
