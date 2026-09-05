import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  UploadCloud,
  Edit2,
  Check,
  Copy,
  CheckCircle2,
  Users,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Lock,
  Globe,
  Radio,
  Share2,
  Camera
} from 'lucide-react';
import { Chat, User } from '../../types';
import { uploadChatMedia } from '../../lib/chatRealtimeService';
import { EntityAvatar } from './EntityAvatar';

interface ChannelInfoDrawerProps {
  isOpen: boolean;
  chat: Chat;
  currentUser: User;
  usersList?: User[];
  onlineUserIds?: string[];
  onClose: () => void;
  onUpdateChat: (updated: Partial<Chat>) => void;
}

export const ChannelInfoDrawer: React.FC<ChannelInfoDrawerProps> = ({
  isOpen,
  chat,
  currentUser,
  usersList = [],
  onlineUserIds = [],
  onClose,
  onUpdateChat,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(chat.name);
  const [description, setDescription] = useState(chat.description || '');
  const [avatarUrl, setAvatarUrl] = useState(chat.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isOwnerOrAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    chat.createdById === currentUser.id ||
    chat.channelAdmins?.includes(currentUser.id) ||
    chat.memberRoles?.[currentUser.id] === 'OWNER' ||
    chat.memberRoles?.[currentUser.id] === 'ADMIN';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await uploadChatMedia(file, file.name, 'community-media' as any);
      if (res.url) {
        setAvatarUrl(res.url);
        onUpdateChat({ avatarUrl: res.url });
      }
    } catch (err) {
      console.warn('Avatar upload error:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveMetadata = () => {
    onUpdateChat({
      name: name.trim(),
      description: description.trim(),
      avatarUrl,
    });
    setIsEditing(false);
  };

  const isPublicEntity = chat.isPublic !== false && chat.type !== 'PRIVATE_GROUP' && chat.type !== 'PRIVATE_CHANNEL';
  const fullInviteUrl = isPublicEntity && chat.username
    ? `https://sat-asron1.vercel.app/chat?c=@${chat.username}`
    : `https://sat-asron1.vercel.app/chat/join/${chat.inviteToken || chat.inviteCode || chat.slug || chat.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullInviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Compile member list
  const memberList = (chat.members || []).map((mId) => {
    const matched = usersList.find((u) => u.id === mId || u.username === mId);
    if (matched) return matched;
    if (mId === currentUser.id) return currentUser;
    return {
      id: mId,
      fullName: mId === 'usr-admin-01' ? 'ASRON SAT Administration' : `Foydalanuvchi #${mId.substring(0, 5)}`,
      username: mId,
      email: `${mId}@asronsat.uz`,
      role: (mId === 'usr-admin-01' || chat.channelAdmins?.includes(mId) ? 'ADMIN' : 'STUDENT') as any,
      avatarUrl: undefined,
      streakDays: 0,
      xp: 0,
      createdAt: new Date().toISOString(),
    } as User;
  });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.2 }}
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-[#121A2F] border-l border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl flex flex-col font-sans select-none overflow-hidden"
    >
      {/* Drawer Header */}
      <div className="h-14 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between shrink-0">
        <div className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Ma'lumotlar & A'zolar
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Avatar & Title Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <EntityAvatar
              name={name || chat.name}
              avatarUrl={avatarUrl || chat.avatarUrl}
              size="2xl"
              shape={chat.type === 'DIRECT' ? 'circle' : 'rounded'}
              className="w-24 h-24 shadow-md"
            />
            {isOwnerOrAdmin && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-[10px] font-mono gap-1"
                title="Rasm yuklash va o'zgartirish"
              >
                <Camera size={20} />
                <span>O'zgartirish</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="w-full space-y-1">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-center text-sm font-bold bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E07A5F] rounded-xl focus:outline-hidden"
              />
            ) : (
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {chat.name}
              </h3>
            )}

            {chat.username && (
              <div className="text-xs font-mono font-bold text-[#E07A5F]">
                @{chat.username}
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              {chat.type === 'PUBLIC_CHANNEL' ? (
                <span className="flex items-center gap-1 text-sky-500">
                  <Radio size={12} /> Ommaviy Kanal
                </span>
              ) : chat.type === 'PRIVATE_GROUP' ? (
                <span className="flex items-center gap-1 text-amber-500">
                  <Lock size={12} /> Yopiq Guruh
                </span>
              ) : chat.type === 'PUBLIC_GROUP' ? (
                <span className="flex items-center gap-1 text-emerald-500">
                  <Globe size={12} /> Ommaviy Guruh
                </span>
              ) : (
                <span>Shaxsiy Yozishma</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="w-full text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed bg-[#F8FAFC] dark:bg-[#0A0F1D] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
            {isEditing ? (
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-1 bg-transparent text-xs text-inherit focus:outline-hidden resize-none"
              />
            ) : (
              chat.description || 'Tavsif mavjud emas'
            )}
          </div>

          {isOwnerOrAdmin && (
            <div className="flex gap-2">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  className="px-3 py-1.5 rounded-lg bg-[#E07A5F] text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={12} /> Saqlash
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#2A3756] text-[#64748B] dark:text-[#94A3B8] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 size={12} /> Tahrirlash
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Invite Link Section */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Share2 size={12} /> Taklif Havolasi
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">Faol</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fullInviteUrl}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-mono text-[#0F172A] dark:text-[#F8FAFC] select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            >
              {copiedLink ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              <span>{copiedLink ? 'Nusxalandi' : 'Nusxa'}</span>
            </button>
          </div>
        </div>

        {/* Members & Subscribers Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold px-1">
            <span className="text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <Users size={14} className="text-[#E07A5F]" />
              <span>A'zolar va Obunachilar</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] text-[11px]">
              {memberList.length} ta
            </span>
          </div>

          <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]/60 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0A0F1D] overflow-hidden">
            {memberList.map((member) => {
              const isOnline = onlineUserIds.includes(member.id);
              const isAdmin =
                member.role === 'SUPER_ADMIN' ||
                member.role === 'ADMIN' ||
                chat.channelAdmins?.includes(member.id) ||
                chat.memberRoles?.[member.id] === 'OWNER' ||
                chat.memberRoles?.[member.id] === 'ADMIN';

              const isTeacher = (member as any).role === 'TEACHER' || (member as any).role === 'MENTOR';

              return (
                <div
                  key={member.id}
                  className="p-3 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#121A2F] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <EntityAvatar
                        name={member.fullName}
                        avatarUrl={member.avatarUrl}
                        size="sm"
                        shape="circle"
                        isOnline={isOnline}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {member.fullName}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                        @{member.username} {isOnline ? '• onlayn' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="shrink-0">
                    {isAdmin ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <ShieldCheck size={10} /> Admin
                      </span>
                    ) : isTeacher ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <GraduationCap size={10} /> O'qituvchi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        A'zo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
