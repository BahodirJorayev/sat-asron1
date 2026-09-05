import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  X,
  Layers,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { MockTest, User } from '../types';

interface PreTestModalProps {
  isOpen: boolean;
  test: MockTest | null;
  user: User;
  onClose: () => void;
  onLaunchTest: (test: MockTest, startInFullscreen: boolean) => void;
}

export const PreTestModal: React.FC<PreTestModalProps> = ({
  isOpen,
  test,
  user,
  onClose,
  onLaunchTest,
}) => {
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus primary start button and handle Escape / Enter keys
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        startButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !test) return null;

  const handleLaunch = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request may be blocked by iframe or browser permissions
      });
    }
    onLaunchTest(test, true);
  };

  const isSectional = test.category === 'SECTIONAL_PRACTICE';
  const categoryBadge =
    test.category === 'OFFICIAL_MOCK'
      ? 'Rasmiy · To\'liq Mock'
      : test.category === 'PAST_EXAM'
      ? 'Haqiqiy SAT Imtihoni'
      : 'Sprint Mashqi';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md bg-white dark:bg-[#121A2F] rounded-3xl border border-[#E5E0D8] dark:border-[#1E293B] shadow-2xl overflow-hidden font-sans text-[#1E1B18] dark:text-[#F8FAFC]"
        >
          {/* 1. Header: Test Title & Category Badge */}
          <div className="px-6 py-5 border-b border-[#F0ECE6] dark:border-[#1E293B] flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF5F0] dark:bg-[#0A0F1D] text-[#E07A5F] border border-[#FCD9CE] dark:border-[#1E293B]">
                  {categoryBadge}
                </span>
                {test.isPrivate && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Lock size={10} /> Maxsus
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#1E1B18] dark:text-[#F8FAFC] leading-snug">
                {test.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#78716C] dark:text-[#64748B] hover:text-[#1E1B18] dark:hover:text-[#F8FAFC] hover:bg-[#F0ECE6] dark:hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Structure Preview (Distraction-Free Minimalist Breakdown) */}
          <div className="p-6 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#64748B]">
              Imtihon Tarkibi
            </div>

            <div className="divide-y divide-[#F0ECE6] dark:divide-[#1E293B] rounded-2xl border border-[#F0ECE6] dark:border-[#1E293B] bg-[#FAF8F5] dark:bg-[#0A0F1D] overflow-hidden text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-semibold text-[#1E1B18] dark:text-[#F8FAFC]">
                  Reading &amp; Writing
                </span>
                <span className="font-mono text-[#78716C] dark:text-[#94A3B8]">
                  54 savol (64 daq)
                </span>
              </div>

              {!isSectional && (
                <div className="p-3.5 flex items-center justify-between">
                  <span className="font-semibold text-[#1E1B18] dark:text-[#F8FAFC]">
                    Math (Desmos)
                  </span>
                  <span className="font-mono text-[#78716C] dark:text-[#94A3B8]">
                    44 savol (70 daq)
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-[#78716C] dark:text-[#64748B] text-center pt-1">
              Jami: {isSectional ? '54 savol · 64 daqiqa' : '98 savol · 134 daqiqa'}
            </div>
          </div>

          {/* 3. Single Primary CTA: Testni Boshlash -> */}
          <div className="p-6 pt-0">
            <button
              ref={startButtonRef}
              type="button"
              onClick={handleLaunch}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#c96c53] active:scale-[0.99] text-[#0A0F1D] dark:text-[#0A0F1D] text-sm font-mono font-bold tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Testni Boshlash</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
