'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../lib/translations';

export interface LanguageSwitcherProps {
  className?: string;
  align?: 'left' | 'right';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  align = 'right',
}) => {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close popover on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeOption =
    supportedLanguages.find((opt) => opt.code === language) || supportedLanguages[0];

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={dropdownRef}>
      {/* Linear / Apple style minimalist trigger pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('selectLanguage', 'Tilni tanlang')}
        title={t('selectLanguage', 'Tilni tanlang')}
        className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-2xs focus:outline-hidden"
      >
        <Globe size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="font-mono uppercase tracking-wider text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100">
          {activeOption.code.toUpperCase()}
        </span>
        <ChevronDown
          size={12}
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Minimalist Floating Dropdown Card */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-44 rounded-2xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('language', 'Til')}
          </div>
          <div className="space-y-0.5">
            {supportedLanguages.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none" role="img" aria-label={opt.label}>
                      {opt.flag}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={13} className="text-[#E07A5F] shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
