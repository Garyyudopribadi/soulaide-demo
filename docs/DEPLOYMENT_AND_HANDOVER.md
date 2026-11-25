# Deployment & Handover Guide

Panduan resmi penyebaran (*deployment*), inisialisasi lingkungan baru, dan serah terima teknis (*technical handover*) platform psikologi Soulaide.

---

## 1. Prasyarat Lingkungan (*Prerequisites*)

1. **Node.js & Manajer Paket:**
   - Node.js versi 20 LTS atau lebih baru.
   - `pnpm` versi 9.x atau lebih baru (`corepack enable pnpm`).
2. **Akun Layanan Eksternal:**
   - Akun Supabase (Organisasi & Proyek Baru).
   - Akun Bisnis Midtrans (Sandbox & Production).
   - Akun Vercel atau Cloudflare Pages (untuk hosting frontend).
   - Nomor WhatsApp Bisnis resmi terverifikasi (`+6289630869804`).

---

## 2. Inisialisasi Basis Data Supabase

Setiap tabel kustom dalam platform Soulaide wajib menggunakan awalan `Soulaide_`. Seluruh migrasi telah disusun secara urut di folder `supabase/migrations/`:

```bash
# 1. Hubungkan Supabase CLI ke proyek Anda
supabase login
supabase link --project-ref [YOUR_SUPABASE_PROJECT_REF]

# 2. Jalankan seluruh migrasi database (Phase 2 s/d Phase 10)
supabase db push

# Atau jalankan file migrasi secara berurutan di SQL Editor Dashboard:
# 20261122000001_create_soulaide_tables.sql
# 20261122000002_create_soulaide_atomic_booking_function.sql
# 20261122000003_create_soulaide_rls_policies.sql
# 20261122000004_create_soulaide_auth_triggers.sql
# 20261122000005_create_soulaide_payments_policies.sql
# 20261122000006_create_soulaide_psychologist_policies.sql
# 20261122000007_create_soulaide_admin_policies.sql
# 20261122000008_create_soulaide_communications_policies.sql
# 20261122000009_seed_initial_data.sql
```

---

## 3. Konfigurasi Rahasia Supabase Edge Functions

Jalankan perintah berikut untuk menyetel kunci rahasia pada Edge Functions:

```bash
supabase secrets set MIDTRANS_SERVER_KEY="[YOUR_MIDTRANS_SERVER_KEY]"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="[YOUR_SUPABASE_SERVICE_ROLE_KEY]"
supabase secrets set MIDTRANS_IS_PRODUCTION="true" # atau false untuk sandbox
```

Deploy kedua Edge Functions:
```bash
supabase functions deploy create-payment --no-verify-jwt
supabase functions deploy midtrans-webhook --no-verify-jwt
```

---

## 4. Konfigurasi Deployment Frontend (Vercel)

1. Impor repositori Git ke akun Vercel.
2. Konfigurasikan variabel lingkungan (*Environment Variables*) di dashboard Vercel:

| Nama Variabel | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL endpoint API Supabase | `https://xyz.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Anon Key Supabase | `eyJhbGciOi...` |
| `VITE_APP_NAME` | Nama identitas platform | `Soulaide` |
| `VITE_WHATSAPP_NUMBER` | Nomor bantuan resmi | `+6289630869804` |
| `VITE_MIDTRANS_CLIENT_KEY` | Client Key Midtrans | `Mid-client-xxxxxxxx` |
| `VITE_MIDTRANS_IS_PRODUCTION` | Flag mode produksi | `true` |

3. Pengaturan Build & Output:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

---

## 5. Prosedur Serah Terima Operasional (*Operational Handover*)

### 5.1 Akun Super Admin Pertama
Setelah migrasi basis data dijalankan, daftarkan akun baru melalui halaman pendaftaran (`/register`). Selanjutnya, berikan peran `super_admin` pada tabel `Soulaide_user_roles`:
```sql
INSERT INTO public."Soulaide_user_roles" (user_id, role)
VALUES ('[UUID_PENGGUNA_DARI_AUTH_USERS]', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

### 5.2 Pengelolaan Jam Praktik & Psikolog
- Akses dasbor Admin di `/admin` untuk memverifikasi profil psikolog berlisensi HIMPSI dan jadwal kerja mingguan.
- Informasi lokasi tatap muka terkonfirmasi: **Pondok Bambu, Duren Sawit, Jakarta Timur**.
- Seluruh sesi tatap muka (*offline*) wajib dipesan minimal 24 jam sebelumnya melalui platform.

### 5.3 Dukungan Darurat Krisis
Pastikan seluruh staf operasional memahami bahwa fitur live chat dan pesan WhatsApp **bukan penanganan gawat darurat mental**. Apabila mendeteksi klien dalam bahaya cedera diri, arahkan segera ke:
- **Hotline Kemenkes RI:** 119 ext. 8
- **Sejiwa (HIMPSI):** 119 ext. 8
- **IGD Rumah Sakit Terdekat**
