-- Migration: 20261125000012_fix_service_uuids.sql
-- Description: Menyelaraskan ID dan kategori layanan konseling ke format UUID RFC 4122 hexadecimal yang valid.

-- 1. Ensure the default category exists
INSERT INTO public."Soulaide_service_categories" (id, name, slug, description)
VALUES ('c1000000-0000-0000-0000-000000000001', 'Soul Guidance', 'soul-guidance', 'Layanan bimbingan dan konseling psikologis')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. Upsert canonical services with hex UUIDs
INSERT INTO public."Soulaide_services" (
  id,
  category_id,
  name,
  slug,
  description,
  duration_minutes,
  delivery_methods,
  price_online,
  price_offline,
  is_active
) VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Layanan Konseling Individu',
    'individual-counseling',
    'Sesi konseling 1-on-1 selama 60 menit bersama psikolog profesional untuk memahami pikiran, emosi, stres, quarter-life crisis, karier, maupun dinamika relasi.',
    60,
    ARRAY['online', 'offline'],
    110000,
    350000,
    TRUE
  ),
  (
    'e2000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Layanan MHCU (Mental Health Check Up)',
    'mhcu',
    'Pemeriksaan kesehatan mental terstruktur dilengkapi 1 sesi konseling pembahasan awal selama 30 menit untuk memahami kondisi emosional, tingkat stres, serta rekomendasi awal.',
    30,
    ARRAY['online', 'offline'],
    89000,
    200000,
    TRUE
  ),
  (
    'e3000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'Bundling MHCU+Konseling Individu Online',
    'bundle-packet',
    'Paket terintegrasi terbaik: asesmen MHCU menyeluruh, 1 sesi penyampaian hasil MHCU (30 menit), dan 1 sesi konseling individu mendalam (60 menit) secara online.',
    90,
    ARRAY['online'],
    169000,
    NULL,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  delivery_methods = EXCLUDED.delivery_methods,
  price_online = EXCLUDED.price_online,
  price_offline = EXCLUDED.price_offline,
  is_active = TRUE;
