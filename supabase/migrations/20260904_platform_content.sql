-- ==============================================================================
-- ASRON SAT: PLATFORM GLOBAL SETTINGS & CMS CONTENT SCHEMA
-- Migration: 20260904_platform_content.sql
-- ==============================================================================

-- 1. Platform Global Settings & CMS Content Table
CREATE TABLE IF NOT EXISTS public.platform_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g. 'landing_hero', 'announcement_banner', 'stats_bar', 'dashboard_announcements', 'recommended_resources'
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed default dynamic content
INSERT INTO public.platform_content (key, title, subtitle, content, is_active) VALUES
(
  'landing_hero', 
  'Score 1500+ on the Digital SAT with Adaptive Mastery', 
  'SAT imtihoniga professional, tizimli va xolis tayyorgarlik platformasi.',
  '{"ctaText": "Ro''yxatdan o''tish (Bepul)", "ctaLink": "/auth", "badgeText": "ASRON SAT • 2026 Yangi Format"}'::jsonb,
  true
),
(
  'announcement_banner', 
  'Yangi Digital SAT 2026 Mock Testlari yuklandi!', 
  'Sinovdan o‘tish mutlaqo bepul.',
  '{"linkText": "Mock Testlarga o''tish", "linkUrl": "mocks", "type": "info"}'::jsonb,
  true
),
(
  'stats_bar',
  'Platforma Ko''rsatkichlari',
  'Haqiqiy natijalar va statistika',
  '[{"id": "stat-1", "label": "Faol SAT Talabalari", "value": "45,000+"}, {"id": "stat-2", "label": "O''rtacha Ball O''sishi", "value": "+210 ball"}, {"id": "stat-3", "label": "Bluebook 2-Stage MST Format", "value": "100%"}, {"id": "stat-4", "label": "Kunlik Samarali Trenirovka", "value": "10 Daqiqa"}]'::jsonb,
  true
),
(
  'dashboard_announcements',
  'Boshqaruv Paneli E''lonlari',
  'O''quvchilar uchun muhim xabarlar',
  '[{"id": "ann-1", "title": "Shanba kuni soat 20:00 da bepul Katta Mock Test bo''lib o''tadi", "text": "Haqiqiy College Board 2026 formatida adaptiv sinov. Barcha qatnashchilar uchun reyting va tahlil taqdim etiladi.", "date": "2026-09-06", "link": "mocks", "is_active": true}]'::jsonb,
  true
),
(
  'recommended_resources',
  'Tavsiya Etiladigan Resurslar',
  'SAT imtihoniga tayyorgarlik materiallari',
  '[{"id": "rec-1", "title": "Erica Meltzer SAT Vocabulary PDF", "description": "Eng ko''p uchraydigan 250 ta akademik so''zlar to''plami.", "link": "vocab", "tag": "LUG''AT", "is_active": true}, {"id": "rec-2", "title": "Desmos 20-Soniyali Formula Xaklari", "description": "Kvadrat tenglamalar va koordinatalar geometriyasi bo''yicha maxsus yechimlar.", "link": "arena", "tag": "DESMOS", "is_active": true}]'::jsonb,
  true
)
ON CONFLICT (key) DO NOTHING;

-- 3. Row Level Security (RLS)
ALTER TABLE public.platform_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read platform content" ON public.platform_content;
CREATE POLICY "Public read platform content" ON public.platform_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update platform content" ON public.platform_content;
CREATE POLICY "Admin update platform content" ON public.platform_content FOR ALL USING (true);

-- 4. Enable Supabase Realtime Replication
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'platform_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_content;
  END IF;
END $$;
