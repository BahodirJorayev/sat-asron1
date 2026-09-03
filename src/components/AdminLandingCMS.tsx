import React, { useState } from 'react';
import { 
  Globe, Layout, Sparkles, Megaphone, HelpCircle, 
  MessageSquare, Plus, Trash2, Save, RotateCcw, 
  Check, Eye, ExternalLink, MoveUp, MoveDown,
  Star, Image as ImageIcon, Sliders
} from 'lucide-react';
import { GlobalPlatformSettings, UserTestimonial } from '../types';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface AdminLandingCMSProps {
  globalSettings: GlobalPlatformSettings;
  testimonials: UserTestimonial[];
  onSaveSettings: (settings: GlobalPlatformSettings) => void;
  onSaveTestimonials: (testimonials: UserTestimonial[]) => void;
}

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does ASRON SAT mirror the official Bluebook interface and scoring curve?',
    answer: 'ASRON SAT utilizes a 1:1 mathematical replica of the College Board Multistage Adaptive Testing (MST) algorithm, including authentic Module 1 routing, Desmos integration, and psychometric 200-800 scale conversions.',
  },
  {
    id: 'faq-2',
    question: 'How do I pay and unlock Standard, PRO, or VIP tiers?',
    answer: 'Payments are handled seamlessly via manual verification on Telegram (@rcmnx). Simply send your receipt or click the plan CTA to get your official Scholar ID pass minted instantly.',
  },
  {
    id: 'faq-3',
    question: 'What is the 3-Stage Leitner Mistake Vault?',
    answer: 'Whenever you miss a question during drills or mocks, it enters Stage 1. You must solve it correctly across spaced intervals (24h, 3d, 7d) and master AI-generated clone variations before it is cleared as mastered.',
  },
  {
    id: 'faq-4',
    question: 'Does the Socratic AI Tutor spoil the answer directly?',
    answer: 'Powered by Gemini 2.5, our AI acts as an Ivy League tutor, guiding you with strategic hints, Desmos 20-second shortcut formulas, and trap identification without revealing the final option prematurely.',
  },
];

export const AdminLandingCMS: React.FC<AdminLandingCMSProps> = ({
  globalSettings,
  testimonials,
  onSaveSettings,
  onSaveTestimonials,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'announcement' | 'faqs' | 'testimonials'>('hero');
  const [saveToast, setSaveToast] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<GlobalPlatformSettings>(globalSettings);
  const [testimonialsList, setTestimonialsList] = useState<UserTestimonial[]>(testimonials);
  const [faqsList, setFaqsList] = useState<FAQItem[]>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('asron_landing_faqs');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_FAQS;
  });

  // New FAQ form
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // New Testimonial form
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    score: '1560',
    university: 'MIT Early Decision',
    quote: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const handleSaveAll = () => {
    onSaveSettings(settingsForm);
    onSaveTestimonials(testimonialsList);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('asron_landing_faqs', JSON.stringify(faqsList));
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2800);
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const item: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQ.trim(),
      answer: newFaqA.trim(),
    };
    setFaqsList([...faqsList, item]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (id: string) => {
    setFaqsList(faqsList.filter((f) => f.id !== id));
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.quote.trim()) return;
    const t: UserTestimonial = {
      id: `t-${Date.now()}`,
      name: newTestimonial.name.trim(),
      score: Number(newTestimonial.score) || 1550,
      university: newTestimonial.university.trim(),
      quote: newTestimonial.quote.trim(),
      avatarUrl: newTestimonial.avatarUrl,
      verifiedDate: 'Just now',
    };
    setTestimonialsList([t, ...testimonialsList]);
    setNewTestimonial({
      name: '',
      score: '1560',
      university: 'Stanford Class of 2030',
      quote: '',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });
  };

  const handleRemoveTestimonial = (id: string) => {
    setTestimonialsList(testimonialsList.filter((t) => t.id !== id));
  };

  return (
    <div id="admin-landing-cms" className="space-y-6 font-sans">
      {/* Toast */}
      {saveToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>Landing Page CMS updated successfully! Instant live propagation active.</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">HTTP 200 OK</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#0A0F1D] text-[#94A3B8] border border-[#1E293B] text-[11px] font-mono uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Landing & Content Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
            Landing Page Copy & Top Bar CMS
          </h2>
          <p className="text-xs text-[#64748B] max-w-xl">
            Live editor for hero headlines, student review cards, FAQ matrices, and top banner announcements.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-4 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4 stroke-[2]" />
          <span>SAVE LANDING CONTENT</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121A2F] border border-[#1E293B] overflow-x-auto">
        {[
          { id: 'hero', label: '1. Hero Headlines & CTA', icon: <Layout className="w-3.5 h-3.5" /> },
          { id: 'announcement', label: '2. Announcement Bar', icon: <Megaphone className="w-3.5 h-3.5" /> },
          { id: 'faqs', label: `3. FAQ Matrix (${faqsList.length})`, icon: <HelpCircle className="w-3.5 h-3.5" /> },
          { id: 'testimonials', label: `4. Testimonials (${testimonialsList.length})`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-[#334155]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB TAB 1: HERO */}
      {activeSubTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider border-b border-[#1E293B] pb-3">
              Hero Section Copy
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Hero Main Headline</label>
                <textarea
                  rows={2}
                  value={settingsForm.landingHeroTitle || settingsForm.landingHeadline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, landingHeroTitle: e.target.value, landingHeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Hero Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={settingsForm.landingHeroSubtitle || settingsForm.landingSubheadline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, landingHeroSubtitle: e.target.value, landingSubheadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={settingsForm.landingHeroCtaText || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, landingHeroCtaText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 rounded-2xl bg-[#0A0F1D] border border-[#1E293B] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4">
                <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Student Viewport Replica</span>
                </h3>
                <span className="text-[10px] font-mono text-[#64748B]">Live Rendering</span>
              </div>

              <div className="p-6 rounded-xl bg-[#121A2F] border border-[#1E293B] space-y-3 text-center">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0A0F1D] text-[#E07A5F] text-[10px] font-mono font-bold border border-[#1E293B]">
                  DIGITAL SAT 2026 INTELLIGENCE
                </span>
                <h2 className="text-lg font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
                  {settingsForm.landingHeroTitle || 'The Ivy League Digital SAT Platform'}
                </h2>
                <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md mx-auto">
                  {settingsForm.landingHeroSubtitle || 'Master the 1550+ score threshold with authentic Bluebook MST engine.'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 rounded-lg bg-[#E07A5F] text-[#0A0F1D] text-xs font-mono font-bold shadow-xs">
                    {settingsForm.landingHeroCtaText || 'Unlock 1550+ Elite Workspace'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#64748B] text-center pt-2">
              Updates propagate immediately to all anonymous & prospective scholar sessions.
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: ANNOUNCEMENT */}
      {activeSubTab === 'announcement' && (
        <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4 max-w-3xl">
          <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Top Announcement Bar
              </h3>
              <p className="text-[11px] text-[#64748B]">Sticky header banner across all authenticated and landing routes.</p>
            </div>

            <button
              onClick={() => setSettingsForm({ ...settingsForm, announcementEnabled: !settingsForm.announcementEnabled, announcementActive: !settingsForm.announcementEnabled })}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold border transition-colors cursor-pointer ${
                settingsForm.announcementEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#0A0F1D] text-[#64748B] border-[#1E293B]'
              }`}
            >
              {settingsForm.announcementEnabled ? 'STATUS: ACTIVE' : 'STATUS: DISABLED'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">Announcement Copy</label>
              <input
                type="text"
                value={settingsForm.announcementText || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                placeholder="Yangi Bluebook 2026 mock testlari bazaga qo'shildi."
                className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-mono text-[#64748B] uppercase mb-1 block">Live Header Preview</label>
              <div className="p-3 rounded-lg bg-[#0B1B3D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] flex items-center justify-between">
                <span>{settingsForm.announcementText || 'No announcement message entered.'}</span>
                <span className="text-[10px] text-[#E07A5F]">Batafsil →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: FAQS */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider border-b border-[#1E293B] pb-3">
              Add New FAQ Item
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="FAQ Question (e.g., How does the Bluebook simulation engine work?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />

              <textarea
                rows={2}
                placeholder="FAQ Answer (Clear, concise explanation for prospective students...)"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />

              <button
                onClick={handleAddFaq}
                disabled={!newFaqQ.trim() || !newFaqA.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#E07A5F]" />
                <span>Add FAQ to Matrix</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {faqsList.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="p-4 rounded-xl bg-[#121A2F] border border-[#1E293B] flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#E07A5F]">#{idx + 1}</span>
                    <span>{faq.question}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed pl-4">{faq.answer}</p>
                </div>

                <button
                  onClick={() => handleRemoveFaq(faq.id)}
                  className="p-1.5 rounded-md text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: TESTIMONIALS */}
      {activeSubTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider border-b border-[#1E293B] pb-3">
              Add Verified Student Review
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Student Name"
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                className="px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />

              <input
                type="text"
                placeholder="Score (e.g. 1560)"
                value={newTestimonial.score}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, score: e.target.value })}
                className="px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />

              <input
                type="text"
                placeholder="Target School / University"
                value={newTestimonial.university}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, university: e.target.value })}
                className="px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />

              <div className="md:col-span-3">
                <textarea
                  rows={2}
                  placeholder="Review quote / strategy feedback..."
                  value={newTestimonial.quote}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <button
              onClick={handleAddTestimonial}
              disabled={!newTestimonial.name.trim() || !newTestimonial.quote.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonialsList.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[#121A2F] border border-[#1E293B] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1E293B]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#F8FAFC]">{t.name}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{t.university}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#0A0F1D] text-xs font-mono font-bold text-[#E07A5F] border border-[#1E293B]">
                      {t.score} SAT
                    </span>
                    <button
                      onClick={() => handleRemoveTestimonial(t.id)}
                      className="p-1 rounded text-[#64748B] hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
