'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Layers,
  Sparkles,
  Award,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Lock,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Shield,
  Save,
  Zap
} from 'lucide-react';
import { User } from '../../types';
import { IeltsMockTestsCatalogView } from './IeltsMockTestsCatalogView';
import { IeltsSectionalPracticeView } from './IeltsSectionalPracticeView';

interface IeltsTestsHubProps {
  user?: User | null;
  initialTab?: 'mocks' | 'classroom' | 'practice' | 'essay-sandbox' | 'speaking-timer';
  onOpenPaywall?: () => void;
  onOpenMistakeVault?: () => void;
}

export const IeltsTestsHub: React.FC<IeltsTestsHubProps> = ({
  user,
  initialTab = 'mocks',
  onOpenPaywall,
  onOpenMistakeVault,
}) => {
  const [activeTab, setActiveTab] = useState<'mocks' | 'classroom' | 'practice' | 'essay-sandbox' | 'speaking-timer'>(initialTab);

  // --- Task 2 Essay Sandbox State ---
  const [essayTopicIndex, setEssayTopicIndex] = useState(0);
  const [essayText, setEssayText] = useState('');
  const [essayTimerSecs, setEssayTimerSecs] = useState(40 * 60);
  const [isEssayTimerRunning, setIsEssayTimerRunning] = useState(false);
  const [savedEssayFeedback, setSavedEssayFeedback] = useState<string | null>(null);

  const ESSAY_PROMPTS = [
    {
      title: 'Cambridge 19: Artificial Intelligence in Higher Education',
      type: 'Discuss both views and give your opinion',
      prompt: 'Some people believe that artificial intelligence will soon replace university professors, while others argue that human guidance remains irreplaceable. Discuss both views and give your opinion.',
    },
    {
      title: 'Cambridge 18: Global Environmental Responsibilities',
      type: 'To what extent do you agree or disagree?',
      prompt: 'Economic growth is often seen as the primary cause of environmental degradation. Therefore, some suggest slowing economic activity to save the planet. To what extent do you agree or disagree?',
    },
    {
      title: 'Cambridge 17: Remote Working & Urban Living',
      type: 'Advantages and Disadvantages',
      prompt: 'In many countries, an increasing number of employees work remotely from home rather than in offices. Do the advantages of this trend outweigh the disadvantages?',
    },
  ];

  const currentEssayPrompt = ESSAY_PROMPTS[essayTopicIndex];
  const essayWordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  useEffect(() => {
    let interval: any = null;
    if (isEssayTimerRunning && essayTimerSecs > 0) {
      interval = setInterval(() => setEssayTimerSecs((prev) => prev - 1), 1000);
    } else if (essayTimerSecs === 0) {
      setIsEssayTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isEssayTimerRunning, essayTimerSecs]);

  const formatSecs = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveEssay = () => {
    if (essayWordCount < 50) {
      setSavedEssayFeedback("Insho kamida 50 ta so'zdan iborat bo'lishi kerak.");
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('asron_saved_ielts_essays') || '[]');
        stored.unshift({
          prompt: currentEssayPrompt.title,
          text: essayText,
          wordCount: essayWordCount,
          date: new Date().toISOString(),
        });
        localStorage.setItem('asron_saved_ielts_essays', JSON.stringify(stored.slice(0, 20)));
      } catch {}
    }
    setSavedEssayFeedback(
      essayWordCount >= 250
        ? "Ajoyib! Insho saqlandi (250+ so'z normasi bajarildi). Xatolar omboriga kiritildi."
        : `Insho saqlandi. Eslatma: Band 7.0+ uchun kamida 250 ta so'z tavsiya etiladi (hozir: ${essayWordCount} ta).`
    );
    setTimeout(() => setSavedEssayFeedback(null), 5000);
  };

  // --- Speaking Part 2 Cue Card Timer State ---
  const [speakingTopicIndex, setSpeakingTopicIndex] = useState(0);
  const [speakingPhase, setSpeakingPhase] = useState<'idle' | 'prep' | 'speaking' | 'finished'>('idle');
  const [speakingTimer, setSpeakingTimer] = useState(60);
  const [speakingNotes, setSpeakingNotes] = useState('');

  const SPEAKING_TOPICS = [
    {
      title: 'Describe a challenging goal you achieved',
      cues: [
        'What the goal was and when you set it',
        'Why it was difficult for you to achieve',
        'What steps you took to overcome obstacles',
        'And explain how you felt after achieving it'
      ],
    },
    {
      title: 'Describe a piece of technology you find difficult to use',
      cues: [
        'What it is and when you first used it',
        'What you use it for',
        'Why you find it complicated or difficult',
        'And explain whether you think it will improve in the future'
      ],
    },
    {
      title: 'Describe an unforgettable journey you made',
      cues: [
        'Where you went and who accompanied you',
        'What transport you took',
        'What unexpected thing happened during the trip',
        'And explain why this journey was so memorable'
      ],
    },
  ];

  const currentSpeakingTopic = SPEAKING_TOPICS[speakingTopicIndex];

  useEffect(() => {
    let timer: any = null;
    if ((speakingPhase === 'prep' || speakingPhase === 'speaking') && speakingTimer > 0) {
      timer = setInterval(() => setSpeakingTimer((prev) => prev - 1), 1000);
    } else if (speakingTimer === 0) {
      if (speakingPhase === 'prep') {
        setSpeakingPhase('speaking');
        setSpeakingTimer(120); // 2 minutes speaking
      } else if (speakingPhase === 'speaking') {
        setSpeakingPhase('finished');
      }
    }
    return () => clearInterval(timer);
  }, [speakingPhase, speakingTimer]);

  const handleStartSpeakingPrep = () => {
    setSpeakingPhase('prep');
    setSpeakingTimer(60); // 1 minute preparation
  };

  const handleResetSpeaking = () => {
    setSpeakingPhase('idle');
    setSpeakingTimer(60);
    setSpeakingNotes('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans select-none text-[#0F172A] dark:text-[#F8FAFC]">
      {/* High-Conversion EdTech Header Banner */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold">
              <Sparkles size={13} />
              <span>CAMBRIDGE 10-19 CD-IELTS SIMULATOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              IELTS Imtihon &amp; Amaliyot Markazi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              CD-IELTS rasmiy kompyuter interfeysi: split-screen Reading, audio playerli Listening, Task 2 Essay Sandbox va 1-daqiqa Cue Card Speaking taymerlari.
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-center min-w-[90px]">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Mocklar</div>
              <div className="text-lg font-black font-mono text-orange-600 dark:text-orange-400">14+</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-center min-w-[90px]">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Maqsad</div>
              <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">8.0+</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-center min-w-[90px]">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Sinf Mock</div>
              <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">🔒 Faol</div>
            </div>
          </div>
        </div>

        {/* Segmented Switcher Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-[#0A0F1D] border border-slate-200/80 dark:border-slate-800 mt-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('mocks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mocks'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>To‘liq Mocklar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('classroom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock size={14} />
            <span>🔒 Sinf Testlari</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Ko‘nikmalar &amp; Savol Turlari</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('essay-sandbox')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'essay-sandbox'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool size={14} />
            <span>✍️ Essay Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('speaking-timer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'speaking-timer'
                ? 'bg-white dark:bg-[#1E293B] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic size={14} />
            <span>🗣️ Speaking Taymer</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'mocks' ? (
          <motion.div
            key="mocks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <IeltsMockTestsCatalogView
              user={user}
              onOpenPaywall={onOpenPaywall}
            />
          </motion.div>
        ) : activeTab === 'classroom' ? (
          <motion.div
            key="classroom"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <IeltsMockTestsCatalogView
              user={user}
              onOpenPaywall={onOpenPaywall}
            />
          </motion.div>
        ) : activeTab === 'practice' ? (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <IeltsSectionalPracticeView
              user={user}
              onOpenPaywall={onOpenPaywall}
              onOpenMistakeVault={onOpenMistakeVault}
            />
          </motion.div>
        ) : activeTab === 'essay-sandbox' ? (
          /* Task 2 Essay Sandbox */
          <motion.div
            key="essay-sandbox"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl p-6 sm:p-8 space-y-6">
              {/* Top Controls: Prompt Switcher & Timer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400 uppercase">
                    IELTS Writing Task 2 • Rasmiy Format
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {currentEssayPrompt.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {/* Timer Display */}
                  <div className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold text-sm flex items-center gap-2">
                    <Clock size={14} className="text-orange-400" />
                    <span>{formatSecs(essayTimerSecs)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEssayTimerRunning(!isEssayTimerRunning)}
                    className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold transition-colors cursor-pointer"
                    title={isEssayTimerRunning ? "Taymerni to'xtatish" : "Taymerni boshlash"}
                  >
                    {isEssayTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEssayTimerRunning(false);
                      setEssayTimerSecs(40 * 60);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                    title="Taymerni qayta o'rnatish"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Prompt Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                    Mavzu Turi: {currentEssayPrompt.type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {ESSAY_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEssayTopicIndex(idx);
                          setEssayText('');
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          essayTopicIndex === idx
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  &ldquo;{currentEssayPrompt.prompt}&rdquo;
                </p>
              </div>

              {/* Writing Textarea */}
              <div className="space-y-2">
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Inshongizni bu yerga yozing (Kamida 250 ta so'z)... Masalan: Introduction -> Body 1 -> Body 2 -> Conclusion"
                  rows={14}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-y"
                />

                {/* Bottom Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 ${
                        essayWordCount >= 250
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {essayWordCount >= 250 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      <span>{essayWordCount} / 250 so‘z</span>
                    </span>

                    <span className="text-slate-400 text-[11px]">
                      {essayWordCount >= 250 ? "Standart mezon bajarildi" : `${250 - essayWordCount} ta so'z yetishmayapti`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveEssay}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Inshoni Saqlash</span>
                  </button>
                </div>

                {savedEssayFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium animate-in fade-in">
                    {savedEssayFeedback}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Speaking Part 2 Cue Card Timer */
          <motion.div
            key="speaking-timer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl p-6 sm:p-8 space-y-6">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
                    IELTS Speaking Part 2 • Cue Card Taymeri
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {currentSpeakingTopic.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {SPEAKING_TOPICS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSpeakingTopicIndex(idx);
                        handleResetSpeaking();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        speakingTopicIndex === idx
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      Mavzu #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cue Card Display */}
              <div className="p-6 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 space-y-4">
                <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  You should say:
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {currentSpeakingTopic.cues.map((cue, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Timer & Action Block */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0F1D] border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
                <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                  {speakingPhase === 'idle'
                    ? "Tayyor bo'lsangiz tayyorgarlikni boshlang"
                    : speakingPhase === 'prep'
                    ? "1 daqiqalik fikrlash & eslatma olish (Prep Time)"
                    : speakingPhase === 'speaking'
                    ? "2 daqiqalik to'xtovsiz nutq so'zlash (Speaking Time)"
                    : "Muvaffaqiyatli yakunlandi!"}
                </div>

                {/* Big Timer Pulse Display */}
                <div
                  className={`text-4xl sm:text-6xl font-extrabold font-mono tabular-nums ${
                    speakingPhase === 'prep'
                      ? 'text-amber-500 animate-pulse'
                      : speakingPhase === 'speaking'
                      ? 'text-purple-600 dark:text-purple-400 animate-pulse'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {formatSecs(speakingTimer)}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  {speakingPhase === 'idle' && (
                    <button
                      type="button"
                      onClick={handleStartSpeakingPrep}
                      className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Play size={15} />
                      <span>1 Daqiqalik Tayyorgarlikni Boshlash</span>
                    </button>
                  )}

                  {speakingPhase === 'prep' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSpeakingPhase('speaking');
                        setSpeakingTimer(120);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>To'g'ridan-to'g'ri Nutqqa O'tish</span>
                      <ChevronRight size={14} />
                    </button>
                  )}

                  {(speakingPhase === 'speaking' || speakingPhase === 'finished') && (
                    <button
                      type="button"
                      onClick={handleResetSpeaking}
                      className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Qayta Boshlash</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Scratchpad for 1-Minute Notes */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  1 Daqiqalik Eslatmalar (Mind Map Notes):
                </label>
                <textarea
                  value={speakingNotes}
                  onChange={(e) => setSpeakingNotes(e.target.value)}
                  placeholder="Tayyorgarlik vaqtida asosiy kalit so'zlar, ideyalar va sinonimlarni yozib oling..."
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { IeltsTestsHub as IELTSTestsHub };
export default IeltsTestsHub;
