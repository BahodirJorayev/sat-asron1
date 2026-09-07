'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CinematicSplashScreenProps {
  onComplete?: () => void;
  durationMs?: number;
  allowSkip?: boolean;
}

/**
 * ASRON SAT 3.5-Second Cinematic Launch Splash Screen
 * 
 * Choreography Lifecycle:
 * - Stage 1 (0.0s - 1.2s): Dynamic Close-up & Reveal (scale 1.35 -> 1.2, blur 12px -> 0px, ambient radial glow)
 * - Stage 2 (1.2s - 2.8s): Push-back to Solid Wall (scale 1.2 -> 1.0, luxury cubic-bezier ease [0.16, 1, 0.3, 1])
 * - Stage 3 (2.8s - 3.5s): Seamless Dissolve (overall opacity fade-out 0.7s revealing dashboard)
 */
export const CinematicSplashScreen: React.FC<CinematicSplashScreenProps> = ({
  onComplete,
  durationMs = 3500,
  allowSkip = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Stage 3 dissolve starts at (durationMs - 700ms), completing at exact 3.5s
    const exitDelay = Math.max(0, durationMs - 700);
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, exitDelay);

    // Safeguard onComplete callback
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, durationMs]);

  const handleDismiss = () => {
    if (!allowSkip) return;
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] bg-[#001744] flex items-center justify-center overflow-hidden select-none cursor-pointer"
          onClick={handleDismiss}
          role="dialog"
          aria-label="ASRON SAT Launch Splash"
        >
          {/* Subtle Ambient Background Light */}
          <div className="absolute w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Centered Dynamic Logo Geometry */}
          <motion.div
            initial={{ scale: 1.35, opacity: 0, filter: 'blur(12px)' }}
            animate={{
              scale: [1.35, 1.2, 1.0],
              opacity: [0, 1, 1],
              filter: ['blur(12px)', 'blur(0px)', 'blur(0px)'],
            }}
            transition={{
              duration: 2.8,
              times: [0, 0.428, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]"
          >
            {/* Authentic Pure White Logo Image (Pixel-perfect to brand mark) */}
            <img
              src="/logo-white.png"
              alt="ASRON SAT"
              className="w-full h-full object-contain pointer-events-none select-none"
              loading="eager"
              draggable={false}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const svgEl = target.nextElementSibling;
                if (svgEl) svgEl.classList.remove('hidden');
              }}
            />

            {/* Pure Geometric SVG Representation */}
            <svg
              viewBox="0 0 512 512"
              className="w-full h-full text-white hidden"
              fill="currentColor"
            >
              {/* Left long diagonal bar */}
              <rect x="226" y="76" width="60" height="248" rx="28" transform="rotate(-45 256 200)" />
              {/* Right top short diagonal bar */}
              <rect x="306" y="196" width="58" height="132" rx="28" transform="rotate(-45 335 262)" />
              {/* Bottom chevron wings */}
              <rect x="195" y="240" width="56" height="110" rx="26" transform="rotate(45 223 295)" />
              <rect x="261" y="240" width="56" height="110" rx="26" transform="rotate(-45 289 295)" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicSplashScreen;
