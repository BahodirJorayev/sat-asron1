'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, X, Check, Clock } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';

export interface OfficialExamDatePreset {
  id: string;
  label: string;
  dateString: string;
  season: string;
}

export const OFFICIAL_SAT_PRESETS: OfficialExamDatePreset[] = [
  { id: 'sat-2026-05', label: '2-May, 2026', dateString: '2026-05-02T08:00:00', season: 'Bahor 2026' },
  { id: 'sat-2026-06', label: '6-Iyun, 2026', dateString: '2026-06-06T08:00:00', season: 'Yoz 2026' },
  { id: 'sat-2026-08', label: '29-Avgust, 2026', dateString: '2026-08-29T08:00:00', season: 'Kuz 2026' },
  { id: 'sat-2026-10', label: '3-Oktyabr, 2026', dateString: '2026-10-03T08:00:00', season: 'Kuz 2026' },
  { id: 'sat-2026-11', label: '7-Noyabr, 2026', dateString: '2026-11-07T08:00:00', season: 'Qish 2026' },
  { id: 'sat-2026-12', label: '5-Dekabr, 2026', dateString: '2026-12-05T08:00:00', season: 'Qish 2026' },
];

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

interface ExamCountdownWidgetProps {
  initialTargetDate?: string;
  userId?: string;
  onTargetDateChange?: (newDate: string) => void;
  className?: string;
}

export const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  initialTargetDate = '2026-10-03T08:00:00',
  userId,
  onTargetDateChange,
  className = '',
}) => {
  // 1. Resolve Target Date from LocalStorage or Prop
  const [targetDate, setTargetDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asron_target_exam_date');
      if (saved) return saved;
    }
    return initialTargetDate;
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customInputDate, setCustomInputDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // 2. High-precision Calculation
  const calculateRemaining = useCallback((targetIso: string): TimeRemaining => {
    const targetMs = new Date(targetIso).getTime();
    const nowMs = Date.now();
    const diff = Math.max(0, targetMs - nowMs);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, totalMs: diff };
  }, []);

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateRemaining(targetDate));

  // 3. 1-second live interval
  useEffect(() => {
    setTimeLeft(calculateRemaining(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(calculateRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, calculateRemaining]);

  // 4. Modal Keydown Listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // 5. Persist Date & Sync to Supabase
  const handleSaveDate = async (newDateIso: string) => {
    setIsSaving(true);
    setStatusFeedback(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('asron_target_exam_date', newDateIso);
      }

      setTargetDate(newDateIso);

      if (onTargetDateChange) {
        onTargetDateChange(newDateIso);
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        let activeUserId = userId;
        if (!activeUserId) {
          const { data } = await supabase.auth.getUser();
          activeUserId = data?.user?.id;
        }

        if (activeUserId) {
          await supabase
            .from('users')
            .update({ target_exam_date: newDateIso })
            .eq('id', activeUserId);
        }
      }

      setStatusFeedback('Sana saqlandi');
      setTimeout(() => {
        setIsModalOpen(false);
        setStatusFeedback(null);
      }, 400);
    } catch (err) {
      console.warn('Target date sync warning:', err);
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputDate) return;
    const isoFormat = `${customInputDate}T08:00:00`;
    handleSaveDate(isoFormat);
  };

  const formattedTargetLabel = new Date(targetDate).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <>
      {/* ========================================================================= */}
      {/* MAIN COUNTDOWN CONTAINER (Theme Adaptive: Light & Dark)                  */}
      {/* ========================================================================= */}
      <section
        aria-label="Rasmiy SAT Imtihon Taymeri"
        className={`w-full rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6 text-[#0F172A] dark:text-[#F8FAFC] shadow-sm relative overflow-hidden transition-colors ${className}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Block: Meta & Context */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]/60 text-[10px] font-mono font-semibold uppercase tracking-wider">
                <Clock size={12} className="text-[#E07A5F]" />
                Rasmiy Digital SAT
              </span>
              <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                {formattedTargetLabel}
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Imtihongacha Qolgan Vaqt
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-relaxed max-w-md">
                College Board rasmiy test sanasiga asoslangan aniq muddat va tayyorgarlik rejasi.
              </p>
            </div>
          </div>

          {/* Center/Right Block: Live Tabular Clock & Edit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 self-start lg:self-auto">
            {/* 4 Unit Metric Blocks */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              {/* Days */}
              <div className="min-w-[64px] sm:min-w-[80px] p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none">
                  {timeLeft.days}
                </div>
                <div className="text-[10px] tracking-widest text-[#64748B] dark:text-[#64748B] font-mono font-bold uppercase mt-1.5">
                  KUN
                </div>
              </div>

              {/* Hours */}
              <div className="min-w-[64px] sm:min-w-[80px] p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none">
                  {pad(timeLeft.hours)}
                </div>
                <div className="text-[10px] tracking-widest text-[#64748B] dark:text-[#64748B] font-mono font-bold uppercase mt-1.5">
                  SOAT
                </div>
              </div>

              {/* Minutes */}
              <div className="min-w-[64px] sm:min-w-[80px] p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none">
                  {pad(timeLeft.minutes)}
                </div>
                <div className="text-[10px] tracking-widest text-[#64748B] dark:text-[#64748B] font-mono font-bold uppercase mt-1.5">
                  DAQIQA
                </div>
              </div>

              {/* Seconds */}
              <div className="min-w-[64px] sm:min-w-[80px] p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tabular-nums text-[#E07A5F] tracking-tight leading-none">
                  {pad(timeLeft.seconds)}
                </div>
                <div className="text-[10px] tracking-widest text-[#64748B] dark:text-[#64748B] font-mono font-bold uppercase mt-1.5">
                  SEKUND
                </div>
              </div>
            </div>

            {/* Edit Date Trigger Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#2D3748] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155]/80 text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 shadow-xs active:scale-98"
              title="Imtihon sanasini o'zgartirish"
            >
              <Calendar size={14} className="text-[#E07A5F]" />
              <span>Sanani o‘zgartirish</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INLINE DATE PICKER MODAL / POPOVER                                       */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exam-date-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0A0F1D]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#E07A5F]">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 id="exam-date-modal-title" className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    SAT Imtihon Sanasini Tanlash
                  </h3>
                  <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    Hozirgi sana: {formattedTargetLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Presets List */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold block">
                  Rasmiy Digital SAT Sanalari (2026)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OFFICIAL_SAT_PRESETS.map((preset) => {
                    const isSelected = targetDate.startsWith(preset.dateString.slice(0, 10));

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveDate(preset.dateString)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#F1F5F9] dark:bg-[#1E293B] border-[#E07A5F] text-[#0F172A] dark:text-[#F8FAFC]'
                            : 'bg-white dark:bg-[#0A0F1D] border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:border-[#CBD5E1] dark:hover:border-[#334155] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {preset.label}
                          </div>
                          <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            {preset.season}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#E07A5F] text-white flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Date Selector */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold block">
                  Boshqa (Maxsus) Sana Belgilash
                </label>

                <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customInputDate}
                    onChange={(e) => setCustomInputDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />

                  <button
                    type="submit"
                    disabled={!customInputDate || isSaving}
                    className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                  >
                    Saqlash
                  </button>
                </form>
              </div>

              {/* Status feedback */}
              {statusFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check size={14} />
                  <span>{statusFeedback}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#F8FAFC] dark:bg-[#0A0F1D] border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              <span>Sana barcha qurilmalarda saqlanadi</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#0F172A] dark:text-[#F8FAFC] font-medium hover:underline cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamCountdownWidget;
