-- Migration: 20260905_questions_multimodal_and_announcements.sql
-- Description: Multimodal question schema supporting images/screenshots, granular modules, and live platform announcements table.

-- 1. Ensure questions table supports images and flexible sections
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_id UUID REFERENCES public.mock_tests(id) ON DELETE SET NULL,
  section TEXT NOT NULL CHECK (section IN ('reading_writing', 'math', 'READING_AND_WRITING', 'MATH')),
  module_number INT DEFAULT 1,
  domain TEXT,
  skill TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'EASY', 'MEDIUM', 'HARD')),
  passage TEXT,
  prompt TEXT,
  image_url TEXT,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'grid_in', 'MULTIPLE_CHOICE', 'GRID_IN')),
  options JSONB DEFAULT '[]'::jsonb, -- [{"id": "A", "text": "...", "image_url": null}] or {"A": "...", "B": "..."}
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Backward-compatibility column additions if questions already exists
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS mock_id UUID REFERENCES public.mock_tests(id) ON DELETE SET NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS module_number INT DEFAULT 1;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS prompt TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation_image_url TEXT;

-- 2. Announcements and Platform News Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  target_route TEXT DEFAULT 'dashboard', -- 'landing', 'dashboard', 'popup'
  action_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_route TEXT DEFAULT 'dashboard';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS action_link TEXT;

-- 3. Row Level Security Policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Questions RLS
DROP POLICY IF EXISTS "Public read questions" ON public.questions;
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage questions" ON public.questions;
CREATE POLICY "Admin manage questions" ON public.questions FOR ALL USING (true);

-- Announcements RLS
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage announcements" ON public.announcements;
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (true);

-- 4. Supabase Storage Bucket for Question Images & Diagrams
INSERT INTO storage.buckets (id, name, public)
VALUES ('sat-questions', 'sat-questions', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Policy for sat-questions
DROP POLICY IF EXISTS "Public read sat-questions" ON storage.objects;
CREATE POLICY "Public read sat-questions" ON storage.objects FOR SELECT
USING (bucket_id = 'sat-questions');

DROP POLICY IF EXISTS "Allow authenticated uploads to sat-questions" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to sat-questions" ON storage.objects FOR ALL
USING (bucket_id = 'sat-questions')
WITH CHECK (bucket_id = 'sat-questions');
