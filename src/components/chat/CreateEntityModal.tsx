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
  UserCheck
} from 'lucide-react';
import { User, ChatType } from '../../types';
import { uploadChatMedia } from '../../lib/chatRealtimeService';

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
  const [groupPrivacy, setGroupPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'DIRECT') {
      if (!selectedUserId) return;
      const targetUser = usersList.find((u) => u.id === selectedUserId);
      onCreateChat({
        name: targetUser?.fullName || 'Shaxsiy Yozishma',
        description: `@${targetUser?.username || 'user'} bilan shaxsiy muloqot`,
        type: 'DIRECT',
        avatarUrl: targetUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        targetUserId: selectedUserId,
      });
      return;
    }

    if (!name.trim()) return;

    let finalType: ChatType = 'PUBLIC_CHANNEL';
    if (activeTab === 'CHANNEL') {
      finalType = 'PUBLIC_CHANNEL';
    } else if (activeTab === 'GROUP') {
      finalType = groupPrivacy === 'PUBLIC' ? 'PUBLIC_GROUP' : 'PRIVATE_GROUP';
    }

    onCreateChat({
      name: name.trim(),
      description: description.trim(),
      type: finalType,
      avatarUrl:
        avatarUrl ||
        (activeTab === 'CHANNEL'
          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
          : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150'),
    });
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.id !== currentUser.id &&
      (u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
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
                Kanal, guruh yoki shaxsiy yozishma ochish
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
          {activeTab === 'GROUP' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                Guruh Turi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGroupPrivacy('PUBLIC')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono transition-all cursor-pointer ${
                    groupPrivacy === 'PUBLIC'
                      ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] font-bold'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <Globe size={16} />
                  <div className="text-left">
                    <div className="text-xs">Ommaviy Guruh</div>
                    <div className="text-[10px] text-slate-400 font-normal">Qidiruvda chiqadi, hamma kiradi</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGroupPrivacy('PRIVATE')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono transition-all cursor-pointer ${
                    groupPrivacy === 'PRIVATE'
                      ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] font-bold'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <Lock size={16} />
                  <div className="text-left">
                    <div className="text-xs">Yopiq Guruh</div>
                    <div className="text-[10px] text-slate-400 font-normal">Faqat havola yoki ruxsat bilan</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* For Channels & Groups: Name, Description, Avatar */}
          {(activeTab === 'CHANNEL' || activeTab === 'GROUP') && (
            <div className="space-y-3">
              {/* Avatar Upload */}
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#F1F5F9] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud size={20} className="text-[#64748B]" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
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
                    Rasm / Avatar yuklash
                  </button>
                  <p className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    PNG, JPG yoki WEBP tavsiya etiladi (Supabase Storage)
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
                          <img
                            src={
                              u.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                            }
                            alt={u.fullName}
                            className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0] dark:border-[#1E293B]"
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
              disabled={activeTab === 'DIRECT' ? !selectedUserId : !name.trim()}
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
