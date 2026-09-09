'use client';

import React from 'react';

export interface ViewSkeletonLoaderProps {
  title?: string;
}

export const ViewSkeletonLoader: React.FC<ViewSkeletonLoaderProps> = ({
  title = 'Yuklanmoqda...',
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans text-[#0F172A] dark:text-[#F8FAFC] animate-pulse">
      {/* 1. Header Strip Skeleton */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-7 w-48 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-3.5 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </header>

      {/* 2. Top Banner / Countdown Skeleton */}
      <div className="w-full h-24 sm:h-28 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-200/50 to-slate-100 dark:from-[#121A2F] dark:via-slate-800/40 dark:to-[#121A2F] border border-slate-200 dark:border-slate-800" />

      {/* 3. Core Metrics Triad Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-2.5 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* 4. Large Module Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-14 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-72 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="h-10 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSkeletonLoader;
