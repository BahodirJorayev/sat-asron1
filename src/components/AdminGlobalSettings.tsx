import React, { useState, useEffect } from 'react';
import { 
  Settings, ShieldAlert, Upload, 
  Send, Save, RotateCcw, 
  Check, Radio, AlertTriangle, Image as ImageIcon,
  Plus, Trash2, Eye, ExternalLink, Sliders, ToggleLeft, ToggleRight,
  HelpCircle, MessageSquare, Flame, CheckCircle, ArrowUpDown, ChevronDown, ChevronUp,
  Lock, KeyRound, ShieldCheck
} from 'lucide-react';
import { GlobalPlatformSettings, UserTestimonial } from '../types';
import { uploadBrandAsset, saveGlobalPlatformSettings, DEFAULT_GLOBAL_SETTINGS } from '../lib/adminApi';
import { AsronLogo } from './AsronLogo';
import { AdminCredentials } from '../data/blogAndBrandingData';

interface AdminGlobalSettingsProps {
  globalSettings: GlobalPlatformSettings;
  onSaveSettings: (settings: GlobalPlatformSettings) => void;
  testimonials?: UserTestimonial[];
  onSaveTestimonials?: (testimonials: UserTestimonial[]) => void;
  adminCredentials?: AdminCredentials;
  onUpdateAdminCredentials?: (updated: AdminCredentials) => void;
}

export const AdminGlobalSettings: React.FC<AdminGlobalSettingsProps> = ({
  globalSettings,
  onSaveSettings,
  testimonials = [],
  onSaveTestimonials,
  adminCredentials,
  onUpdateAdminCredentials,
}) => {
  const [form, setForm] = useState<GlobalPlatformSettings>(globalSettings || DEFAULT_GLOBAL_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<'brand' | 'landing' | 'faqs' | 'testimonials' | 'killswitches' | 'security'>('brand');

  // Admin Credentials State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminLogin, setNewAdminLogin] = useState(adminCredentials?.adminUser || 'Bahodir');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [credMessage, setCredMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (adminCredentials?.adminUser) {
      setNewAdminLogin(adminCredentials.adminUser);
    }
  }, [adminCredentials]);

  // FAQ CRUD State
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqCat, setNewFaqCat] = useState('General');
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  // Testimonial CRUD State
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialScore, setNewTestimonialScore] = useState('1550');
  const [newTestimonialSchool, setNewTestimonialSchool] = useState('MIT Early Action');
  const [newTestimonialQuote, setNewTestimonialQuote] = useState('');
  const [newTestimonialAvatar, setNewTestimonialAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  useEffect(() => {
    if (globalSettings) {
      setForm(globalSettings);
    }
  }, [globalSettings]);

  const handleSave = async () => {
    setSaveStatus('SAVING');
    try {
      const updated = await saveGlobalPlatformSettings(form);
      onSaveSettings(updated);
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2800);
    } catch (e) {
      console.error('Error saving global settings:', e);
      setSaveStatus('ERROR');
      setTimeout(() => setSaveStatus('IDLE'), 3500);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { url } = await uploadBrandAsset(file);
      if (url) {
        setForm((prev) => ({ ...prev, logoUrl: url }));
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // FAQ Helpers
  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const nextFaqs = [
      ...(form.faqs || []),
      { q: newFaqQ.trim(), a: newFaqA.trim(), category: newFaqCat }
    ];
    setForm({ ...form, faqs: nextFaqs });
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleDeleteFaq = (index: number) => {
    const next = (form.faqs || []).filter((_, i) => i !== index);
    setForm({ ...form, faqs: next });
  };

  const handleMoveFaq = (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...(form.faqs || [])];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setForm({ ...form, faqs: list });
  };

  // Testimonial Helpers
  const handleAddTestimonial = () => {
    if (!newTestimonialName.trim() || !newTestimonialQuote.trim()) return;
    const newT = {
      id: `t-${Date.now()}`,
      name: newTestimonialName.trim(),
      targetSchoolOrMajor: newTestimonialSchool.trim() || 'Ivy League Scholar',
      score: newTestimonialScore.trim() || '1540',
      quote: newTestimonialQuote.trim(),
      stars: 5,
      avatar: newTestimonialAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      date: 'Just now',
      verifiedStudent: true
    };
    const nextList = [newT, ...(form.testimonials || [])];
    setForm({ ...form, testimonials: nextList });
    setNewTestimonialName('');
    setNewTestimonialQuote('');
  };

  const handleDeleteTestimonial = (id: string) => {
    const next = (form.testimonials || []).filter(t => t.id !== id);
    setForm({ ...form, testimonials: next });
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    const activePass = adminCredentials?.adminPass || 'Bahodir2008';
    if (currentPassword.trim() !== activePass.trim()) {
      setCredMessage({ text: 'Joriy parol noto‘g‘ri kiritildi.', type: 'error' });
      return;
    }
    if (!newAdminLogin.trim()) {
      setCredMessage({ text: 'Login bo‘sh bo‘lishi mumkin emas.', type: 'error' });
      return;
    }
    if (!newAdminPass.trim()) {
      setCredMessage({ text: 'Yangi parol kiritilmadi.', type: 'error' });
      return;
    }
    if (newAdminPass.length < 6) {
      setCredMessage({ text: 'Yangi parol kamida 6 belgidan iborat bo‘lishi kerak.', type: 'error' });
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setCredMessage({ text: 'Yangi parollar mos kelmadi.', type: 'error' });
      return;
    }

    if (onUpdateAdminCredentials) {
      onUpdateAdminCredentials({
        adminUser: newAdminLogin.trim(),
        adminPass: newAdminPass.trim(),
      });
      setCredMessage({ text: 'Admin ma‘lumotlari muvaffaqiyatli yangilandi!', type: 'success' });
      setCurrentPassword('');
      setNewAdminPass('');
      setConfirmAdminPass('');
    }
  };

  return (
    <div id="admin-global-settings" className="space-y-6 font-sans">
      {/* Toast Notification */}
      {saveStatus === 'SAVED' && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>GLOBAL SETTINGS PERSISTED & BROADCASTED TO LIVE REPLICAS</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">HTTP 200 OK</span>
        </div>
      )}

      {saveStatus === 'ERROR' && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 stroke-[2.5]" />
          <span>Error saving to central database. Saved to local state as fallback.</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#0A0F1D] text-[#94A3B8] border border-[#1E293B] text-[11px] font-mono uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Platform Governance CMS</span>
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
            Global Branding & Landing CMS
          </h2>
          <p className="text-xs text-[#64748B] max-w-2xl">
            Directly configure platform identity, vector logo, top announcement bar, FAQ matrix, verified testimonials, and emergency kill-switches.
          </p>
        </div>

        <button
          id="btn-save-global-settings"
          onClick={handleSave}
          disabled={saveStatus === 'SAVING'}
          className="px-4 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4 stroke-[2]" />
          <span>{saveStatus === 'SAVING' ? 'PERSISTING...' : 'SAVE ALL CHANGES'}</span>
        </button>
      </div>

      {/* Tab Navigation Pill Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#121A2F] border border-[#1E293B]">
        {[
          { id: 'brand', label: '1. Brand Identity & Header' },
          { id: 'landing', label: '2. Landing Copy & Announcement' },
          { id: 'faqs', label: `3. FAQ Matrix (${form.faqs?.length || 0})` },
          { id: 'testimonials', label: `4. Testimonials (${form.testimonials?.length || 0})` },
          { id: 'killswitches', label: '5. Emergency Kill-Switches' },
          { id: 'security', label: '6. Xavfsizlik & Parollar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubSection(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeSubSection === tab.id
                ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-[#334155]'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-SECTION 1: BRAND IDENTITY & HEADER */}
      {activeSubSection === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Platform Identity
              </h3>
              <p className="text-[11px] text-[#64748B]">Core name and header labels displayed across the ecosystem.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Platform Title</label>
                <input
                  type="text"
                  value={form.platformName}
                  onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  placeholder="ASRON SAT"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={form.platformTagline || ''}
                  onChange={(e) => setForm({ ...form, platformTagline: e.target.value })}
                  placeholder="Master the Digital SAT with Executive Precision"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Admin Telegram Handler</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B]">@</span>
                  <input
                    type="text"
                    value={(form.adminTelegram || form.contactTelegram || 'rcmnx').replace('@', '')}
                    onChange={(e) => {
                      const val = `@${e.target.value.replace('@', '')}`;
                      setForm({ ...form, adminTelegram: val, contactTelegram: val });
                    }}
                    placeholder="rcmnx"
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Asset Management */}
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Logo Asset (Supabase Storage: brand-assets)
              </h3>
              <p className="text-[11px] text-[#64748B]">Upload direct vector SVG/PNG or specify external URL.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0A0F1D] border border-[#1E293B]">
                <div className="w-16 h-16 rounded-lg bg-[#121A2F] border border-[#1E293B] flex items-center justify-center p-2 shrink-0">
                  {form.logoUrl && form.logoUrl !== '/brand/logo.svg' ? (
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <AsronLogo size={40} showText={false} />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-[#F8FAFC] truncate">
                    {form.platformName || 'ASRON SAT'}
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] truncate">
                    Live Navbar & Header Preview
                  </div>
                  <label
                    htmlFor="logo-file-upload"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E293B] hover:bg-[#334155] text-[11px] font-mono text-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3 text-[#E07A5F]" />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Upload Vector/PNG'}</span>
                  </label>
                  <input
                    id="logo-file-upload"
                    type="file"
                    accept="image/*,.svg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Direct Logo URL</label>
                <input
                  type="text"
                  value={form.logoUrl || ''}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://.../brand-logo.svg"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: LANDING COPY & ANNOUNCEMENT */}
      {activeSubSection === 'landing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Hero Headlines & Copy
              </h3>
              <p className="text-[11px] text-[#64748B]">Primary headline and value proposition displayed on `/`.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Main Hero Headline</label>
                <textarea
                  rows={2}
                  value={form.landingHeadline || form.landingHeroTitle || ''}
                  onChange={(e) => setForm({ ...form, landingHeadline: e.target.value, landingHeroTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Subtitle / Value Prop</label>
                <textarea
                  rows={3}
                  value={form.landingSubheadline || form.landingHeroSubtitle || ''}
                  onChange={(e) => setForm({ ...form, landingSubheadline: e.target.value, landingHeroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Daily Free Question Limit (Non-PRO)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.freeDailyLimit || 5}
                  onChange={(e) => setForm({ ...form, freeDailyLimit: Number(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>
          </div>

          {/* Announcement Bar & Live Preview */}
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Global Top Announcement Bar
                </h3>
                <p className="text-[11px] text-[#64748B]">Top-of-screen announcement banner across all routes.</p>
              </div>

              <button
                type="button"
                onClick={() => setForm({ ...form, announcementEnabled: !form.announcementEnabled, announcementActive: !form.announcementEnabled })}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                  form.announcementEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#0A0F1D] text-[#64748B] border-[#1E293B]'
                }`}
              >
                {form.announcementEnabled ? 'STATUS: ACTIVE (ON)' : 'STATUS: DISABLED (OFF)'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Announcement Text</label>
                <input
                  type="text"
                  value={form.announcementText || ''}
                  onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                  placeholder="Yangi Bluebook 2026 mock testlari bazaga qo'shildi."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-mono text-[#64748B] uppercase">Live Banner Preview</label>
                {form.announcementEnabled ? (
                  <div className="p-3 rounded-lg bg-[#0B1B3D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] flex items-center justify-between">
                    <span className="truncate">{form.announcementText || 'No announcement text entered'}</span>
                    <span className="text-[10px] text-[#E07A5F] ml-2 shrink-0">Batafsil →</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#64748B] text-center">
                    Announcement bar is currently toggled OFF.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: FAQ MATRIX CRUD */}
      {activeSubSection === 'faqs' && (
        <div className="space-y-6">
          {/* Add New FAQ Card */}
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Add New FAQ Entry
              </h3>
              <p className="text-[11px] text-[#64748B]">Expandable accordion items shown on landing and help desk.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Question</label>
                <input
                  type="text"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  placeholder="e.g. Bluebook testlari qanday tuzilgan?"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Category</label>
                <select
                  value={newFaqCat}
                  onChange={(e) => setNewFaqCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden"
                >
                  <option value="General">General</option>
                  <option value="Billing">Billing & Plans</option>
                  <option value="Bluebook">Bluebook MST</option>
                  <option value="AI Tutor">Socratic AI Tutor</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Detailed Answer</label>
                <textarea
                  rows={2}
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  placeholder="Enter clear, concise explanation..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <button
              onClick={handleAddFaq}
              disabled={!newFaqQ.trim() || !newFaqA.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Append FAQ to Matrix</span>
            </button>
          </div>

          {/* Existing FAQ List */}
          <div className="space-y-3">
            {(form.faqs || []).map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#121A2F] border border-[#1E293B] space-y-2 hover:border-[#334155] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#E07A5F] font-bold">#{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#0A0F1D] text-[10px] font-mono text-[#64748B] border border-[#1E293B]">
                        {faq.category || 'General'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#F8FAFC]">{faq.q}</div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{faq.a}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveFaq(idx, 'UP')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-md text-[#64748B] hover:text-[#F8FAFC] disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveFaq(idx, 'DOWN')}
                      disabled={idx === (form.faqs?.length || 0) - 1}
                      className="p-1.5 rounded-md text-[#64748B] hover:text-[#F8FAFC] disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1.5 rounded-md text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: TESTIMONIALS CRUD */}
      {activeSubSection === 'testimonials' && (
        <div className="space-y-6">
          {/* Add Testimonial Card */}
          <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                Add Verified Student Testimonial
              </h3>
              <p className="text-[11px] text-[#64748B]">Real student scores and authentic quote cards on landing page.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Student Name</label>
                <input
                  type="text"
                  value={newTestimonialName}
                  onChange={(e) => setNewTestimonialName(e.target.value)}
                  placeholder="e.g. Jasurbek O."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">SAT Score (400-1600)</label>
                <input
                  type="text"
                  value={newTestimonialScore}
                  onChange={(e) => setNewTestimonialScore(e.target.value)}
                  placeholder="1560"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Target School / University</label>
                <input
                  type="text"
                  value={newTestimonialSchool}
                  onChange={(e) => setNewTestimonialSchool(e.target.value)}
                  placeholder="MIT Computer Science"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] uppercase">Review Quote</label>
                <textarea
                  rows={2}
                  value={newTestimonialQuote}
                  onChange={(e) => setNewTestimonialQuote(e.target.value)}
                  placeholder="How ASRON SAT helped them achieve their target score..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <button
              onClick={handleAddTestimonial}
              disabled={!newTestimonialName.trim() || !newTestimonialQuote.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Add Verified Testimonial</span>
            </button>
          </div>

          {/* Testimonial List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(form.testimonials || []).map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[#121A2F] border border-[#1E293B] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={t.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#1E293B]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#F8FAFC]">{t.name}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{t.targetSchoolOrMajor}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#0A0F1D] text-xs font-mono font-bold text-[#E07A5F] border border-[#1E293B]">
                      {t.score} SAT
                    </span>
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-1 rounded text-[#64748B] hover:text-rose-400 cursor-pointer"
                      title="Delete Testimonial"
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

      {/* SUB-SECTION 5: EMERGENCY FEATURE KILL-SWITCHES */}
      {activeSubSection === 'killswitches' && (
        <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] space-y-6">
          <div className="border-b border-[#1E293B] pb-3">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Operational Kill-Switches & Infrastructure Controls</span>
            </h3>
            <p className="text-[11px] text-[#64748B]">Instantly enable or disable real-time platform subsystems without redeploying code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arena Matchmaking Kill-switch */}
            <div className="p-4 rounded-xl bg-[#0A0F1D] border border-[#1E293B] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">Multiplayer Arena Matchmaking</div>
                <div className="text-[11px] text-[#64748B]">Real-time 1v1 duels & survival arena</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, arenaEnabled: !form.arenaEnabled })}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  form.arenaEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {form.arenaEnabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </button>
            </div>

            {/* Live Stream Broadcast Kill-switch */}
            <div className="p-4 rounded-xl bg-[#0A0F1D] border border-[#1E293B] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">Live Stream Broadcast Studio</div>
                <div className="text-[11px] text-[#64748B]">Staff live whiteboard & video broadcasting</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, liveStreamEnabled: !form.liveStreamEnabled })}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  form.liveStreamEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {form.liveStreamEnabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </button>
            </div>

            {/* Voice Notes in Chat Kill-switch */}
            <div className="p-4 rounded-xl bg-[#0A0F1D] border border-[#1E293B] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">Voice Notes & Audio in Chat</div>
                <div className="text-[11px] text-[#64748B]">Audio recording in community channels</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, voiceNotesEnabled: !(form.voiceNotesEnabled ?? true) })}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  form.voiceNotesEnabled ?? true
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {form.voiceNotesEnabled ?? true ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </button>
            </div>

            {/* Full Maintenance Mode */}
            <div className="p-4 rounded-xl bg-[#0A0F1D] border border-rose-900/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Full Maintenance Mode</span>
                </div>
                <div className="text-[11px] text-[#64748B]">Locks out non-admin students during updates</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isMaintenance: !form.isMaintenance })}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  form.isMaintenance
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-[#121A2F] text-[#64748B] border-[#1E293B]'
                }`}
              >
                {form.isMaintenance ? 'MAINTENANCE ACTIVE' : 'NORMAL MODE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 6: XAVFSIZLIK & PAROLLAR */}
      {activeSubSection === 'security' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-xs space-y-6">
          <div className="border-b border-[#1E293B] pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#0A0F1D] text-[#E07A5F] border border-[#1E293B] text-[11px] font-mono uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Super Admin Xavfsizlik Sozlamalari</span>
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Admin Login va Parolini Yangilash
            </h3>
            <p className="text-xs text-[#64748B]">
              Xavfsizlik yuzasidan yangi ma‘lumotlarni kiritishdan oldin joriy parolingizni tasdiqlashingiz shart.
            </p>
          </div>

          {credMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 border ${
                credMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {credMessage.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-[2]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 stroke-[2]" />
              )}
              <span>{credMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#94A3B8] uppercase flex items-center justify-between">
                <span>Joriy Parol (Talab qilinadi)</span>
                <span className="text-[10px] text-rose-400 font-sans">*Majburiy</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#475569] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#94A3B8] uppercase">
                  Yangi Admin Logini
                </label>
                <input
                  type="text"
                  value={newAdminLogin}
                  onChange={(e) => setNewAdminLogin(e.target.value)}
                  placeholder="Bahodir"
                  autoComplete="off"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#475569] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">
                    Yangi Parol
                  </label>
                  <input
                    type="password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="off"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#475569] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">
                    Yangi Parolni Tasdiqlang
                  </label>
                  <input
                    type="password"
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="off"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#475569] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <KeyRound className="w-4 h-4 stroke-[2.5]" />
                <span>PAROL VA LOGINNI YANGILASH</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
