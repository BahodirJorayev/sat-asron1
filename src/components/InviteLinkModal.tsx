import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Lock,
  Share2,
  ShieldCheck,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Chat, User } from '../types';

interface Props {
  isOpen: boolean;
  chat: Chat;
  currentUser: User;
  onClose: () => void;
  onUpdateChat: (updated: Partial<Chat>) => void;
}

export const InviteLinkModal: React.FC<Props> = ({
  isOpen,
  chat,
  currentUser,
  onClose,
  onUpdateChat,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(
    chat.type === 'PUBLIC_CHANNEL' || chat.type === 'PUBLIC_GROUP'
  );

  if (!isOpen) return null;

  const isOwnerOrAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    chat.createdById === currentUser.id ||
    chat.channelAdmins?.includes(currentUser.id);

  const inviteCode = chat.inviteCode || chat.slug || 'sat-asron';
  const fullInviteUrl = `https://asronsat.uz/join/${inviteCode}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullInviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleRegenerateCode = () => {
    setIsRegenerating(true);
    const newCode = `asron-${Math.random().toString(36).substring(2, 8)}`;
    setTimeout(() => {
      onUpdateChat({ inviteCode: newCode });
      setIsRegenerating(false);
    }, 400);
  };

  const handleToggleVisibility = () => {
    const nextIsPublic = !isPublic;
    setIsPublic(nextIsPublic);
    let nextType = chat.type;
    if (chat.type === 'PUBLIC_CHANNEL' || chat.type === 'PRIVATE_CHANNEL') {
      nextType = nextIsPublic ? 'PUBLIC_CHANNEL' : 'PRIVATE_CHANNEL';
    } else if (chat.type === 'PUBLIC_GROUP' || chat.type === 'PRIVATE_GROUP') {
      nextType = nextIsPublic ? 'PUBLIC_GROUP' : 'PRIVATE_GROUP';
    }
    onUpdateChat({ type: nextType });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-md bg-[#121A2F] border border-[#1E293B] rounded-2xl p-6 text-[#F8FAFC] shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-[#E07A5F]">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Taklif Havolasi & Ulashish</h3>
                <p className="text-[11px] font-mono text-[#64748B]">{chat.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Deep Link URL Card */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block">
              Rasmiy Taklif Havolasi
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B]">
              <span className="text-xs font-mono text-[#F8FAFC] truncate flex-1 select-all">
                {fullInviteUrl}
              </span>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls & Security Settings */}
          {isOwnerOrAdmin && (
            <div className="space-y-3 pt-1 border-t border-[#1E293B]">
              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B]">
                <div className="flex items-center gap-2.5">
                  {isPublic ? (
                    <Globe className="w-4 h-4 text-[#E07A5F]" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#F8FAFC]">
                      {isPublic ? 'Ochiq (Public) Kanal/Guruh' : 'Yopiq (Private) Kanal'}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {isPublic
                        ? 'Global qidiruvda ko\'rinadi va har kim a\'zo bo\'la oladi.'
                        : 'Faqat taklif havolasi orqali kirish mumkin.'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleToggleVisibility}
                  className="px-2.5 py-1 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[11px] font-mono text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  O'zgartirish
                </button>
              </div>

              {/* Revoke & Regenerate Link */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B]">
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC]">Havolani Yangilash (Revoke)</div>
                  <div className="text-[10px] text-[#64748B]">
                    Eski havola darhol bekor qilinadi va yangi havola yaratiladi.
                  </div>
                </div>

                <button
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Yangilash</span>
                </button>
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-mono font-bold text-[#F8FAFC] transition-colors cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
