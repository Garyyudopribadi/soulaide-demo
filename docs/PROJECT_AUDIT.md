# Project Audit (Phase 0)

Laporan audit komprehensif struktur repositori, dependensi, konfigurasi, aset, dan kesiapan arsitektur awal aplikasi web Soulaide Psychology.

---

## 1. Ringkasan Eksekutif

Aplikasi web Soulaide diawali dari template dasar React 19 + Vite 8 + TypeScript (Vite template starter). Sebelum audit ini, aplikasi belum memiliki routing, styling utility (Tailwind CSS), integrasi backend Supabase, manajemen state, maupun struktur folder berbasis fitur. Seluruh dokumentasi spesifikasi dan kebutuhan telah tersedia di dalam direktori `docs/`.

---

## 2. Struktur Repositori & Package

| Item | Status Awal | Temuan / Catatan |
|---|---|---|
| **Package Manager** | `pnpm` (v11.18.0) | `node-linker` default sempat memicu isolasi symlink yang gagal me-resolve dependensi nested (`@humanfs/node` untuk ESLint dan peer `rolldown`). Diselesaikan dengan konfigurasi `.npmrc` (`node-linker=hoisted`). |
| **Framework & Compiler** | React 19.3.1 + `@vitejs/plugin-react` + `babel-plugin-react-compiler` | Menggunakan React Compiler preset terkini. |
| **Bundler & Build Tool** | Vite 8.3.8 + Rolldown | Native bundler modern dengan performa tinggi. |
| **TypeScript** | TypeScript 6.0.3 | Pengaturan `tsconfig.app.json` menggunakan `target: es2023`, `moduleResolution: bundler`, `verbatimModuleSyntax: true`. Opsi deprecated `baseUrl` dieliminasi untuk kompatibilitas TS 6+. |
| **Git Tracking** | Belum diinisialisasi `.git` di root | `.gitignore` diperbarui untuk memastikan `.env` dan file secret server tidak terekspos. |

---

## 3. Inventaris Aset Publik

Direktori `public/` telah memuat materi visual awal untuk profil psikolog dan branding:
- **Foto Profil & Card Psikolog (`public/Psikolog/`):**
  - Finandita Utari, M.Psi., Psikolog., CTC., CGA. (`Card` dan `Profile`)
  - Amanda Natasanti S. Psi., Psikolog. (`Card` dan `Profile`)
  - Filza Ayska S. S. Psi., Psikolog. (`Card` dan `Profile`)
  - Narissa Q. Ayunin S. Psi., Psikolog. (`Card` dan `Profile`)
- **Branding & Identitas:**
  - `Soulaide Psi Arc Logo.png`
  - `Soulaide.jpg`
  - `Layanan Kesehatan Mental.jpg`
  - `favicon.svg`
  - `icons.svg`

---

## 4. Analisis Konfigurasi Supabase & Environment

1. **Environment Variables:**
   - Telah tersedia `.env.example` dan `.env` yang mendefinisikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`.
   - Variabel frontend dipastikan menggunakan prefix `VITE_` (bukan `NEXT_PUBLIC_`).
   - Secret privilese tinggi (seperti `SUPABASE_SERVICE_ROLE_KEY` dan `MIDTRANS_SERVER_KEY`) dipastikan **tidak** dimasukkan ke dalam bundle frontend.
2. **Database Naming Convention:**
   - **Aturan Wajib:** Seluruh tabel custom Supabase yang akan dibuat pada Phase 2 wajib menggunakan prefix persis `Soulaide_` (misalnya `Soulaide_profiles`, `Soulaide_bookings`, dll.).

---

## 5. Kesenjangan (Gaps) & Risiko yang Diidentifikasi

| Area | Risiko / Kesenjangan | Rencana Mitigasi |
|---|---|---|
| **Routing** | Tidak ada client-side routing | Pasang `react-router-dom` dan buat layout dasar beserta route skeleton. |
| **Design System** | Belum ada utility CSS & token warna brand | Pasang Tailwind CSS v4 (`@tailwindcss/vite`) dan definisikan token warna lembut/hangat. |
| **Pengujian** | Script `pnpm test` belum ada | Pasang `vitest` dan buat unit test dasar. |
| **Strict Type Prefix** | Potensi kesalahan penamaan tabel database custom | Definisikan interface `Database` di `src/types/database.ts` dengan prefix `Soulaide_`. |
| **Pencegahan Double-Booking** | Risiko race condition slot reservasi | Disiapkan untuk eksekusi via RPC / transaksi atomik PostgreSQL pada fase berikutnya. |
| **Pemisahan Data Klinis** | Risiko kebocoran data asesmen dan rekam konseling | Akses catatan klinis dipisahkan ketat dari admin operasional umum melalui RLS. |

---

## 6. Rencana Perubahan (Action Plan)

1. **Phase 1 (Foundation):** Menyiapkan Tailwind CSS, routing, provider, utility, Supabase client, unit test, path alias `@/*`, dan skeleton folder fitur.
2. **Menunggu Approval:** Berhenti setelah Phase 1 tuntas sebelum melangkah ke Phase 2 (Database & Security).
