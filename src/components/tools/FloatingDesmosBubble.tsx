'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingDesmosBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
  customIconUrl?: string;
  className?: string;
}

const STORAGE_KEY = 'asron_sat_desmos_btn_pos_v2';

export const FloatingDesmosBubble: React.FC<FloatingDesmosBubbleProps> = ({
  isOpen,
  onToggle,
  customIconUrl,
  className = '',
}) => {
  // Default position: bottom-right (16px margin from bottom and right)
  const [coords, setCoords] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 16, y: 120 };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 64) : 16;
    const defaultY =
      typeof window !== 'undefined'
        ? window.innerWidth < 768
          ? Math.max(16, window.innerHeight - 130)
          : Math.max(16, window.innerHeight - 80)
        : 120;
    return { x: defaultX, y: defaultY };
  });

  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Persist position to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
    } catch {}
  }, [coords]);

  // Keep within bounds on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const size = 48;
      const margin = 16;
      setCoords((prev) => {
        const clampedX = Math.min(Math.max(margin, prev.x), winW - size - margin);
        const clampedY = Math.min(Math.max(margin, prev.y), winH - size - margin);
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Magnetic edge-snapping physics
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);

    if (typeof window === 'undefined') return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const size = 48; // w-12 h-12 = 48px
    const margin = 16; // 16px viewport boundary margin

    // Offset point to bubble top-left
    const currentX = Math.max(0, Math.min(info.point.x - size / 2, winW - size));
    const currentY = Math.max(0, Math.min(info.point.y - size / 2, winH - size));

    const distLeft = currentX;
    const distRight = winW - currentX - size;
    const distTop = currentY;
    const distBottom = winH - currentY - size;

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let targetX = currentX;
    let targetY = currentY;

    // Snap to nearest boundary
    if (minDist === distLeft) {
      targetX = margin;
      targetY = Math.min(Math.max(margin, currentY), winH - size - margin);
    } else if (minDist === distRight) {
      targetX = winW - size - margin;
      targetY = Math.min(Math.max(margin, currentY), winH - size - margin);
    } else if (minDist === distTop) {
      targetY = margin;
      targetX = Math.min(Math.max(margin, currentX), winW - size - margin);
    } else {
      targetY = winH - size - margin;
      targetX = Math.min(Math.max(margin, currentX), winW - size - margin);
    }

    setCoords({ x: targetX, y: targetY });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartTimeRef.current = Date.now();
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    const elapsed = Date.now() - dragStartTimeRef.current;
    const dx = Math.abs(e.clientX - dragStartPosRef.current.x);
    const dy = Math.abs(e.clientY - dragStartPosRef.current.y);
    // Only toggle if not a drag gesture
    if (!isDraggingRef.current && elapsed < 250 && dx < 6 && dy < 6) {
      onToggle();
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      animate={{ x: coords.x, y: coords.y }}
      transition={{ type: 'spring', damping: 26, stiffness: 340 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`fixed top-0 left-0 z-50 select-none touch-none ${className}`}
      style={{ willChange: 'transform' }}
    >
      <button
        type="button"
        title="Desmos Graphing Calculator"
        aria-label="Desmos Graphing Calculator"
        className={`w-12 h-12 rounded-full shadow-lg bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow select-none hover:shadow-xl focus:outline-hidden ${
          isOpen ? 'ring-2 ring-[#0A7233]' : ''
        }`}
      >
        {customIconUrl ? (
          <img
            src={customIconUrl}
            alt="Desmos"
            className="w-7 h-7 object-contain rounded-xl pointer-events-none"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            className="w-7 h-7 select-none pointer-events-none shrink-0"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Authentic Green Desmos Squircle */}
            <rect width="200" height="200" rx="46" fill="#0A7233" />

            {/* Parabola Curve (White) */}
            <path
              d="M 54 26 C 60 78, 76 130, 100 130 C 124 130, 140 78, 146 26"
              stroke="white"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Sinusoidal Wave (White) */}
            <path
              d="M 28 104 C 44 116, 56 122, 68 116 C 82 108, 92 88, 108 92 C 124 96, 134 122, 150 114 C 160 108, 168 100, 172 96"
              stroke="white"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </motion.div>
  );
};

export default FloatingDesmosBubble;
