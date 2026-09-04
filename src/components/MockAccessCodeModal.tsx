import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, X, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { MockTest } from '../types';

interface MockAccessCodeModalProps {
  isOpen: boolean;
  test: MockTest | null;
  onClose: () => void;
  onSuccessUnlock: (test: MockTest) => void;
}

export const MockAccessCodeModal: React.FC<MockAccessCodeModalProps> = ({
  isOpen,
  test,
  onClose,
  onSuccessUnlock,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setIsVerifying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !test) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    const enteredClean = code.trim().toUpperCase();
    const targetClean = (test.accessCode || 'ASRON-2026').trim().toUpperCase();

    // Check code match (also accept default universal code if assigned or standard format)
    if (enteredClean === targetClean || enteredClean === 'ASRON-2026') {
      setIsVerifying(false);
      onSuccessUnlock(test);
      onClose();
    } else {
      setIsVerifying(false);
      setError('Noto‘g‘ri kod. Iltimos, ustozingizdan to‘g‘ri kodni so‘rang.');
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]"
        >
          {/* Header Bar */}
          <div className="p-6 pb-4 flex items-start justify-between border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] dark:bg-[#1E293B] border border-[#FCD9CE] dark:border-[#334155] text-[#E07A5F] flex items-center justify-center shadow-xs shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  Maxsus Kirish Kodingizni Kiriting
                </h3>
                <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5 truncate max-w-[240px]">
                  {test.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleVerify} className="p-6 space-y-5">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Ushbu mock test maxsus kurs o‘quvchilari uchun mo‘ljallangan. Agar kurs o‘quvchisi bo‘lsangiz, ustozingiz taqdim etgan maxsus kodni kiriting.
            </p>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                <KeyRound size={12} className="text-[#E07A5F]" />
                <span>Maxsus Kirish Kodi</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="ASRON-2026"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full py-3 px-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-base font-mono font-bold tracking-widest text-center uppercase text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                disabled={!code.trim() || isVerifying}
                className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96a51] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Tasdiqlash va Boshlash</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
