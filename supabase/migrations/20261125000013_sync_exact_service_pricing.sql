-- ==============================================================================
-- Migration: 20261125000013_sync_exact_service_pricing.sql
-- Description: Memastikan harga seluruh layanan di database Supabase sinkron 100%
-- dengan data landing page dan halaman booking Soulaide.
-- ==============================================================================

-- 1. Pastikan kategori Soul Guidance tersedia
INSERT INTO public."Soulaide_service_categories" (id, name, slug, description)
VALUES ('c1000000-0000-0000-0000-000000000001', 'Soul Guidance', 'soul-guidance', 'Layanan bimbingan dan konseling psikologis')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. Nonaktifkan layanan lama yang usang agar tidak terbaca
UPDATE public."Soulaide_services"
SET is_active = FALSE
WHERE slug IN (
  'mhcu-assessment-online',
  'individual-counseling-60m-offline',
  'individual-counseling-60m-online',
  'bundle-mhcu-counseling-online'
);

-- 3. Upsert data tarif resmi 3 Layanan Utama Soulaide
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
  is_active,
  updated_at
) VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Individual Counseling',
    'individual-counseling',
    'Sesi konseling 1-on-1 dengan psikolog profesional untuk mengeksplorasi tantangan emosional, stres, quarter-life, atau relasi.',
    60,
    ARRAY['online', 'offline'],
    1000,
    1000,
    TRUE,
    NOW()
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
    TRUE,
    NOW()
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
    TRUE,
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  delivery_methods = EXCLUDED.delivery_methods,
  price_online = EXCLUDED.price_online,
  price_offline = EXCLUDED.price_offline,
  is_active = TRUE,
  updated_at = NOW();

-- 4. Sinkronisasi fitur layanan ke Soulaide_site_settings
INSERT INTO public."Soulaide_site_settings" (key, value)
VALUES (
  'service_features_catalog',
  '{
    "e1000000-0000-0000-0000-000000000001": [
      "Sesi konseling 1-on-1 (60 menit)",
      "Online (Google Meet) - Voice Call / Video Call",
      "Offline / Tatap Muka (Pondok Bambu) - By Appointment"
    ],
    "e2000000-0000-0000-0000-000000000002": [
      "Asesmen kondisi psikologis terstruktur",
      "Sesi pembahasan awal (30 menit)",
      "Laporan analisis klinis dalam 2 minggu"
    ],
    "e3000000-0000-0000-0000-000000000003": [
      "Asesmen MHCU komprehensif",
      "Sesi penyampaian hasil (30 menit)",
      "Sesi konseling individu daring (60 menit)"
    ]
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
