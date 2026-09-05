import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calculator,
  BookOpen,
  Sparkles,
  Clipboard,
  Trash2,
  Save,
  Plus,
  ArrowRight,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';
import { Question, SectionType, Difficulty, QuestionType } from '../types';
import { KaTeXRenderer } from './KaTeXRenderer';
import { uploadQuestionImage } from '../lib/questionUtils';
import { supabase } from '../lib/supabase';

interface AdminQuestionIngestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestion: (newQuestion: Question) => void;
  mockId?: string;
  defaultSection?: SectionType;
  defaultModule?: number;
}

const DOMAINS_BY_SECTION: Record<SectionType, string[]> = {
  READING_AND_WRITING: [
    'Craft and Structure',
    'Information and Ideas',
    'Standard English Conventions',
    'Expression of Ideas'
  ],
  MATH: [
    'Algebra',
    'Advanced Math',
    'Problem-Solving and Data Analysis',
    'Geometry and Trigonometry'
  ]
};

export const AdminQuestionIngestionDrawer: React.FC<AdminQuestionIngestionDrawerProps> = ({
  isOpen,
  onClose,
  onSaveQuestion,
  mockId,
  defaultSection = 'MATH',
  defaultModule = 1,
}) => {
  // Input modality: 'TEXT' vs 'IMAGE'
  const [modality, setModality] = useState<'TEXT' | 'IMAGE'>('TEXT');

  // Form State
  const [section, setSection] = useState<SectionType>(defaultSection);
  const [moduleNumber, setModuleNumber] = useState<number>(defaultModule);
  const [domain, setDomain] = useState<string>(DOMAINS_BY_SECTION[defaultSection][0]);
  const [skill, setSkill] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [questionType, setQuestionType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [testScope, setTestScope] = useState<'FULL_SAT' | 'MATH_ONLY' | 'RW_ONLY'>('FULL_SAT');

  // Content
  const [passage, setPassage] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Options (A, B, C, D)
  const [options, setOptions] = useState<{ A: string; B: string; C: string; D: string }>({
    A: '',
    B: '',
    C: '',
    D: ''
  });
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');
  const [gridInAnswer, setGridInAnswer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [explanationImageUrl, setExplanationImageUrl] = useState<string | null>(null);

  // Toast / Status
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update domain options when section changes
  useEffect(() => {
    const domains = DOMAINS_BY_SECTION[section];
    if (domains && !domains.includes(domain)) {
      setDomain(domains[0]);
    }
  }, [section]);

  // Handle Global/Dropzone Clipboard Paste (Ctrl+V) for Screenshot Ingestion
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            setIsUploadingImage(true);
            setStatusNotice("Skrinshot xotiradan yuklanmoqda...");
            const res = await uploadQuestionImage(file);
            if (res.url) {
              setImageUrl(res.url);
              setModality('IMAGE');
              setStatusNotice("Rasm muvaffaqiyatli biriktirildi!");
              setTimeout(() => setStatusNotice(null), 2500);
            }
            setIsUploadingImage(false);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setStatusNotice("Fayl yuklanmoqda...");
    const res = await uploadQuestionImage(file);
    if (res.url) {
      setImageUrl(res.url);
      setStatusNotice("Rasm muvaffaqiyatli yuklandi!");
      setTimeout(() => setStatusNotice(null), 2500);
    }
    setIsUploadingImage(false);
  };

  const handleSave = async (andAddAnother: boolean = false) => {
    if (!prompt.trim() && !imageUrl) {
      alert("Iltimos, savol matnini yoki muammo rasmini kiriting.");
      return;
    }

    const finalAnswer = questionType === 'GRID_IN' ? gridInAnswer.trim() : correctAnswer;
    if (!finalAnswer) {
      alert("Iltimos, to'g'ri javobni ko'rsating.");
      return;
    }

    setIsSaving(true);
    const newQuestionId = `Q-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newQuestion: Question = {
      id: newQuestionId,
      sqbId: `#ASRON-${Math.floor(1000 + Math.random() * 9000)}`,
      section,
      domain,
      skill: skill.trim() || domain,
      difficulty,
      type: questionType,
      passage: section === 'READING_AND_WRITING' ? passage.trim() : undefined,
      questionText: prompt.trim(),
      options: questionType === 'MULTIPLE_CHOICE' ? options : undefined,
      correctAnswer: finalAnswer,
      explanation: explanation.trim(),
      imageUrl: imageUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    // 1. Sync directly with Supabase public.questions table
    try {
      await supabase.from('questions').insert({
        id: crypto.randomUUID ? crypto.randomUUID() : undefined,
        mock_id: mockId || null,
        section: section === 'READING_AND_WRITING' ? 'reading_writing' : 'math',
        module_number: moduleNumber,
        domain,
        skill: skill.trim() || domain,
        difficulty: difficulty.toLowerCase(),
        passage: section === 'READING_AND_WRITING' ? passage.trim() : null,
        prompt: prompt.trim(),
        image_url: imageUrl || null,
        question_type: questionType === 'GRID_IN' ? 'grid_in' : 'multiple_choice',
        options: questionType === 'MULTIPLE_CHOICE' ? options : null,
        correct_answer: finalAnswer,
        explanation: explanation.trim(),
        explanation_image_url: explanationImageUrl || null,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Supabase direct insert notice:", err);
    }

    // 2. Call local app state handler
    onSaveQuestion(newQuestion);
    setIsSaving(false);

    if (andAddAnother) {
      // Reset only question-specific fields, retain section/domain
      setPrompt('');
      setPassage('');
      setImageUrl(null);
      setOptions({ A: '', B: '', C: '', D: '' });
      setGridInAnswer('');
      setExplanation('');
      setStatusNotice("Savol saqlandi! Keyingisini kiritishingiz mumkin.");
      setTimeout(() => setStatusNotice(null), 3000);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="w-full max-w-2xl h-full bg-white dark:bg-[#0A0F1D] border-l border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl flex flex-col font-sans overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]"
      >
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between bg-white dark:bg-[#121A2F] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#E07A5F]/15 text-[#E07A5F]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold truncate text-[#0F172A] dark:text-[#F8FAFC]">
                Multimodal Savol & Mock Ingestion Engine
              </h2>
              <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                R&W / Math · LaTeX · Skrinshot tashlash (Ctrl+V)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Status Toast */}
        {statusNotice && (
          <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section & Modality Tabs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Bo'lim (Section)
              </label>
              <div className="mt-1 flex gap-1 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setSection('READING_AND_WRITING')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    section === 'READING_AND_WRITING'
                      ? 'bg-[#E07A5F] text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Reading & Writing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSection('MATH')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    section === 'MATH'
                      ? 'bg-[#E07A5F] text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Math</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Modallik (Input Modality)
              </label>
              <div className="mt-1 flex gap-1 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setModality('TEXT')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    modality === 'TEXT'
                      ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Matnli (LaTeX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModality('IMAGE')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    modality === 'IMAGE'
                      ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Skrinshot / Rasm</span>
                </button>
              </div>
            </div>
          </div>

          {/* Granular Module, Domain & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#121A2F]/60 border border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Modul Bosqichi
              </label>
              <select
                value={moduleNumber}
                onChange={(e) => setModuleNumber(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-inherit focus:outline-hidden focus:border-[#E07A5F]"
              >
                <option value={1}>Modul 1 (Standart / Routing)</option>
                <option value={2}>Modul 2 (Hard / Qiyin)</option>
                <option value={2}>Modul 2 (Easy / Oson)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Qiyinlik (Difficulty)
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-inherit focus:outline-hidden focus:border-[#E07A5F]"
              >
                <option value="EASY">Oson (Easy)</option>
                <option value="MEDIUM">O'rta (Medium)</option>
                <option value="HARD">Qiyin (Hard 700+)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Savol Turi
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-inherit focus:outline-hidden focus:border-[#E07A5F]"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice (A, B, C, D)</option>
                {section === 'MATH' && (
                  <option value="GRID_IN">Student-Produced (Grid-in)</option>
                )}
              </select>
            </div>
          </div>

          {/* Domain & Skill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                SAT Domen (Domain)
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-inherit focus:outline-hidden focus:border-[#E07A5F]"
              >
                {DOMAINS_BY_SECTION[section].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Aniq Ko'nikma (Skill)
              </label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Masalan: Linear Equations, Words in Context..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-inherit focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          </div>

          {/* Reading Passage (if RW section) */}
          {section === 'READING_AND_WRITING' && (
            <div>
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                O'qish Matni (Reading Passage)
              </label>
              <textarea
                rows={3}
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="SAT matni yoki abzatsni bu yerga kiriting..."
                className="w-full mt-1 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-inherit font-serif leading-relaxed focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          )}

          {/* Screenshot Paste & Upload Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#E07A5F]" />
                <span>Chizma / Grafik / Skrinshot Tashlash (Ctrl+V)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">
                Clipboard Ingestion Faol
              </span>
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] bg-black/5 dark:bg-black/30 p-2">
                <img
                  src={imageUrl}
                  alt="Biriktirilgan savol chizmasi"
                  className="max-h-64 mx-auto rounded-xl object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                  title="Rasmni o'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F] bg-[#F8FAFC] dark:bg-[#121A2F]/40 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors"
              >
                <div className="p-2.5 rounded-full bg-[#E07A5F]/15 text-[#E07A5F]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Skrinshotni to'g'ridan-to'g'ri tashlang (Ctrl + V)
                  </div>
                  <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    yoki kompyuterdan fayl tanlang (PNG, JPG, WebP)
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>

          {/* Question Prompt */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Savol Matni (Prompt) — LaTeX $...$ qo'llab-quvvatlanadi
              </label>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Masalan: If $2x + 5 = 17$, what is the value of $4x$?"
              className="w-full mt-1 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-inherit focus:outline-hidden focus:border-[#E07A5F]"
            />
            {prompt && (
              <div className="mt-1.5 p-3 rounded-xl bg-[#F1F5F9] dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs">
                <div className="text-[10px] font-mono text-[#94A3B8] mb-1">Jonli KaTeX ko'rinishi:</div>
                <KaTeXRenderer text={prompt} />
              </div>
            )}
          </div>

          {/* Answer Options (A, B, C, D) or Grid-In */}
          {questionType === 'MULTIPLE_CHOICE' ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                  Variantlar (A, B, C, D) va To'g'ri Kalit
                </label>
                <span className="text-[10px] font-mono text-[#E07A5F] font-bold">
                  Tanlangan kalit: {correctAnswer}
                </span>
              </div>

              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const isCorrect = correctAnswer === letter;
                return (
                  <div key={letter} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(letter)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-bold shrink-0 transition-colors cursor-pointer border flex items-center justify-center ${
                        isCorrect
                          ? 'bg-[#E07A5F] text-white border-[#E07A5F] shadow-xs'
                          : 'bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#E07A5F]'
                      }`}
                      title={`${letter} variantni to'g'ri deb belgilash`}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      value={options[letter]}
                      onChange={(e) =>
                        setOptions({ ...options, [letter]: e.target.value })
                      }
                      placeholder={`${letter} javob matni yoki formula...`}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-inherit focus:outline-hidden focus:border-[#E07A5F]"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                Student-Produced Matematik Javob (Grid-in)
              </label>
              <input
                type="text"
                value={gridInAnswer}
                onChange={(e) => setGridInAnswer(e.target.value)}
                placeholder="Masalan: 24 yoki 3/4 yoki 0.75"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-inherit focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          )}

          {/* Pedagogical Explanation */}
          <div>
            <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
              Pedagogik Yechim & Tushuntirish (Explanation)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Bosqichma-bosqich yechish usuli va Desmos xaki..."
              className="w-full mt-1 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-inherit focus:outline-hidden focus:border-[#E07A5F]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-4 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#121A2F] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
          >
            Bekor qilish
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0A0F1D] border border-[#E07A5F] text-[#E07A5F] text-xs font-mono font-bold hover:bg-[#E07A5F]/10 cursor-pointer transition-colors disabled:opacity-50"
            >
              Saqlash & Yana Qo'shish
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saqlanmoqda..." : "Saqlash va Yopish"}</span>
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
