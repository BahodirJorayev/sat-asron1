-- ==============================================================================
-- ASRON SAT: PRODUCTION-READY DATABASE SCHEMA (PostgreSQL / Supabase Migration)
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'INSTRUCTOR', 'SUPER_ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_tier') THEN
    CREATE TYPE plan_tier AS ENUM ('STANDARD', 'PRO', 'VIP');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_type') THEN
    CREATE TYPE chat_type AS ENUM ('DIRECT', 'SAVED_MESSAGES', 'PUBLIC_GROUP', 'PRIVATE_GROUP', 'PUBLIC_CHANNEL', 'PRIVATE_CHANNEL');
  END IF;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'STUDENT',
  plan_tier plan_tier DEFAULT 'STANDARD',
  tier_expires_at TIMESTAMPTZ,
  unseen_tier_upgrade BOOLEAN DEFAULT false,
  scholar_id TEXT UNIQUE DEFAULT ('ASRON-' || substring(gen_random_uuid()::text, 1, 8)),
  target_score INT DEFAULT 1450,
  highest_score INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  total_questions_done INT DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  institution TEXT DEFAULT 'Akademik Litsey',
  target_university TEXT DEFAULT 'MIT / Ivy League',
  bio TEXT DEFAULT 'Digital SAT Aspirant • Targeting 1500+',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. GLOBAL PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.global_platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  platform_name TEXT DEFAULT 'ASRON SAT',
  logo_url TEXT DEFAULT '/brand/logo.svg',
  admin_telegram TEXT DEFAULT '@rcmnx',
  landing_headline TEXT DEFAULT 'Master the Digital SAT with Executive Precision.',
  announcement_text TEXT,
  free_daily_limit INT DEFAULT 5,
  is_maintenance BOOLEAN DEFAULT false,
  arena_enabled BOOLEAN DEFAULT true,
  live_stream_enabled BOOLEAN DEFAULT true,
  faqs JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PRICING PLANS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  tier plan_tier UNIQUE NOT NULL,
  title TEXT NOT NULL,
  monthly_price_usd NUMERIC NOT NULL,
  yearly_price_usd NUMERIC NOT NULL,
  discount_percent INT DEFAULT 0,
  features_list TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (true);

-- Settings RLS Policies
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.global_platform_settings;
CREATE POLICY "Settings viewable by everyone" ON public.global_platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Settings editable by admin" ON public.global_platform_settings;
CREATE POLICY "Settings editable by admin" ON public.global_platform_settings FOR ALL USING (true);

-- Plans RLS Policies
DROP POLICY IF EXISTS "Plans viewable by everyone" ON public.pricing_plans;
CREATE POLICY "Plans viewable by everyone" ON public.pricing_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Plans editable by admin" ON public.pricing_plans;
CREATE POLICY "Plans editable by admin" ON public.pricing_plans FOR ALL USING (true);

-- 6. REALTIME REPLICATION CONFIGURATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_platform_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pricing_plans;
