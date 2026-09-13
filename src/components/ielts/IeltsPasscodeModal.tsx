'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, AlertCircle, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { IeltsMockTest } from '../../types';
import { INITIAL_IELTS_MOCK_TESTS } from '../../data/ieltsDatabase';

interface IeltsPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTest?: IeltsMockTest | null;
  onSuccess: (unlockedTest: IeltsMockTest) => void;
}

export const IeltsPasscodeModal: React.FC<IeltsPasscodeModalProps> = ({
  isOpen,
  onClose,
  targetTest,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim().toUpperCase();

    if (!cleanCode) {
      setError('Iltimos, dars kodini kiriting');
      triggerShake();
      return;
    }

    if (cleanCode.length < 3) {
      setError("Kod kamida 3 ta belgidan iborat bo'lishi kerak");
      triggerShake();
      return;
    }

    // Retrieve active classroom tests (from localStorage overrides or initial database)
    let allTests = INITIAL_IELTS_MOCK_TESTS;
    if (typeof window !== 'undefined') {
      try {
        const customTests = localStorage.getItem('asron_custom_ielts_tests');
        if (customTests) {
          const parsed = JSON.parse(customTests);
          allTests = [...parsed, ...INITIAL_IELTS_MOCK_TESTS];
        }
      } catch (err) {
        console.error('Error loading custom tests:', err);
      }
    }

    let matchedTest: IeltsMockTest | undefined;

    if (targetTest) {
      // Direct check against target test
      const targetCode = targetTest.accessCode || targetTest.passcode;
      if (targetCode && targetCode.toUpperCase() === cleanCode) {
        matchedTest = targetTest;
      }
    } else {
      // Find matching test among all classroom tests
      matchedTest = allTests.find((t) => {
        const testCode = t.accessCode || t.passcode;
        return Boolean(testCode && testCode.toUpperCase() === cleanCode);
      });
    }

    if (matchedTest) {
      setError(null);
      setIsSuccess(true);

      // Persist unlocked test ID in localStorage
      if (typeof window !== 'undefined') {
        try {
          const currentUnlocked = JSON.parse(localStorage.getItem('asron_unlocked_ielts_tests') || '[]');
          if (!currentUnlocked.includes(matchedTest.id)) {
            currentUnlocked.push(matchedTest.id);
            localStorage.setItem('asron_unlocked_ielts_tests', JSON.stringify(currentUnlocked));
          }
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onSuccess(matchedTest!);
      }, 1000);
    } else {
      setError("Noto'g'ri kod. Ustozingiz taqdim etgan kodni qayta tekshirib ko'ring.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [-8, 8, -6, 6, -3, 3, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="flex justify-center mb-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : error
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/25'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              ) : error ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {targetTest ? targetTest.title : 'Maxsus Dars Testini Qulfdan Chiqarish'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {targetTest
                ? targetTest.classroomNotice || "Ushbu testga kirish uchun ustozingiz taqdim etgan parolni kiriting."
                : "Ustozingiz yoki o'quv markazingiz taqdim etgan maxsus dars kodini kiriting."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dars Passkodi (Masalan: CORE-W3)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder="KODNI KIRITING..."
                  autoFocus
                  maxLength={15}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-center tracking-widest text-lg font-mono font-bold uppercase transition-all bg-slate-50 dark:bg-slate-800 border ${
                    error
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-rose-600 dark:text-rose-400'
                      : isSuccess
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  } outline-none`}
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs font-medium text-rose-500 flex items-center gap-1.5 justify-center"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </motion.p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSuccess}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-[0.99]'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Qabul qilindi! Ochilmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Testni Faollashtirish
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passkod yo&apos;qmi? Kurs o&apos;qituvchingizga murojaat qiling yoki standart bepul testlarni yeching.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
