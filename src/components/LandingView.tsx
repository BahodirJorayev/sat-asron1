'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers,
  BookOpen,
  ArrowUpRight,
  Target,
  Clock,
  Flame,
  Check,
  X as XIcon,
  ChevronRight,
  BarChart3,
  Calendar,
  GraduationCap,
  Timer,
  Play,
  Menu,
  Database,
  Users,
  Compass,
  FileText,
  HelpCircle,
  Award,
  Send,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { User } from '../types';
import {
  SiteBrandingConfig,
  BlogArticle,
  UserTestimonial,
  INITIAL_SITE_CONFIG,
  INITIAL_TESTIMONIALS,
} from '../data/blogAndBrandingData';
import { AsronLogo } from './AsronLogo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './navigation/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useLandingContent } from '../hooks/useLandingContent';
import { supabase } from '../lib/supabase';

export interface LandingViewProps {
  user: User;
  siteBranding: SiteBrandingConfig;
  platformContent?: Record<string, any>;
  blogArticles: BlogArticle[];
  testimonials?: UserTestimonial[];
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenDiagnostic: () => void;
  onOpenDailyWorkout: () => void;
  onOpenPaywall: () => void;
  onNavigateToBlog: () => void;
  onOpenAdminLogin?: () => void;
}

// 2 High-Yield Interactive SAT Questions for the Live Mockup
interface InteractiveQuestion {
  id: number;
  category: 'Math' | 'Reading & Writing';
  domain: string;
  difficulty: 'Medium' | 'Hard';
  timeEstimate: string;
  text: string;
  passage?: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  desmosOrGrammarTip: string;
}

const DEMO_QUESTIONS: InteractiveQuestion[] = [
  {
    id: 1,
    category: 'Math',
    domain: 'Advanced Math • Nonlinear Systems',
    difficulty: 'Hard',
    timeEstimate: '25 sec',
    text: 'A system of two equations is given by y = 2x² - 8x + k and y = 4x - 10. For what value of constant k does the system have exactly ONE real solution (x, y)?',
    options: [
      { id: 'A', text: 'k = 8' },
      { id: 'B', text: 'k = 10' },
      { id: 'C', text: 'k = 18' },
      { id: 'D', text: 'k = -2' },
    ],
    correctAnswer: 'A',
    explanation: '2x² - 8x + k = 4x - 10 → 2x² - 12x + (k + 10) = 0. Yagona yechim uchun diskriminant Δ = b² - 4ac = 0. (-12)² - 4(2)(k + 10) = 0 → 144 = 8(k + 10) → 18 = k + 10 → k = 8.',
    desmosOrGrammarTip: 'Desmos 10-soniyalik usul: y = 2x² - 8x + k va y = 4x - 10 ni kiriting. k uchun slayder qo\'shing va chiziq parabolaga urinma bo\'ladigan k = 8 nuqtani ko\'ring!',
  },
  {
    id: 2,
    category: 'Reading & Writing',
    domain: 'Craft & Structure • Words in Context',
    difficulty: 'Hard',
    timeEstimate: '20 sec',
    passage: 'Although contemporary neural translation systems perform admirably with standardized prose, their capacity to translate colloquial idioms remains distinctly ________, frequently rendering metaphors with clumsy literalism.',
    text: 'Which choice completes the text with the most logical and precise word or phrase?',
    options: [
      { id: 'A', text: 'circumscribed' },
      { id: 'B', text: 'ubiquitous' },
      { id: 'C', text: 'infallible' },
      { id: 'D', text: 'unprecedented' },
    ],
    correctAnswer: 'A',
    explanation: '"Although" kontrasti va "clumsy literalism" (qo\'pol so\'zma-so\'zlik) sun\'iy intellekt imkoniyati cheklanganligini ko\'rsatadi. "Circumscribed" = chegaralangan, tor doiradagi.',
    desmosOrGrammarTip: 'Erica Meltzer strategiyasi: Matndagi "Although" burilish so\'ziga qarang. Salbiy ma\'no faqat "circumscribed" (cheklangan) variantida mavjud.',
  },
];

export const LandingView: React.FC<LandingViewProps> = ({
  user,
  siteBranding,
  platformContent,
  blogArticles,
  testimonials = INITIAL_TESTIMONIALS,
  onOpenAuthModal,
  onOpenDiagnostic,
  onOpenDailyWorkout,
  onOpenPaywall,
  onNavigateToBlog,
  onOpenAdminLogin,
}) => {
  const { t } = useLanguage();
  const { content } = useLandingContent();
  const branding = siteBranding || INITIAL_SITE_CONFIG;

  // Auto redirect if already authenticated
  useEffect(() => {
    const handleRedirectIfAuth = (u: any) => {
      if (u && typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
        if (window.location.pathname === '/' || window.location.pathname === '') {
          window.location.href = '/dashboard';
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        handleRedirectIfAuth(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleRedirectIfAuth(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mobile menu open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Interactive Mockup Question State
  const [demoQuestionIndex, setDemoQuestionIndex] = useState(0);
  const [selectedDemoAnswer, setSelectedDemoAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const activeDemoQuestion = DEMO_QUESTIONS[demoQuestionIndex];

  // Confetti trigger helper
  const triggerConfetti = async () => {
    if (typeof window !== 'undefined') {
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E07A5F', '#2A9D8F', '#F4A261', '#E76F51'],
        });
      } catch {
        // Fallback ignore
      }
    }
  };

  const handleSelectDemoOption = (optionId: string) => {
    setSelectedDemoAnswer(optionId);
    setShowExplanation(true);
    if (optionId === activeDemoQuestion.correctAnswer) {
      triggerConfetti();
    }
  };

  const handleNextDemoQuestion = () => {
    setDemoQuestionIndex((prev) => (prev + 1) % DEMO_QUESTIONS.length);
    setSelectedDemoAnswer(null);
    setShowExplanation(false);
  };

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#E07A5F] selection:text-white transition-colors duration-200">
      {/* 1. STICKY MODERN NAVBAR (GrowMock Style) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#070D1E]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer flex items-center gap-2.5 transition-transform hover:scale-102"
          >
            <AsronLogo variant="full" size={34} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection('mocks-section')}
              className="hover:text-[#E07A5F] dark:hover:text-[#E07A5F] transition-colors cursor-pointer"
            >
              Mock Testlar
            </button>
            <button
              onClick={() => scrollToSection('sqb-section')}
              className="hover:text-[#E07A5F] dark:hover:text-[#E07A5F] transition-colors cursor-pointer"
            >
              Savollar Banki
            </button>
            <button
              onClick={() => scrollToSection('vocab-section')}
              className="hover:text-[#E07A5F] dark:hover:text-[#E07A5F] transition-colors cursor-pointer"
            >
              SAT Lug'at
            </button>
            <button
              onClick={() => scrollToSection('features-section')}
              className="hover:text-[#E07A5F] dark:hover:text-[#E07A5F] transition-colors cursor-pointer"
            >
              Imkoniyatlar
            </button>
            <button
              onClick={() => scrollToSection('timeline-section')}
              className="hover:text-[#E07A5F] dark:hover:text-[#E07A5F] transition-colors cursor-pointer"
            >
              Yo'riqnoma
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            
            <button
              type="button"
              onClick={() => onOpenAuthModal('signin')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#E07A5F] dark:hover:text-white transition-colors cursor-pointer"
            >
              Kirish
            </button>

            <button
              type="button"
              onClick={() => onOpenAuthModal('signup')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E07A5F] to-[#E76F51] hover:from-[#d96e53] hover:to-[#dc6345] text-white text-sm font-bold shadow-md shadow-[#E07A5F]/20 hover:shadow-lg hover:shadow-[#E07A5F]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Bepul Boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => onOpenAuthModal('signin')}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Kirish
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Menyu"
            >
              {isMobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070D1E]/95 backdrop-blur-2xl px-5 py-5 space-y-4 animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col space-y-3 font-medium text-sm text-slate-700 dark:text-slate-200">
              <button
                onClick={() => scrollToSection('mocks-section')}
                className="text-left py-1 hover:text-[#E07A5F]"
              >
                Mock Testlar (Bluebook)
              </button>
              <button
                onClick={() => scrollToSection('sqb-section')}
                className="text-left py-1 hover:text-[#E07A5F]"
              >
                Savollar Banki (3000+)
              </button>
              <button
                onClick={() => scrollToSection('vocab-section')}
                className="text-left py-1 hover:text-[#E07A5F]"
              >
                SAT Lug'at &amp; Flashcards
              </button>
              <button
                onClick={() => scrollToSection('features-section')}
                className="text-left py-1 hover:text-[#E07A5F]"
              >
                Platforma Imkoniyatlari
              </button>
              <button
                onClick={() => scrollToSection('timeline-section')}
                className="text-left py-1 hover:text-[#E07A5F]"
              >
                3-Bosqichli Reja
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuthModal('signup');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E07A5F] to-[#E76F51] text-white text-xs font-bold shadow-md shadow-[#E07A5F]/20 flex items-center gap-1.5"
              >
                <span>Bepul Ro'yxatdan O'tish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MODERN HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-16 sm:pb-24">
        {/* Glow & Radial Background Gradients */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-[#E07A5F]/20 via-[#F4A261]/15 to-[#2A9D8F]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[300px] bg-[#2A9D8F]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Sleek Pill Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 text-[#E07A5F] text-xs font-mono font-bold shadow-xs mb-6 sm:mb-8 animate-in fade-in zoom-in-95 duration-500">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse" />
            <span>⚡ 2026 Digital SAT Bluebook Standarti &amp; AI Tahlil</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] max-w-4xl mx-auto text-slate-900 dark:text-white">
            Digital SAT Imtihoniga{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07A5F] via-[#F4A261] to-[#2A9D8F]">
              1500+ Natija Bilan
            </span>{' '}
            Tayyorlaning
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Haqiqiy 2-bosqichli adaptiv (MST) mock imtihonlari, 3,000+ rasmiy College Board savollar banki, 
            Erica Meltzer lug'at tizimi va AI asosidagi xatolar tahlili — barchasi yagona professional platformada.
          </p>

          {/* Action Buttons (CTAs) */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-[#E76F51] hover:from-[#d86e53] hover:to-[#dc6345] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#E07A5F]/25 hover:shadow-2xl hover:shadow-[#E07A5F]/35 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer group"
            >
              <span>Bepul Boshlash</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/90 dark:bg-[#121A2F]/90 hover:bg-white dark:hover:bg-[#18233e] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base transition-all duration-200 shadow-xs flex items-center justify-center gap-2 hover:border-[#E07A5F]/40 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#E07A5F] fill-[#E07A5F]" />
              <span>Demo Testni Ko'rish</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#2A9D8F]" /> Kredit karta talab etilmaydi
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#2A9D8F]" /> 10 soniyada ro'yxatdan o'tish
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#2A9D8F]" /> 100% rasmiy Bluebook MST
            </span>
          </div>

          {/* 3. INTERACTIVE VISUAL PREVIEW: BLUEBOOK MOCKUP (Centerpiece) */}
          <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto text-left">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#E07A5F]/30 via-[#F4A261]/20 to-[#2A9D8F]/30 rounded-3xl sm:rounded-4xl blur-xl opacity-75 pointer-events-none" />

            <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0E1528]/95 backdrop-blur-2xl shadow-2xl p-4 sm:p-7 overflow-hidden">
              {/* Window Title Bar (macOS aesthetic) */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline-block">
                    asron-sat-bluebook-engine.app • Practice Test #1 (2026 Edition)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2A9D8F]/15 text-[#2A9D8F] border border-[#2A9D8F]/30">
                    MST Adaptive Mode
                  </span>
                </div>
              </div>

              {/* Bluebook Live Test Header Strip */}
              <div className="py-3 px-1 sm:px-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#E07A5F]">
                    {activeDemoQuestion.category.toUpperCase()}
                  </span>
                  <span>{activeDemoQuestion.domain}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Vaqt: 31:45</span>
                  </div>
                  <span className="hidden sm:inline-block text-slate-400">Savol 14 / 27</span>
                </div>
              </div>

              {/* Question Text & Passage */}
              <div className="pt-5 pb-4 space-y-3">
                {activeDemoQuestion.passage && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D1E]/60 border border-slate-200/60 dark:border-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed italic">
                    "{activeDemoQuestion.passage}"
                  </div>
                )}

                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activeDemoQuestion.text}
                </p>

                {/* 4 Interactive Option Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {activeDemoQuestion.options.map((opt) => {
                    const isSelected = selectedDemoAnswer === opt.id;
                    const isCorrect = opt.id === activeDemoQuestion.correctAnswer;
                    let stateClass =
                      'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121A2F] text-slate-800 dark:text-slate-200 hover:border-[#E07A5F]/50';

                    if (showExplanation) {
                      if (isCorrect) {
                        stateClass = 'border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#2A9D8F] ring-2 ring-[#2A9D8F]/30';
                      } else if (isSelected && !isCorrect) {
                        stateClass = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30';
                      }
                    } else if (isSelected) {
                      stateClass = 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] ring-2 ring-[#E07A5F]/30';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectDemoOption(opt.id)}
                        className={`p-3 rounded-xl border text-left font-mono text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${stateClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {showExplanation && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[#2A9D8F] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback & Desmos Tip */}
                {showExplanation && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070D1E]/80 border border-slate-200 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#2A9D8F] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Rasmiy Yechim &amp; Desmos Hack:
                      </span>
                      <button
                        type="button"
                        onClick={handleNextDemoQuestion}
                        className="text-xs font-mono font-bold text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Keyingi savol</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {activeDemoQuestion.explanation}
                    </p>
                    <p className="text-xs text-[#E07A5F] font-mono leading-relaxed bg-[#E07A5F]/10 p-2 rounded-lg border border-[#E07A5F]/20">
                      ⚡ {activeDemoQuestion.desmosOrGrammarTip}
                    </p>
                  </div>
                )}
              </div>

              {/* 3 Floating Glass Overlay Badges */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 text-[#2A9D8F] text-xs font-mono font-bold">
                  <Award className="w-4 h-4" />
                  <span>Prognoz Ball: 1540 / 1600 (+230 ball)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                  <BrainCircuit className="w-4 h-4" />
                  <span>2-Bosqich: Hard Modul Faollashdi</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[#E07A5F] text-xs font-mono font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Desmos 10s Hack Faol</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF & LIVE STATS COUNTER (GrowMock 4-Col Grid) */}
      <section className="py-10 sm:py-16 bg-white dark:bg-[#0B1123] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#111827]/70 border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1.5 hover:border-[#E07A5F]/40 transition-colors">
              <div className="text-2xl sm:text-4xl font-black font-mono text-[#E07A5F] tracking-tight">
                12+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Rasmiy &amp; Adaptiv Mocklar
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                College Board Bluebook MST algoritmi
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#111827]/70 border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1.5 hover:border-[#2A9D8F]/40 transition-colors">
              <div className="text-2xl sm:text-4xl font-black font-mono text-[#2A9D8F] tracking-tight">
                3,000+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Saralangan SAT Savollari
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Domain va Skill bo'yicha filtrlangan
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#111827]/70 border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="text-2xl sm:text-4xl font-black font-mono text-amber-500 tracking-tight">
                1500+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Maqsadli Ball Strategiyalari
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Desmos va AI xatolar tahlili
              </div>
            </div>

            {/* Stat 4 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#111827]/70 border border-slate-200/70 dark:border-slate-800/70 text-center space-y-1.5 hover:border-indigo-500/40 transition-colors">
              <div className="text-2xl sm:text-4xl font-black font-mono text-indigo-500 tracking-tight">
                100%
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Real Bluebook Imtihon Muhiti
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Haqiqiy interfeys va vositalar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE MODULES SHOWCASE (Bento Feature Grid) */}
      <section id="features-section" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E07A5F] px-3 py-1 rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/20">
              ASRON SAT EKOTIZIMI
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              1500+ Natijaga Yetaklovchi 5 Asosiy Modul
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Oddiy test yechishdan voz keching. Zamonaviy adaptiv algoritmlar va sun'iy intellekt yordamida imtihonga tizimli tayyorlaning.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Bento Card 1: Bluebook Standard Mocks (Span 2) */}
            <div id="mocks-section" className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-slate-800 hover:border-[#E07A5F]/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#E07A5F] flex items-center justify-center font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  2-STAGE MST ALGORITHM
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#E07A5F] transition-colors">
                1. Bluebook Standartidagi Adaptiv Mock Testlar
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                College Board rasmiy Bluebook algoritmining 100% nusxasi. 1-modul natijangizga qarab 2-modul o'z-o'zidan oson (Easy) 
                yoki qiyin (Hard) darajaga moslashadi va aniq 1600 ballik shkalada hisoblanadi.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070D1E] text-xs font-mono">
                  <span className="font-bold text-[#E07A5F] block">MST Adaptivlik</span>
                  <span className="text-slate-500 text-[11px]">Avtomatik modul branching</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070D1E] text-xs font-mono">
                  <span className="font-bold text-[#2A9D8F] block">Desmos Integratsiyasi</span>
                  <span className="text-slate-500 text-[11px]">To'liq rasmiy kalkulyator</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070D1E] text-xs font-mono">
                  <span className="font-bold text-indigo-500 block">Section Sprint</span>
                  <span className="text-slate-500 text-[11px]">RW va Math alohida testlar</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Question Bank (SQB) */}
            <div id="sqb-section" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-slate-800 hover:border-[#2A9D8F]/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#2A9D8F] flex items-center justify-center font-black">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  3000+ QUESTIONS
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#2A9D8F] transition-colors">
                2. Rasmiy Savollar Banki (SQB)
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Reading &amp; Writing hamda Math bo'limlari bo'yicha barcha domain va skill filtrlari. 
                Har bir savol uchun bosqichma-bosqich yechim va Desmos usullari.
              </p>

              <ul className="mt-4 space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" /> Algebra &amp; Advanced Math
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" /> Craft &amp; Structure / Ideas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" /> Qiyinlik darajalari filtri
                </li>
              </ul>
            </div>

            {/* Bento Card 3: Vocabulary Hub */}
            <div id="vocab-section" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  SRS FLASHCARDS
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                3. Erica Meltzer &amp; SAT Lug'at
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Spaced Repetition (SRS) algoritmi asosidagi flashcards tizimi. Audio talaffuz, 
                o'zbekcha izohlar va kontekstdagi so'zlar bo'yicha interaktiv testlar.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-700 dark:text-purple-300">
                1,000+ saralangan SAT so'zlari: Erica Meltzer, College Board va Panda Vocab.
              </div>
            </div>

            {/* Bento Card 4: Mistake Vault */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  AI LEITNER SYSTEM
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                4. Smart Xatolar Ombori (Vault)
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Xato qilingan savollar avtomatik Leitner tizimiga tushadi. Sun'iy intellekt noto'g'ri 
                javob nima sababdan tanlanganini psixologik tahlil qilib beradi va qayta re-test qiladi.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-700 dark:text-rose-300">
                Trap Analysis: Tuzoq variantlar psixologiyasini tushuning va xatoni takrorlamang.
              </div>
            </div>

            {/* Bento Card 5: Community Hub (Span 1 or 2) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  STUDENT CHAT HUB
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                5. Talabalar Hamjamiyati
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Telegram Web K/Z uslubidagi jonli guruhlar, savollarni birgalikda yechish, Desmos formulalari 
                va 1500+ ball to'plagan mentorlar tajribasi almashinuvi.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-700 dark:text-indigo-300">
                Jonli audio/video muloqot va barcha test materiallari xavfsiz almashinuvi.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STEP-BY-STEP PREPARATION TIMELINE (GrowMock 3-Step Journey) */}
      <section id="timeline-section" className="py-16 sm:py-24 bg-white dark:bg-[#0B1123] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2A9D8F] px-3 py-1 rounded-full bg-[#2A9D8F]/10 border border-[#2A9D8F]/20">
              SAMARALI STRATEGIYA
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              1500+ Natijaga Eltuvchi 3 Oddiy Qadam
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Haqiqiy SAT imtihonida yuqori natija ko'rsatish murakkab emas, agar siz aniq reja bilan shug'ullansangiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#111827]/80 border border-slate-200 dark:border-slate-800 space-y-4 relative group hover:border-[#E07A5F]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/10 text-[#E07A5F] flex items-center justify-center font-mono font-black text-xl">
                01
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Diagnostik Test Topshiring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                15 daqiqalik ekspress diagnostika orqali joriy bilim darajangizni aniqlang. AI platforma 4 ta asosiy 
                domaindagi zaif mavzularingiz bo'yicha aniq xarita tuzib beradi.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenDiagnostic}
                  className="text-xs font-mono font-bold text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Diagnostikani boshlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#111827]/80 border border-slate-200 dark:border-slate-800 space-y-4 relative group hover:border-[#2A9D8F]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#2A9D8F]/10 text-[#2A9D8F] flex items-center justify-center font-mono font-black text-xl">
                02
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Savollar Banki va Lug'atni O'zlashtiring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Har kuni zaif mavzularingiz bo'yicha 15-20 ta savol yeching. Kuniga 10 daqiqa SRS flashcardlar yordamida 
                Erica Meltzer lug'atidagi so'zlarni uzoq muddatli xotiraga muhrlang.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signup')}
                  className="text-xs font-mono font-bold text-[#2A9D8F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Savollar bankiga o'tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#111827]/80 border border-slate-200 dark:border-slate-800 space-y-4 relative group hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-mono font-black text-xl">
                03
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Adaptiv Mocklar Orqali 1500+ Ballga Erishing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Haftada bir marta rasmiy Bluebook 2-Stage MST mock imtihonini to'liq topshiring. Xatolar Omborida xatolaringizni 
                AI bilan tahlil qilib, imtihon kuniga 100% ishonch bilan kiring.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signup')}
                  className="text-xs font-mono font-bold text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Mock testlarni boshlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HIGH-CONVERSION BOTTOM CTA BANNER (GrowMock Style) */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-14 text-center text-white border border-slate-700/60 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#E07A5F]/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#2A9D8F]/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-orange-300 border border-white/10">
                10 SONIYADA RO'YXATDAN O'TISH
              </span>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Digital SAT Imtihoniga Bugunoq Tayyorgarlikni Boshlang!
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                Bepul hisob oching va 3,000+ rasmiy College Board savollari, adaptiv mock testlar 
                hamda Erica Meltzer lug'at tizimidan darhol foydalanishni boshlang.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signup')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-[#E76F51] hover:from-[#d86e53] hover:to-[#dc6345] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#E07A5F]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Bepul Akkaunt Yaratish</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signin')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Tizimga Kirish</span>
                </button>
              </div>

              <p className="text-xs font-mono text-slate-400 pt-2">
                Kredit karta shart emas • Bepul reja bilan darhol test yechish mumkin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODERN FOOTER */}
      <footer className="bg-white dark:bg-[#070D1E] border-t border-slate-200 dark:border-slate-800/80 py-12 text-slate-600 dark:text-slate-400 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/80">
            <div className="space-y-2">
              <AsronLogo variant="full" size={32} />
              <p className="text-xs text-slate-500 max-w-sm">
                O'zbekistondagi birinchi va yagona rasmiy Bluebook MST standartidagi Digital SAT platformasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <button
                onClick={() => scrollToSection('mocks-section')}
                className="hover:text-[#E07A5F] transition-colors cursor-pointer"
              >
                Mock Testlar
              </button>
              <button
                onClick={() => scrollToSection('sqb-section')}
                className="hover:text-[#E07A5F] transition-colors cursor-pointer"
              >
                Savollar Banki
              </button>
              <button
                onClick={() => scrollToSection('vocab-section')}
                className="hover:text-[#E07A5F] transition-colors cursor-pointer"
              >
                SAT Lug'at
              </button>
              <button
                onClick={() => scrollToSection('features-section')}
                className="hover:text-[#E07A5F] transition-colors cursor-pointer"
              >
                Imkoniyatlar
              </button>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="hover:text-[#E07A5F] transition-colors cursor-pointer"
              >
                Kirish
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div>
              © 2026 ASRON SAT. Barcha huquqlar himoyalangan.
            </div>

            <div className="flex items-center gap-4">
              <span className="hover:text-[#E07A5F] cursor-pointer">Maxfiylik Siyosati</span>
              <span>•</span>
              <span className="hover:text-[#E07A5F] cursor-pointer">Foydalanish Qoidalari</span>
              <span>•</span>
              <span className="hover:text-[#E07A5F] cursor-pointer">Aloqa: @asronsat_bot</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
