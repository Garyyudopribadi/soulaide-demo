# Database & Security Implementation (Phase 2)

Dokumentasi implementasi skema database PostgreSQL, pencegahan double-booking atomik, Row Level Security (RLS), dan seed data untuk platform psikologi Soulaide.

---

## 1. Aturan Wajib Penamaan Tabel

**MANDATORY RULE:** Setiap custom table yang dibuat untuk aplikasi Soulaide diawali dengan persis `Soulaide_` dan diapit tanda kutip ganda (`public."Soulaide_..."`) pada SQL untuk mencegah PostgreSQL melakukan lowercasing otomatis.

### Inventaris Tabel Terdaftar:
1. `public."Soulaide_profiles"`
2. `public."Soulaide_user_roles"`
3. `public."Soulaide_staff_members"`
4. `public."Soulaide_psychologists"`
5. `public."Soulaide_service_categories"`
6. `public."Soulaide_services"`
7. `public."Soulaide_service_psychologists"`
8. `public."Soulaide_psychologist_schedules"`
9. `public."Soulaide_availability_overrides"`
10. `public."Soulaide_bookings"`
11. `public."Soulaide_booking_status_history"`
12. `public."Soulaide_reschedule_requests"`
13. `public."Soulaide_client_profiles"`
14. `public."Soulaide_assessments"`
15. `public."Soulaide_consent_records"`
16. `public."Soulaide_clinical_notes"`
17. `public."Soulaide_clinical_reports"`
18. `public."Soulaide_payments"`
19. `public."Soulaide_payment_webhook_events"`
20. `public."Soulaide_refunds"`
21. `public."Soulaide_conversations"`
22. `public."Soulaide_conversation_participants"`
23. `public."Soulaide_messages"`
24. `public."Soulaide_psychologist_presence"`
25. `public."Soulaide_notifications"`
26. `public."Soulaide_cms_pages"`
27. `public."Soulaide_faqs"`
28. `public."Soulaide_site_settings"`
29. `public."Soulaide_audit_logs"`

---

## 2. Struktur Berkas Migrasi

Berkas migrasi diletakkan di `supabase/migrations/`:
- **`20261122000001_create_soulaide_tables.sql`**: Definisi DDL seluruh tabel `Soulaide_`, foreign keys, tipe data, check constraints, dan index.
- **`20261122000002_create_soulaide_functions_and_atomic_booking.sql`**:
  - `Soulaide_get_user_role(UUID)`
  - `Soulaide_is_admin(UUID)`
  - `Soulaide_is_psychologist(UUID)`
  - `Soulaide_get_psychologist_id(UUID)`
  - `Soulaide_reserve_slot_atomic(...)`: RPC reservasi atomik dengan advisory lock & validasi lead time.
  - `Soulaide_handle_updated_at()`: Trigger otomatis pembaruan kolom `updated_at`.
- **`20261122000003_create_soulaide_rls_policies.sql`**: RLS policies untuk semua tabel.
- **`supabase/seed/seed.sql`**: Data seed non-sensitif kategori, 4 psikolog awal, layanan terkonfirmasi, pengaturan situs, dan FAQ.

---

## 3. Pencegahan Double-Booking (Atomic Slot Reservation)

Pencegahan tabrakan jadwal diimplementasikan dengan dua lapis perlindungan:
1. **Unique Partial Index:**
   ```sql
   CREATE UNIQUE INDEX "Soulaide_bookings_no_overlap_idx"
   ON public."Soulaide_bookings" (psychologist_id, session_date, session_start_time)
   WHERE status IN ('pending_payment', 'confirmed', 'reschedule_requested', 'rescheduled');
   ```
2. **Database Function / RPC (`Soulaide_reserve_slot_atomic`):**
   - Mengambil exclusive transaction-level lock (`pg_advisory_xact_lock`) pada kombinasi psikolog dan tanggal sesi.
   - Memvalidasi lead time minimal 24 jam sebelum waktu mulai sesi.
   - Memeriksa overlap durasi sesi dengan booking aktif lainnya.
   - Menghasilkan kode booking unik dan mencatat riwayat status pertama secara atomik.

---

## 4. Perlindungan Privasi Klinis (Clinical Privacy Boundary)

Data catatan konseling pada `Soulaide_clinical_notes` memiliki RLS yang sangat ketat:
- **Hanya psikolog yang ditugaskan** pada sesi tersebut yang memiliki akses baca dan tulis (`psychologist_id = Soulaide_get_psychologist_id(auth.uid())`).
- **Super Admin** klinis dapat memiliki akses audit darurat bila diotorisasi.
- **Admin operasional umum TIDAK memiliki akses** membaca isi rekam konseling atau observasi klinis klien.

---

## 5. Cara Menjalankan Migrasi

Jika menggunakan Supabase Dashboard:
1. Buka project Anda di [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke **SQL Editor**.
3. Jalankan `supabase/migrations/20261122000001_create_soulaide_tables.sql`.
4. Jalankan `supabase/migrations/20261122000002_create_soulaide_functions_and_atomic_booking.sql`.
5. Jalankan `supabase/migrations/20261122000003_create_soulaide_rls_policies.sql`.
6. Jalankan `supabase/seed/seed.sql`.
