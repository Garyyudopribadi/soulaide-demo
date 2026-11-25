# Psychologist Dashboard Implementation (Phase 8)

## 1. Overview & Ethical Compliance

Portal Praktik Psikolog (Psychologist Dashboard) dirancang khusus untuk psikolog klinis Soulaide guna:
1. Mengelola daftar sesi konseling yang ditugaskan (*assigned bookings*) secara terisolasi.
2. Membuka room Google Meet / Zoom terenkripsi untuk sesi konseling online.
3. Mencatat dan menyimpan rekam klinis psikologis (*clinical notes*) yang dilindungi hak kerahasiaannya sesuai Kode Etik Psikologi Indonesia (HIMPSI).
4. Mengatur jadwal ketersediaan praktik mingguan berulang (Senin - Minggu) dengan penegakan otomatis aturan pemesanan 24-hour lead time (tanpa *same-day booking*).
5. Memperbarui status kehadiran (*live presence*): `offline`, `online`, `available`, `busy`, `away`.
6. Melakukan koordinasi logistik pra-sesi dengan klien melalui ruang chat terisolasi yang disertai **Disclaimer Krisis Mental Medis**.

---

## 2. Isolasi Keamanan & Prinsip Least Privilege

Sesuai standar `docs/SECURITY_AND_PRIVACY.md` dan kebijakan RLS Supabase:
- **Catatan Klinis Terisolasi:** Tabel `public."Soulaide_clinical_notes"` hanya dapat dibaca dan diedit oleh psikolog yang ditugaskan menangani booking terkait (`psychologist_id = Soulaide_get_psychologist_id(auth.uid())`) atau `super_admin` berlisensi klinis.
- **Staf Admin Umum Diblokir:** Staf administrasi umum/operasional secara tegas dilarang mengakses isi catatan observasi psikologis klien.
- **Data Klien Minimal:** Psikolog hanya menerima detail demografis dasar yang relevan untuk keselamatan sesi (Nama, No. Telepon, dan Nomor Kontak Darurat).

---

## 3. Workspace Shell & Information Architecture

Portal psikolog memakai `DashboardShell` bersama.

- Sidebar dikelompokkan menjadi **Ruang Praktik** dan **Operasional**.
- Badge sesi hari ini tampil pada menu jadwal.
- Mobile memakai drawer aksesibel dengan backdrop, Escape, dan scroll lock.
- Ringkasan menyediakan agenda hari ini, catatan tertunda, sesi mendatang, beban 7 hari,
  ringkasan ketersediaan, dan pengingat privasi.

Tab portal:

- `overview`: Beranda praktik
- `sessions`: Jadwal sesi
- `calendar`: Ketersediaan

## 4. Struktur Modul & Komponen

Implementasi berada di direktori `src/features/psychologist/`:

1. **`PsychologistDashboardPage.tsx`:**
   - Shell navigasi role-aware dengan identitas, kredensial, dan status kehadiran.
   - Ringkasan KPI harian: *Sesi Hari Ini*, *Sesi Mendatang*, *Sesi Selesai*, dan *Catatan Perlu Diisi*.
   - Tab `overview`, `sessions`, dan `calendar` tanpa tab horizontal yang padat.

2. **`PsychologistOverviewTab.tsx`:**
   - Hero sambutan dengan kontrol presence langsung.
   - Agenda hari ini dalam format timeline dengan aksi ruang sesi, catatan, dan chat.
   - Daftar catatan klinis tertunda dan sesi mendatang.
   - Grafik beban 7 hari, jam praktik aktif, dan pengingat least-privilege.

3. **`PsychologistPresenceControl.tsx`:**
   - Kontrol status kehadiran interaktif dengan indikator warna:
     - 🟢 `available`: Tersedia & bersedia menerima konsultasi/chat
     - 🟡 `busy`: Sedang dalam sesi konseling
     - 🟠 `away`: Istirahat / jeda antar sesi
     - 🔵 `online`: Aktif di sistem
     - ⚫ `offline`: Tidak aktif

4. **`PsychologistSessionsTab.tsx`:**
   - Filter sub-kategori: *Hari Ini*, *Mendatang*, *Selesai*, dan *Semua*.
   - Pencarian instan berdasarkan nama klien atau kode reservasi.
   - Kartu sesi memuat tautan langsung room video call, informasi kontak darurat klien, status pengisian catatan klinis, dan tombol aksi (*Catatan Klinis*, *Koordinasi Klien*).

5. **`PsychologistClinicalModal.tsx`:**
   - Formulir rekam klinis standar HIMPSI:
     - Ringkasan Sesi & Keluhan Utama (`session_summary`)
     - Observasi Klinis & Status Afek Klien (`clinical_observations`)
     - Intervensi Psikologis yang Diterapkan (`interventions_used`)
     - Rekomendasi & Rencana Tindak Lanjut (`recommendations`)
     - Penanda status rahasia (`is_confidential`)
   - Tombol *Tandai Sesi Selesai* (`status: 'completed'`).

6. **`PsychologistCalendarTab.tsx`:**
   - Pengaturan jam buka praktik mingguan berulang per hari (Senin s/d Minggu).
   - Pengaturan jam mulai dan jam selesai dalam zona waktu WIB.
   - Penjelasan aturan penguncian otomatis 24 jam untuk melindungi waktu persiapan psikolog.

---

## 5. Hasil Pengujian Unit

Seluruh pengujian unit pada `src/features/psychologist/psychologist.test.ts` berhasil:
- Validasi 5 status kehadiran resmi HIMPSI.
- Validasi logika jadwal jam praktik (`end_time > start_time`).
- Penegakan integritas dan kerahasiaan catatan klinis (*confidentiality by default*).
- Pemfilteran presisi jadwal sesi hari ini vs mendatang vs sesi yang memerlukan dokumentasi klinis.
- Helper bersama di `src/lib/dashboard.test.ts` menguji jendela 7 hari, penghitungan sesi per
  tanggal, label tanggal relatif, format waktu, inisial, dan kelengkapan profil.
