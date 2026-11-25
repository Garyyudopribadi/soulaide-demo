-- ==============================================================================
-- SOULAIDE PSYCHOLOGY PLATFORM - SEED DATA
-- Seed: seed.sql (Non-sensitive initial content & verified data)
-- ==============================================================================

-- 1. SERVICE CATEGORIES
INSERT INTO public."Soulaide_service_categories" (id, name, slug, description)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Soul Guidance', 'soul-guidance', 'Layanan pendampingan dan konseling umum bersama psikolog berlisensi.'),
  ('c2000000-0000-0000-0000-000000000002', 'Soul Expert', 'soul-expert', 'Layanan spesialis dan intervensi tingkat lanjut bersama psikolog senior.')
ON CONFLICT (name) DO NOTHING;

-- 2. CONFIRMED SERVICES
INSERT INTO public."Soulaide_services" (
  id, category_id, name, slug, description, duration_minutes, delivery_methods, price_online, price_offline, is_active
) VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Individual Counseling 60 Menit (Online)',
    'individual-counseling-60m-online',
    'Sesi konseling 1-on-1 dengan psikolog profesional untuk mengeksplorasi tantangan emosional, stres, quarter-life, atau relasi.',
    60,
    ARRAY['online'],
    110000,
    NULL,
    TRUE
  ),
  (
    'e2000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'MHCU Assessment (Online)',
    'mhcu-assessment-online',
    'Pemeriksaan status kesehatan mental menyeluruh untuk memahami kondisi emosional dan psikologis secara objektif.',
    45,
    ARRAY['online'],
    89000,
    NULL,
    TRUE
  ),
  (
    'e3000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'Bundle MHCU + Sesi Hasil 30m + Konseling 60m (Online)',
    'bundle-mhcu-counseling-online',
    'Paket terlengkap: asesmen MHCU, sesi pembahasan hasil selama 30 menit, dan 1 sesi konseling individual 60 menit.',
    90,
    ARRAY['online'],
    169000,
    NULL,
    TRUE
  ),
  (
    'e4000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    'Individual Counseling 60 Menit (Offline)',
    'individual-counseling-60m-offline',
    'Sesi konseling tatap muka langsung di ruang konseling yang nyaman di Pondok Bambu, Jakarta Timur.',
    60,
    ARRAY['offline'],
    NULL,
    350000,
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. INITIAL PSYCHOLOGISTS
INSERT INTO public."Soulaide_psychologists" (
  id, slug, full_name, credentials, bio, experience_years, initial_schedule, practice_areas, approaches, card_image_url, profile_image_url, is_active
) VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'finandita-utari',
    'Finandita Utari',
    'M.Psi., Psikolog., CTC., CGA.',
    'Psikolog senior dengan pengalaman lebih dari 10 tahun mendampingi keluarga, pendidikan, dan pasangan.',
    '> 10 tahun',
    'Senin – Sabtu, by appointment',
    ARRAY['Pendidikan', 'Inklusi', 'Parenting', 'Pernikahan/Pasangan/Keluarga'],
    ARRAY['ABA', 'CBT'],
    '/Psikolog/Card - Finandita Utari, M.Psi., Psikolog., CTC., CGA.webp',
    '/Psikolog/Profile - Finandita Utari, M.Psi., Psikolog., CTC., CGA.webp',
    TRUE
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'amanda-natasanti',
    'Amanda Natasanti',
    'S.Psi., Psikolog.',
    'Psikolog muda yang berfokus pada dinamika quarter-life crisis, stres kerja, dan kecemasan.',
    '< 2 tahun',
    'Selasa/Rabu 19.30–21.30; Sabtu/Minggu by appointment',
    ARRAY['Stres', 'Kecemasan', 'Overthinking', 'Quarter-Life', 'Karier', 'Relasi', 'Burnout'],
    ARRAY['CBT', 'Humanistic', 'SFBT'],
    '/Psikolog/Card - Amanda Natasanti S. Psi., Psikolog.webp',
    '/Psikolog/Profile - Amanda Natasanti S. Psi., Psikolog.webp',
    TRUE
  ),
  (
    'b3000000-0000-0000-0000-000000000003',
    'filza-ayska-syabina',
    'Filza Ayska Syabina',
    'S.Psi., Psikolog.',
    'Psikolog yang mendampingi pengembangan diri, relasi interpersonal, dan manajemen stres profesional.',
    '< 2 tahun',
    'Selasa – Jumat, by appointment',
    ARRAY['Burnout', 'Lingkungan Kerja', 'Pengembangan Diri', 'Quarter-Life', 'Stres', 'Kecemasan', 'Konflik Interpersonal'],
    ARRAY['CBT', 'Humanistic', 'SFBT'],
    '/Psikolog/Card - Filza Ayska S. S. Psi., Psikolog.webp',
    '/Psikolog/Profile - Filza Ayska S. S. Psi., Psikolog.webp',
    TRUE
  ),
  (
    'b4000000-0000-0000-0000-000000000004',
    'narissa-qurrata-ayunin',
    'Narissa Qurrata Ayunin',
    'S.Psi., Psikolog.',
    'Psikolog yang berfokus pada adaptasi emosi, regulasi diri, neurodiversity, dan penerimaan diri.',
    '< 2 tahun',
    'Kamis/Jumat 18.30–21.30; Sabtu/Minggu by appointment',
    ARRAY['Adaptasi', 'Neurodiversity', 'Kecemasan', 'Regulasi Emosi', 'Overthinking', 'Caregiver Burnout', 'Relasi', 'Self-Acceptance'],
    ARRAY['CBT', 'Humanistic', 'SFBT'],
    '/Psikolog/Card - Narissa Q. Ayunin S. Psi., Psikolog.webp',
    '/Psikolog/Profile - Narissa Q. Ayunin S. Psi., Psikolog.webp',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. LINK ALL PSYCHOLOGISTS TO SERVICES
INSERT INTO public."Soulaide_service_psychologists" (service_id, psychologist_id)
SELECT s.id, p.id
FROM public."Soulaide_services" s
CROSS JOIN public."Soulaide_psychologists" p
ON CONFLICT DO NOTHING;

-- 5. INITIAL PRESENCE RECORDS
INSERT INTO public."Soulaide_psychologist_presence" (psychologist_id, status, last_active_at)
SELECT id, 'available', NOW()
FROM public."Soulaide_psychologists"
ON CONFLICT (psychologist_id) DO NOTHING;

-- 6. SITE SETTINGS
INSERT INTO public."Soulaide_site_settings" (key, value)
VALUES
  ('general', '{"brand_name": "Soulaide", "tagline": "Ruang Aman untuk Kesehatan Mental Anda"}'::jsonb),
  ('whatsapp', '{"phone_number": "+6289630869804", "default_message": "Halo Soulaide, saya ingin bertanya mengenai layanan dan proses booking konseling."}'::jsonb),
  ('booking_policy', '{"minimum_lead_time_hours": 24, "max_reschedule_count": 1, "reschedule_lead_time_hours": 8, "late_tolerance_minutes": 5, "max_wait_time_minutes": 10}'::jsonb),
  ('offline_location', '{"city": "Jakarta Timur", "subdistrict": "Pondok Bambu", "province": "DKI Jakarta", "country": "Indonesia"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 7. INITIAL FAQS
INSERT INTO public."Soulaide_faqs" (question, answer, category, display_order, is_active)
VALUES
  (
    'Bagaimana cara melakukan booking konseling?',
    'Pilih layanan yang diinginkan, tentukan psikolog dan tanggal/jam yang sesuai, lalu lakukan konfirmasi dan pembayaran online melalui sistem kami.',
    'booking',
    1,
    TRUE
  ),
  (
    'Berapa lama batas waktu reservasi sebelum sesi (lead time)?',
    'Pemesanan sesi membutuhkan lead time minimal 24 jam sebelum sesi berlangsung untuk memastikan psikolog telah mempersiapkan sesi dengan baik.',
    'booking',
    2,
    TRUE
  ),
  (
    'Apakah data konseling saya dijamin aman dan rahasia?',
    'Ya. Seluruh data asesmen dan informasi konseling dilindungi dengan standar kerahasiaan medis psikologis dan kontrol otorisasi ketat.',
    'privacy',
    3,
    TRUE
  ),
  (
    'Bagaimana jika saya perlu mereschedule sesi?',
    'Permintaan perubahan jadwal (reschedule) dapat diajukan minimal 8 jam sebelum sesi berlangsung melalui dashboard klien, dengan batas maksimal 1 kali reschedule.',
    'reschedule',
    4,
    TRUE
  )
ON CONFLICT DO NOTHING;
