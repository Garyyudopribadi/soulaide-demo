# Phase 11 — Production Readiness Review & Checklist

Dokumen audit kesiapan produksi (*production readiness*) untuk platform psikologi Soulaide, mencakup verifikasi keamanan, isolasi privasi klinis, validasi RLS, checklist migrasi pembayaran Midtrans, rencana pemulihan bencana (*disaster recovery*), dan pemantauan sistem.

---

## 1. Security Review & Clinical Privacy Audit

### 1.1 Isolasi Catatan Klinis (*Clinical Notes Boundary*)
Sesuai kode etik psikologi HIMPSI dan prinsip hak istimewa terkecil (*least privilege*):
- **Struktur Tabel:** Data rekam medis dan catatan perkembangan disimpan dalam `public."Soulaide_clinical_notes"`.
- **Enforcement RLS:** 
  - Klien **tidak dapat** mengubah catatan klinis.
  - Staf operasional/Admin **STRICTLY BLOCKED** dari melihat atau melakukan query terhadap tabel `Soulaide_clinical_notes`.
  - Hanya psikolog penanggung jawab yang terdaftar dan `super_admin` (khusus audit kepatuhan klinis) yang memiliki izin akses.
- **Penyimpanan Berkas Asesmen:** Semua berkas laporan klinis wajib menggunakan Supabase Private Storage dengan akses melalui *time-limited signed URLs*.

### 1.2 Isolasi Kunci Rahasia (*Secret Zero-Leakage*)
- **Frontend Bundle Security:** Kunci rahasia seperti `MIDTRANS_SERVER_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` **TIDAK PERNAH** diberi awalan `VITE_` dan tidak dimasukkan ke dalam bundel klien Vite.
- **Edge Functions:** Seluruh proses pembayaran, pembuatan transaksi Midtrans Snap, dan penerimaan webhook dijalankan di Supabase Edge Functions yang terisolasi secara server-authoritative.
- **Verifikasi Kriptografis Webhook:** Menggunakan algoritma SHA-512 berbasis Web Crypto API standar untuk memvalidasi `signature_key = SHA-512(order_id + status_code + gross_amount + server_key)`.

---

## 2. RLS & Role Hierarchy Matrix

| Peran (*Role*) | Akses Booking | Akses Pembayaran & Refund | Profil Klien & Darurat | Catatan Klinis (*Clinical Notes*) | Manajemen Peran Staf |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Anonymous (Publik)** | Baca Layanan/Psikolog | ❌ | ❌ | ❌ | ❌ |
| **Customer** | Sesi Milik Sendiri | Riwayat Milik Sendiri | Profil & Kontak Darurat Sendiri | ❌ | ❌ |
| **Psychologist** | Sesi yang Ditugaskan | ❌ | Kontak Darurat Klien Sesi | Sesi yang Ditugaskan | ❌ |
| **Admin (Operasional)** | Seluruh Booking | Verifikasi & Refund | Informasi Kontak Saja | ❌ **(Dilarang Keras)** | ❌ |
| **Super Admin** | Seluruh Booking | Penuh | Penuh | Audit HIMPSI Terbatas | Penuh |

---

## 3. Checklist Transisi Midtrans: Sandbox ke Produksi

Sebelum beralih dari Sandbox (`app.sandbox.midtrans.com`) ke Lingkungan Produksi (`app.midtrans.com`), pastikan seluruh langkah berikut telah diverifikasi:

- [ ] **Akun Bisnis Midtrans:** Akun bisnis terverifikasi resmi atas nama badan usaha Soulaide dengan KYC disetujui.
- [ ] **Kunci API Produksi:**
  - `Production Client Key` dimasukkan ke variabel lingkungan `VITE_MIDTRANS_CLIENT_KEY` di platform hosting frontend (Vercel).
  - `Production Server Key` dimasukkan secara aman ke Supabase Edge Functions Secrets menggunakan `supabase secrets set MIDTRANS_SERVER_KEY=...`.
- [ ] **Mode Produksi Diaktifkan:**
  - `VITE_MIDTRANS_IS_PRODUCTION=true`.
  - Snap script loader memuat `https://app.midtrans.com/snap/snap.js` (bukan `app.sandbox.midtrans.com`).
- [ ] **Registrasi Webhook URL:**
  - Masukkan URL webhook produksi pada dashboard Midtrans (Menu *Settings > Configuration > Payment Notification URL*):
    `https://[project-ref].supabase.co/functions/v1/midtrans-webhook`
- [ ] **Verifikasi Saluran Pembayaran Aktif:**
  - Konfirmasi aktivasi kanal pembayaran di dashboard Midtrans (BCA Virtual Account, Mandiri Bill, BNI/BRI VA, QRIS/GoPay, Kartu Kredit).
- [ ] **Uji Transaksi Real (Smoke Test):**
  - Lakukan 1 transaksi uji coba bernilai kecil (misal Rp 10.000) menggunakan akun bank riil untuk memastikan verifikasi SHA-512 dan update status `Soulaide_bookings` serta `Soulaide_payments` berhasil 100%.

---

## 4. Performance & Accessibility Review

### 4.1 Bundle & Code Splitting
- **Vite & Rolldown Minification:** Seluruh aset CSS dan JS terkompresi dengan Gzip/Brotli.
- **React 19 Safe Architecture:** Pemuatan asinkron dengan TanStack React Query mencegah re-render siklikal atau efek samping `setState-in-effect`.
- **Lazy Loading Asset:** Komponen modal koordinasi sesi, snap checkout, dan modal eskalasi krisis hanya dirender ketika dibutuhkan.

### 4.2 Standar Aksesibilitas (WCAG 2.1 AA)
- Rasio kontras warna teks terhadap latar belakang memenuhi standar WCAG (rasio minimal 4.5:1 untuk teks normal).
- Label formulir, tombol aksi, dan indikator kehadiran memiliki teks semantik yang jelas untuk pembaca layar (*screen readers*).
- Seluruh elemen interaktif dapat diakses melalui navigasi keyboard (fokus visual ring terlihat jelas).

---

## 5. Rencana Cadangan & Pemulihan Data (*Backup & Disaster Recovery*)

### 5.1 Mekanisme Pencadangan Otomatis Supabase
- **Continuous Archiving / Point-In-Time Recovery (PITR):** Supabase mengarsipkan Write-Ahead Logs (WAL) secara berkelanjutan, memungkinkan pemulihan basis data ke detik mana pun dalam 7 hingga 30 hari terakhir.
- **Cadangan Harian (*Daily Snapshot*):** Snapshot basis data dibuat otomatis setiap 24 jam dan disimpan di lokasi penyimpanan terenkripsi yang terpisah secara geografis.

### 5.2 Target Pemulihan (*Recovery Objectives*)
- **RTO (*Recovery Time Objective*):** < 2 Jam untuk mengembalikan aplikasi ke kondisi operasional penuh.
- **RPO (*Recovery Point Objective*):** < 5 Menit data hilang berkat WAL continuous archiving.

### 5.3 Prosedur Ekspor Rutin Mandiri
Jalankan pencadangan terenkripsi berkala menggunakan CLI:
```bash
# Ekspor skema dan data tabel Soulaide
supabase db dump --data-only -f soulaide_backup_$(date +%Y%m%d).sql
```

---

## 6. Pemantauan & Penanganan Galat (*Monitoring & Error Handling*)

- **React ErrorBoundary:** Komponen [ErrorBoundary.tsx](file:///F:/Garyudo.my.id/soulaide-webapp/src/components/shared/ErrorBoundary.tsx) mengisolasi galat tak terduga pada antarmuka klien dan menyediakan navigasi pemulihan tanpa mengekspos data medis.
- **Audit Logging Berkelanjutan:** Setiap perubahan status jadwal booking, pengembalian dana (*refund*), pembaruan peran staf, dan pengubahan kehadiran psikolog dicatat ke tabel `public."Soulaide_audit_logs"`.
- **Edge Function Logs:** Log eksekusi `create-payment` dan `midtrans-webhook` dapat dipantau langsung melalui Supabase Dashboard (*Edge Functions > Invocations / Logs*).
