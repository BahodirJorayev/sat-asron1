'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] p-4 transition-colors duration-150">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        {/* Minimalist Icon Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm text-[#E07A5F]">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        {/* Status Tag */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[#E07A5F]/10 text-[#E07A5F] border border-[#E07A5F]/20">
            404 • Sahifa Topilmadi
          </span>
        </div>

        {/* Clean Typography */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Adashib qoldingizmi?
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            Siz qidirayotgan sahifa ko&apos;chirilgan, o&apos;chirilgan yoki manzili noto&apos;g&apos;ri kiritilgan bo&apos;lishi mumkin.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/dashboard');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#0F172A] text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121A2F] hover:bg-slate-100 dark:hover:bg-[#1A243B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E293B] text-sm font-medium transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orqaga</span>
          </button>
        </div>
      </div>
    </div>
  );
}
