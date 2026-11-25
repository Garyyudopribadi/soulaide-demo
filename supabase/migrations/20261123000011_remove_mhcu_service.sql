-- Migration: 20261123000011_remove_mhcu_service.sql
-- Description: Sinkronisasi 3 layanan resmi Soulaide dengan valid RFC 4122 hex UUIDs:
-- 1. Layanan Konseling Individu (1 Sesi Konseling/60 Menit)
-- 2. Layanan MHCU (Mental Health Check Up) (Asesmen+1 Sesi Konseling/30 Menit)
-- 3. Bundling MHCU+Konseling Individu Online (Asesmen+1 Sesi Penyampaian Hasil MHCU/30 Menit+1 Sesi Konseling/60 Menit)

INSERT INTO public."Soulaide_service_categories" (id, name, slug, description)
VALUES ('c1000000-0000-0000-0000-000000000001', 'Soul Guidance', 'soul-guidance', 'Layanan bimbingan dan konseling psikologis')
ON CONFLICT (slug) DO NOTHING;

UPDATE public."Soulaide_services"
SET is_active = FALSE
WHERE slug IN ('mhcu-assessment-online', 'individual-counseling-60m-offline', 'individual-counseling-60m-online', 'bundle-mhcu-counseling-online');

INSERT INTO public."Soulaide_services" (
  id, category_id, name, slug, description, duration_minutes, delivery_methods, price_online, price_offline, is_active
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
