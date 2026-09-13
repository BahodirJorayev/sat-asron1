'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';

interface MilestoneStep {
  id: string;
  title: string;
  description: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'general';
  estimatedHours: number;
}

interface RoadmapPhase {
  id: string;
  number: number;
  title: string;
  targetBand: string;
  description: string;
  color: string;
  accentBg: string;
  steps: MilestoneStep[];
}

const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'phase-1',
    number: 1,
    title: 'Poydevor & Savol Mexanikalari',
    targetBand: 'Band 6.0 → 6.5',
    description: "IELTS formatini chuqur o'rganish, asosiy akademik lug'at boyligi va barcha 4 ko'nikma bo'yicha asosiy savol turlari algoritmi.",
    color: 'from-blue-500 to-indigo-600',
    accentBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    steps: [
      {
        id: 'p1-1',
        title: "Akademik Lug'at (AWL) & Grammatik Poydevor",
        description: "570 ta Academic Word List so'zini kontekstda o'zlashtirish hamda Complex & Compound jumlalar tuzish qoidalarini mustahkamlash.",
        skill: 'general',
        estimatedHours: 15,
      },
      {
        id: 'p1-2',
        title: 'Listening: Fonetika & Bog‘langan Nutq (Connected Speech)',
        description: 'Native spikerlarning qisqartmalari, assimilatsiya, urg‘u va tezkor raqam/harf diktantlarini xatosiz yozib olish refleksini shakllantirish.',
        skill: 'listening',
        estimatedHours: 10,
      },
      {
        id: 'p1-3',
        title: 'Reading: Skimming & Scanning Mexanikasi',
        description: "3 daqiqa ichida har qanday ilmiy matnning asosiy g'oyasini ilg'ash va savollardagi kalit so'zlarni matndan 10 soniyada lokallashtirish.",
        skill: 'reading',
        estimatedHours: 12,
      },
      {
        id: 'p1-4',
        title: 'Writing: Task 1 Report Arxitekturasi & Task 2 Kirish',
        description: "Grafik/jadval hisobotlarida 4-paragrafli qat'iy tizim, Overview yozish mahorati va Task 2 insholarida ravshan Thesis Statement tuzish.",
        skill: 'writing',
        estimatedHours: 14,
      },
      {
        id: 'p1-5',
        title: 'Speaking: Part 1 Javoblarini 3 Bosqichda Kengaytirish',
        description: "Bir so'zli javoblardan qochish: Answer + Reason + Example formulasi orqali har bir savolga 3-4 gapdan iborat tabiiy javob berish.",
        skill: 'speaking',
        estimatedHours: 8,
      },
    ],
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Tezlik & Taktik Strategiyalar',
    targetBand: 'Band 7.0 → 7.5',
    description: "Vaqt taqchilligini yengish, murakkab savollardagi tuzoqlarni fosh qilish va yuqori darajadagi akademik uslubni rivojlantirish.",
    color: 'from-amber-500 to-orange-600',
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    steps: [
      {
        id: 'p2-1',
        title: 'Reading: T/F/NG va Matching Headings Tuzoqlarini Yechish',
        description: 'Not Given va False o‘rtasidagi nozik chegarani 100% ajratish hamda sarlavhalarni butun matnni o‘qimasdan 1 daqiqada topish algoritmi.',
        skill: 'reading',
        estimatedHours: 15,
      },
      {
        id: 'p2-2',
        title: 'Listening: Xarita (Map) & Section 3/4 Akademik Diqqat',
        description: 'Ko‘p ishtirokchili akademik munozaralarda chalg‘ituvchi so‘zlarni darhol inkor qilish va xarita marshrutlarini to‘g‘ri kuzatish.',
        skill: 'listening',
        estimatedHours: 12,
      },
      {
        id: 'p2-3',
        title: 'Writing Task 2: Band 8.0 Leksik Resurs & Koheziya',
        description: 'Yuksak mavhum tushunchalar, mavzuga xos kollokatsiyalar, koheziv bog‘lovchilar va 250+ so‘zli mukammal inshoni 40 daqiqada yakunlash.',
        skill: 'writing',
        estimatedHours: 18,
      },
      {
        id: 'p2-4',
        title: 'Speaking Part 2: 1 Daqiqalik Brain-Mapping',
        description: 'Cue Card berilganda 60 soniya ichida to‘liq fikr xaritasini (Mind Map) tuzish va to‘xtovsiz 2 daqiqa ravon, boy tilda nutq so‘zlash.',
        skill: 'speaking',
        estimatedHours: 10,
      },
      {
        id: 'p2-5',
        title: 'Qat’iy Vaqt Nazorati & Stress Boshqaruvi',
        description: 'Har bir Reading passajini 18 daqiqadan oshirmasdan bajarish va javoblar varaqasiga xatosiz ko‘chirish intizomi.',
        skill: 'general',
        estimatedHours: 10,
      },
    ],
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Cambridge Simulyatsiyasi & Mukammallik',
    targetBand: 'Band 8.0 → 8.5+',
    description: "Haqiqiy kompyuterli CD-IELTS rejimida Cambridge testlarini yechish, har bir xatoni tahlil qilish va ekspert darajasiga yetish.",
    color: 'from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    steps: [
      {
        id: 'p3-1',
        title: 'Cambridge 15-19 Rasmiy Mock Imtihonlari',
        description: 'Qat’iy imtihon qoidalariga rioya qilgan holda kamida 8 ta to‘liq 4-ko‘nikmali CD-IELTS simulyatsiyasini muvaffaqiyatli topshirish.',
        skill: 'general',
        estimatedHours: 24,
      },
      {
        id: 'p3-2',
        title: 'Xatolar Ombori (Mistake Vault) Chuqur Tahlili',
        description: 'Qilingan har bir xatoni sababi (lug‘at, e’tiborsizlik yoki vaqt) bo‘yicha tahlil qilish va qayta takrorlanishiga yo‘l qo‘ymaslik.',
        skill: 'general',
        estimatedHours: 12,
      },
      {
        id: 'p3-3',
        title: 'CD-IELTS Kompyuter Interfeysi Mahorati',
        description: 'Ekranda matnni tez ajratish (highlight), eslatma qoldirish (notes) va split-screen rejimida maksimal tezlikda ishlash reflekslari.',
        skill: 'reading',
        estimatedHours: 8,
      },
      {
        id: 'p3-4',
        title: 'Examiner Baholash Mezonlari (Band Descriptors) Nazorati',
        description: 'Speaking va Writing bo‘yicha 4 ta rasmiy mezon (Fluency, Lexical Resource, Grammatical Range, Task Achievement) talablarini to‘liq bajarish.',
        skill: 'speaking',
        estimatedHours: 10,
      },
    ],
  },
];

interface RoadmapHubProps {
  user?: User | null;
  onOpenPaywall?: () => void;
  onNavigateMocks?: () => void;
}

export const RoadmapHub: React.FC<RoadmapHubProps> = ({
  user,
  onOpenPaywall,
  onNavigateMocks,
}) => {
  // Checkable milestone IDs stored in localStorage and synced
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('asron_ielts_roadmap_milestones');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Expanded phases state
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    'phase-1': true,
    'phase-2': true,
    'phase-3': true,
  });

  const allSteps = ROADMAP_PHASES.flatMap((p) => p.steps);
  const totalStepsCount = allSteps.length;
  const completedCount = completedSteps.length;
  const progressPercent = Math.round((completedCount / totalStepsCount) * 100);

  // Toggle milestone step completion
  const handleToggleStep = async (stepId: string) => {
    const isDone = completedSteps.includes(stepId);
    const updated = isDone
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];

    setCompletedSteps(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('asron_ielts_roadmap_milestones', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('asron_roadmap_updated', { detail: { completedSteps: updated } }));
    }

    // Persist to Supabase if authenticated
    try {
      const { data: authData } = await supabase.auth.getUser();
      const activeId = authData?.user?.id || user?.id;
      if (activeId) {
        await supabase
          .from('user_progress')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', activeId);
      }
    } catch {}
  };

  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'listening':
        return <Headphones size={13} className="text-sky-500" />;
      case 'reading':
        return <BookOpen size={13} className="text-emerald-500" />;
      case 'writing':
        return <PenTool size={13} className="text-orange-500" />;
      case 'speaking':
        return <Mic size={13} className="text-purple-500" />;
      default:
        return <Zap size={13} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-900 dark:text-slate-100">
      {/* Frosted Glass Hero Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold">
              <Compass size={13} />
              <span>BAND 6.0 → 8.5+ STRATEGIK ROADMAP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              IELTS Tayyorgarlik Yo‘l Xaritasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              3 bosqichli professional strategiya orqali fundamentdan boshlab xalqaro standartdagi 8.5+ band darajasiga qadam-baqadam erishing.
            </p>
          </div>

          {/* Progress Summary Card */}
          <div className="shrink-0 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Umumiy Natija</span>
              <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm">
                {progressPercent}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{completedCount} / {totalStepsCount} bosqich</span>
              <span>{totalStepsCount - completedCount} ta qoldi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Interactive Roadmap Phases */}
      <div className="space-y-6">
        {ROADMAP_PHASES.map((phase) => {
          const phaseCompletedSteps = phase.steps.filter((s) => completedSteps.includes(s.id));
          const phasePercent = Math.round((phaseCompletedSteps.length / phase.steps.length) * 100);
          const isExpanded = expandedPhases[phase.id] ?? true;

          return (
            <div
              key={phase.id}
              className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl overflow-hidden transition-all"
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhaseExpand(phase.id)}
                className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${phase.color} text-white flex items-center justify-center font-mono font-extrabold text-base shadow-md shrink-0`}
                  >
                    0{phase.number}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        {phase.title}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${phase.accentBg}`}>
                        {phase.targetBand}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {phaseCompletedSteps.length} / {phase.steps.length}
                    </span>
                    <span className="text-[10px] text-slate-400">{phasePercent}% bajarildi</span>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Bo'limni yopish/ochish"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Phase Steps Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-200/50 dark:border-slate-800/60 p-4 sm:p-6 space-y-3"
                  >
                    {phase.steps.map((step, idx) => {
                      const isDone = completedSteps.includes(step.id);

                      return (
                        <div
                          key={step.id}
                          onClick={() => handleToggleStep(step.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                            isDone
                              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 shadow-2xs'
                              : 'bg-white/90 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:border-orange-500/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {/* Checkbox Icon */}
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 size={20} className="text-emerald-500" />
                            ) : (
                              <Circle size={20} className="text-slate-300 dark:text-slate-600 hover:text-orange-500" />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap justify-between">
                              <span
                                className={`text-xs sm:text-sm font-bold ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {step.title}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                                  {getSkillIcon(step.skill)}
                                  <span className="capitalize">{step.skill}</span>
                                </span>

                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                                  <Clock size={11} />
                                  <span>{step.estimatedHours}h</span>
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA to Testing Hub */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
            <Sparkles size={18} />
            <span>Strategiyani Haqiqiy CD-IELTS Simulyatorida Sinab Ko‘ring</span>
          </h3>
          <p className="text-xs text-orange-100 max-w-xl">
            Cambridge 10-19 standartidagi to‘liq mock testlar yoki ko‘nikmalar bo‘yicha alohida savol turlari amaliyoti.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onNavigateMocks) onNavigateMocks();
            else if (typeof window !== 'undefined') window.location.hash = '#/mocks';
          }}
          className="px-5 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-mono font-bold text-xs shadow-md shrink-0 flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
        >
          <span>Testlar Markaziga O'tish</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default RoadmapHub;
