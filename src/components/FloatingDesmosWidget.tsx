import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DesmosSatHack, GlobalPlatformSettings } from '../types';
import { FloatingDesmosModal } from './FloatingDesmosModal';
import { DesmosLogoIcon } from './DesmosLogoIcon';
import { INITIAL_SAT_DESMOS_HACKS } from '../data/desmosHacksData';

interface Props {
  hacks?: DesmosSatHack[];
  globalSettings?: GlobalPlatformSettings;
  isDarkMode?: boolean;
}

const STORAGE_KEYS = {
  DESMOS_OPEN: 'asron_sat_desmos_open',
  DESMOS_BTN_POS: 'asron_sat_desmos_btn_pos_v2',
};

export const FloatingDesmosWidget: React.FC<Props> = ({
  hacks = INITIAL_SAT_DESMOS_HACKS,
  globalSettings,
  isDarkMode,
}) => {
  const isEnabled = globalSettings?.desmosEnabled ?? true;
  const customIconUrl = globalSettings?.desmosIconUrl;

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DESMOS_OPEN);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Calculate default position: bottom-right (x: window.innerWidth - 60, y: window.innerHeight - 80)
  const [coords, setCoords] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 16, y: 120 };
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DESMOS_BTN_POS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 60) : 16;
    const defaultY = typeof window !== 'undefined' ? (window.innerWidth < 768 ? Math.max(16, window.innerHeight - 130) : Math.max(16, window.innerHeight - 80)) : 120;
    return { x: defaultX, y: defaultY };
  });

  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DESMOS_OPEN, JSON.stringify(isOpen));
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DESMOS_BTN_POS, JSON.stringify(coords));
    } catch {}
  }, [coords]);

  // Adjust coordinates if window resizes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const bottomInset = winW < 768 ? 120 : 60;
      setCoords((prev) => {
        const snapLeft = prev.x < winW / 2;
        const targetX = snapLeft ? 16 : Math.max(16, winW - 60);
        const targetY = Math.min(Math.max(16, prev.y), Math.max(16, winH - bottomInset));
        return { x: targetX, y: targetY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isEnabled) return null;

  // Magnetic edge-snapping physics
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);

    if (typeof window === 'undefined') return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const currentX = info.point.x;
    const currentY = info.point.y;

    // Magnetic horizontal snapping: Left (16px) or Right (winW - 60px)
    const isLeftHalf = currentX < winW / 2;
    const targetX = isLeftHalf ? 16 : Math.max(16, winW - 60);

    // Clamped vertical boundary: 16px <= Y <= winH - 60px
    const targetY = Math.min(Math.max(16, currentY - 22), Math.max(16, winH - 60));

    setCoords({ x: targetX, y: targetY });
  };

  const handlePointerDown = () => {
    dragStartTimeRef.current = Date.now();
  };

  const handleClick = () => {
    // Distinguish quick click from drag release
    if (!isDraggingRef.current && Date.now() - dragStartTimeRef.current < 250) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <>
      {/* Draggable Circular Button with Magnetic Snapping Physics */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.12}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: coords.x, y: coords.y }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className="fixed top-0 left-0 z-50 select-none touch-none"
      >
        <button
          type="button"
          className="w-11 h-11 rounded-full bg-[#0B1B3D] text-white dark:bg-[#E07A5F] shadow-lg border border-white/20 flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-none transition-colors"
          title="Desmos Graphing Suite"
          aria-label="Desmos Graphing Suite"
        >
          {customIconUrl ? (
            <img
              src={customIconUrl}
              alt="Desmos"
              className="w-6 h-6 object-contain rounded-full pointer-events-none"
            />
          ) : (
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 pointer-events-none">
              <DesmosLogoIcon size={24} showText={false} />
            </div>
          )}
        </button>
      </motion.div>

      {/* 2-Stage Desmos Viewport Modal */}
      <FloatingDesmosModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        hacks={hacks}
        customIconUrl={customIconUrl}
        isDarkMode={isDarkMode}
      />
    </>
  );
};
