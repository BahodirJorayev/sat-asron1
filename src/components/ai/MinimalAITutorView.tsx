import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  ArrowUp,
  RotateCcw,
  X,
  Lock,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Calculator,
  CornerDownLeft,
} from 'lucide-react';
import { KaTeXRenderer } from '../KaTeXRenderer';
import { Question, User } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface MinimalAITutorViewProps {
  user?: User;
  question?: Question | null;
  userWrongAnswer?: string;
  onClose?: () => void;
  isSlideOver?: boolean;
}

export const MinimalAITutorView: React.FC<MinimalAITutorViewProps> = ({
  user,
  question,
  userWrongAnswer,
  onClose,
  isSlideOver = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting if question is present
  useEffect(() => {
    if (question && messages.length === 0) {
      const wrongContext = userWrongAnswer
        ? `Siz tanlagan variant: Choice ${userWrongAnswer}. `
        : '';
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'model',
          text: `Men sizning ASRON SAT Sokratik repetitoringizman. ${wrongContext}Ushbu **${question.skill}** savolini birgalikda tahlil qilamiz. Masala shartini o'qiganingizda dastlab qanday fikrga keldingiz?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [question, userWrongAnswer]);

  const handleReset = () => {
    if (question) {
      const wrongContext = userWrongAnswer
        ? `Siz tanlagan variant: Choice ${userWrongAnswer}. `
        : '';
      setMessages([
        {
          id: `reset-${Date.now()}`,
          role: 'model',
          text: `Men sizning ASRON SAT Sokratik repetitoringizman. ${wrongContext}Ushbu **${question.skill}** savolini qaytadan tahlil qilamiz. Qaysi bosqichdan boshlaymiz?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
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
          questionContext: question || undefined,
          question: question || undefined,
          userMessage: textToSend,
          userPrompt: textToSend,
          userWrongAnswer,
          conversationHistory: historyPayload,
          chatHistory: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const modelMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Masalani tahlil qilaylik. Dastlabki qadam haqida nima deya olasiz?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Socratic Tutor call error:', err);
      // Fallback
      const isRW = question?.section === 'READING_AND_WRITING';
      const fallbackReply = isRW
        ? `Tahlil bosqichi:\n\n1. **Grammatik chegara:** Nuqtalar o'rnidagi bog'lovchi mustaqil gaplarni bog'layaptimi yoki ergash gapmi?\n2. **Variantlar:** Qaysi 2 ta variant jiddiy punktuatsiya xatosi hosil qiladi?\n3. **Savol:** Qolgan variantlarning ma'noviy farqiga e'tibor bering.`
        : `Tahlil bosqichi:\n\n1. **Invariant:** Tenglamaning ikki tomonini solishtiring.\n2. **Desmos:** $y = f(x)$ deb kiritib, ekstremum yoki kesishish nuqtasini tekshiring.\n3. **Savol:** Ushbu ifodani soddalashtirganda qanday natija olasiz?`;

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

  return (
    <div
      className={`flex flex-col h-full bg-[#0A0F1D] text-[#F8FAFC] font-sans select-text ${
        isSlideOver ? 'border-l border-[#1E293B] shadow-2xl' : ''
      }`}
    >
      {/* 1. Header */}
      <header className="h-14 px-5 border-b border-[#1E293B] bg-[#121A2F] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B1B3D] border border-[#1E293B] flex items-center justify-center text-[#E76F51]">
            <Terminal size={16} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight text-[#F8FAFC]">
              ASRON Socratic Tutor
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center font-mono text-[10px] text-[#94A3B8] tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Gemini 2.5 Flash • Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            title="Suhbatni tozalash"
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] border border-transparent hover:border-[#1E293B] transition-all cursor-pointer"
          >
            <RotateCcw size={14} strokeWidth={1.5} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Yopish"
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] border border-transparent hover:border-[#1E293B] transition-all cursor-pointer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </header>

      {/* 2. Optional Context Card if tied to active Question */}
      {question && (
        <div className="p-3.5 mx-4 mt-4 rounded-xl bg-[#121A2F] border border-[#1E293B] shrink-0 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-1.5">
            <span className="uppercase">{question.domain} • {question.skill}</span>
            {userWrongAnswer && (
              <span className="text-rose-400 font-bold">Tanlangan: {userWrongAnswer}</span>
            )}
          </div>
          <p className="text-[#F8FAFC] line-clamp-2 text-xs leading-relaxed opacity-90">
            {question.passage || question.questionText}
          </p>
        </div>
      )}

      {/* 3. Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-[#121A2F] border border-[#1E293B] flex items-center justify-center text-[#E76F51]">
              <Terminal size={22} strokeWidth={1.5} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                ASRON Sokratik AI Repetitor
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Savolni tahlil qilish, xatolar ildizini aniqlash va Desmos tezkor usullarini o'rganish uchun savol bering.
              </p>
            </div>

            <div className="w-full space-y-2 text-left">
              <button
                onClick={() => handleSend("Nega mening tanlagan javobim xato?")}
                className="w-full p-3 rounded-xl bg-[#121A2F] hover:bg-[#1E293B] border border-[#1E293B] text-xs text-[#F8FAFC] font-medium transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>→ Nega mening tanlagan javobim xato?</span>
                <ChevronRight size={14} strokeWidth={1.5} className="text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors" />
              </button>

              <button
                onClick={() => handleSend("Desmosda yechish formulasini ko'rsat")}
                className="w-full p-3 rounded-xl bg-[#121A2F] hover:bg-[#1E293B] border border-[#1E293B] text-xs text-[#F8FAFC] font-medium transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>→ Desmosda yechish formulasini ko'rsat</span>
                <ChevronRight size={14} strokeWidth={1.5} className="text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          messages.map((m) => {
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
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] p-3 rounded-xl bg-[#121A2F] border border-[#1E293B] w-fit animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E76F51] animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#E76F51] animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#E76F51] animate-bounce [animation-delay:0.4s]" />
            <span className="font-mono text-[11px] ml-1">ASRON tahlil qilmoqda...</span>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* 4. Input Bar */}
      <footer className="p-4 border-t border-[#1E293B] bg-[#121A2F] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savolingizni yoki fikringizni yozing..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs sm:text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#E76F51] transition-all font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-[#E76F51] hover:bg-[#d65f42] text-white disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowUp size={16} strokeWidth={1.5} />
          </button>
        </form>
      </footer>
    </div>
  );
};
