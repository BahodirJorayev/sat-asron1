import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Calculator, Sparkles, Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  isFloating?: boolean;
  isExpanded?: boolean;
  onSnapshot?: (dataUrl: string) => void;
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

const DESMOS_SCRIPT_URL = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

export const DesmosCalculator: React.FC<Props> = ({
  isOpen = true,
  onClose,
  isFloating = false,
  isExpanded: controlledExpanded,
  onSnapshot,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calculatorInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [internalExpanded, setInternalExpanded] = useState<boolean>(false);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // Load Official Desmos API script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Desmos && window.Desmos.GraphingCalculator) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="desmos.com/api"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = DESMOS_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Calculator on container
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.Desmos) return;

    if (!calculatorInstanceRef.current) {
      try {
        const calc = window.Desmos.GraphingCalculator(containerRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          border: false,
          pointsOfInterest: true,
          trace: true,
          decimalToFraction: true,
        });

        // Set authentic SAT starter graphs
        calc.setExpression({ id: 'sat_1', latex: 'y = 2x^2 - 4x - 6', color: '#E07A5F' });
        calc.setExpression({ id: 'sat_2', latex: 'y = x - 3', color: '#2A9D8F' });

        calculatorInstanceRef.current = calc;
      } catch (err) {
        console.warn('Official Desmos init warning:', err);
      }
    }

    return () => {
      if (calculatorInstanceRef.current) {
        try {
          calculatorInstanceRef.current.destroy();
        } catch {}
        calculatorInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  // Quick SAT Formula Inserter
  const handleInsertSatTemplate = (latex: string) => {
    if (calculatorInstanceRef.current) {
      calculatorInstanceRef.current.setExpression({
        id: `sat_${Date.now()}`,
        latex,
        color: '#E07A5F',
      });
    }
  };

  const handleCaptureGraph = () => {
    if (calculatorInstanceRef.current && onSnapshot) {
      try {
        calculatorInstanceRef.current.asyncScreenshot(
          {
            width: 800,
            height: 600,
            targetPixelRatio: 2,
          },
          (dataUrl: string) => {
            onSnapshot(dataUrl);
          }
        );
      } catch (e) {
        console.warn('Desmos screenshot error:', e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl rounded-2xl overflow-hidden ${
        isFloating
          ? 'fixed bottom-4 right-4 z-50 w-[580px] h-[480px]'
          : 'w-full h-full'
      }`}
    >
      {/* Top Header Bar */}
      <div className="h-10 px-4 bg-[#F8FAFC] dark:bg-[#121A2F] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <div className="w-5 h-5 rounded-md bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center">
            <Calculator size={13} />
          </div>
          <span className="text-[#0F172A] dark:text-[#F8FAFC]">Official SAT Desmos API</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            College Board Native
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick SAT Presets */}
          <button
            type="button"
            onClick={() => handleInsertSatTemplate('y_1 \\sim mx_1 + b')}
            className="px-2 py-1 rounded-md bg-[#E2E8F0] dark:bg-[#1E293B] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            title="Linear Regression"
          >
            ~ Regressiya
          </button>
          <button
            type="button"
            onClick={() => handleInsertSatTemplate('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')}
            className="px-2 py-1 rounded-md bg-[#E2E8F0] dark:bg-[#1E293B] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            title="Kvadrat tenglama ildizlari"
          >
            Ildizlar
          </button>

          {isFloating && (
            <button
              type="button"
              onClick={() => setInternalExpanded((prev) => !prev)}
              className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-rose-500 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Official Desmos Mounting Div */}
      <div className="flex-1 w-full h-full relative bg-white min-h-[300px]">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white space-y-2 z-10">
            <div className="w-6 h-6 border-2 border-[#E07A5F] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-400">Official Desmos API yuklanmoqda...</span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full min-h-[350px]" />
      </div>
    </div>
  );
};
