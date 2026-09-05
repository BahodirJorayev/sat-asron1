'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error boundary captured exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center p-4 selection:bg-[#E07A5F] selection:text-white font-sans transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Error Symbol */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
          <AlertTriangle size={32} strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ilovada xatolik yuz berdi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Kutilmagan xatolik tufayli sahifa yuklanmadi. Iltimos, sahifani qayta yangilang yoki bosh sahifaga qayting.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-left overflow-hidden">
              <p className="font-mono text-xs text-rose-600 dark:text-rose-400 truncate">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#E07A5F] hover:bg-[#c96248] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Qayta urinish</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/dashboard';
              }
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Bosh sahifa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
