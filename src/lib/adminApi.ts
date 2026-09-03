import { supabase } from './supabase';
import { GlobalPlatformSettings, User, PlanTier, Question } from '../types';

export const DEFAULT_GLOBAL_SETTINGS: GlobalPlatformSettings = {
  id: 'global_config',
  platformName: 'ASRON SAT',
  platformSubtitle: 'Digital SAT Intelligence & Scoring Engine',
  platformTagline: 'Master the Digital SAT with Executive Precision',
  logoUrl: '/brand/logo.svg',
  adminTelegram: '@rcmnx',
  contactTelegram: '@rcmnx',
  supportEmail: 'support@asronsat.uz',
  contactEmail: 'support@asronsat.uz',
  contactInstagram: 'https://instagram.com/asronsat',
  landingHeadline: 'Master the Digital SAT with Executive Precision.',
  landingHeroTitle: 'The Ivy League Digital SAT Intelligence Platform',
  landingSubheadline: 'Authentic 2-stage adaptive Bluebook simulation, 20-second Desmos shortcuts, and Leitner spaced repetition error eradication.',
  landingHeroSubtitle: 'Master the 1550+ score threshold with authentic Bluebook MST engine, 20-second Desmos shortcuts, and 3-stage Leitner spaced error eradication.',
  landingHeroCtaText: 'Unlock 1550+ Elite Workspace',
  announcementText: 'Yangi Bluebook 2026 mock testlari bazaga qo\'shildi. Fall 2026 Scholar Passes Active.',
  announcementActive: true,
  announcementEnabled: true,
  freeDailyLimit: 5,
  isMaintenance: false,
  arenaEnabled: true,
  liveStreamEnabled: true,
  voiceNotesEnabled: true,
  faqs: [
    {
      q: 'ASRON SAT nima va u qanday ishlaydi?',
      a: 'ASRON SAT - Digital SAT imtihoniga tayyorlanish uchun mo\'ljallangan to\'liq raqamli trenajyor, 2-bosqichli adaptiv Bluebook MST simulyatori, 20 soniyali Desmos xaklari va xatolar ustida ishlash tizimi.',
      category: 'General'
    },
    {
      q: 'Obuna turlari (STANDARD, PRO, VIP) qanday farqlanadi?',
      a: 'STANDARD: 3,000+ savollar bazasi va kundalik trenajyor. PRO: To\'liq adaptiv Bluebook mock testlari va Desmos video-yechimlari. VIP: Shaxsiy mentorlik, haftalik jonli efirlar va yopiq Mastermind guruhi.',
      category: 'Billing'
    },
    {
      q: 'To\'lov qanday amalga oshiriladi?',
      a: 'To\'lov Payme, Click yoki xalqaro kartalar orqali rasmiy Telegram administratorimiz (@rcmnx) orqali to\'g\'ridan-to\'g\'ri tasdiqlanadi va hisobingizga bir zumda kirish beriladi.',
      category: 'Billing'
    },
    {
      q: 'Socratic AI Repetitor javobni birdan aytib qo\'yadimi?',
      a: 'Yo\'q, Socratic AI talabaga to\'g\'ridan-to\'g\'ri javobni aytmasdan, bosqichma-bosqich yo\'naltiruvchi savollar va formulalar orqali o\'zi yechimga kelishiga yordam beradi.',
      category: 'AI Tutor'
    }
  ],
  testimonials: [
    {
      id: 't-1',
      name: 'Jasurbek O.',
      targetSchoolOrMajor: 'MIT Computer Science',
      score: '1560',
      quote: 'ASRON SAT yordamida Math bo\'limini 800/800 qildim. Desmos xaklari va Leitner xatolar qutisi tufayli 3 hafta ichida 1420 dan 1560 ga ko\'tarildim.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      date: '14-Avg, 2026',
      verifiedStudent: true
    },
    {
      id: 't-2',
      name: 'Madinabonu K.',
      targetSchoolOrMajor: 'Stanford University',
      score: '1540',
      quote: 'Reading & Writing bo\'limidagi Transitions va Words in Context modullari haqiqiy imtihon bilan 100% bir xil tushdi. Socratic AI juda katta yordam berdi.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      date: '28-Iyul, 2026',
      verifiedStudent: true
    },
    {
      id: 't-3',
      name: 'Bekzod T.',
      targetSchoolOrMajor: 'Columbia University',
      score: '1520',
      quote: 'Bluebook adaptiv algoritmi va real vaqtdagi taymer menga imtihon stressini to\'liq yengishga imkon berdi. VIP Inner Circle darslari ajoyib!',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date: '02-Avg, 2026',
      verifiedStudent: true
    }
  ],
  updatedAt: new Date().toISOString(),
};

/**
 * Fetch Global Platform Settings from API / Supabase
 */
export async function fetchGlobalPlatformSettings(): Promise<GlobalPlatformSettings> {
  // 1. Try local cache first for instant rendering
  let cached: GlobalPlatformSettings = DEFAULT_GLOBAL_SETTINGS;
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('asron_global_settings');
      if (saved) {
        cached = { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. Fetch from backend API
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const merged = { ...cached, ...data };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('asron_global_settings', JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    // API not reachable or offline, fallback to Supabase direct query
  }

  // 3. Fallback to direct Supabase query
  try {
    const { data, error } = await supabase
      .from('global_platform_settings')
      .select('*')
      .eq('id', 'global_config')
      .single();

    if (!error && data) {
      const settings: GlobalPlatformSettings = {
        ...cached,
        id: data.id || 'global_config',
        platformName: data.platform_name || data.platformName || cached.platformName,
        logoUrl: data.logo_url || data.logoUrl || cached.logoUrl,
        adminTelegram: data.admin_telegram || data.adminTelegram || cached.adminTelegram,
        contactTelegram: data.admin_telegram || data.contactTelegram || cached.contactTelegram,
        landingHeadline: data.landing_headline || data.landingHeadline || cached.landingHeadline,
        landingHeroTitle: data.landing_headline || data.landingHeroTitle || cached.landingHeroTitle,
        announcementText: data.announcement_text || data.announcementText || cached.announcementText,
        announcementEnabled: data.announcement_enabled ?? data.announcementEnabled ?? cached.announcementEnabled,
        announcementActive: data.announcement_enabled ?? data.announcementActive ?? cached.announcementActive,
        freeDailyLimit: data.free_daily_limit ?? data.freeDailyLimit ?? cached.freeDailyLimit,
        isMaintenance: data.is_maintenance ?? data.isMaintenance ?? cached.isMaintenance,
        arenaEnabled: data.arena_enabled ?? data.arenaEnabled ?? cached.arenaEnabled,
        liveStreamEnabled: data.live_stream_enabled ?? data.liveStreamEnabled ?? cached.liveStreamEnabled,
        voiceNotesEnabled: data.voice_notes_enabled ?? data.voiceNotesEnabled ?? cached.voiceNotesEnabled,
        faqs: data.faqs || cached.faqs,
        testimonials: data.testimonials || cached.testimonials,
        updatedAt: data.updated_at || new Date().toISOString(),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('asron_global_settings', JSON.stringify(settings));
      }
      return settings;
    }
  } catch (supabaseErr) {
    // ignore
  }

  return cached;
}

/**
 * Save Global Platform Settings to API & Supabase
 */
export async function saveGlobalPlatformSettings(settings: GlobalPlatformSettings): Promise<GlobalPlatformSettings> {
  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately persist to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('asron_global_settings', JSON.stringify(payload));
    // Also dispatch custom event for instant cross-component synchronization
    window.dispatchEvent(new CustomEvent('asron_settings_updated', { detail: payload }));
  }

  // 2. Persist to Express Backend API
  try {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Backend API save warning:', err);
  }

  // 3. Persist to Supabase Postgres database
  try {
    await supabase.from('global_platform_settings').upsert({
      id: 'global_config',
      platform_name: payload.platformName,
      logo_url: payload.logoUrl,
      admin_telegram: payload.adminTelegram || payload.contactTelegram,
      landing_headline: payload.landingHeadline || payload.landingHeroTitle,
      announcement_text: payload.announcementText,
      announcement_enabled: payload.announcementEnabled,
      free_daily_limit: payload.freeDailyLimit || 5,
      is_maintenance: payload.isMaintenance,
      arena_enabled: payload.arenaEnabled,
      live_stream_enabled: payload.liveStreamEnabled,
      voice_notes_enabled: payload.voiceNotesEnabled ?? true,
      faqs: payload.faqs || [],
      testimonials: payload.testimonials || [],
      updated_at: new Date().toISOString(),
    });
  } catch (supaErr) {
    console.warn('Supabase DB upsert notice:', supaErr);
  }

  return payload;
}

/**
 * Upload Brand Asset to Supabase Storage 'brand-assets' bucket
 */
export async function uploadBrandAsset(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `brand-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn('Storage bucket notice, creating object url fallback:', uploadError.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string, error: null });
        };
        reader.onerror = () => {
          resolve({ url: URL.createObjectURL(file), error: null });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage.from('brand-assets').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.readAsDataURL(file);
    });
  }
}
