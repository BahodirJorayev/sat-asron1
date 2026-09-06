'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import { AsronLogo } from '../AsronLogo';

interface PwaSplashScreenProps {
  forceShow?: boolean;
  videoSrc?: string;
  onFinish?: () => void;
}

export const PwaSplashScreen: React.FC<PwaSplashScreenProps> = ({
  forceShow = false,
  videoSrc,
  onFinish,
}) => {
  const { settings } = usePlatformSettings();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone PWA mode
    const isStandaloneMode =
      forceShow ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      new URLSearchParams(window.location.search).get('splash') === '1';

    // Play upon every standalone app launch
    const hasPlayedThisSession = sessionStorage.getItem('asron_pwa_splash_played');

    if (isStandaloneMode && (!hasPlayedThisSession || forceShow)) {
      setIsVisible(true);
      sessionStorage.setItem('asron_pwa_splash_played', 'true');
    }
  }, [forceShow]);

  // Cinematic canvas animation fallback/accent
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for digital SAT intelligence effect
    const particles = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let startTime = performance.now();
    const duration = 2400; // 2.4 seconds

    const render = (time: number) => {
      const elapsed = time - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      ctx.clearRect(0, 0, width, height);

      // Deep dark navy backdrop
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      bgGrad.addColorStop(0, '#00256B');
      bgGrad.addColorStop(0.6, '#001744');
      bgGrad.addColorStop(1, '#000D27');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 122, 95, ${p.alpha * 0.7})`;
        ctx.fill();
      });

      // Ambient glowing radar circle behind emblem
      const pulse = Math.sin((elapsed / 300) * Math.PI) * 12;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 30, 80 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224, 122, 95, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (elapsed < duration) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        handleDismiss();
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    onFinish?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] bg-[#001744] flex flex-col items-center justify-center select-none font-sans overflow-hidden"
        >
          {/* Dynamic Interactive Canvas Background */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Optional Branded Video Source if available */}
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted
              playsInline
              onEnded={handleDismiss}
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none mix-blend-screen"
            />
          )}

          {/* Skip Button (Top Right) */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-5 right-5 z-20 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 text-xs font-mono border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>O'tkazib yuborish</span>
            <ArrowRight size={12} />
          </button>

          {/* Central Animated Splash Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-6">
            {/* Glowing Logo Emblem with Spring In */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 220 }}
              className="relative"
            >
              {/* Pulsing Aura */}
              <div className="absolute -inset-4 rounded-3xl bg-[#E07A5F]/20 blur-xl animate-pulse" />

              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#001744] border-2 border-[#E07A5F]/60 flex items-center justify-center shadow-2xl shadow-orange-500/20 overflow-hidden p-2">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <AsronLogo size={64} variant="mark-only" />
                )}
              </div>
            </motion.div>

            {/* Title & Brand Slogan */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-1.5"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {settings.platform_title || 'ASRON SAT'}
              </h1>
              <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-slate-400">
                {settings.tagline || 'Digital SAT Intelligence Platform'}
              </p>
            </motion.div>

            {/* Launch Progress Meter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="w-44 sm:w-56 space-y-2 pt-2"
            >
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00256B] via-[#E07A5F] to-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles size={10} className="text-[#E07A5F]" />
                  Yuklanmoqda...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </motion.div>
          </div>

          {/* Footer College Board Bluebook Alignment */}
          <div className="absolute bottom-6 text-center text-[10px] font-mono text-slate-500">
            Bluebook Standard • Adaptive SAT Engine
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaSplashScreen;
