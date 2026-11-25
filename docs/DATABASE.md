# Supabase Database Design

## 1. Mandatory table prefix

**WAJIB: setiap custom table yang dibuat untuk aplikasi Soulaide harus diawali persis dengan `Soulaide_`.**

Contoh:
- `Soulaide_profiles`
- `Soulaide_user_roles`
- `Soulaide_psychologists`
- `Soulaide_services`
- `Soulaide_bookings`
- `Soulaide_payments`
- `Soulaide_messages`
- `Soulaide_audit_logs`

Gunakan lowercase snake_case setelah prefix. Prefix harus tetap `Soulaide_` dengan huruf S kapital.

## 2. PostgreSQL case sensitivity

Karena prefix mengandung huruf kapital, selalu gunakan double quotes pada identifier SQL.

```sql
CREATE TABLE public."Soulaide_profiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Query Supabase harus menggunakan nama tabel persis:

```ts
const { data, error } = await supabase
  .from("Soulaide_profiles")
  .select("*");
```

Jangan menulis identifier tersebut tanpa quotes dalam SQL, karena PostgreSQL akan melipat identifier tidak ber-quote menjadi lowercase.

## 3. Scope aturan

Prefix berlaku untuk:
- Semua custom tables.
- Foreign key references.
- Indexes, triggers, policies, seed scripts, migrations, dan query aplikasi harus merujuk ke nama tabel persis.
- Dokumentasi schema dan diagram.

Prefix tidak berlaku untuk schema dan tabel internal milik Supabase/PostgreSQL. Jangan rename atau memodifikasi objek sistem.

## 4. Proposed table inventory

Daftar berikut adalah rancangan awal. Review kebutuhan dan relasi sebelum membuat migration.

### Identity and roles
- `Soulaide_profiles`
- `Soulaide_user_roles`
- `Soulaide_staff_members`

### Psychologists and services
- `Soulaide_psychologists`
- `Soulaide_service_categories`
- `Soulaide_services`
- `Soulaide_service_prices`
- `Soulaide_service_psychologists`

### Scheduling and booking
- `Soulaide_psychologist_schedules`
- `Soulaide_availability_overrides`
- `Soulaide_appointment_slots` (gunakan hanya jika model slot materialized memang dipilih)
- `Soulaide_bookings`
- `Soulaide_booking_status_history`
- `Soulaide_reschedule_requests`

### Customer intake and consent
- `Soulaide_client_profiles`
- `Soulaide_assessments`
- `Soulaide_emergency_contacts`
- `Soulaide_consent_templates`
- `Soulaide_consent_records`

### Clinical records
- `Soulaide_clinical_notes`
- `Soulaide_clinical_reports`

Akses klinis harus sangat terbatas dan terpisah dari akses operasional.

### Payments
- `Soulaide_payments`
- `Soulaide_payment_transactions`
- `Soulaide_payment_webhook_events`
- `Soulaide_refunds`

### Chat and notifications
- `Soulaide_conversations`
- `Soulaide_conversation_participants`
- `Soulaide_messages`
- `Soulaide_psychologist_presence`
- `Soulaide_notifications`

### CMS and audit
- `Soulaide_cms_pages`
- `Soulaide_faqs`
- `Soulaide_articles`
- `Soulaide_site_settings`
- `Soulaide_audit_logs`

## 5. Database design requirements

- Gunakan UUID untuk primary key kecuali ada alasan teknis kuat.
- Tambahkan `created_at` dan `updated_at` untuk entitas yang perlu dilacak.
- Gunakan `TIMESTAMPTZ` untuk waktu; interpretasikan jadwal operasional dalam `Asia/Jakarta`.
- Tambahkan foreign key, unique constraints, check constraints, dan index sesuai pola query.
- Gunakan enum atau constrained text secara konsisten untuk status.
- Simpan uang dalam integer satuan terkecil yang sesuai (untuk IDR umumnya rupiah integer), bukan floating point.
- Pisahkan booking status dan payment status.
- Gunakan unique constraint/locking atau transaksi atomik untuk mencegah double booking.
- Webhook event harus idempotent.
- Hindari menyimpan data sensitif yang tidak diperlukan.

## 6. RLS and policy requirements

- Aktifkan RLS untuk semua tabel yang terekspos melalui API.
- Customer hanya dapat membaca/mengubah data miliknya sesuai aturan.
- Psikolog hanya dapat mengakses booking dan data klien yang ditugaskan.
- Admin hanya memperoleh akses sesuai role dan lingkup tugas.
- Catatan klinis dan asesmen memerlukan policy terpisah yang ketat.
- Jangan mengandalkan route guard frontend sebagai pengganti RLS.

## 7. Migration checklist

Sebelum merge migration:
1. Pastikan semua custom table memiliki prefix `Soulaide_`.
2. Pastikan semua identifier dengan huruf kapital di-quote.
3. Verifikasi foreign keys dan index.
4. Verifikasi RLS dan grants.
5. Uji akses sebagai anon, customer, psychologist, admin, dan super admin.
6. Pastikan migration rollback/recovery dipahami.
7. Periksa tidak ada secret atau data pribadi di seed.
8. Update dokumen schema.

## 8. Naming examples

```sql
CREATE INDEX "Soulaide_bookings_customer_id_idx"
ON public."Soulaide_bookings" (customer_id);

ALTER TABLE public."Soulaide_bookings"
ADD CONSTRAINT "Soulaide_bookings_customer_id_fkey"
FOREIGN KEY (customer_id)
REFERENCES public."Soulaide_profiles"(id);
```

Nama index/constraint juga sebaiknya menyertakan prefix untuk konsistensi, meskipun aturan wajib `Soulaide_` secara utama ditujukan pada custom table.
