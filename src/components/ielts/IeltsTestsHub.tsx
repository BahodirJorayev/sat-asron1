'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Layers, Sparkles, Award, Headphones, BookOpen, PenTool, Mic } from 'lucide-react';
import { User } from '../../types';
import { IeltsMockTestsCatalogView } from './IeltsMockTestsCatalogView';
import { IeltsSectionalPracticeView } from './IeltsSectionalPracticeView';

interface IeltsTestsHubProps {
  user?: User | null;
  initialTab?: 'mocks' | 'practice';
  onOpenPaywall?: () => void;
  onOpenMistakeVault?: () => void;
}

export const IeltsTestsHub: React.FC<IeltsTestsHubProps> = ({
  user,
  initialTab = 'mocks',
  onOpenPaywall,
  onOpenMistakeVault,
}) => {
  const [activeTab, setActiveTab] = useState<'mocks' | 'practice'>(initialTab);

  return (
    <div className="space-y-6 pb-12 font-sans select-none text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Top Unified IELTS Testing Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold">
            <Sparkles size={13} />
            <span>IELTS TESTLAR MARKAZI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            IELTS Test &amp; Ko‘nikmalar Markazi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            To‘liq 4-ko‘nikmali rasmiy simulyatorlar yoki alohida bo‘lim va savol turlari bo‘yicha intensiv mashqlar.
          </p>
        </div>

        {/* Segmented Switcher Controls */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('mocks')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mocks'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={15} />
            <span>To‘liq Mocklar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={15} />
            <span>Ko‘nikmalar &amp; Savol Turlari</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'mocks' ? (
          <motion.div
            key="mocks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <IeltsMockTestsCatalogView
              user={user}
              onOpenPaywall={onOpenPaywall}
            />
          </motion.div>
        ) : (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <IeltsSectionalPracticeView
              user={user}
              onOpenPaywall={onOpenPaywall}
              onOpenMistakeVault={onOpenMistakeVault}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
