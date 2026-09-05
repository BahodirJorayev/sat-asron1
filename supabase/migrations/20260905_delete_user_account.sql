-- ==============================================================================
-- ASRON SAT: Real Account Deletion RPC
-- Allows authenticated users to completely wipe their account from auth.users,
-- cascading down to public.profiles, public.user_progress, and related tables.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Wipe from user_progress
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
    DELETE FROM public.user_progress WHERE user_id = v_uid;
  END IF;

  -- 2. Wipe from profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    DELETE FROM public.profiles WHERE id = v_uid;
  END IF;

  -- 3. Wipe from legacy users table if present
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    DELETE FROM public.users WHERE id = v_uid;
  END IF;

  -- 4. Wipe from auth.users
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
