'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Minimize2,
  Maximize2,
  X,
  Check,
} from 'lucide-react';
import { DesmosSatHack } from '../../types';
import { DesmosHacksDrawer } from '../DesmosHacksDrawer';
import { INITIAL_SAT_DESMOS_HACKS } from '../../data/desmosHacksData';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpression?: string;
  hacks?: DesmosSatHack[];
  customIconUrl?: string;
  isDarkMode?: boolean;
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        element: HTMLElement,
        options?: Record<string, any>
      ) => any;
    };
  }
}

export const DesmosModal: React.FC<DesmosModalProps> = ({
  isOpen,
  onClose,
  initialExpression,
  hacks = INITIAL_SAT_DESMOS_HACKS,
  customIconUrl,
  isDarkMode: propDarkMode,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'HACKS'>('CALCULATOR');
  const [apiLoaded, setApiLoaded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dragControls = useDragControls();
  const calcContainerRef = useRef<HTMLDivElement | null>(null);
  const desmosCalcInstance = useRef<any>(null);

  // Determine dark mode
  const isDark =
    propDarkMode ??
    (typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'));

  // Load Official Desmos API script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Desmos) {
      setApiLoaded(true);
      return;
    }

    const scriptId = 'desmos-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src =
        'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
      script.async = true;
      script.onload = () => {
        setApiLoaded(true);
      };
      script.onerror = () => {
        console.warn('Official Desmos API script could not load, using embed fallback.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setApiLoaded(true));
    }
  }, []);

  // Initialize or update Desmos Graphing Calculator instance
  useEffect(() => {
    if (!isOpen || activeTab !== 'CALCULATOR' || !calcContainerRef.current) return;

    if (window.Desmos && !desmosCalcInstance.current) {
      try {
        const calc = window.Desmos.GraphingCalculator(calcContainerRef.current, {
          keypad: true,
          graphpaper: true,
          expressions: true,
          settingsMenu: true,
          border: false,
          invertedColors: isDark,
          projectorMode: false,
          degreeMode: false,
        });

        // Set initial expression or sample expressions for SAT
        if (initialExpression) {
          calc.setExpression({
            id: 'init_expr',
            latex: initialExpression,
            color: '#2563EB',
          });
        } else {
          calc.setExpression({
            id: 'sat_parabola',
            latex: 'y = 2x^2 - 8x + 6',
            color: '#2563EB',
          });
          calc.setExpression({
            id: 'sat_line',
            latex: 'y = -x + 3',
            color: '#E07A5F',
          });
        }

        desmosCalcInstance.current = calc;
      } catch (err) {
        console.error('Error instantiating Desmos Graphing Calculator:', err);
      }
    } else if (desmosCalcInstance.current) {
      try {
        desmosCalcInstance.current.updateSettings({
          invertedColors: isDark,
        });
        desmosCalcInstance.current.resize();
      } catch {}
    }
  }, [isOpen, activeTab, apiLoaded, isDark, isExpanded, initialExpression]);

  // Insert formula from Hacks library into active Desmos instance
  const handleInsertFormula = (latexFormula: string) => {
    setActiveTab('CALCULATOR');
    showToast('Formula Desmosga kiritildi');

    setTimeout(() => {
      if (desmosCalcInstance.current) {
        const lines = latexFormula.split('\n');
        lines.forEach((line, idx) => {
          if (line.trim()) {
            desmosCalcInstance.current.setExpression({
              id: `sat_hack_${Date.now()}_${idx}`,
              latex: line.trim(),
            });
          }
        });
      }
    }, 150);
  };

  // Reset calculator to blank state
  const handleResetCalculator = () => {
    if (desmosCalcInstance.current) {
      desmosCalcInstance.current.setBlank();
      showToast('Kalkulyator tozalandi');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center sm:justify-end sm:items-start p-2 sm:p-6 select-none font-sans">
      {/* Draggable Bluebook-Accurate Desmos Window */}
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`pointer-events-auto bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 text-slate-800 dark:text-slate-100 relative ${
          isExpanded
            ? 'w-[94vw] sm:w-[820px] h-[75vh] sm:h-[640px] max-w-[94vw] max-h-[88vh]'
            : 'w-[94vw] sm:w-[590px] h-[65vh] sm:h-[540px] max-w-[94vw] max-h-[85vh]'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-mono font-medium shadow-md flex items-center gap-1.5 border border-slate-700/30"
            >
              <Check className="w-3.5 h-3.5 text-[#0A7233]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Redesign: Platform Minimalism & Bluebook Standard */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="bg-slate-100 dark:bg-[#131C31] text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 px-3.5 py-2 flex items-center justify-between select-none cursor-move rounded-t-2xl shrink-0"
        >
          {/* Left: Clean Desmos SVG icon + Desmos Kalkulyator text */}
          <div className="flex items-center gap-2 pointer-events-none truncate">
            {customIconUrl ? (
              <img
                src={customIconUrl}
                alt="Desmos"
                className="w-5 h-5 rounded-md object-contain shrink-0"
              />
            ) : (
              <svg
                viewBox="0 0 200 200"
                className="w-5 h-5 rounded-md overflow-hidden shrink-0"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="200" height="200" rx="46" fill="#0A7233" />
                <path
                  d="M 54 26 C 60 78, 76 130, 100 130 C 124 130, 140 78, 146 26"
                  stroke="white"
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 28 104 C 44 116, 56 122, 68 116 C 82 108, 92 88, 108 92 C 124 96, 134 122, 150 114 C 160 108, 168 100, 172 96"
                  stroke="white"
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="text-xs font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
              Desmos Kalkulyator
            </span>
          </div>

          {/* Middle: Minimal Tab Pill [ 🧮 Desmos | ✨ SAT Hacks ] */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-[#1E293B]/70 border border-slate-300/40 dark:border-slate-700/40 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveTab('CALCULATOR')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'CALCULATOR'
                  ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🧮</span>
              <span>Desmos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HACKS')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'HACKS'
                  ? 'bg-white dark:bg-[#0F172A] text-[#E07A5F] dark:text-[#E07A5F] shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>✨</span>
              <span>SAT Hacks</span>
            </button>
          </div>

          {/* Right: Minimal Action Icons (Reset, Minimize/Maximize, Close) */}
          <div
            className="flex items-center gap-1 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {activeTab === 'CALCULATOR' && (
              <button
                type="button"
                onClick={handleResetCalculator}
                title="Tozalash"
                aria-label="Tozalash"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Kichiklashtirish' : 'Kattalashtirish'}
              aria-label={isExpanded ? 'Kichiklashtirish' : 'Kattalashtirish'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Yopish"
              aria-label="Yopish"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-white dark:bg-[#0A0F1D]">
          {activeTab === 'CALCULATOR' ? (
            <div className="w-full h-full relative flex flex-col">
              {/* Desmos Graphing API Container */}
              <div
                ref={calcContainerRef}
                className="w-full flex-1 border-0"
                style={{ minHeight: '100%' }}
              />

              {/* Clean Fallback Embed Iframe if script is still loading */}
              {!window.Desmos && (
                <iframe
                  src={`https://www.desmos.com/calculator?embed${
                    isDark ? '&invertedColors=true' : ''
                  }`}
                  title="Official Desmos Graphing Suite"
                  className="w-full h-full border-0 absolute inset-0 bg-white dark:bg-[#0A0F1D]"
                  allow="clipboard-read; clipboard-write"
                />
              )}
            </div>
          ) : (
            <DesmosHacksDrawer
              hacks={hacks}
              onInsertFormula={handleInsertFormula}
              onClose={() => setActiveTab('CALCULATOR')}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DesmosModal;
