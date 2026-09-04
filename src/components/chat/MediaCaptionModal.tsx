import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, FileText, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface MediaCaptionModalProps {
  file: File | null;
  onSend: (file: File, caption: string) => Promise<void>;
  onCancel: () => void;
}

export const MediaCaptionModal: React.FC<MediaCaptionModalProps> = ({
  file,
  onSend,
  onCancel,
}) => {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSend(file, caption.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-5 text-[#0F172A] dark:text-[#F8FAFC] shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            {isImage ? (
              <ImageIcon size={16} className="text-[#E07A5F]" />
            ) : (
              <FileText size={16} className="text-[#E07A5F]" />
            )}
            <span>{isImage ? "Rasm Biriktirish" : "Hujjat Biriktirish"}</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Media Preview Frame */}
        <div className="rounded-xl overflow-hidden bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col items-center justify-center max-h-72">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded-xl"
            />
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#1E293B] text-[#E07A5F] flex items-center justify-center">
                <FileText size={28} />
              </div>
              <div className="font-bold text-xs text-white truncate max-w-[280px]">
                {file.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {fileSizeMb} MB • {file.type || 'Hujjat'}
              </div>
            </div>
          )}
        </div>

        {/* Caption Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
              <span>Izoh / Tagyozuv (Caption)</span>
              <span className="text-[10px] text-slate-400">Markdown, $math$ va ||spoiler|| qo'llab-quvvatlanadi</span>
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Rasm yoki hujjat tagiga izoh yozing..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#E07A5F] resize-none leading-relaxed"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Yuklanmoqda...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Yuborish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
