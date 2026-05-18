-- ============================================================
-- Seed local — usuario admin de desarrollo
-- ⚠️  LOCAL DEV ONLY — nunca ejecutar en producción.
--    Aplicar solo via: supabase db reset
-- Email: admin@wc26.local
-- ============================================================

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'admin@wc26.local',
  crypt('admin1234', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"Admin"}'::jsonb,
  now(),
  now()
);

-- El trigger handle_new_user ya crea el profile; solo marcamos is_admin
update public.profiles
set is_admin = true
where id = '00000000-0000-0000-0000-000000000001'::uuid;
