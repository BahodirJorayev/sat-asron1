import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Share2, Radio, Users, MessageSquare, Check } from 'lucide-react';
import { Chat, Message } from '../../types';

interface ForwardMessageModalProps {
  isOpen: boolean;
  messageToForward: Message | null;
  chats: Chat[];
  onClose: () => void;
  onForward: (targetChatId: string, message: Message) => void;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  isOpen,
  messageToForward,
  chats,
  onClose,
  onForward,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen || !messageToForward) return null;

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-5 text-[#0F172A] dark:text-[#F8FAFC] shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <Share2 size={16} className="text-[#E07A5F]" />
            <span>Xabarni Uzatish (Forward)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs space-y-1">
          <div className="font-mono text-[10px] text-[#E07A5F] font-bold">
            {messageToForward.senderName}:
          </div>
          <p className="line-clamp-2 text-[#64748B] dark:text-[#94A3B8]">
            {messageToForward.caption || messageToForward.content || 'Biriktirilgan media'}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kanal yoki guruhni qidiring..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F]"
          />
        </div>

        {/* Chat List */}
        <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-[#E2E8F0] dark:divide-[#1E293B]/40 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-1">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onForward(c.id, messageToForward);
                onClose();
              }}
              className="p-2.5 rounded-lg flex items-center justify-between hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={c.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80'}
                  alt={c.name}
                  className="w-8 h-8 rounded-xl object-cover border border-[#E2E8F0] dark:border-[#1E293B]"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{c.name}</div>
                  <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                    {c.type === 'PUBLIC_CHANNEL' ? 'Kanal' : c.type === 'DIRECT' ? 'Shaxsiy' : 'Guruh'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#E07A5F]/15 hover:bg-[#E07A5F] text-[#E07A5F] hover:text-white text-[11px] font-mono font-bold transition-colors cursor-pointer"
              >
                Yuborish
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
