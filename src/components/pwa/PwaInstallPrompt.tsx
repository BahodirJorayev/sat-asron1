'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Check, Smartphone, ExternalLink, Sparkles, ChevronDown } from 'lucide-react';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import { useLanguage } from '../../context/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Authentic Apple iOS SF Symbols Share Icon (Upward arrow exiting from square container)
 */
export const AppleShareIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

/**
 * Authentic Apple iOS Add to Home Screen Icon (Square with plus sign)
 */
export const AppleAddToHomeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/**
 * Global helper to trigger the PWA install flow from anywhere in the application
 */
export const triggerPwaInstall = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('asron_open_pwa_install'));
  }
};

export const PwaInstallPrompt: React.FC = () => {
  const { settings } = usePlatformSettings();
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isIPad, setIsIPad] = useState<boolean>(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if already running in standalone / PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();
    if (standalone) return;

    // 2. Accurate iOS & iPadOS Detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      (/iphone|ipad|ipod/.test(ua) && !(window as any).MSStream) ||
      (ua.includes('macintosh') && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
    const isIpadDevice =
      /ipad/.test(ua) ||
      (ua.includes('macintosh') && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
    const inApp =
      /fban|fbav|instagram|telegram|twitter|line|micromessenger|bytedance|webview/i.test(ua);

    setIsIOS(isIosDevice);
    setIsIPad(isIpadDevice);
    setIsInAppBrowser(inApp);

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('asron_pwa_prompt_dismissed');

    // 3. Listen for Chromium / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        // Wait 1.5s after load to avoid abrupt prompt
        setTimeout(() => {
          setIsVisible(true);
        }, 1500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari (which doesn't fire beforeinstallprompt), show after 2.5s
    if (isIosDevice && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Fallback timer for desktop/other browsers
    const fallbackTimer = setTimeout(() => {
      if (!standalone && !isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsVisible(false);
      setShowIOSGuide(false);
      setIsInstalledSuccess(true);
      setTimeout(() => setIsInstalledSuccess(false), 3500);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for external trigger events (from settings, profile, header)
    const handleManualTrigger = () => {
      if (isIosDevice) {
        setShowIOSGuide(true);
      } else if (deferredPrompt) {
        handleInstallClick();
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener('asron_open_pwa_install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('asron_open_pwa_install', handleManualTrigger);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert(
        t(
          'common.installAppDesc',
          "Ilovani o'rnatish uchun brauzer menyusidan 'Bosh ekranga qo'shish' yoki 'Ilovani o'rnatish' bandini tanlang."
        )
      );
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

  const appTitle = settings.platform_title || 'ASRON SAT';
  const appLogo = settings.logo_url && settings.logo_url.trim() ? settings.logo_url.trim() : '/logo.png';

  return (
    <>
      {/* 1. Success Toast Notification */}
      <AnimatePresence>
        {isInstalledSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-2xl bg-[#001744]/95 border border-emerald-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{t('common.pwaInstalledSuccess', `${appTitle} ilovasi muvaffaqiyatli o'rnatildi!`)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Modern Glassmorphic Floating Install Pill */}
      <AnimatePresence>
        {isVisible && !isStandalone && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[92vw] max-w-[420px] select-none font-sans"
          >
            <div className="bg-[#001744]/95 dark:bg-[#001744]/95 backdrop-blur-xl border border-[#0B2B6F] text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden">
              {/* Subtle top accent gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E07A5F] to-transparent opacity-80" />

              {/* Left: App Icon & Brand Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-[22%] bg-[#03165a] border border-white/15 flex items-center justify-center shrink-0 shadow-md overflow-hidden p-1">
                  <img
                    src={appLogo}
                    alt={`${appTitle} Logo`}
                    className="w-full h-full object-contain rounded-[18%]"
                  />
                </div>

                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-tight truncate">
                      {appTitle}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#E07A5F]/20 text-[#E07A5F] font-semibold">
                      {isIOS ? 'iOS App' : 'PWA'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    {t('common.pwaBannerDesc', "Bosh ekranga o'rnatish & tezkor kirish")}
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E07A5F] hover:bg-[#c9684f] active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('common.installPwa', "O'rnatish")}</span>
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

      {/* 3. Bulletproof Native-Feeling Apple iOS Installation Modal Flow */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md select-none font-sans">
            {/* Backdrop Dismiss Click Target */}
            <div className="absolute inset-0" onClick={() => setShowIOSGuide(false)} />

            {/* Apple iOS Bottom Sheet on Mobile / Centered Card on Tablet & Desktop */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-w-md bg-[#001744]/95 border-t sm:border border-white/15 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 text-white shadow-2xl backdrop-blur-2xl space-y-4 max-h-[92dvh] overflow-y-auto"
            >
              {/* iOS Grab Handle Bar at top */}
              <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto -mt-1 mb-1 sm:hidden" />

              {/* Modal Header: App Identity & Close */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[22%] bg-[#03165a] border border-white/20 p-1 flex items-center justify-center shadow-md shrink-0">
                    <img
                      src={appLogo}
                      alt={appTitle}
                      className="w-full h-full object-contain rounded-[18%]"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                      <span>{t('common.iosGuideTitle', "iOS Safari'da O'rnatish")}</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      {t('common.iosGuideSubtitle', "Rasmiy web ilovani bosh ekranga qo'shing")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* In-App Browser Warning Banner (Telegram, Instagram, Facebook Webview) */}
              {isInAppBrowser && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="font-semibold text-amber-300 block mb-0.5">
                      Ichki brauzer aniqlandi
                    </strong>
                    {t(
                      'common.iosInAppNotice',
                      "Ilovani to'liq o'rnatish uchun ushbu sahifani Safari brauzerida oching. (Tugma: ... -> Safarida ochish)"
                    )}
                  </div>
                </div>
              )}

              {/* Step-by-Step Native Walkthrough with Authentic Apple Icons */}
              <div className="space-y-2.5 text-xs text-slate-200">
                {/* Step 1: Tap Share */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#007AFF]/20 border border-[#007AFF]/40 text-[#007AFF] flex items-center justify-center shrink-0 shadow-xs">
                    <AppleShareIcon className="w-4 h-4 text-[#3898FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-xs mb-0.5">
                      1. {t('common.iosStep1Title', "Ulashish menyusini oching")}
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      {isIPad
                        ? t(
                            'common.iosStep1DescIpad',
                            'Safari brauzerining yuqori panelidagi "Ulashish" (Share) tugmasini bosing.'
                          )
                        : t(
                            'common.iosStep1Desc',
                            'Safari brauzerining pastki qismidagi "Ulashish" (Share) tugmasini bosing.'
                          )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Add to Home Screen */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                    <AppleAddToHomeIcon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-xs mb-0.5">
                      2. {t('common.iosStep2Title', "Bosh ekranga qo'shishni tanlang")}
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      {t(
                        'common.iosStep2Desc',
                        'Menyuni pastga surib, "Bosh ekranga qo\'shish" (Add to Home Screen) bandini tanlang.'
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Tap Add */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#E07A5F]/20 border border-[#E07A5F]/40 text-[#E07A5F] flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-xs mb-0.5">
                      3. {t('common.iosStep3Title', "Qo'shishni tasdiqlang")}
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      {t(
                        'common.iosStep3Desc',
                        'Yuqori o\'ng burchakdagi "Qo\'shish" (Add) tugmasini bosing.'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Downward Pointer Indicator for iPhone Safari Bottom Bar */}
              {!isIPad && (
                <div className="py-1 px-3 rounded-xl bg-[#001744]/80 border border-white/10 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-300 text-center animate-pulse">
                  <span>{t('common.iosTapBelow', 'Pastdagi "Ulashish" (Share) tugmasini bosing')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                </div>
              )}

              {/* Action Button: Understood */}
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3 rounded-2xl bg-[#E07A5F] hover:bg-[#c9684f] active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                {t('common.iosUnderstood', "Tushundim")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PwaInstallPrompt;

