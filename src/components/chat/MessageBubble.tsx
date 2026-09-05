'use client';

import React from 'react';
import {
  Download,
  FileText,
  Volume2,
  CheckCheck,
  CornerUpLeft,
  Forward,
  Copy,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Message, User, Chat } from '../../types';
import { EntityAvatar } from './EntityAvatar';
import { RichTextRenderer } from './RichTextRenderer';

export interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  currentUser: User;
  onReply?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onEdit?: (msg: Message) => void;
  onDelete?: (msgId: string) => void;
  onSelectUserProfile?: (userId: string) => void;
  onJoinSuccess?: (chat: Chat) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message: msg,
  isMe,
  currentUser,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onSelectUserProfile,
  onJoinSuccess,
}) => {
  const canManageMessage =
    isMe ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'SUPER_ADMIN';

  return (
    <div
      className={`group flex items-start gap-2 relative max-w-full ${
        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* Sender Avatar (Only for other users) */}
      {!isMe && (
        <div
          onClick={() => onSelectUserProfile?.(msg.senderId)}
          className="cursor-pointer shrink-0 mt-0.5"
          title={msg.senderName}
        >
          <EntityAvatar
            name={msg.senderName}
            avatarUrl={msg.senderAvatar}
            size="xs"
            shape="circle"
            className="w-7 h-7"
          />
        </div>
      )}

      {/* Bubble Container */}
      <div className="relative group/msg max-w-[85%] sm:max-w-[80%]">
        <div
          className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm space-y-1.5 shadow-2xs transition-colors ${
            isMe
              ? 'bg-[#E07A5F] text-white border border-[#E07A5F] rounded-tr-xs'
              : 'bg-white dark:bg-[#121A2F] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-slate-800 rounded-tl-xs'
          }`}
        >
          {/* Sender Micro-Badge & Name */}
          {!isMe && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono leading-none mb-1">
              <span className="font-bold text-[#E07A5F] truncate max-w-[140px] sm:max-w-[200px]">
                {msg.senderName}
              </span>

              {/* Minimalist Micro-Badge */}
              {msg.senderRole === 'SUPER_ADMIN' || msg.senderRole === 'ADMIN' ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400">
                  ADMIN
                </span>
              ) : msg.senderRole === 'TEACHER' ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400">
                  O'QITUVCHI
                </span>
              ) : null}
            </div>
          )}

          {/* Reply Reference Preview */}
          {msg.replyToMessage && (
            <div
              className={`p-2 rounded-lg border-l-2 border-[#E07A5F] text-[11px] leading-tight ${
                isMe
                  ? 'bg-black/15 text-white/90'
                  : 'bg-slate-50 dark:bg-[#0A0F1D]/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="font-bold font-mono text-[10px] truncate">
                {msg.replyToMessage.senderName}
              </div>
              <div className="truncate opacity-90 mt-0.5">
                {msg.replyToMessage.content}
              </div>
            </div>
          )}

          {/* Video Attachment */}
          {msg.recordingVideoUrl && (
            <div className="rounded-xl overflow-hidden bg-black border border-black/10 dark:border-white/10 p-1 space-y-1.5">
              <video
                src={msg.recordingVideoUrl}
                controls
                className="w-full rounded-lg max-h-60 object-contain"
              />
              <div className="px-1.5 py-0.5 flex items-center justify-between text-[10px] font-mono text-slate-300">
                <span className="truncate">{msg.recordingTitle || 'Video darslik'}</span>
                <a
                  href={msg.recordingVideoUrl}
                  download
                  className="text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <Download className="w-3 h-3" />
                  <span>Yuklash</span>
                </a>
              </div>
            </div>
          )}

          {/* Image Attachment */}
          {msg.mediaUrl && msg.mediaType === 'image' && (
            <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/20">
              <img
                src={msg.mediaUrl}
                alt={msg.mediaName || 'Biriktirilgan rasm'}
                className="rounded-xl max-h-72 w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Document Attachment */}
          {msg.mediaUrl && msg.mediaType === 'document' && (
            <div
              className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
                isMe
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-slate-50 dark:bg-[#0A0F1D]/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className={isMe ? 'text-white' : 'text-[#E07A5F]'} />
                <div className="min-w-0">
                  <div className="font-bold truncate text-xs">{msg.mediaName || 'Hujjat'}</div>
                  <div className="text-[9px] font-mono opacity-80">PDF / Fayl</div>
                </div>
              </div>
              <a
                href={msg.mediaUrl}
                download={msg.mediaName}
                target="_blank"
                rel="noreferrer"
                className={`p-1.5 rounded-lg shrink-0 ${
                  isMe ? 'bg-white/20 text-white' : 'bg-[#E07A5F] text-white'
                }`}
              >
                <Download size={12} />
              </a>
            </div>
          )}

          {/* Voice Audio Player */}
          {msg.voiceAudioUrl && (
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border ${
                isMe
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-slate-50 dark:bg-[#0A0F1D] border-slate-200 dark:border-slate-800'
              }`}
            >
              <Volume2 className={`w-4 h-4 shrink-0 ${isMe ? 'text-white' : 'text-[#E07A5F]'}`} />
              <audio src={msg.voiceAudioUrl} controls className="h-7 max-w-[200px]" />
            </div>
          )}

          {/* Formatted Text / Caption */}
          {(msg.caption || msg.content) && (
            <RichTextRenderer
              content={msg.caption || msg.content}
              className="leading-relaxed break-words"
              currentUser={currentUser}
              onJoinSuccess={onJoinSuccess}
            />
          )}

          {/* Timestamp & Flags */}
          <div
            className={`text-[10px] font-mono flex items-center justify-end gap-1.5 select-none pt-0.5 ${
              isMe ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {msg.isEdited && <span className="italic text-[9px]">(tahrirlandi)</span>}
            <span>
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isMe && <CheckCheck size={11} className="text-white shrink-0" />}
          </div>
        </div>

        {/* Floating Message Action Buttons */}
        <div
          className={`absolute -top-3 ${
            isMe ? 'left-0' : 'right-0'
          } opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-0.5 p-0.5 bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 rounded-lg shadow-md z-10 select-none`}
        >
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(msg)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Javob qaytarish"
            >
              <CornerUpLeft size={11} />
            </button>
          )}

          {onForward && (
            <button
              type="button"
              onClick={() => onForward(msg)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Uzatish (Forward)"
            >
              <Forward size={11} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(msg.caption || msg.content || '');
              }
            }}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Nusxa olish"
          >
            <Copy size={11} />
          </button>

          {isMe && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(msg)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Tahrirlash"
            >
              <Edit2 size={11} />
            </button>
          )}

          {canManageMessage && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(msg.id)}
              className="p-1 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              title="O'chirish"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
