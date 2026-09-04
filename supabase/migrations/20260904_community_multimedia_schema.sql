-- ==============================================================================
-- ASRON SAT: Enterprise Community, Channels, Groups & Live Broadcasting Schema
-- ==============================================================================

-- 1. Channels, Groups and DMs Table
CREATE TABLE IF NOT EXISTS public.community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('channel', 'public_group', 'private_group', 'direct')),
  name TEXT,
  title TEXT,
  slug TEXT,
  description TEXT,
  avatar_url TEXT,
  invite_code TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Channel Members Table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- 3. Messages with Media & Captions Table
CREATE TABLE IF NOT EXISTS public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  media_name TEXT,
  caption TEXT,
  voice_url TEXT,
  voice_duration INT,
  recording_url TEXT,
  recording_title TEXT,
  recording_duration INT,
  reply_to_id UUID REFERENCES public.community_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Recorded Broadcasts Table
CREATE TABLE IF NOT EXISTS public.live_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INT,
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_recordings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Public read channels" ON public.community_channels;
CREATE POLICY "Public read channels" ON public.community_channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert channels" ON public.community_channels;
CREATE POLICY "Auth users insert channels" ON public.community_channels FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Auth users update channels" ON public.community_channels;
CREATE POLICY "Auth users update channels" ON public.community_channels FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Public read members" ON public.community_members;
CREATE POLICY "Public read members" ON public.community_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users join channels" ON public.community_members;
CREATE POLICY "Auth users join channels" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read messages" ON public.community_messages;
CREATE POLICY "Public read messages" ON public.community_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert messages" ON public.community_messages;
CREATE POLICY "Auth users insert messages" ON public.community_messages FOR INSERT WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL);

DROP POLICY IF EXISTS "Auth users update their messages" ON public.community_messages;
CREATE POLICY "Auth users update their messages" ON public.community_messages FOR UPDATE USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Public read live recordings" ON public.live_recordings;
CREATE POLICY "Public read live recordings" ON public.live_recordings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users insert live recordings" ON public.live_recordings;
CREATE POLICY "Auth users insert live recordings" ON public.live_recordings FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- 7. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_community_messages_channel ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_channel ON public.community_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_live_recordings_channel ON public.live_recordings(channel_id);

-- 8. Seed Official Channels
INSERT INTO public.community_channels (id, type, name, title, slug, description, avatar_url, invite_code, is_verified, is_official)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'channel', 'SAT | ASRON', 'SAT | ASRON', 'sat-asron', 'ASRON SAT rasmiy yangiliklar va darslar kanali.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', 'sat-asron', true, true),
  ('22222222-2222-2222-2222-222222222222', 'public_group', 'SAT | ASRON Platformasi', 'SAT | ASRON Platformasi', 'sat-asron-platformasi', 'ASRON SAT platformasi o''quvchilari va muhokama kanali.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'sat-asron-chat', true, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;
