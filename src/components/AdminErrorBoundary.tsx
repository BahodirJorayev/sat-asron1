import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Minimalist executive error boundary for Admin sub-routes and modules.
 * Traps runtime crashes (e.g. malformed JSON options, unexpected null fields)
 * and renders a clean recovery card instead of a blank white screen.
 */
export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AdminErrorBoundary caught error in ${this.props.moduleName || 'Admin'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-rose-200 dark:border-rose-900/40 shadow-sm text-[#0F172A] dark:text-[#F8FAFC] space-y-4 font-sans my-4">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider">
              {this.props.moduleName || 'Modul'} yuklanishida xatolik yuz berdi
            </h3>
          </div>

          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono leading-relaxed">
            {this.state.error?.message || "Kutilmagan ma'lumotlar formati sababli modul render qilinmadi. Qayta urinib ko'ring."}
          </p>

          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta urinish</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
