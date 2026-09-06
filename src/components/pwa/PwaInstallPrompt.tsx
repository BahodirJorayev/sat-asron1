'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare, Sparkles, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if already installed & running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();
    if (standalone) return;

    // 2. Check iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('asron_pwa_prompt_dismissed');
    if (isDismissed) return;

    // 3. Listen for Chromium/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 1.5s after load to avoid abrupt prompt
      setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari (which doesn't fire beforeinstallprompt), show after 2.5s
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Fallback timer for desktop/other browsers
    const fallbackTimer = setTimeout(() => {
      if (!isStandalone) {
        setIsVisible(true);
      }
    }, 3000);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsVisible(false);
      setIsInstalledSuccess(true);
      setTimeout(() => setIsInstalledSuccess(false), 3000);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction if browser blocked native prompt
      alert("Ilovani o'rnatish uchun brauzer menyusidan 'Bosh ekranga qo'shish' yoki 'Ilovani o'rnatish' bandini tanlang.");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
        setIsInstalledSuccess(true);
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    sessionStorage.setItem('asron_pwa_prompt_dismissed', 'true');
  };

  if (isStandalone && !isInstalledSuccess) return null;

  return (
    <>
      {/* Success Notification */}
      <AnimatePresence>
        {isInstalledSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#001744] border border-emerald-500/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>ASRON SAT ilovasi muvaffaqiyatli o'rnatildi!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Floating Install Pill Banner */}
      <AnimatePresence>
        {isVisible && !isStandalone && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[420px] select-none font-sans"
          >
            <div className="bg-[#001744]/95 dark:bg-[#001744]/95 backdrop-blur-md border border-[#0B2B6F] text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden">
              {/* Subtle accent glow line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E07A5F] to-transparent opacity-75" />

              {/* Left: App Icon & Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#001744] border border-[#0B2B6F] flex items-center justify-center p-1 shrink-0 shadow-xs">
                  <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#E07A5F] fill-current" fill="none">
                    <rect x="32" y="21" width="11" height="40" rx="5.5" transform="rotate(-45 32 21)" />
                    <rect x="55" y="36" width="11" height="26" rx="5.5" transform="rotate(-45 55 36)" />
                    <path d="M38.5 56.5L49.5 45.5C50.3 44.7 51.7 44.7 52.5 45.5L63.5 56.5" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-tight truncate">
                      ASRON SAT
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#E07A5F]/20 text-[#E07A5F] font-semibold">
                      PWA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    Bosh ekranga o'rnatish & tezkor kirish
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E07A5F] hover:bg-[#c9684f] active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>O'rnatish</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Yopish"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Installation Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none font-sans">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-sm bg-[#001744] border border-[#0B2B6F] rounded-3xl p-5 text-white shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#0B2B6F]/80 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#E07A5F]" />
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    iOS Safari'da O'rnatish
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    Safari brauzerining pastki qismidagi <Share className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> <strong>"Ulashish" (Share)</strong> tugmasini bosing.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    Menyuni biroz pastga surib, <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> <strong>"Bosh ekranga qo'shish" (Add to Home Screen)</strong> bandini tanlang.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    Yuqori o'ng burchakdagi <strong>"Qo'shish" (Add)</strong> tugmasini bosing.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c9684f] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Tushundim
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PwaInstallPrompt;
