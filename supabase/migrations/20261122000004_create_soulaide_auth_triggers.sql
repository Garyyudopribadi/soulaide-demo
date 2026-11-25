-- ==============================================================================
-- SOULAIDE PSYCHOLOGY PLATFORM - AUTH SYNC TRIGGERS
-- Migration: 20261122000004_create_soulaide_auth_triggers.sql
-- ==============================================================================

-- 1. Automatic Profile & Default Role Creation upon Auth User Creation
CREATE OR REPLACE FUNCTION public."Soulaide_handle_new_user"()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Extract metadata if provided during sign up
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  v_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL);

  -- Insert profile
  INSERT INTO public."Soulaide_profiles" (
    id,
    email,
    full_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_avatar_url,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public."Soulaide_profiles".full_name IS NULL OR public."Soulaide_profiles".full_name = '' THEN EXCLUDED.full_name ELSE public."Soulaide_profiles".full_name END,
    updated_at = NOW();

  -- Assign default role 'customer' securely
  -- Users cannot assign themselves 'admin' or 'psychologist' via public sign-up metadata
  INSERT INTO public."Soulaide_user_roles" (
    user_id,
    role,
    created_at
  ) VALUES (
    NEW.id,
    'customer',
    NOW()
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger attached to auth.users
DROP TRIGGER IF EXISTS "Soulaide_on_auth_user_created" ON auth.users;
CREATE TRIGGER "Soulaide_on_auth_user_created"
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_new_user"();
