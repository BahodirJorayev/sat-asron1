import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  Users,
  MessageSquare,
  Lock,
  Globe,
  UploadCloud,
  Search,
  Check,
  Sparkles,
  ShieldCheck,
  UserCheck,
  AtSign
} from 'lucide-react';
import { User, ChatType } from '../../types';
import { uploadChatMedia } from '../../lib/chatRealtimeService';
import { generateSecureInviteToken } from '../../lib/communityApi';
import { EntityAvatar } from './EntityAvatar';

interface CreateEntityModalProps {
  isOpen: boolean;
  currentUser: User;
  usersList?: User[];
  onClose: () => void;
  onCreateChat: (data: {
    name: string;
    description: string;
    type: ChatType;
    avatarUrl?: string;
    targetUserId?: string;
    username?: string;
    inviteToken?: string;
    isPublic?: boolean;
  }) => void;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
  isOpen,
  currentUser,
  usersList = [],
  onClose,
  onCreateChat,
}) => {
  const [activeTab, setActiveTab] = useState<'CHANNEL' | 'GROUP' | 'DIRECT'>('CHANNEL');
  const [entityPrivacy, setEntityPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await uploadChatMedia(file, file.name, 'community-media' as any);
      if (res.url) {
        setAvatarUrl(res.url);
      }
    } catch (err) {
      console.warn('Avatar upload error:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUsernameChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    if (cleaned.length > 0 && cleaned.length < 3) {
      setUsernameError("Kamida 3 ta belgi (harf, raqam yoki pastki chiziq)");
    } else {
      setUsernameError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'DIRECT') {
      if (!selectedUserId) return;
      const targetUser = usersList.find((u) => u.id === selectedUserId);
      onCreateChat({
        name: targetUser?.fullName || 'Shaxsiy Yozishma',
        description: `@${targetUser?.username || 'user'} bilan shaxsiy muloqot`,
        type: 'DIRECT',
        avatarUrl: targetUser?.avatarUrl,
        targetUserId: selectedUserId,
        isPublic: false,
      });
      return;
    }

    if (!name.trim()) return;

    const isPublic = entityPrivacy === 'PUBLIC';

    // Validate username for public entities
    if (isPublic) {
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
      if (!cleanUsername || cleanUsername.length < 3) {
        setUsernameError("Ommaviy kanal/guruh uchun kamida 3 belgili @username kiriting");
        return;
      }
    }

    let finalType: ChatType = 'PUBLIC_CHANNEL';
    if (activeTab === 'CHANNEL') {
      finalType = isPublic ? 'PUBLIC_CHANNEL' : 'PRIVATE_CHANNEL';
    } else if (activeTab === 'GROUP') {
      finalType = isPublic ? 'PUBLIC_GROUP' : 'PRIVATE_GROUP';
    }

    const inviteToken = !isPublic ? generateSecureInviteToken() : undefined;

    onCreateChat({
      name: name.trim(),
      description: description.trim(),
      type: finalType,
      avatarUrl: avatarUrl.trim() || undefined,
      username: isPublic ? username.trim().toLowerCase().replace(/^@/, '') : undefined,
      inviteToken,
      isPublic,
    });
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.id !== currentUser.id &&
      (u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-6 text-[#0F172A] dark:text-[#F8FAFC] shadow-2xl space-y-5 select-none"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Yangi Muloqot Yaratish</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Telegram standartidagi kanal, guruh yoki shaxsiy yozishma
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 3 Main Telegram-style Options */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#F1F5F9] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('CHANNEL')}
            className={`py-2 px-3 rounded-lg flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'CHANNEL'
                ? 'bg-[#E07A5F] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Radio size={16} />
            <span>Yangi Kanal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GROUP')}
            className={`py-2 px-3 rounded-lg flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'GROUP'
                ? 'bg-[#E07A5F] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Users size={16} />
            <span>Yangi Guruh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DIRECT')}
            className={`py-2 px-3 rounded-lg flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'DIRECT'
                ? 'bg-[#E07A5F] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <MessageSquare size={16} />
            <span>Shaxsiy</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Privacy Selector for Channel & Group */}
          {(activeTab === 'CHANNEL' || activeTab === 'GROUP') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                {activeTab === 'CHANNEL' ? 'Kanal Turi' : 'Guruh Turi'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntityPrivacy('PUBLIC')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono transition-all cursor-pointer ${
                    entityPrivacy === 'PUBLIC'
                      ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] font-bold'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <Globe size={16} />
                  <div className="text-left">
                    <div className="text-xs">Ommaviy</div>
                    <div className="text-[10px] text-slate-400 font-normal">Qidiruvda chiqadi (@username)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEntityPrivacy('PRIVATE')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono transition-all cursor-pointer ${
                    entityPrivacy === 'PRIVATE'
                      ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] font-bold'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <Lock size={16} />
                  <div className="text-left">
                    <div className="text-xs">Yopiq (Xususiy)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Faqat taklif havolasi bilan</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* For Channels & Groups: Name, Username, Description, Avatar */}
          {(activeTab === 'CHANNEL' || activeTab === 'GROUP') && (
            <div className="space-y-3">
              {/* Avatar Upload with Crisp 2-Letter Monogram Fallback */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <EntityAvatar
                    name={name || 'AS'}
                    avatarUrl={avatarUrl || null}
                    size="lg"
                    shape="rounded"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#2A3756] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Haqiqiy Logo Yuklash (Ixtiyoriy)
                  </button>
                  <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Yuklanmasa, minimalist 2-harfli monogramma o'rnatiladi
                  </p>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                  {activeTab === 'CHANNEL' ? 'Kanal Nomi' : 'Guruh Nomi'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    activeTab === 'CHANNEL'
                      ? 'Masalan: Digital SAT Bluebook Tahlillari'
                      : 'Masalan: SAT Math 800 Guruhi'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              {/* Mandatory @username for Public Entities */}
              {entityPrivacy === 'PUBLIC' && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                    <span>Ommaviy Havola (@username)</span>
                    <span className="text-[10px] font-bold text-[#E07A5F]">Majburiy</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#94A3B8]">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="sat_math_club"
                      className={`w-full pl-8 pr-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden ${
                        usernameError ? 'border-rose-500 focus:border-rose-500' : 'border-[#E2E8F0] dark:border-[#1E293B] focus:border-[#E07A5F]'
                      }`}
                    />
                  </div>
                  {usernameError ? (
                    <p className="text-[10px] font-mono text-rose-500">{usernameError}</p>
                  ) : (
                    <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      Kichik harflar (a-z), raqamlar va pastki chiziq (_). Havola: /chat?c=@{username || 'nomi'}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">Tavsif</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kanal yoki guruh maqsadini qisqacha yozing..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F] resize-none"
                />
              </div>
            </div>
          )}

          {/* For Direct Messages: Select user from registered users list */}
          {activeTab === 'DIRECT' && (
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] block">
                Foydalanuvchini tanlang
              </label>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Ism yoki username bo'yicha qidiring..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-[#E2E8F0] dark:divide-[#1E293B]/40 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-1">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8] font-mono">
                    Foydalanuvchilar topilmadi
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E07A5F]/15 text-[#E07A5F] font-bold'
                            : 'hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/60 text-[#0F172A] dark:text-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <EntityAvatar
                            name={u.fullName || u.username}
                            avatarUrl={u.avatarUrl || null}
                            size="sm"
                            shape="circle"
                          />
                          <div className="min-w-0">
                            <div className="text-xs truncate">{u.fullName}</div>
                            <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                              @{u.username}
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check size={14} className="text-[#E07A5F] shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={
                activeTab === 'DIRECT'
                  ? !selectedUserId
                  : !name.trim() || (entityPrivacy === 'PUBLIC' && username.trim().length < 3)
              }
              className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
            >
              {activeTab === 'CHANNEL'
                ? 'Kanalni Yaratish'
                : activeTab === 'GROUP'
                ? 'Guruhni Yaratish'
                : 'Yozishmani Boshlash'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
