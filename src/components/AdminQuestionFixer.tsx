import React, { useState, useMemo } from 'react';
import { 
  Terminal, Search, Filter, Save, Check, 
  RotateCcw, Eye, Code, BookOpen, Calculator, 
  AlertCircle, Plus, Copy, ExternalLink, Sliders
} from 'lucide-react';
import { Question, SectionType, Difficulty } from '../types';
import { KaTeXRenderer } from './KaTeXRenderer';

interface AdminQuestionFixerProps {
  questions: Question[];
  onUpdateQuestion: (updatedQ: Question) => void;
  onAddQuestion?: (newQ: Question) => void;
}

export const AdminQuestionFixer: React.FC<AdminQuestionFixerProps> = ({
  questions,
  onUpdateQuestion,
  onAddQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | SectionType>('ALL');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0]?.id || 'MATH-001');
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');
  const [activePreviewTab, setActivePreviewTab] = useState<'bluebook' | 'raw'>('bluebook');

  const selectedQuestion = useMemo(() => {
    return questions.find((q) => q.id === selectedQuestionId) || questions[0] || {
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
  }, [questions, selectedQuestionId]);

  const [editForm, setEditForm] = useState<Question>(selectedQuestion);

  // Sync edit form when selection changes
  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestionId(q.id);
    setEditForm(q);
  };

  const handleUpdateOption = (index: number, value: string) => {
    const nextOpts = [...(editForm.options || ['', '', '', ''])];
    nextOpts[index] = value;
    setEditForm({ ...editForm, options: nextOpts });
  };

  const handleSaveHotFix = () => {
    onUpdateQuestion(editForm);
    setSaveStatus('SAVED');
    setTimeout(() => setSaveStatus('IDLE'), 2800);
  };

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return questions.filter((item) => {
      const textMatch = 
        (item.id || '').toLowerCase().includes(q) ||
        (item.stem || item.questionText || '').toLowerCase().includes(q) ||
        (item.skill || '').toLowerCase().includes(q) ||
        (item.domain || '').toLowerCase().includes(q);

      const sectionMatch = sectionFilter === 'ALL' || item.section === sectionFilter;
      return textMatch && sectionMatch;
    });
  }, [questions, searchQuery, sectionFilter]);

  const rawStem = editForm.stem || editForm.questionText || '';

  return (
    <div id="admin-question-fixer" className="space-y-6 font-sans">
      {/* Toast Notification */}
      {saveStatus === 'SAVED' && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>HOT-FIX APPLIED & RECALCULATED FOR QUESTION #{editForm.id}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">BROADCAST ACTIVE</span>
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
            Live Question Editor & KaTeX Bluebook Viewport
          </h2>
          <p className="text-xs text-[#64748B] max-w-2xl">
            Split-screen editor with real-time KaTeX LaTeX equation parsing, option shuffling validation, and student Bluebook replica testing.
          </p>
        </div>

        <button
          id="btn-save-question-hotfix"
          onClick={handleSaveHotFix}
          className="px-4 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4 stroke-[2]" />
          <span>SAVE & RECALCULATE</span>
        </button>
      </div>

      {/* Search & Selector Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by Question ID (#SQB-MATH-042), stem text, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 p-1 rounded-xl bg-[#121A2F] border border-[#1E293B]">
          {(['ALL', 'MATH', 'READING_AND_WRITING'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                sectionFilter === sec
                  ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-[#334155]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {sec === 'ALL' ? 'All Sections' : sec === 'MATH' ? 'Math' : 'R & W'}
            </button>
          ))}
        </div>
      </div>

      {/* Question Selector Pill Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filteredQuestions.slice(0, 16).map((q) => (
          <button
            key={q.id}
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
      </div>

      {/* SPLIT-SCREEN HOT-FIX WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: LATEX / MARKDOWN QUESTION FORM */}
        <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4 shadow-xs">
          <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-[#E07A5F]" />
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Question Editor (#{(editForm.id || '').toUpperCase()})
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#0A0F1D] text-[10px] font-mono text-[#64748B] border border-[#1E293B]">
              {editForm.section}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Domain</label>
              <input
                type="text"
                value={editForm.domain || ''}
                onChange={(e) => setEditForm({ ...editForm, domain: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Skill</label>
              <input
                type="text"
                value={editForm.skill || ''}
                onChange={(e) => setEditForm({ ...editForm, skill: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          </div>

          {/* Passage (if RW) */}
          {editForm.passage && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Reading Passage</label>
              <textarea
                rows={3}
                value={editForm.passage || ''}
                onChange={(e) => setEditForm({ ...editForm, passage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] font-serif leading-relaxed focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>
          )}

          {/* Question Stem */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#64748B] uppercase">Question Stem (LaTeX supported with $...$)</label>
            <textarea
              rows={3}
              value={rawStem}
              onChange={(e) => setEditForm({ ...editForm, stem: e.target.value, questionText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
            />
          </div>

          {/* Options (A, B, C, D) */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-[#64748B] uppercase">Answer Choices (A, B, C, D)</label>
            {(editForm.options || ['', '', '', '']).map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-6 text-center text-xs font-mono font-bold ${
                    editForm.correctAnswer === letter ? 'text-[#E07A5F]' : 'text-[#64748B]'
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
                      editForm.correctAnswer === letter
                        ? 'bg-[#E07A5F]/20 text-[#E07A5F] border-[#E07A5F]/40 font-bold'
                        : 'bg-[#0A0F1D] text-[#64748B] border-[#1E293B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {editForm.correctAnswer === letter ? 'CORRECT' : 'SET KEY'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#64748B] uppercase">Official Pedagogical Explanation</label>
            <textarea
              rows={3}
              value={editForm.explanation || ''}
              onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
            />
          </div>
        </div>

        {/* RIGHT PANE: LIVE STUDENT BLUEBOOK PREVIEW */}
        <div className="p-6 rounded-2xl bg-[#0A0F1D] border border-[#1E293B] space-y-4 shadow-xs flex flex-col">
          <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Live Student Bluebook Viewport
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">KaTeX Engine Active</span>
          </div>

          {/* Simulated Bluebook Question Card */}
          <div className="p-5 rounded-xl bg-[#121A2F] border border-[#1E293B] space-y-4 flex-1">
            {/* Header info */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] border-b border-[#1E293B] pb-2.5">
              <span>Section: {editForm.section}</span>
              <span className="text-[#E07A5F]">{editForm.domain}</span>
            </div>

            {/* Passage if any */}
            {editForm.passage && (
              <div className="p-3.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-serif text-[#F8FAFC] leading-relaxed">
                <KaTeXRenderer text={editForm.passage} />
              </div>
            )}

            {/* Stem */}
            <div className="text-xs text-[#F8FAFC] leading-relaxed">
              <KaTeXRenderer text={rawStem} />
            </div>

            {/* Options List */}
            <div className="space-y-2 pt-2">
              {(editForm.options || []).map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isCorrect = editForm.correctAnswer === letter;
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
                  </div>
                );
              })}
            </div>

            {/* Explanation box */}
            {editForm.explanation && (
              <div className="p-3 rounded-lg bg-[#0A0F1D] border border-[#1E293B] space-y-1 mt-4">
                <div className="text-[10px] font-mono text-[#E07A5F] uppercase font-bold">Explanation Breakdown</div>
                <div className="text-[11px] text-[#94A3B8] leading-relaxed">
                  <KaTeXRenderer text={editForm.explanation} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
