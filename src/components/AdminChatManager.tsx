import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Shield,
  Trash2,
  VolumeX,
  Volume2,
  HardDrive,
  Video,
  Download,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Filter,
  Eye,
  Radio,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Send,
  Pin,
  Sparkles,
  Share2,
  UserCheck,
  UserX
} from 'lucide-react';
import { Chat, User, Message } from '../types';
import {
  OFFICIAL_CHANNELS,
  getInitialChats,
  persistChatsList,
  persistChatMessage,
  getChatMessages
} from '../lib/chatRealtimeService';
import { InviteLinkModal } from './InviteLinkModal';

interface Props {
  currentUser: User;
  usersList?: User[];
}

interface StoredRecording {
  id: string;
  title: string;
  channelName: string;
  hostName: string;
  sizeMB: number;
  duration: string;
  recordedAt: string;
  videoUrl: string;
}

export const AdminChatManager: React.FC<Props> = ({ currentUser, usersList = [] }) => {
  const [activeTab, setActiveTab] = useState<'CHANNELS' | 'BROADCAST' | 'ADMINS' | 'STORAGE'>('CHANNELS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Official & Active Channels
  const [chats, setChats] = useState<Chat[]>(() => getInitialChats(currentUser));
  const [selectedChatForModal, setSelectedChatForModal] = useState<Chat | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  // Global Broadcast Form State
  const [broadcastTarget, setBroadcastTarget] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [isPinBroadcast, setIsPinBroadcast] = useState<boolean>(true);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  // Admin Assignment Search
  const [adminSearchUser, setAdminSearchUser] = useState<string>('');
  const [selectedChannelForAdmin, setSelectedChannelForAdmin] = useState<string>('11111111-1111-1111-1111-111111111111');

  // Cloud Video Recordings
  const [recordings, setRecordings] = useState<StoredRecording[]>([
    {
      id: 'rec-asron-01',
      title: 'Digital SAT Math: Hard Module 2 Desmos & Quadratic Shortcuts',
      channelName: 'SAT | ASRON',
      hostName: 'ASRON Master Instructor',
      sizeMB: 285.4,
      duration: '45m 12s',
      recordedAt: '2026-08-28 20:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: 'rec-asron-02',
      title: 'Reading & Writing: Rhetorical Synthesis and Transition Mastery',
      channelName: 'SAT | ASRON Platformasi',
      hostName: 'Senior RW Coach',
      sizeMB: 190.2,
      duration: '32m 40s',
      recordedAt: '2026-08-25 19:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
  ]);

  const [previewRecording, setPreviewRecording] = useState<StoredRecording | null>(null);

  // Filtered Chats
  const filteredChats = chats.filter(
    (c) =>
      c.type !== 'SAVED_MESSAGES' &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle Send Global Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    const targetChat = chats.find((c) => c.id === broadcastTarget);
    const newBroadcastMsg: Message = {
      id: `msg-broadcast-${Date.now()}`,
      chatId: broadcastTarget,
      senderId: currentUser.id,
      senderName: currentUser.fullName || 'ASRON SAT Rahbariyati',
      senderAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      senderRole: currentUser.role || 'SUPER_ADMIN',
      content: broadcastText.trim(),
      isPinned: isPinBroadcast,
      createdAt: new Date().toISOString(),
      reactions: { '🔥': 1, '💡': 1 },
    };

    await persistChatMessage(newBroadcastMsg);
    setBroadcastText('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  // Toggle User Channel Admin Role
  const handleToggleChannelAdmin = (targetUserId: string, channelId: string) => {
    const updatedChats = chats.map((c) => {
      if (c.id === channelId) {
        const currentAdmins = c.channelAdmins || [];
        const exists = currentAdmins.includes(targetUserId);
        const nextAdmins = exists
          ? currentAdmins.filter((id) => id !== targetUserId)
          : [...currentAdmins, targetUserId];

        const nextRoles = { ...(c.memberRoles || {}) };
        if (exists) {
          delete nextRoles[targetUserId];
        } else {
          nextRoles[targetUserId] = 'ADMIN';
        }

        return {
          ...c,
          channelAdmins: nextAdmins,
          memberRoles: nextRoles,
        };
      }
      return c;
    });

    setChats(updatedChats);
    persistChatsList(updatedChats);
  };

  // Delete / Purge Chat
  const handleDeleteChat = (chatId: string) => {
    if (chatId === '11111111-1111-1111-1111-111111111111' || chatId === '22222222-2222-2222-2222-222222222222') {
      alert('Rasmiy ASRON kanallarini o\'chirib bo\'lmaydi.');
      return;
    }
    if (confirm('Ushbu guruh yoki kanalni butunlay o\'chirishga ishonchingiz komilmi?')) {
      const next = chats.filter((c) => c.id !== chatId);
      setChats(next);
      persistChatsList(next);
    }
  };

  const currentChannelForAdminObj = chats.find((c) => c.id === selectedChannelForAdmin);

  return (
    <div className="space-y-6 font-sans text-[#F8FAFC]">
      {/* Top Tab Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E07A5F]" />
            <span>Kanal & Hamjamiyat Boshqaruv Markazi</span>
          </h2>
          <p className="text-xs font-mono text-[#64748B]">
            Rasmiy kanallar, moderatorlik huquqlari, e'lonlar va bulutli video darslar arxivi.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0A0F1D] rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('CHANNELS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              activeTab === 'CHANNELS' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            Kanallar ({filteredChats.length})
          </button>

          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              activeTab === 'BROADCAST' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            Rasmiy E'lon Yuborish
          </button>

          <button
            onClick={() => setActiveTab('ADMINS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              activeTab === 'ADMINS' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            Adminlar & Rollar
          </button>

          <button
            onClick={() => setActiveTab('STORAGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              activeTab === 'STORAGE' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            Video Yozuvlar ({recordings.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OFFICIAL CHANNELS & DIRECTORY */}
      {activeTab === 'CHANNELS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kanal yoki guruhlarni qidirish..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="p-5 rounded-2xl bg-[#121A2F] border border-[#1E293B] hover:border-[#334155] transition-colors space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={chat.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
                      alt={chat.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#1E293B]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#F8FAFC]">{chat.name}</h4>
                        {chat.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E07A5F]" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#64748B]">
                        Slug: @{chat.slug || chat.inviteCode || 'channel'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold ${
                      chat.isOfficial
                        ? 'bg-[#0B1B3D] text-[#E07A5F] border border-[#E07A5F]/30'
                        : 'bg-[#0A0F1D] text-[#64748B] border border-[#1E293B]'
                    }`}
                  >
                    {chat.type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {chat.description || "Tavsif berilmagan."}
                </p>

                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#1E293B] text-[#64748B]">
                  <div className="flex items-center gap-3">
                    <span>A'zolar: <strong className="text-[#F8FAFC]">{chat.members?.length || 1}</strong></span>
                    <span>Adminlar: <strong className="text-[#E07A5F]">{chat.channelAdmins?.length || 1}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedChatForModal(chat);
                        setIsInviteModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] text-xs font-mono text-[#F8FAFC] border border-[#1E293B] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-[#E07A5F]" />
                      <span>Havola</span>
                    </button>

                    {!chat.isOfficial && (
                      <button
                        onClick={() => handleDeleteChat(chat.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL BROADCAST DISPATCHER */}
      {activeTab === 'BROADCAST' && (
        <div className="max-w-2xl bg-[#121A2F] border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#E07A5F]" />
              <span>Rasmiy E'lon yoki Masterclass Xabari Yuborish</span>
            </h3>
            <p className="text-xs font-mono text-[#64748B]">
              Tanlangan rasmiy kanalga barcha talabalar uchun yuqori darajali formatlangan e'lon yuboring.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block mb-1.5">
                Qaysi Kanalga Yuborilsin?
              </label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              >
                <option value="11111111-1111-1111-1111-111111111111">
                  SAT | ASRON (Rasmiy Yangiliklar & Darslar)
                </option>
                <option value="22222222-2222-2222-2222-222222222222">
                  SAT | ASRON Platformasi (Muhokama & Qo'llanmalar)
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block mb-1.5">
                E'lon Matni (Markdown & KaTeX qo'llab-quvvatlanadi)
              </label>
              <textarea
                rows={5}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="E'lon matnini kiriting...\n\nMasalan: 🚀 Bugun soat 20:00 da Jonli Masterclass darsi bo'lib o'tadi. Desmos shortcuts va $x^2+y^2=r^2$ doira tenglamalarini tahlil qilamiz."
                className="w-full p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinBroadcast}
                  onChange={(e) => setIsPinBroadcast(e.target.checked)}
                  className="rounded border-[#1E293B] text-[#E07A5F] focus:ring-0"
                />
                <span className="text-xs font-mono text-[#64748B] flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Kanalda xabarni qadash (Pin qilish)</span>
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>E'lonni Tarqatish</span>
              </button>
            </div>

            {broadcastSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>E'lon kanalga muvaffaqiyatli yetkazildi va qadaldi!</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 3: ADMIN & ROLE ASSIGNMENTS */}
      {activeTab === 'ADMINS' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Kanal Administratorlarini Tayinlash</h3>
                <p className="text-xs font-mono text-[#64748B]">
                  Foydalanuvchilarga rasmiy kanalda dars o'tish (Live Stream) va post yuborish huquqini berish.
                </p>
              </div>

              <select
                value={selectedChannelForAdmin}
                onChange={(e) => setSelectedChannelForAdmin(e.target.value)}
                className="p-2 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC]"
              >
                <option value="11111111-1111-1111-1111-111111111111">SAT | ASRON</option>
                <option value="22222222-2222-2222-2222-222222222222">SAT | ASRON Platformasi</option>
              </select>
            </div>

            {/* Search User to Assign */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={adminSearchUser}
                onChange={(e) => setAdminSearchUser(e.target.value)}
                placeholder="Foydalanuvchini @username yoki ism bo'yicha qidirish..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>

            {/* Users List for Admin Assignment */}
            <div className="space-y-2 max-h-72 overflow-y-auto pt-2">
              {usersList
                .filter(
                  (u) =>
                    !adminSearchUser ||
                    u.fullName.toLowerCase().includes(adminSearchUser.toLowerCase()) ||
                    u.username.toLowerCase().includes(adminSearchUser.toLowerCase()) ||
                    u.email.toLowerCase().includes(adminSearchUser.toLowerCase())
                )
                .map((u) => {
                  const isChannelAdmin =
                    currentChannelForAdminObj?.channelAdmins?.includes(u.id) ||
                    currentChannelForAdminObj?.channelAdmins?.includes(u.username) ||
                    u.role === 'SUPER_ADMIN';

                  return (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[#1E293B]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            <span className="text-[10px] font-mono text-[#64748B]">@{u.username}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#64748B]">{u.email}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleChannelAdmin(u.id, selectedChannelForAdmin)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isChannelAdmin
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D]'
                        }`}
                      >
                        {isChannelAdmin ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Adminlikni Bekor Qilish</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Channel Admin Qilish</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUD RECORDING VAULT */}
      {activeTab === 'STORAGE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#F8FAFC] line-clamp-1">{rec.title}</h4>
                    <p className="text-[11px] font-mono text-[#64748B]">
                      {rec.channelName} • {rec.hostName}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0A0F1D] text-[#E07A5F] border border-[#1E293B]">
                    {rec.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#1E293B] text-[#64748B]">
                  <span>Hajm: <strong className="text-[#F8FAFC]">{rec.sizeMB} MB</strong></span>
                  <span>{rec.recordedAt}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setPreviewRecording(rec)}
                    className="flex-1 py-1.5 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-[#E07A5F]" />
                    <span>Ko'rish</span>
                  </button>

                  <a
                    href={rec.videoUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                    title="Yuklab olish"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Video Preview Modal */}
          {previewRecording && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl bg-[#121A2F] border border-[#1E293B] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC]">{previewRecording.title}</h3>
                    <p className="text-xs font-mono text-[#64748B]">{previewRecording.channelName}</p>
                  </div>
                  <button
                    onClick={() => setPreviewRecording(null)}
                    className="p-1 text-[#64748B] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="w-full aspect-video rounded-xl bg-black overflow-hidden">
                  <video
                    src={previewRecording.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share / Invite Link Modal */}
      {selectedChatForModal && (
        <InviteLinkModal
          isOpen={isInviteModalOpen}
          chat={selectedChatForModal}
          currentUser={currentUser}
          onClose={() => setIsInviteModalOpen(false)}
          onUpdateChat={(updated) => {
            const next = chats.map((c) =>
              c.id === selectedChatForModal.id ? { ...c, ...updated } : c
            );
            setChats(next);
            persistChatsList(next);
          }}
        />
      )}
    </div>
  );
};
