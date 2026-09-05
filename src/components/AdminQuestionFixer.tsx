import React, { useState, useMemo, useRef } from 'react';
import { 
  Terminal, Search, Filter, Save, Check, 
  RotateCcw, Eye, Code, BookOpen, Calculator, 
  AlertCircle, Plus, Copy, ExternalLink, Sliders,
  Image as ImageIcon, UploadCloud, Trash2, CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Question, SectionType, Difficulty } from '../types';
import { KaTeXRenderer } from './KaTeXRenderer';
import { 
  normalizeQuestionOptions, 
  safeStem, 
  safePassage, 
  safeExplanation,
  uploadQuestionImage
} from '../lib/questionUtils';
import { AdminQuestionIngestionDrawer } from './AdminQuestionIngestionDrawer';

interface AdminQuestionFixerProps {
  questions: Question[];
  onUpdateQuestion: (updatedQ: Question) => void;
  onAddQuestion?: (newQ: Question) => void;
}

const DEFAULT_FALLBACK_QUESTION: Question = {
  id: 'MATH-SQB-042',
  section: 'MATH',
  domain: 'Advanced Math',
  skill: 'Nonlinear equations and systems',
  difficulty: 'HARD',
  stem: 'What is the sum of the solutions to $x^2 - 14x + 45 = 0$?',
  options: ['9', '14', '45', '-14'],
  correctAnswer: 'B',
  explanation: 'By Vieta formulas, the sum of roots for $ax^2 + bx + c = 0$ is $-b/a = -(-14)/1 = 14$.',
};

export const AdminQuestionFixer: React.FC<AdminQuestionFixerProps> = ({
  questions = [],
  onUpdateQuestion,
  onAddQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | SectionType>('ALL');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    questions[0]?.id || DEFAULT_FALLBACK_QUESTION.id
  );
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Selected question with guaranteed non-null fallback
  const selectedQuestion = useMemo(() => {
    const found = questions.find((q) => q && q.id === selectedQuestionId);
    return found || questions[0] || DEFAULT_FALLBACK_QUESTION;
  }, [questions, selectedQuestionId]);

  const [editForm, setEditForm] = useState<Question>(selectedQuestion);

  // Sync edit form whenever selected question changes
  const handleSelectQuestion = (q: Question) => {
    if (!q) return;
    setSelectedQuestionId(q.id);
    setEditForm(q);
  };

  // Safe normalized options array guaranteed to be an array of strings
  const normalizedOptions = useMemo(() => {
    return normalizeQuestionOptions(editForm?.options);
  }, [editForm?.options]);

  const handleUpdateOption = (index: number, value: string) => {
    const current = [...normalizedOptions];
    while (current.length <= index) {
      current.push('');
    }
    current[index] = value;
    setEditForm((prev) => ({
      ...prev,
      options: current,
    }));
  };

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadQuestionImage(file);
      setEditForm((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
      }));
    } catch (err) {
      console.error('Error uploading question image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveHotFix = () => {
    onUpdateQuestion(editForm);
    setSaveStatus('SAVED');
    setTimeout(() => setSaveStatus('IDLE'), 2800);
  };

  const handleQuestionSavedFromDrawer = (newQ: Question) => {
    if (onAddQuestion) {
      onAddQuestion(newQ);
    }
    setSelectedQuestionId(newQ.id);
    setEditForm(newQ);
    setIsIngestionOpen(false);
  };

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (questions || []).filter((item) => {
      if (!item) return false;
      const idMatch = (item.id || '').toLowerCase().includes(q);
      const stemMatch = safeStem(item).toLowerCase().includes(q);
      const skillMatch = (item.skill || '').toLowerCase().includes(q);
      const domainMatch = (item.domain || '').toLowerCase().includes(q);

      const sectionMatch = sectionFilter === 'ALL' || item.section === sectionFilter;
      return (idMatch || stemMatch || skillMatch || domainMatch) && sectionMatch;
    });
  }, [questions, searchQuery, sectionFilter]);

  const currentStem = safeStem(editForm);
  const currentPassage = safePassage(editForm);
  const currentExplanation = safeExplanation(editForm);
  const currentImageUrl = editForm?.imageUrl || (editForm as any)?.image_url;

  return (
    <div id="admin-question-fixer" className="space-y-6 font-sans">
      {/* Drawer for Multimodal Question Ingestion */}
      <AdminQuestionIngestionDrawer
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onSaveQuestion={handleQuestionSavedFromDrawer}
        defaultSection={editForm?.section || 'MATH'}
      />

      {/* Toast Notification */}
      {saveStatus === 'SAVED' && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>HOT-FIX SAQLANDI: SAVOL #{editForm?.id || 'SQB'}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">GLOBAL REAL-TIME SYNC ACTIVE</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#0A0F1D] text-[#94A3B8] border border-[#1E293B] text-[11px] font-mono uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Universal Question & Mock Hot-Fix CMS</span>
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
            Savollar Banki & KaTeX Bluebook Muharriri
          </h2>
          <p className="text-xs text-[#64748B] max-w-2xl">
            Har qanday savolni real-time tahrirlash, formula ($...$), grafik/rasm yuklash va talaba Bluebook interfeysida tekshirish.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsIngestionOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>YANGI SAVOL (Ctrl+V)</span>
          </button>

          <button
            id="btn-save-question-hotfix"
            type="button"
            onClick={handleSaveHotFix}
            className="px-4 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4 stroke-[2]" />
            <span>SAQLASH</span>
          </button>
        </div>
      </div>

      {/* Search & Selector Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Savol ID (#MATH-001), matn, skill yoki domain bo'yicha izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 p-1 rounded-xl bg-[#121A2F] border border-[#1E293B]">
          {(['ALL', 'MATH', 'READING_AND_WRITING'] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                sectionFilter === sec
                  ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-[#334155]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {sec === 'ALL' ? 'Barcha Bo\'limlar' : sec === 'MATH' ? 'Math' : 'R & W'}
            </button>
          ))}
        </div>
      </div>

      {/* Question Selector Pill Strip */}
      {filteredQuestions.length > 0 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filteredQuestions.slice(0, 24).map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => handleSelectQuestion(q)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono shrink-0 transition-colors border cursor-pointer ${
                selectedQuestionId === q.id
                  ? 'bg-[#E07A5F]/15 text-[#E07A5F] border-[#E07A5F]/40 font-bold'
                  : 'bg-[#121A2F] text-[#64748B] border-[#1E293B] hover:text-[#94A3B8]'
              }`}
            >
              #{q.id}
            </button>
          ))}
          {filteredQuestions.length > 24 && (
            <span className="text-[10px] font-mono text-[#64748B] px-2">
              +{filteredQuestions.length - 24} yana
            </span>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#121A2F] border border-[#1E293B] text-center text-xs text-[#64748B]">
          Mos keladigan savollar topilmadi. Qidiruvni tozalang yoki yangi savol qo'shing.
        </div>
      )}

      {/* SPLIT-SCREEN HOT-FIX WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: LATEX / MARKDOWN QUESTION FORM */}
        <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4 shadow-xs">
          <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-[#E07A5F]" />
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Savol Muharriri (#{(editForm?.id || '').toUpperCase()})
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#0A0F1D] text-[10px] font-mono text-[#64748B] border border-[#1E293B]">
              {editForm?.section || 'MATH'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Domain</label>
              <input
                type="text"
                value={editForm?.domain || ''}
                onChange={(e) => setEditForm({ ...editForm, domain: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Skill</label>
              <input
                type="text"
                value={editForm?.skill || ''}
                onChange={(e) => setEditForm({ ...editForm, skill: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          </div>

          {/* Reading Passage (if RW or has passage) */}
          {(editForm?.section === 'READING_AND_WRITING' || Boolean(editForm?.passage)) && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Matn (Reading Passage)</label>
              <textarea
                rows={3}
                value={currentPassage}
                onChange={(e) => setEditForm({ ...editForm, passage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] font-serif leading-relaxed focus:outline-hidden focus:border-[#E07A5F]"
                placeholder="Reading passage matni..."
              />
            </div>
          )}

          {/* Question Stem */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#64748B] uppercase">
              Savol Sharti (Formula: $x^2 + y = 10$)
            </label>
            <textarea
              rows={3}
              value={currentStem}
              onChange={(e) => setEditForm({ ...editForm, stem: e.target.value, questionText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
            />
          </div>

          {/* Image Attachment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#64748B] uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-[#E07A5F]" />
                <span>Grafik / Rasm URL</span>
              </label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileSelected}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                className="text-[10px] font-mono text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3 h-3" />
                <span>{isUploadingImage ? 'Yuklanmoqda...' : 'Fayl Tanlash'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://... yoki fayl yuklang"
                value={currentImageUrl || ''}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
              {currentImageUrl && (
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                  className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg cursor-pointer"
                  title="Rasmni o'chirish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options (A, B, C, D) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Variantlar (A, B, C, D)</label>
              <button
                type="button"
                onClick={() => {
                  const current = [...normalizedOptions];
                  current.push('');
                  setEditForm({ ...editForm, options: current });
                }}
                className="text-[10px] font-mono text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Variant Qo'shish
              </button>
            </div>

            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isCorrect = (editForm?.correctAnswer || '').trim().toUpperCase() === letter;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-6 text-center text-xs font-mono font-bold ${
                      isCorrect ? 'text-[#E07A5F]' : 'text-[#64748B]'
                    }`}>
                      {letter}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleUpdateOption(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, correctAnswer: letter })}
                      className={`px-2 py-1 rounded-md text-[10px] font-mono border transition-colors cursor-pointer ${
                        isCorrect
                          ? 'bg-[#E07A5F]/20 text-[#E07A5F] border-[#E07A5F]/40 font-bold'
                          : 'bg-[#0A0F1D] text-[#64748B] border-[#1E293B] hover:text-[#94A3B8]'
                      }`}
                    >
                      {isCorrect ? 'TO\'G\'RI' : 'BELGILASH'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-3 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#64748B] flex items-center justify-between">
                <span>Student-Produced Response (Grid-in). To'g'ri javob:</span>
                <input
                  type="text"
                  value={editForm?.correctAnswer || ''}
                  onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                  placeholder="Masalan: 14 yoki 3/4"
                  className="w-32 px-2 py-1 rounded bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#F8FAFC]"
                />
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#64748B] uppercase">Pedagogik Tushuntirish (Explanation)</label>
            <textarea
              rows={3}
              value={currentExplanation}
              onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              placeholder="Savol yechimi va tushuntirishi..."
            />
          </div>
        </div>

        {/* RIGHT PANE: LIVE STUDENT BLUEBOOK PREVIEW */}
        <div className="p-6 rounded-2xl bg-[#0A0F1D] border border-[#1E293B] space-y-4 shadow-xs flex flex-col">
          <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Talaba Bluebook Ko'rinishi (Live Preview)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">KaTeX Engine Active</span>
          </div>

          {/* Simulated Bluebook Question Card */}
          <div className="p-5 rounded-xl bg-[#121A2F] border border-[#1E293B] space-y-4 flex-1">
            {/* Header info */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] border-b border-[#1E293B] pb-2.5">
              <span>Bo'lim: {editForm?.section || 'MATH'}</span>
              <span className="text-[#E07A5F]">{editForm?.domain || 'Algebra'}</span>
            </div>

            {/* Passage if any */}
            {currentPassage && (
              <div className="p-3.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-serif text-[#F8FAFC] leading-relaxed max-h-48 overflow-y-auto">
                <KaTeXRenderer text={currentPassage} />
              </div>
            )}

            {/* Image Diagram if any */}
            {currentImageUrl && (
              <div className="p-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] flex justify-center">
                <img
                  src={currentImageUrl}
                  alt="Question diagram"
                  className="max-h-56 max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Stem */}
            <div className="text-xs text-[#F8FAFC] leading-relaxed">
              <KaTeXRenderer text={currentStem || 'Savol matni kiritilmagan.'} />
            </div>

            {/* Options List or Grid-In Preview */}
            <div className="space-y-2 pt-2">
              {normalizedOptions.length > 0 ? (
                normalizedOptions.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = (editForm?.correctAnswer || '').trim().toUpperCase() === letter;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors ${
                        isCorrect
                          ? 'bg-[#E07A5F]/10 border-[#E07A5F]/40 text-[#F8FAFC]'
                          : 'bg-[#0A0F1D] border-[#1E293B] text-[#94A3B8]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isCorrect ? 'bg-[#E07A5F] text-[#0A0F1D]' : 'bg-[#1E293B] text-[#64748B]'
                      }`}>
                        {letter}
                      </span>
                      <div className="flex-1 min-w-0">
                        <KaTeXRenderer text={opt} />
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] font-mono text-[#E07A5F] font-bold">To'g'ri kalit</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#94A3B8] space-y-2">
                  <div className="font-mono text-[11px] text-[#64748B]">Talaba kiritadigan javob (Grid-in):</div>
                  <div className="px-3 py-2 rounded bg-[#121A2F] border border-[#334155] font-mono text-sm text-[#F8FAFC] inline-block">
                    {editForm?.correctAnswer || '---'}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation box */}
            {currentExplanation && (
              <div className="p-3 rounded-lg bg-[#0A0F1D] border border-[#1E293B] space-y-1 mt-4">
                <div className="text-[10px] font-mono text-[#E07A5F] uppercase font-bold">Pedagogik Yechim</div>
                <div className="text-[11px] text-[#94A3B8] leading-relaxed">
                  <KaTeXRenderer text={currentExplanation} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
