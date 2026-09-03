import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  ArrowUp,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  BookOpen,
  Target,
  Zap,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Question, User, MistakeVaultItem } from '../types';
import { KaTeXRenderer } from './KaTeXRenderer';
import { FloatingDesmosWidget } from './FloatingDesmosWidget';

interface Props {
  user: User;
  questions?: Question[];
  mistakes?: MistakeVaultItem[];
  onOpenPaywall?: () => void;
  onOpenQuestionBank?: (skill?: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const SAT_DOMAINS = [
  { id: 'all', name: 'Barcha Domenlar' },
  { id: 'algebra', name: 'Algebra' },
  { id: 'advanced-math', name: 'Advanced Math' },
  { id: 'problem-solving', name: 'Problem Solving & Data' },
  { id: 'geometry', name: 'Geometry & Trig' },
  { id: 'conventions', name: 'Standard English Conventions' },
  { id: 'transitions', name: 'Expression of Ideas' },
  { id: 'craft', name: 'Craft & Structure' },
  { id: 'info', name: 'Information & Ideas' },
];

export const SocraticRepetitorHubView: React.FC<Props> = ({
  user,
  questions = [],
  mistakes = [],
  onOpenPaywall,
  onOpenQuestionBank,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(() => {
    return questions[0] || null;
  });
  const [activeMistake, setActiveMistake] = useState<MistakeVaultItem | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Tools & Modals
  const [isDesmosOpen, setIsDesmosOpen] = useState<boolean>(false);
  const [desmosExpression, setDesmosExpression] = useState<string>('');
  const [isTwinGenerating, setIsTwinGenerating] = useState<boolean>(false);
  const [isTrapLoading, setIsTrapLoading] = useState<boolean>(false);
  const [trapAnalysis, setTrapAnalysis] = useState<any | null>(null);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting when active question changes
  useEffect(() => {
    if (activeQuestion) {
      const wrongContext = activeMistake?.userWrongAnswer
        ? `Siz tanlagan noto'g'ri variant: Choice ${activeMistake.userWrongAnswer}. `
        : '';

      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'model',
          text: `Men sizning ASRON SAT Sokratik repetitoringizman. ${wrongContext}Ushbu **${activeQuestion.skill}** savolini birgalikda tahlil qilamiz. Masala shartini o'qiganingizda qaysi qism sizda ikkilanish uyg'otdi?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTrapAnalysis(null);
    }
  }, [activeQuestion, activeMistake]);

  // Send message
  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion || undefined,
          questionContext: activeQuestion || undefined,
          userMessage: text,
          userPrompt: text,
          userWrongAnswer: activeMistake?.userWrongAnswer,
          chatHistory: historyPayload,
          conversationHistory: historyPayload,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Masalani tahlil qilaylik. Dastlabki qadam haqida nima deya olasiz?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Socratic error:', err);
      const isRW = activeQuestion?.section === 'READING_AND_WRITING';
      const fallbackReply = isRW
        ? `Tahlil bosqichlari:\n\n1. **Qoida tahlili:** Nuqtalar o'rnidagi grammatik tuzilmani aniqlang.\n2. **Variantlar:** Qaysi 2 ta variant mustaqil gap qoidalariga zid?\n3. **Savol:** Qolgan variantlarning ma'noviy farqi nimada?`
        : `Tahlil bosqichlari:\n\n1. **Invariant:** Tenglamaning asosiy hadlarini ajratib oling.\n2. **Desmos:** $y = f(x)$ deb kiritib, ekstremum yoki kesishish nuqtalarini ko'ring.\n3. **Savol:** Ushbu ifodani soddalashtirganda qanday natijaga kelasiz?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Run Trap Analysis
  const handleRunTrapAnalysis = async () => {
    if (!activeQuestion) return;
    setIsTrapLoading(true);
    try {
      const res = await fetch('/api/gemini/trap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          userWrongAnswer: activeMistake?.userWrongAnswer || 'Selected Choice',
          correctAnswer: activeQuestion.correctAnswer,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setTrapAnalysis(data.analysis);
        const analysisText = `**Xato Tuzog'i Tahlili (${data.analysis.cognitiveBias}):**\n\n- **O'tkazib yuborilgan qoida:** ${data.analysis.coreRuleMissed}\n- **Tuzoq mexanizmi:** ${data.analysis.trapReason}\n- **Oldini olish strategiyasi:** ${data.analysis.preventionStrategy}`;
        setMessages((prev) => [
          ...prev,
          {
            id: `trap-${Date.now()}`,
            role: 'model',
            text: analysisText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Trap analysis error:', err);
    } finally {
      setIsTrapLoading(false);
    }
  };

  // Desmos solver trigger
  const handleOpenDesmosSolver = () => {
    if (!activeQuestion) return;
    const mathText = activeQuestion.questionText;
    const formulaMatch = mathText.match(/([a-zA-Z0-9\^_\+\-\*\/\=\(\)\s]+)/);
    const expr = formulaMatch ? formulaMatch[0].trim() : 'y = x^2 - 4x + 3';
    setDesmosExpression(expr);
    setIsDesmosOpen(true);
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesDomain =
      selectedDomain === 'all' ||
      q.domain.toLowerCase().includes(selectedDomain.replace('-', ' '));
    const matchesSearch =
      !searchQuery ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.skill.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-[#0A0F1D] text-[#F8FAFC] font-sans">
      {/* 1. Left Taxonomy & Items Sidebar */}
      <div className="w-full md:w-80 border-r border-[#1E293B] bg-[#121A2F] flex flex-col shrink-0 h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] space-y-3 bg-[#0A0F1D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0B1B3D] border border-[#1E293B] flex items-center justify-center text-[#E76F51]">
                <Terminal size={15} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F8FAFC]">ASRON Socratic Hub</h2>
                <span className="text-[10px] font-mono text-[#94A3B8]">Gemini 2.5 Flash</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#121A2F] text-[#94A3B8] border border-[#1E293B]">
              Active
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ko'nikma yoki savolni qidirish..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#121A2F] border border-[#1E293B] rounded-xl text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#E76F51]"
            />
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="p-2 border-b border-[#1E293B] overflow-x-auto flex gap-1.5 scrollbar-none bg-[#121A2F]">
          {SAT_DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedDomain === d.id
                  ? 'bg-[#E76F51] text-white font-bold'
                  : 'bg-[#0A0F1D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* List of Questions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
            Mashq Savollari ({filteredQuestions.length})
          </div>

          {filteredQuestions.map((q) => {
            const isSelected = activeQuestion?.id === q.id;
            const relatedMistake = mistakes.find((m) => m.question?.id === q.id);

            return (
              <div
                key={q.id}
                onClick={() => {
                  setActiveQuestion(q);
                  setActiveMistake(relatedMistake || null);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                  isSelected
                    ? 'bg-[#0A0F1D] border-[#E76F51] ring-1 ring-[#E76F51]'
                    : 'bg-[#121A2F] border-[#1E293B] hover:border-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#E76F51] truncate max-w-[150px]">
                    {q.skill}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      q.difficulty === 'HARD'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                        : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-xs text-[#F8FAFC] line-clamp-2 leading-relaxed opacity-90">
                  {q.passage || q.questionText}
                </p>

                {relatedMistake && (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-mono">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span>Xato tanlangan: {relatedMistake.userWrongAnswer}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Center Conversational Socratic Intelligence Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#0A0F1D] overflow-hidden min-w-0">
        {/* Top Active Question Banner */}
        {activeQuestion && (
          <div className="p-4 bg-[#121A2F] border-b border-[#1E293B] shrink-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
                <span className="uppercase">{activeQuestion.domain}</span>
                <span>•</span>
                <span className="text-[#F8FAFC] font-semibold">{activeQuestion.skill}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunTrapAnalysis}
                  disabled={isTrapLoading}
                  className="px-3 py-1 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap size={13} strokeWidth={1.5} className="text-[#E76F51]" />
                  <span>Xato Tahlili</span>
                </button>

                {activeQuestion.section === 'MATH' && (
                  <button
                    onClick={handleOpenDesmosSolver}
                    className="px-3 py-1 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sliders size={13} strokeWidth={1.5} className="text-[#38BDF8]" />
                    <span>Desmos Solver</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs text-[#F8FAFC] leading-relaxed max-h-24 overflow-y-auto pr-2">
              <KaTeXRenderer text={activeQuestion.passage || activeQuestion.questionText} />
            </div>
          </div>
        )}

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed border ${
                    isUser
                      ? 'bg-[#E76F51] text-white border-[#E76F51] rounded-br-xs font-medium'
                      : 'bg-[#121A2F] text-[#F8FAFC] border-[#1E293B] rounded-bl-xs'
                  }`}
                >
                  <KaTeXRenderer text={m.text} className={isUser ? 'text-white' : 'text-[#F8FAFC]'} />
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8] px-1">
                  {m.timestamp}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] p-3 rounded-xl bg-[#121A2F] border border-[#1E293B] w-fit animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E76F51] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#E76F51] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#E76F51] animate-bounce [animation-delay:0.4s]" />
              <span className="font-mono text-[11px] ml-1">ASRON tahlil qilmoqda...</span>
            </div>
          )}

          <div ref={chatScrollRef} />
        </div>

        {/* Input Bar */}
        <footer className="p-4 border-t border-[#1E293B] bg-[#121A2F] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Sokratik repetitorga savol bering yoki fikringizni yozing..."
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs sm:text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#E76F51] transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-[#E76F51] hover:bg-[#d65f42] text-white disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowUp size={16} strokeWidth={1.5} />
            </button>
          </form>
        </footer>
      </div>

      {/* Floating Desmos Widget for In-Situ Solve */}
      <FloatingDesmosWidget
        isOpen={isDesmosOpen}
        onClose={() => setIsDesmosOpen(false)}
        initialExpression={desmosExpression}
      />
    </div>
  );
};
