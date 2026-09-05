'use client';

import React, { useRef } from 'react';
import {
  Paperclip,
  Mic,
  Send,
  Check,
  X,
  CornerUpLeft,
  Edit2,
  Lock,
} from 'lucide-react';
import { Message } from '../../types';

export interface MessageComposerProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onPickFile?: () => void;
  onFilePicked?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onToggleVoice?: () => void;
  isRecordingVoice?: boolean;
  voiceSeconds?: number;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  canPost?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
  onPickFile,
  onFilePicked,
  fileInputRef,
  onToggleVoice,
  isRecordingVoice = false,
  voiceSeconds = 0,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  canPost = true,
  disabled = false,
  placeholder,
}) => {
  const localFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeFileInputRef = fileInputRef || localFileInputRef;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !value.trim()) return;
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  if (!canPost) {
    return (
      <footer className="flex-shrink-0 bg-white dark:bg-[#0A0F1D] border-t border-slate-200 dark:border-slate-800 p-2 text-center text-xs font-mono text-slate-500 dark:text-slate-400 select-none transition-colors">
        <div className="flex items-center justify-center gap-1.5 py-1">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Faqat kanal ma'murlari xabar yuborishi mumkin.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="flex-shrink-0 bg-white dark:bg-[#0A0F1D] border-t border-slate-200 dark:border-slate-800 p-2 transition-colors z-10">
      {/* 1. Reply Banner */}
      {replyingTo && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 border-l-2 border-[#E07A5F] pl-2 min-w-0">
            <CornerUpLeft size={13} className="text-[#E07A5F] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[#E07A5F]">{replyingTo.senderName}: </span>
              <span className="truncate text-slate-600 dark:text-slate-300">
                {replyingTo.caption || replyingTo.content || 'Fayl'}
              </span>
            </div>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-2"
              title="Bekor qilish"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* 2. Editing Banner */}
      {editingMessage && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-mono animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 min-w-0">
            <Edit2 size={13} className="shrink-0" />
            <span className="truncate">Xabarni tahrirlash</span>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="p-1 rounded-md text-amber-600 dark:text-amber-400 hover:text-rose-500 cursor-pointer ml-2"
              title="Bekor qilish"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* 3. Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => {
            if (onPickFile) {
              onPickFile();
            } else {
              activeFileInputRef.current?.click();
            }
          }}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-[#121A2F] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Fayl yoki rasm biriktirish"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          ref={activeFileInputRef as any}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={onFilePicked}
        />

        {/* Voice Recording Button */}
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2 sm:p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs ${
              isRecordingVoice
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-[#121A2F] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Ovozli xabar"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            isRecordingVoice
              ? `Ovoz yozilmoqda (${voiceSeconds}s)...`
              : editingMessage
              ? 'Tahrirlangan xabarni kiriting...'
              : placeholder || "Xabar yozing..."
          }
          className="flex-1 min-w-0 px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#E07A5F] transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="p-2 sm:p-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-2xs"
          title={editingMessage ? 'Saqlash' : 'Yuborish'}
        >
          {editingMessage ? (
            <Check className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </footer>
  );
};

export default MessageComposer;
