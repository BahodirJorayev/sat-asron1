import { supabase } from './supabase';
import { GlobalPlatformSettings, User, PlanTier, Question, MockCategory, MockTest } from '../types';

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

  // 4. Broadcast to all active browser windows & external visitors via Supabase Realtime
  try {
    const channel = supabase.channel('global-platform-events');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'settings_updated',
          payload,
        });
      }
    });
  } catch (bcErr) {
    // Non-critical, ignore
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

/**
 * Default Seed Mock Categories
 */
export const INITIAL_MOCK_CATEGORIES: MockCategory[] = [
  {
    id: '11111111-c001-4000-8000-000000000001',
    name: 'Rasmiy Bluebook Testlari',
    slug: 'official-bluebook',
    orderIndex: 1,
    description: 'Rasmiy College Board formati va adaptiv MST tizimidagi to‘liq mock testlar.',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: '22222222-c002-4000-8000-000000000002',
    name: 'Maxsus Kurs Mocklari',
    slug: 'private-course',
    orderIndex: 2,
    description: 'Faqat maxsus kurs talabalari uchun kod orqali ochiladigan eksklyuziv testlar.',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: '33333333-c003-4000-8000-000000000003',
    name: 'Diagnostik Testlar',
    slug: 'diagnostic',
    orderIndex: 3,
    description: 'Talabaning kuchli va zaif tomonlarini aniqlashga mo‘ljallangan diagnostik testlar.',
    createdAt: '2026-08-01T00:00:00Z',
  },
];

/**
 * Fetch Mock Categories from Supabase / localStorage cache
 */
export async function fetchMockCategories(): Promise<MockCategory[]> {
  let categories: MockCategory[] = INITIAL_MOCK_CATEGORIES;
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem('asron_mock_categories');
      if (cached) {
        categories = JSON.parse(cached);
      }
    } catch {}
  }

  try {
    const { data, error } = await supabase
      .from('mock_categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (data && !error && data.length > 0) {
      categories = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        orderIndex: d.order_index ?? 0,
        description: d.description || '',
        createdAt: d.created_at,
      }));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('asron_mock_categories', JSON.stringify(categories));
      }
    }
  } catch (err) {
    console.warn('Supabase fetch mock_categories notice:', err);
  }

  return categories;
}

/**
 * Persist or Update a Mock Category in Supabase
 */
export async function saveMockCategoryRemote(category: MockCategory): Promise<void> {
  try {
    await supabase.from('mock_categories').upsert({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order_index: category.orderIndex,
      created_at: category.createdAt || new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Supabase upsert mock_category notice:', err);
  }
}

/**
 * Delete a Mock Category from Supabase
 */
export async function deleteMockCategoryRemote(categoryId: string): Promise<void> {
  try {
    await supabase.from('mock_categories').delete().eq('id', categoryId);
  } catch (err) {
    console.warn('Supabase delete mock_category notice:', err);
  }
}

/**
 * ==============================================================================
 * DYNAMIC PLATFORM CONTENT (Supabase public.platform_content)
 * ==============================================================================
 */

export interface PlatformContentItem {
  id?: string;
  key: string;
  title?: string;
  subtitle?: string;
  content?: any;
  is_active: boolean;
  updated_at?: string;
}

export const DEFAULT_PLATFORM_CONTENT: Record<string, PlatformContentItem> = {
  landing_hero: {
    key: 'landing_hero',
    title: 'Score 1500+ on the Digital SAT with Adaptive Mastery',
    subtitle: 'SAT imtihoniga professional, tizimli va xolis tayyorgarlik platformasi.',
    content: {
      ctaText: "Ro'yxatdan o'tish (Bepul)",
      ctaLink: '/auth',
      badgeText: 'ASRON SAT • 2026 Yangi Format',
    },
    is_active: true,
  },
  announcement_banner: {
    key: 'announcement_banner',
    title: 'Yangi Digital SAT 2026 Mock Testlari yuklandi!',
    subtitle: 'Sinovdan o‘tish mutlaqo bepul.',
    content: {
      linkText: "Mock Testlarga o'tish",
      linkUrl: 'mocks',
      type: 'info',
    },
    is_active: true,
  },
  stats_bar: {
    key: 'stats_bar',
    title: "Platforma Ko'rsatkichlari",
    subtitle: 'Haqiqiy natijalar va statistika',
    content: [
      { id: 'stat-1', label: 'Faol SAT Talabalari', value: '45,000+' },
      { id: 'stat-2', label: "O'rtacha Ball O'sishi", value: '+210 ball' },
      { id: 'stat-3', label: 'Bluebook 2-Stage MST Format', value: '100%' },
      { id: 'stat-4', label: 'Kunlik Samarali Trenirovka', value: '10 Daqiqa' },
    ],
    is_active: true,
  },
  dashboard_announcements: {
    key: 'dashboard_announcements',
    title: "Boshqaruv Paneli E'lonlari",
    subtitle: "O'quvchilar uchun muhim xabarlar",
    content: [
      {
        id: 'ann-1',
        title: "Shanba kuni soat 20:00 da bepul Katta Mock Test bo'lib o'tadi",
        text: 'Haqiqiy College Board 2026 formatida adaptiv sinov. Barcha qatnashchilar uchun reyting va tahlil taqdim etiladi.',
        date: '2026-09-06',
        link: 'mocks',
        is_active: true,
      },
    ],
    is_active: true,
  },
  recommended_resources: {
    key: 'recommended_resources',
    title: 'Tavsiya Etiladigan Resurslar',
    subtitle: 'SAT imtihoniga tayyorgarlik materiallari',
    content: [
      {
        id: 'rec-1',
        title: 'Erica Meltzer SAT Vocabulary PDF',
        description: "Eng ko'p uchraydigan 250 ta akademik so'zlar to'plami.",
        link: 'vocab',
        tag: "LUG'AT",
        is_active: true,
      },
      {
        id: 'rec-2',
        title: 'Desmos 20-Soniyali Formula Xaklari',
        description: "Kvadrat tenglamalar va koordinatalar geometriyasi bo'yicha maxsus yechimlar.",
        link: 'arena',
        tag: 'DESMOS',
        is_active: true,
      },
    ],
    is_active: true,
  },
};

/**
 * Fetch all platform content rows or a specific item by key from Supabase
 */
export async function fetchPlatformContent(targetKey?: string): Promise<PlatformContentItem[]> {
  let cachedMap: Record<string, PlatformContentItem> = { ...DEFAULT_PLATFORM_CONTENT };

  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('asron_platform_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          cachedMap = { ...cachedMap, ...parsed };
        }
      }
    } catch {}
  }

  try {
    let query = supabase.from('platform_content').select('*');
    if (targetKey) {
      query = query.eq('key', targetKey);
    }
    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      data.forEach((row: any) => {
        cachedMap[row.key] = {
          id: row.id,
          key: row.key,
          title: row.title || '',
          subtitle: row.subtitle || '',
          content: row.content || {},
          is_active: row.is_active ?? true,
          updated_at: row.updated_at,
        };
      });

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('asron_platform_content', JSON.stringify(cachedMap));
      }
    }
  } catch (err) {
    console.warn('Supabase fetch platform_content notice:', err);
  }

  if (targetKey) {
    return cachedMap[targetKey] ? [cachedMap[targetKey]] : [];
  }
  return Object.values(cachedMap);
}

/**
 * Fetch platform content as a dictionary indexed by key
 */
export async function fetchPlatformContentMap(): Promise<Record<string, PlatformContentItem>> {
  const list = await fetchPlatformContent();
  const map: Record<string, PlatformContentItem> = { ...DEFAULT_PLATFORM_CONTENT };
  list.forEach((item) => {
    map[item.key] = item;
  });
  return map;
}

/**
 * Persist or mutate a dynamic platform content item in Supabase
 */
export async function savePlatformContent(
  item: Partial<PlatformContentItem> & { key: string }
): Promise<PlatformContentItem> {
  const currentMap = await fetchPlatformContentMap();
  const existing = currentMap[item.key] || DEFAULT_PLATFORM_CONTENT[item.key] || {
    key: item.key,
    title: '',
    subtitle: '',
    content: {},
    is_active: true,
  };

  const payload: PlatformContentItem = {
    ...existing,
    ...item,
    updated_at: new Date().toISOString(),
  };

  // 1. Immediately update local cache & broadcast event
  currentMap[item.key] = payload;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('asron_platform_content', JSON.stringify(currentMap));
    window.dispatchEvent(
      new CustomEvent('asron_platform_content_updated', {
        detail: { key: item.key, item: payload, map: currentMap },
      })
    );
  }

  // 2. Persist to Supabase PostgreSQL table
  try {
    const { data, error } = await supabase
      .from('platform_content')
      .upsert(
        {
          key: payload.key,
          title: payload.title,
          subtitle: payload.subtitle,
          content: payload.content,
          is_active: payload.is_active,
          updated_at: payload.updated_at,
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (!error && data) {
      payload.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase savePlatformContent notice:', err);
  }

  return payload;
}

/**
 * Delete a dynamic platform content item by key
 */
export async function deletePlatformContent(key: string): Promise<void> {
  // Update local cache
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('asron_platform_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed[key];
        localStorage.setItem('asron_platform_content', JSON.stringify(parsed));
      }
    } catch {}
    window.dispatchEvent(
      new CustomEvent('asron_platform_content_updated', {
        detail: { key, deleted: true },
      })
    );
  }

  try {
    await supabase.from('platform_content').delete().eq('key', key);
  } catch (err) {
    console.warn('Supabase deletePlatformContent notice:', err);
  }
}

/**
 * Realtime subscription to public.platform_content table
 */
export function subscribeToPlatformContent(
  onChange: (map: Record<string, PlatformContentItem>) => void
): () => void {
  const channel = supabase
    .channel('public:platform_content:changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'platform_content' },
      async () => {
        const freshMap = await fetchPlatformContentMap();
        onChange(freshMap);
      }
    )
    .subscribe();

  const handleCustomEvent = (e: any) => {
    if (e.detail?.map) {
      onChange(e.detail.map);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('asron_platform_content_updated', handleCustomEvent);
  }

  return () => {
    supabase.removeChannel(channel);
    if (typeof window !== 'undefined') {
      window.removeEventListener('asron_platform_content_updated', handleCustomEvent);
    }
  };
}

/**
 * ==============================================================================
 * MOCK TESTS SUPABASE PERSISTENCE
 * ==============================================================================
 */

/**
 * Fetch all mock tests from Supabase
 */
export async function fetchMockTestsRemote(): Promise<MockTest[]> {
  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description || '',
        category: d.category || 'OFFICIAL_MOCK',
        isPublished: d.is_published ?? true,
        isPrivate: d.is_private ?? false,
        accessCode: d.access_code || undefined,
        totalTimeMinutes: d.total_time_minutes ?? 134,
        timeLimitSecs: d.time_limit_secs ?? 8040,
        attemptsCount: d.attempts_count ?? 0,
        averageScore: d.average_score ?? 0,
        highestScore: d.highest_score ?? 0,
        tags: d.tags || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        questions: [],
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch mock_tests notice:', err);
  }
  return [];
}

/**
 * Upsert Mock Test to Supabase
 */
export async function saveMockTestRemote(test: MockTest): Promise<void> {
  try {
    await supabase.from('mock_tests').upsert(
      {
        id: test.id,
        title: test.title,
        description: test.description || '',
        category: test.category || 'OFFICIAL_MOCK',
        is_published: test.isPublished ?? true,
        is_private: test.isPrivate ?? false,
        access_code: test.accessCode || null,
        total_time_minutes: test.totalTimeMinutes || 134,
        time_limit_secs: test.timeLimitSecs || 8040,
        attempts_count: test.attemptsCount || 0,
        average_score: test.averageScore || 0,
        highest_score: test.highestScore || 0,
        tags: test.tags || [],
        created_at: test.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Supabase upsert mock_test notice:', err);
  }
}

/**
 * Delete Mock Test from Supabase
 */
export async function deleteMockTestRemote(testId: string): Promise<void> {
  try {
    await supabase.from('mock_tests').delete().eq('id', testId);
  } catch (err) {
    console.warn('Supabase delete mock_test notice:', err);
  }
}

/**
 * Realtime subscription to public.mock_tests table
 */
export function subscribeToMockTests(onChange: (tests: MockTest[]) => void): () => void {
  const channel = supabase
    .channel('public:mock_tests:changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mock_tests' },
      async () => {
        const tests = await fetchMockTestsRemote();
        if (tests.length > 0) {
          onChange(tests);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}


