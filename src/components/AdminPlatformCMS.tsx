import React, { useState, useEffect } from 'react';
import {
  Globe,
  Megaphone,
  BarChart3,
  Layout,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  Eye,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Calendar,
  Link as LinkIcon,
  Tag,
  X,
} from 'lucide-react';
import {
  PlatformContentItem,
  fetchPlatformContentMap,
  savePlatformContent,
  deletePlatformContent,
  DEFAULT_PLATFORM_CONTENT,
} from '../lib/adminApi';

interface AdminPlatformCMSProps {
  onRefreshGlobal?: () => void;
}

export const AdminPlatformCMS: React.FC<AdminPlatformCMSProps> = ({ onRefreshGlobal }) => {
  const [contentMap, setContentMap] = useState<Record<string, PlatformContentItem>>(
    DEFAULT_PLATFORM_CONTENT
  );
  const [activeTab, setActiveTab] = useState<
    'hero' | 'announcement' | 'stats' | 'dashboard' | 'custom'
  >('hero');
  const [loading, setLoading] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 1. Landing Hero Local Form
  const [heroForm, setHeroForm] = useState({
    title: '',
    subtitle: '',
    badgeText: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
  });

  // 2. Top Announcement Bar Local Form
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    subtitle: '',
    linkText: '',
    linkUrl: '',
    type: 'info',
    isActive: true,
  });

  // 3. Stats Bar Local Form
  const [statsList, setStatsList] = useState<
    Array<{ id: string; label: string; value: string }>
  >([]);
  const [statsActive, setStatsActive] = useState(true);

  // 4. Dashboard Announcements & Resources Local Form
  const [dashAnnouncements, setDashAnnouncements] = useState<
    Array<{ id: string; title: string; text: string; date: string; link: string; is_active: boolean }>
  >([]);
  const [dashResources, setDashResources] = useState<
    Array<{ id: string; title: string; description: string; tag: string; link: string; is_active: boolean }>
  >([]);

  // Announcement Modal State
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annInput, setAnnInput] = useState({
    title: '',
    text: '',
    date: new Date().toISOString().split('T')[0],
    link: 'mocks',
    is_active: true,
  });

  // Resource Modal State
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [resInput, setResInput] = useState({
    title: '',
    description: '',
    tag: 'LUG\'AT',
    link: 'vocab',
    is_active: true,
  });

  // 5. Custom Key Modal State
  const [customKeyModalOpen, setCustomKeyModalOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState({
    key: '',
    title: '',
    subtitle: '',
    contentJson: '{}',
    is_active: true,
  });

  // Initial Load from Supabase / Cache
  const loadContent = async () => {
    setLoading(true);
    try {
      const map = await fetchPlatformContentMap();
      setContentMap(map);

      // Populate Hero Form
      const hero = map.landing_hero || DEFAULT_PLATFORM_CONTENT.landing_hero;
      setHeroForm({
        title: hero.title || '',
        subtitle: hero.subtitle || '',
        badgeText: hero.content?.badgeText || 'ASRON SAT • 2026 Yangi Format',
        ctaText: hero.content?.ctaText || "Ro'yxatdan o'tish (Bepul)",
        ctaLink: hero.content?.ctaLink || '/auth',
        isActive: hero.is_active ?? true,
      });

      // Populate Announcement Form
      const ann = map.announcement_banner || DEFAULT_PLATFORM_CONTENT.announcement_banner;
      setAnnouncementForm({
        title: ann.title || '',
        subtitle: ann.subtitle || '',
        linkText: ann.content?.linkText || "Mock Testlarga o'tish",
        linkUrl: ann.content?.linkUrl || 'mocks',
        type: ann.content?.type || 'info',
        isActive: ann.is_active ?? true,
      });

      // Populate Stats
      const stats = map.stats_bar || DEFAULT_PLATFORM_CONTENT.stats_bar;
      if (Array.isArray(stats.content)) {
        setStatsList(stats.content);
      } else {
        setStatsList(DEFAULT_PLATFORM_CONTENT.stats_bar.content);
      }
      setStatsActive(stats.is_active ?? true);

      // Populate Dashboard announcements
      const dAnn = map.dashboard_announcements || DEFAULT_PLATFORM_CONTENT.dashboard_announcements;
      if (Array.isArray(dAnn.content)) {
        setDashAnnouncements(dAnn.content);
      } else {
        setDashAnnouncements(DEFAULT_PLATFORM_CONTENT.dashboard_announcements.content);
      }

      // Populate Recommended resources
      const dRes = map.recommended_resources || DEFAULT_PLATFORM_CONTENT.recommended_resources;
      if (Array.isArray(dRes.content)) {
        setDashResources(dRes.content);
      } else {
        setDashResources(DEFAULT_PLATFORM_CONTENT.recommended_resources.content);
      }
    } catch (err) {
      console.warn('Failed to load platform content in CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // --- SAVE HERO ---
  const handleSaveHero = async () => {
    setLoading(true);
    try {
      const updated = await savePlatformContent({
        key: 'landing_hero',
        title: heroForm.title,
        subtitle: heroForm.subtitle,
        content: {
          badgeText: heroForm.badgeText,
          ctaText: heroForm.ctaText,
          ctaLink: heroForm.ctaLink,
        },
        is_active: heroForm.isActive,
      });
      setContentMap((prev) => ({ ...prev, landing_hero: updated }));
      triggerToast("Landing Hero sarlavhalari Supabase-ga muvaffaqiyatli saqlandi!");
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE ANNOUNCEMENT ---
  const handleSaveAnnouncement = async () => {
    setLoading(true);
    try {
      const updated = await savePlatformContent({
        key: 'announcement_banner',
        title: announcementForm.title,
        subtitle: announcementForm.subtitle,
        content: {
          linkText: announcementForm.linkText,
          linkUrl: announcementForm.linkUrl,
          type: announcementForm.type,
        },
        is_active: announcementForm.isActive,
      });
      setContentMap((prev) => ({ ...prev, announcement_banner: updated }));
      triggerToast("Yuqori E'lonlar banneri saqlandi va barcha o'quvchilarga tarqatildi!");
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE STATS ---
  const handleSaveStats = async () => {
    setLoading(true);
    try {
      const updated = await savePlatformContent({
        key: 'stats_bar',
        title: "Platforma Ko'rsatkichlari",
        subtitle: 'Haqiqiy natijalar va statistika',
        content: statsList,
        is_active: statsActive,
      });
      setContentMap((prev) => ({ ...prev, stats_bar: updated }));
      triggerToast("Statistika ko'rsatkichlari Supabase-ga saqlandi!");
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE DASHBOARD ANNOUNCEMENTS ---
  const handleSaveDashAnnouncements = async (
    newList: Array<{ id: string; title: string; text: string; date: string; link: string; is_active: boolean }>
  ) => {
    setDashAnnouncements(newList);
    try {
      await savePlatformContent({
        key: 'dashboard_announcements',
        title: "Boshqaruv Paneli E'lonlari",
        subtitle: "O'quvchilar uchun muhim xabarlar",
        content: newList,
        is_active: true,
      });
      triggerToast("Dashboard e'lonlari yangilandi!");
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error(err);
    }
  };

  // --- SAVE DASHBOARD RESOURCES ---
  const handleSaveDashResources = async (
    newList: Array<{ id: string; title: string; description: string; tag: string; link: string; is_active: boolean }>
  ) => {
    setDashResources(newList);
    try {
      await savePlatformContent({
        key: 'recommended_resources',
        title: 'Tavsiya Etiladigan Resurslar',
        subtitle: 'SAT imtihoniga tayyorgarlik materiallari',
        content: newList,
        is_active: true,
      });
      triggerToast("Tavsiya etiladigan resurslar yangilandi!");
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error(err);
    }
  };

  // --- CUSTOM KEY SAVE ---
  const handleSaveCustomKey = async () => {
    if (!customKeyInput.key.trim()) return;
    let parsedContent = {};
    try {
      parsedContent = JSON.parse(customKeyInput.contentJson || '{}');
    } catch (e) {
      alert("JSON formatida xatolik bor!");
      return;
    }

    try {
      await savePlatformContent({
        key: customKeyInput.key.trim(),
        title: customKeyInput.title.trim(),
        subtitle: customKeyInput.subtitle.trim(),
        content: parsedContent,
        is_active: customKeyInput.is_active,
      });
      await loadContent();
      setCustomKeyModalOpen(false);
      setCustomKeyInput({
        key: '',
        title: '',
        subtitle: '',
        contentJson: '{}',
        is_active: true,
      });
      triggerToast(`Maxsus kontent '${customKeyInput.key}' saqlandi!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (confirm(`Haqiqatan ham '${key}' kalitini o'chirmoqchimisiz?`)) {
      await deletePlatformContent(key);
      await loadContent();
      triggerToast(`'${key}' o'chirildi.`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span className="font-semibold">{saveToast}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20">
            SUPABASE LIVE
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-mono uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Supabase PostgreSQL • Realtime Dynamic CMS</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Platforma CMS & Reklama Boshqaruvi
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-xl">
            Landing hero, e'lonlar banneri, statistika ko'rsatkichlari va dashboard bildirishnomalari bevosita Supabase-ga yoziladi va barcha tashrif buyuruvchilarga bir zumda aks etadi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadContent}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E07A5F]' : ''}`} />
            <span>Qayta yuklash</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] overflow-x-auto">
        {[
          { id: 'hero', label: '1. Landing Hero & Reklama', icon: <Layout className="w-4 h-4" /> },
          { id: 'announcement', label: '2. Yuqori E\'lonlar Banneri', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'stats', label: `3. Statistika Ko'rsatkichlari (${statsList.length})`, icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'dashboard', label: `4. Dashboard E'lonlari & Resurslar`, icon: <Bell className="w-4 h-4" /> },
          { id: 'custom', label: '5. Maxsus Dinamik Kontent', icon: <Layers className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LANDING HERO */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                Hero Bo'limi Tahriri
              </h3>
              <button
                onClick={() => setHeroForm({ ...heroForm, isActive: !heroForm.isActive })}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  heroForm.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-[#0A0F1D] text-slate-500 border-slate-300 dark:border-slate-800'
                }`}
              >
                {heroForm.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                <span>{heroForm.isActive ? 'HOLAT: FAOL' : 'HOLAT: O\'CHIRILGAN'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                  Asosiy Sarlavha (Headline)
                </label>
                <textarea
                  rows={2}
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  placeholder="Score 1500+ on the Digital SAT with Adaptive Mastery"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                  Kichik Matn / Tavsif (Subheadline)
                </label>
                <textarea
                  rows={3}
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  placeholder="SAT imtihoniga professional, tizimli va xolis tayyorgarlik platformasi."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                    Badge Matni
                  </label>
                  <input
                    type="text"
                    value={heroForm.badgeText}
                    onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
                    placeholder="ASRON SAT • 2026 Yangi Format"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                    Asosiy CTA Tugmasi Matni
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaText}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                    placeholder="Ro'yxatdan o'tish (Bepul)"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveHero}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>SUPABASE-GA SAQLASH (LANDING HERO)</span>
            </button>
          </div>

          {/* Live Student Viewport Replica */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 mb-4">
                <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Jonli O'quvchi Ko'rinishi (Live Preview)</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  {heroForm.isActive ? 'FAOL' : 'YASHIRILGAN'}
                </span>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-4 shadow-sm">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#0A0F1D] text-[#0B1B3D] dark:text-[#FAF8F5] text-xs font-bold border border-[#E5E0D8] dark:border-[#1E293B]">
                  {heroForm.badgeText || 'ASRON SAT • 2026 Yangi Format'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1B3D] dark:text-[#EAEBED] tracking-tight leading-tight">
                  {heroForm.title || 'Score 1500+ on the Digital SAT with Adaptive Mastery'}
                </h2>
                <p className="text-xs text-[#57534E] dark:text-[#94A3B8] leading-relaxed max-w-md mx-auto">
                  {heroForm.subtitle || 'SAT imtihoniga professional, tizimli va xolis tayyorgarlik platformasi.'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-5 py-2.5 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold shadow-md">
                    {heroForm.ctaText || "Ro'yxatdan o'tish (Bepul)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] text-center pt-2">
              Ushbu o'zgarishlar barcha tashrif buyuruvchilar va ro'yxatdan o'tmagan foydalanuvchilarga darhol ko'rinadi.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOP ANNOUNCEMENT BAR */}
      {/* ========================================================================= */}
      {activeTab === 'announcement' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-5 shadow-xs">
            <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                  Yuqori E'lonlar Banneri (Sticky Top Announcement)
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Saytning eng yuqori qismida barcha sahifalarda chiquvchi rasmiy bildirishnoma satri.
                </p>
              </div>

              <button
                onClick={() =>
                  setAnnouncementForm({
                    ...announcementForm,
                    isActive: !announcementForm.isActive,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  announcementForm.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-[#0A0F1D] text-slate-500 border-slate-300 dark:border-slate-800'
                }`}
              >
                {announcementForm.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{announcementForm.isActive ? 'STATUS: FAOL (EKRANDA)' : 'STATUS: O\'CHIRILGAN'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                  E'lon Matni / Sarlavhasi
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="Shanba kuni soat 20:00 da bepul Katta Mock Test bo'lib o'tadi!"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                  Qo'shimcha Izoh / Kichik Matn
                </label>
                <input
                  type="text"
                  value={announcementForm.subtitle}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, subtitle: e.target.value })}
                  placeholder="Sinovdan o'tish mutlaqo bepul va hamma uchun ochiq."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                    Tugma / Havola Matni
                  </label>
                  <input
                    type="text"
                    value={announcementForm.linkText}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, linkText: e.target.value })}
                    placeholder="Mock Testlarga o'tish"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                    Havola Manzili (Tab / URL)
                  </label>
                  <select
                    value={announcementForm.linkUrl}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  >
                    <option value="mocks">Mock Testlar (/mocks)</option>
                    <option value="qbank">Savollar Banki (/qbank)</option>
                    <option value="vocab">SAT Lug'at (/vocabulary)</option>
                    <option value="arena">Multiplayer Arena (/arena)</option>
                    <option value="community">Hamjamiyat (/community)</option>
                    <option value="landing">Bosh Sahifa (/)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview of the Sticky Banner */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Jonli Banner Namunasi (Header Tepasida Ko'rinishi):</span>
                </label>
                {announcementForm.isActive ? (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-white/10 shadow-sm">
                    <div className="flex items-center gap-2.5 truncate">
                      <Megaphone className="w-4 h-4 text-[#E07A5F] shrink-0 animate-bounce" />
                      <div className="truncate">
                        <span className="font-bold">{announcementForm.title || "E'lon sarlavhasi kiritilmagan"}</span>
                        {announcementForm.subtitle && (
                          <span className="text-slate-300 ml-2 hidden md:inline">
                            — {announcementForm.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {announcementForm.linkText && (
                      <span className="px-3 py-1 rounded-lg bg-[#E07A5F] text-[#0A0F1D] text-[11px] font-mono font-bold shrink-0 self-start sm:self-auto">
                        {announcementForm.linkText} →
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs font-mono text-slate-400">
                    Banner holati o'chirilgan (talabalar ekranida ko'rsatilmaydi).
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveAnnouncement}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>SUPABASE-GA SAQLASH (TOP BANNER)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STATS BAR */}
      {/* ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 shadow-xs">
            <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                  Landing Sahifasi Statistika Ko'rsatkichlari (Stats Bar)
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Talabalar soni, o'sish ballari va rasmiy format ko'rsatkichlarini tahrirlash.
                </p>
              </div>

              <button
                onClick={() => setStatsActive(!statsActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statsActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-[#0A0F1D] text-slate-500 border-slate-300 dark:border-slate-800'
                }`}
              >
                {statsActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{statsActive ? 'STATISTIKA: FAOL' : 'STATISTIKA: YASHIRILGAN'}</span>
              </button>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statsList.map((stat, idx) => (
                <div
                  key={stat.id || idx}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">
                      Ko'rsatkich #{idx + 1}
                    </span>
                    {statsList.length > 2 && (
                      <button
                        onClick={() => setStatsList(statsList.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">Qiymat (Katta matn):</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const updated = [...statsList];
                        updated[idx].value = e.target.value;
                        setStatsList(updated);
                      }}
                      placeholder="45,000+"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-sm font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">Izoh / Tavsif:</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const updated = [...statsList];
                        updated[idx].label = e.target.value;
                        setStatsList(updated);
                      }}
                      placeholder="Faol SAT Talabalari"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  setStatsList([
                    ...statsList,
                    { id: `stat-${Date.now()}`, label: 'Yangi Ko\'rsatkich', value: '100%' },
                  ])
                }
                className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E2E8F0] dark:border-[#1E293B]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi Ko'rsatkich Qo'shish</span>
              </button>

              <button
                onClick={handleSaveStats}
                disabled={loading}
                className="py-2 px-5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>SUPABASE-GA SAQLASH (STATISTIKA)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DASHBOARD ANNOUNCEMENTS & RESOURCES */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Section A: Dashboard Notices */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#E07A5F]" />
                  <span>Dashboard Rasmiy Bildirishnomalari ({dashAnnouncements.length})</span>
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Talabaning shaxsiy kabinetida (Dashboard) chiqadigan muhim xabarlar va sinov e'lonlari.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAnnId(null);
                  setAnnInput({
                    title: '',
                    text: '',
                    date: new Date().toISOString().split('T')[0],
                    link: 'mocks',
                    is_active: true,
                  });
                  setIsAnnModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi E'lon Kiritish</span>
              </button>
            </div>

            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 relative flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#E07A5F]" />
                        <span>{item.date}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          item.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.is_active ? 'Faol' : 'O\'chirilgan'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] mt-2 text-xs">
                    <span className="font-mono text-[11px] text-[#E07A5F] flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      <span>/{item.link}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAnnId(item.id);
                          setAnnInput({
                            title: item.title,
                            text: item.text,
                            date: item.date,
                            link: item.link,
                            is_active: item.is_active,
                          });
                          setIsAnnModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Ushbu e'lonni o'chirmoqchimisiz?")) {
                            handleSaveDashAnnouncements(
                              dashAnnouncements.filter((a) => a.id !== item.id)
                            );
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Recommended Resources */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Tavsiya Etiladigan Resurslar & Havolalar ({dashResources.length})</span>
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  O'quvchilarga tezkor o'rganish uchun tavsiya qilinadigan qo'llanma va materiallar.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingResId(null);
                  setResInput({
                    title: '',
                    description: '',
                    tag: 'LUG\'AT',
                    link: 'vocab',
                    is_active: true,
                  });
                  setIsResModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi Resurs Qo'shish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashResources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30">
                        {res.tag}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          res.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {res.is_active ? 'Faol' : 'O\'chirilgan'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                      {res.title}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] mt-2 text-xs">
                    <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      /{res.link}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingResId(res.id);
                          setResInput({
                            title: res.title,
                            description: res.description,
                            tag: res.tag,
                            link: res.link,
                            is_active: res.is_active,
                          });
                          setIsResModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Ushbu resursni o'chirmoqchimisiz?")) {
                            handleSaveDashResources(
                              dashResources.filter((r) => r.id !== res.id)
                            );
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CUSTOM CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#E07A5F]" />
                  <span>Barcha Supabase `platform_content` Yozuvlari ({Object.keys(contentMap).length})</span>
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  PostgreSQL jadvalida saqlangan barcha dinamik kontent qatorlari.
                </p>
              </div>

              <button
                onClick={() => setCustomKeyModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi Kalit (Key) Kiritish</span>
              </button>
            </div>

            <div className="space-y-3">
              {Object.values(contentMap).map((item) => (
                <div
                  key={item.key}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E07A5F]">
                        key: "{item.key}"
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          item.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.is_active ? 'Faol' : 'O\'chirilgan'}
                      </span>
                    </div>
                    {item.title && (
                      <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {item.title}
                      </div>
                    )}
                    {item.subtitle && (
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setCustomKeyInput({
                          key: item.key,
                          title: item.title || '',
                          subtitle: item.subtitle || '',
                          contentJson: JSON.stringify(item.content || {}, null, 2),
                          is_active: item.is_active ?? true,
                        });
                        setCustomKeyModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E07A5F] cursor-pointer"
                    >
                      Tahrirlash
                    </button>

                    <button
                      onClick={() => handleDeleteKey(item.key)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DASHBOARD ANNOUNCEMENT ADD / EDIT */}
      {/* ========================================================================= */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                {editingAnnId ? "E'lonni Tahrirlash" : "Yangi Dashboard E'loni"}
              </h3>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Sarlavha
                </label>
                <input
                  type="text"
                  value={annInput.title}
                  onChange={(e) => setAnnInput({ ...annInput, title: e.target.value })}
                  placeholder="Shanba kuni soat 20:00 da bepul Katta Mock Test"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Batafsil Matn
                </label>
                <textarea
                  rows={3}
                  value={annInput.text}
                  onChange={(e) => setAnnInput({ ...annInput, text: e.target.value })}
                  placeholder="Test haqida ma'lumot va ishtirok etish shartlari..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                    Sana
                  </label>
                  <input
                    type="date"
                    value={annInput.date}
                    onChange={(e) => setAnnInput({ ...annInput, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                    Havola / Tab
                  </label>
                  <select
                    value={annInput.link}
                    onChange={(e) => setAnnInput({ ...annInput, link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="mocks">Mock Testlar</option>
                    <option value="qbank">Savollar Banki</option>
                    <option value="vocab">SAT Lug'at</option>
                    <option value="arena">Multiplayer Arena</option>
                    <option value="community">Hamjamiyat</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ann-active-check"
                  checked={annInput.is_active}
                  onChange={(e) => setAnnInput({ ...annInput, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-[#E07A5F] focus:ring-[#E07A5F]"
                />
                <label htmlFor="ann-active-check" className="text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer">
                  Ushbu e'lon darhol talabalar ekranida faol bo'lsin
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] text-xs font-mono text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                onClick={() => {
                  if (!annInput.title.trim()) return;
                  if (editingAnnId) {
                    const updated = dashAnnouncements.map((a) =>
                      a.id === editingAnnId ? { ...a, ...annInput } : a
                    );
                    handleSaveDashAnnouncements(updated);
                  } else {
                    const newItem = {
                      id: `ann-${Date.now()}`,
                      ...annInput,
                    };
                    handleSaveDashAnnouncements([newItem, ...dashAnnouncements]);
                  }
                  setIsAnnModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold cursor-pointer shadow-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DASHBOARD RESOURCE ADD / EDIT */}
      {/* ========================================================================= */}
      {isResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                {editingResId ? "Resursni Tahrirlash" : "Yangi Resurs Qo'shish"}
              </h3>
              <button
                onClick={() => setIsResModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Resurs Nomi
                </label>
                <input
                  type="text"
                  value={resInput.title}
                  onChange={(e) => setResInput({ ...resInput, title: e.target.value })}
                  placeholder="Erica Meltzer SAT Vocabulary PDF"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Qisqacha Tavsif
                </label>
                <textarea
                  rows={2}
                  value={resInput.description}
                  onChange={(e) => setResInput({ ...resInput, description: e.target.value })}
                  placeholder="250 ta eng ko'p uchraydigan akademik so'zlar..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                    Teg / Bo'lim (Tag)
                  </label>
                  <input
                    type="text"
                    value={resInput.tag}
                    onChange={(e) => setResInput({ ...resInput, tag: e.target.value })}
                    placeholder="LUG'AT"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                    Havola / Tab
                  </label>
                  <select
                    value={resInput.link}
                    onChange={(e) => setResInput({ ...resInput, link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="vocab">SAT Lug'at</option>
                    <option value="mocks">Mock Testlar</option>
                    <option value="qbank">Savollar Banki</option>
                    <option value="arena">Multiplayer Arena</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="res-active-check"
                  checked={resInput.is_active}
                  onChange={(e) => setResInput({ ...resInput, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-[#E07A5F] focus:ring-[#E07A5F]"
                />
                <label htmlFor="res-active-check" className="text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer">
                  Faol resurs sifatida ko'rsatilsin
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <button
                onClick={() => setIsResModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] text-xs font-mono text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                onClick={() => {
                  if (!resInput.title.trim()) return;
                  if (editingResId) {
                    const updated = dashResources.map((r) =>
                      r.id === editingResId ? { ...r, ...resInput } : r
                    );
                    handleSaveDashResources(updated);
                  } else {
                    const newItem = {
                      id: `rec-${Date.now()}`,
                      ...resInput,
                    };
                    handleSaveDashResources([newItem, ...dashResources]);
                  }
                  setIsResModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold cursor-pointer shadow-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOM CONTENT KEY */}
      {/* ========================================================================= */}
      {customKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                Maxsus Dinamik Kontent Yozuvi
              </h3>
              <button
                onClick={() => setCustomKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Kalit Nomi (key - e.g. banner_popup, promo_card)
                </label>
                <input
                  type="text"
                  value={customKeyInput.key}
                  onChange={(e) => setCustomKeyInput({ ...customKeyInput, key: e.target.value })}
                  placeholder="custom_announcement"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Sarlavha (title)
                </label>
                <input
                  type="text"
                  value={customKeyInput.title}
                  onChange={(e) => setCustomKeyInput({ ...customKeyInput, title: e.target.value })}
                  placeholder="Yangi mavsum ochildi"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Kichik Matn (subtitle)
                </label>
                <input
                  type="text"
                  value={customKeyInput.subtitle}
                  onChange={(e) => setCustomKeyInput({ ...customKeyInput, subtitle: e.target.value })}
                  placeholder="Batafsil ma'lumot..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">
                  JSON Kontent (content JSONB)
                </label>
                <textarea
                  rows={4}
                  value={customKeyInput.contentJson}
                  onChange={(e) => setCustomKeyInput({ ...customKeyInput, contentJson: e.target.value })}
                  placeholder="{}"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="custom-active-check"
                  checked={customKeyInput.is_active}
                  onChange={(e) => setCustomKeyInput({ ...customKeyInput, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-[#E07A5F] focus:ring-[#E07A5F]"
                />
                <label htmlFor="custom-active-check" className="text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer">
                  Faol holatda saqlash (is_active: true)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <button
                onClick={() => setCustomKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0A0F1D] text-xs font-mono text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                Bekor qilish
              </button>

              <button
                onClick={handleSaveCustomKey}
                className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold cursor-pointer shadow-xs"
              >
                Supabase-ga saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
