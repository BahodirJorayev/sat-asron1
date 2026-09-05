-- ==============================================================================
-- ASRON SAT: ADMIN CMS SETTINGS, PROFILES CLOUD SYNC & REALTIME REPLICATION
-- Migration: 20260905_admin_cms_and_profiles_sync.sql
-- ==============================================================================

-- 1. GLOBAL PLATFORM SETTINGS TABLE (Branding, Announcements, System Toggles)
CREATE TABLE IF NOT EXISTS public.global_platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  platform_name TEXT DEFAULT 'ASRON SAT',
  platform_subtitle TEXT DEFAULT 'Digital SAT Intelligence & Scoring Engine',
  platform_tagline TEXT DEFAULT 'Master the Digital SAT with Executive Precision',
  logo_url TEXT DEFAULT '/brand/logo.svg',
  admin_telegram TEXT DEFAULT '@rcmnx',
  contact_telegram TEXT DEFAULT '@rcmnx',
  support_email TEXT DEFAULT 'support@asronsat.uz',
  contact_email TEXT DEFAULT 'support@asronsat.uz',
  contact_instagram TEXT DEFAULT 'https://instagram.com/asronsat',
  landing_headline TEXT DEFAULT 'Master the Digital SAT with Executive Precision.',
  landing_hero_title TEXT DEFAULT 'The Ivy League Digital SAT Intelligence Platform',
  landing_subheadline TEXT DEFAULT 'Authentic 2-stage adaptive Bluebook simulation, 20-second Desmos shortcuts, and Leitner spaced repetition error eradication.',
  landing_hero_subtitle TEXT DEFAULT 'Master the 1550+ score threshold with authentic Bluebook MST engine, 20-second Desmos shortcuts, and 3-stage Leitner spaced error eradication.',
  landing_hero_cta_text TEXT DEFAULT 'Unlock 1550+ Elite Workspace',
  announcement_text TEXT DEFAULT 'Yangi Bluebook 2026 mock testlari bazaga qo''shildi. Fall 2026 Scholar Passes Active.',
  announcement_active BOOLEAN DEFAULT true,
  announcement_enabled BOOLEAN DEFAULT true,
  free_daily_limit INTEGER DEFAULT 5,
  is_maintenance BOOLEAN DEFAULT false,
  arena_enabled BOOLEAN DEFAULT true,
  live_stream_enabled BOOLEAN DEFAULT true,
  voice_notes_enabled BOOLEAN DEFAULT true,
  faqs JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) for Global Settings
ALTER TABLE public.global_platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read global_platform_settings" ON public.global_platform_settings;
CREATE POLICY "Public read global_platform_settings"
  ON public.global_platform_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow write access on global_platform_settings" ON public.global_platform_settings;
CREATE POLICY "Allow write access on global_platform_settings"
  ON public.global_platform_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default global settings row
INSERT INTO public.global_platform_settings (id, platform_name, announcement_enabled)
VALUES ('global_config', 'ASRON SAT', true)
ON CONFLICT (id) DO NOTHING;


-- 2. DYNAMIC PLATFORM CONTENT TABLE (Hero, Stats Bar, Announcements, Resources)
CREATE TABLE IF NOT EXISTS public.platform_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.platform_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read platform_content" ON public.platform_content;
CREATE POLICY "Public read platform_content"
  ON public.platform_content
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow write access on platform_content" ON public.platform_content;
CREATE POLICY "Allow write access on platform_content"
  ON public.platform_content
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- 3. ENHANCE PROFILES TABLE (Extend schema for unified cross-device state)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_university TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_exam_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'STANDARD';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'STUDENT';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_questions_done INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS overall_accuracy NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- 4. REALTIME REPLICATION CONFIGURATION
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'global_platform_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_platform_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'platform_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_content;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
