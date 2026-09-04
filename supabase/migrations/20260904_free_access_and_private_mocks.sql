-- ==============================================================================
-- ASRON SAT: FREE ACCESS ARCHITECTURE & ACCESS-CODE PROTECTED PRIVATE MOCKS
-- Migration: 20260904_free_access_and_private_mocks.sql
-- ==============================================================================

-- 1. EXTEND MOCK TESTS TABLE WITH ACCESS CONTROLS
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'OFFICIAL_MOCK',
  is_published BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  access_code TEXT,
  total_time_minutes INT DEFAULT 134,
  time_limit_secs INT DEFAULT 8040,
  attempts_count INT DEFAULT 0,
  average_score INT DEFAULT 0,
  highest_score INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table already existed
ALTER TABLE public.mock_tests ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE public.mock_tests ADD COLUMN IF NOT EXISTS access_code TEXT;
ALTER TABLE public.mock_tests ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 2. USER UNLOCKED MOCKS TABLE (Records permanently unlocked private course mocks)
CREATE TABLE IF NOT EXISTS public.user_unlocked_mocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mock_test_id TEXT NOT NULL,
  access_code_used TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mock_test_id)
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_mocks ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR MOCK TESTS
DROP POLICY IF EXISTS "Mock tests viewable by all authenticated users" ON public.mock_tests;
CREATE POLICY "Mock tests viewable by all authenticated users" 
  ON public.mock_tests 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Mock tests editable by admin" ON public.mock_tests;
CREATE POLICY "Mock tests editable by admin" 
  ON public.mock_tests 
  FOR ALL 
  USING (true);

-- 5. RLS POLICIES FOR USER UNLOCKED MOCKS
DROP POLICY IF EXISTS "Users can view own unlocked mocks" ON public.user_unlocked_mocks;
CREATE POLICY "Users can view own unlocked mocks" 
  ON public.user_unlocked_mocks 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlock mocks" ON public.user_unlocked_mocks;
CREATE POLICY "Users can unlock mocks" 
  ON public.user_unlocked_mocks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all unlocked mocks" ON public.user_unlocked_mocks;
CREATE POLICY "Admins can view all unlocked mocks" 
  ON public.user_unlocked_mocks 
  FOR ALL 
  USING (true);

-- 6. REALTIME REPLICATION CONFIGURATION
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mock_tests;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_unlocked_mocks;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
