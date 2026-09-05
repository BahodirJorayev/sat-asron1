-- ==============================================================================
-- ASRON SAT: Community Search Indexes, Usernames & Secure Invite Tokens
-- ==============================================================================

-- 1. Add username, invite_token, and is_public to community_channels
ALTER TABLE public.community_channels 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Full-text search index for high performance channel and group lookup
CREATE INDEX IF NOT EXISTS idx_community_channels_search 
ON public.community_channels USING gin(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(username, '')));

-- 2. Ensure users profile table has username and is searchable
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index for user profiles lookup
CREATE INDEX IF NOT EXISTS idx_profiles_search 
ON public.profiles USING gin(to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(username, '')));

-- RLS: Allow any authenticated user to search public channels & profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles search" ON public.profiles;
CREATE POLICY "Public profiles search" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sync existing public.users to public.profiles if users table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    INSERT INTO public.profiles (id, full_name, username, avatar_url, created_at)
    SELECT id, full_name, username, avatar_url, created_at
    FROM public.users
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url;
  END IF;
END $$;

-- 3. Join private channel via valid invite token
CREATE OR REPLACE FUNCTION join_channel_by_token(token_input TEXT)
RETURNS UUID AS $$ 
DECLARE 
  target_channel_id UUID; 
BEGIN 
  SELECT id INTO target_channel_id 
  FROM public.community_channels 
  WHERE invite_token = token_input OR invite_code = token_input; 
  
  IF target_channel_id IS NULL THEN 
    RAISE EXCEPTION 'Yaroqsiz yoki eskirgan taklif havolasi'; 
  END IF; 
  
  INSERT INTO public.community_members (channel_id, user_id, role) 
  VALUES (target_channel_id, auth.uid(), 'member') 
  ON CONFLICT (channel_id, user_id) DO NOTHING; 
  
  RETURN target_channel_id; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;
