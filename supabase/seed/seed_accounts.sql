-- ==============================================================================
-- SOULAIDE PSYCHOLOGY PLATFORM - REPAIR & SEED AUTH ACCOUNTS
-- File: supabase/seed/seed_accounts.sql
-- ==============================================================================
-- Mengatasi error: "Database error querying schema" (500)
-- Penyebab: Supabase GoTrue Auth mewajibkan kolom token string bernilai '' (bukan NULL)
-- dan auth.identities harus selaras dengan provider_id = id::text.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_finandita_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_amanda_id UUID := 'a0000000-0000-0000-0000-000000000003';
  v_klien_id UUID := 'a0000000-0000-0000-0000-000000000004';

  v_admin_pwd TEXT := extensions.crypt('AdminSoulaide2026!', extensions.gen_salt('bf'));
  v_psych_pwd TEXT := extensions.crypt('Psikolog2026!', extensions.gen_salt('bf'));
  v_klien_pwd TEXT := extensions.crypt('KlienSoulaide2026!', extensions.gen_salt('bf'));
BEGIN

  -- 1. HAPUS IDENTITAS LAMA DARI AKUN DEMO INI SUPAYA TIDAK DUPLIKAT/BENTROK
  DELETE FROM auth.identities WHERE user_id IN (v_admin_id, v_finandita_id, v_amanda_id, v_klien_id);

  -- 2. INSERT / UPSERT KE AUTH.USERS LENGKAP DENGAN DEFAULT EMPTY STRING
  -- (Mencegah "converting NULL to string is unsupported" di GoTrue)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token,
    email_change_confirm_status,
    is_super_admin,
    is_sso_user,
    is_anonymous
  ) VALUES 
    (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@soulaide.id',
      v_admin_pwd,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Administrator Soulaide"}'::jsonb,
      NOW(),
      NOW(),
      '', '', '', '', '', '', '', '', 0, FALSE, FALSE, FALSE
    ),
    (
      v_finandita_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'finandita@soulaide.id',
      v_psych_pwd,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Finandita Utari, M.Psi., Psikolog."}'::jsonb,
      NOW(),
      NOW(),
      '', '', '', '', '', '', '', '', 0, FALSE, FALSE, FALSE
    ),
    (
      v_amanda_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'amanda@soulaide.id',
      v_psych_pwd,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Amanda Natasanti, S.Psi., Psikolog."}'::jsonb,
      NOW(),
      NOW(),
      '', '', '', '', '', '', '', '', 0, FALSE, FALSE, FALSE
    ),
    (
      v_klien_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'klien@soulaide.id',
      v_klien_pwd,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Budi Pratama"}'::jsonb,
      NOW(),
      NOW(),
      '', '', '', '', '', '', '', '', 0, FALSE, FALSE, FALSE
    )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email = EXCLUDED.email,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    confirmation_token = COALESCE(auth.users.confirmation_token, ''),
    recovery_token = COALESCE(auth.users.recovery_token, ''),
    email_change_token_new = COALESCE(auth.users.email_change_token_new, ''),
    email_change = COALESCE(auth.users.email_change, ''),
    email_change_token_current = COALESCE(auth.users.email_change_token_current, ''),
    phone_change = COALESCE(auth.users.phone_change, ''),
    phone_change_token = COALESCE(auth.users.phone_change_token, ''),
    reauthentication_token = COALESCE(auth.users.reauthentication_token, ''),
    email_change_confirm_status = COALESCE(auth.users.email_change_confirm_status, 0),
    updated_at = NOW();

  -- 3. FIX SEMUA TOKEN NULL PADA SELURUH RECORD DI AUTH.USERS
  UPDATE auth.users
  SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
    is_super_admin = COALESCE(is_super_admin, FALSE),
    is_sso_user = COALESCE(is_sso_user, FALSE),
    is_anonymous = COALESCE(is_anonymous, FALSE)
  WHERE confirmation_token IS NULL
     OR recovery_token IS NULL
     OR email_change_token_new IS NULL
     OR email_change IS NULL
     OR email_change_token_current IS NULL
     OR phone_change IS NULL
     OR phone_change_token IS NULL
     OR reauthentication_token IS NULL
     OR email_change_confirm_status IS NULL;

  -- 4. INSERT KE AUTH.IDENTITIES DENGAN GEN_RANDOM_UUID() & PROVIDER_ID = ID::TEXT
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  SELECT 
    gen_random_uuid(),
    u.id,
    u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email),
    'email',
    NOW(),
    NOW(),
    NOW()
  FROM auth.users u
  WHERE u.id IN (v_admin_id, v_finandita_id, v_amanda_id, v_klien_id);

  -- 5. UPSERT KE PUBLIC."Soulaide_profiles"
  INSERT INTO public."Soulaide_profiles" (id, email, full_name, phone_number, created_at, updated_at)
  VALUES
    (v_admin_id, 'admin@soulaide.id', 'Administrator Soulaide', '+6281234567890', NOW(), NOW()),
    (v_finandita_id, 'finandita@soulaide.id', 'Finandita Utari, M.Psi., Psikolog.', '+6281234567891', NOW(), NOW()),
    (v_amanda_id, 'amanda@soulaide.id', 'Amanda Natasanti, S.Psi., Psikolog.', '+6281234567892', NOW(), NOW()),
    (v_klien_id, 'klien@soulaide.id', 'Budi Pratama', '+6289876543210', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    updated_at = NOW();

  -- 6. BERIKAN ROLE SPESIFIK DI PUBLIC."Soulaide_user_roles"
  DELETE FROM public."Soulaide_user_roles"
  WHERE user_id IN (v_admin_id, v_finandita_id, v_amanda_id, v_klien_id);

  INSERT INTO public."Soulaide_user_roles" (user_id, role, created_at)
  VALUES
    (v_admin_id, 'super_admin', NOW()),
    (v_finandita_id, 'psychologist', NOW()),
    (v_amanda_id, 'psychologist', NOW()),
    (v_klien_id, 'customer', NOW());

  -- 7. HUBUNGKAN USER_ID KE DATA PSIKOLOG DI PUBLIC."Soulaide_psychologists"
  UPDATE public."Soulaide_psychologists"
  SET user_id = v_finandita_id
  WHERE slug = 'finandita-utari';

  UPDATE public."Soulaide_psychologists"
  SET user_id = v_amanda_id
  WHERE slug = 'amanda-natasanti';

END $$;

-- Verifikasi akhir
SELECT 
  u.id,
  u.email,
  p.full_name,
  r.role,
  i.provider,
  i.provider_id
FROM auth.users u
JOIN public."Soulaide_profiles" p ON u.id = p.id
JOIN public."Soulaide_user_roles" r ON u.id = r.user_id
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email IN ('admin@soulaide.id', 'finandita@soulaide.id', 'amanda@soulaide.id', 'klien@soulaide.id')
ORDER BY u.email;
