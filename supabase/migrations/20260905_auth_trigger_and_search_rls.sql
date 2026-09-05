-- ==============================================================================
-- ASRON SAT: Auth User Trigger, User Progress, & Global Search RLS Policies
-- ==============================================================================

-- 1. Ensure profiles table exists with necessary columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  target_score INT DEFAULT 1500,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure target_score column exists if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_score INT DEFAULT 1500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Auto-create profile and user record on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_full_name TEXT;
  clean_username TEXT;
  clean_avatar TEXT;
BEGIN
  clean_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Foydalanuvchi');
  clean_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substr(NEW.id::text, 1, 8)
  );
  clean_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || clean_username
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, full_name, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    clean_full_name,
    clean_username,
    clean_avatar,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      username = EXCLUDED.username,
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
      updated_at = NOW();

  -- Also insert into public.users if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    INSERT INTO public.users (id, email, full_name, username, avatar_url, role, plan_tier, target_score, streak_days, total_questions_done, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, clean_username || '@asronsat.uz'),
      clean_full_name,
      clean_username,
      clean_avatar,
      'STUDENT',
      'STANDARD',
      1500,
      0,
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Open RLS Policies for Profiles Search
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can search profiles" ON public.profiles;
CREATE POLICY "Anyone can search profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Open RLS Policies for Community Channels Search
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public channels are searchable" ON public.community_channels;
CREATE POLICY "Public channels are searchable" ON public.community_channels FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

-- 5. User Progress Tracking Table (Strict 0-State Persistence)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  section TEXT,
  domain TEXT,
  skill TEXT,
  difficulty TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  selected_answer TEXT,
  time_spent_secs INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_question UNIQUE (user_id, question_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;
CREATE POLICY "Users can read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
