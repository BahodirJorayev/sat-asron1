'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error safely
    console.error('Dashboard error boundary captured exception:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 selection:bg-[#E07A5F] selection:text-white">
      <div className="w-full max-w-md bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Error Capsule Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
          <AlertCircle size={32} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kutilmagan xatolik yuz berdi
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Ushbu sahifani yuklashda xatolik yuzaga keldi. Iltimos, sahifani qayta yangilang yoki bosh sahifaga qayting.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-left overflow-hidden">
              <p className="font-mono text-xs text-rose-600 dark:text-rose-400 truncate">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#E07A5F] hover:bg-[#c96248] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Qayta urinish</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Home size={16} />
            <span>Bosh sahifa</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
