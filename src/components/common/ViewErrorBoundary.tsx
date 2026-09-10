'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export interface ViewErrorBoundaryProps {
  children: ReactNode;
  moduleName?: string;
  onReset?: () => void;
  fallbackTitle?: string;
}

interface ViewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Robust ViewErrorBoundary to isolate view-level runtime exceptions.
 * Prevents a single view crash from crashing the whole application shell (Sidebar, Header, Navigation).
 */
export class ViewErrorBoundary extends Component<ViewErrorBoundaryProps, ViewErrorBoundaryState> {
  public declare props: ViewErrorBoundaryProps;
  public declare setState: (
    state: Partial<ViewErrorBoundaryState> | ((prevState: ViewErrorBoundaryState) => Partial<ViewErrorBoundaryState>),
    callback?: () => void
  ) => void;

  public state: ViewErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ViewErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ViewErrorBoundary caught error in ${this.props.moduleName || 'View'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard';
    }
  };

  public render() {
    if (this.state.hasError) {
      const name = this.props.moduleName || 'Sahifa';
      return (
        <div className="p-6 sm:p-10 max-w-3xl mx-auto my-8 rounded-3xl bg-white dark:bg-[#121A2F] border border-rose-200 dark:border-rose-900/40 shadow-lg text-[#0F172A] dark:text-[#F8FAFC] space-y-6 font-sans animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                {name} Moduli
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                {this.props.fallbackTitle || `${name} yuklanishida kutilmagan xatolik yuz berdi`}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-mono leading-relaxed bg-slate-50 dark:bg-[#0A0F1D] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {this.state.error?.message || "Kutilmagan ma'lumotlar formati sababli modulni to'liq render qilib bo'lmadi. Sahifani qayta yuklang yoki dashboardga qayting."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-slate-200 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Qayta urinish</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC] text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboardga qaytish</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ViewErrorBoundary;
