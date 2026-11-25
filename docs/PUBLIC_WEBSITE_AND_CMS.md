# Public Website and CMS Implementation (Phase 4)

Dokumentasi implementasi antarmuka publik, katalog layanan, profil psikolog, pusat bantuan FAQ, Click-to-Chat WhatsApp, dan modul CMS Admin untuk platform psikologi Soulaide.

---

## 1. Antarmuka Publik (Public Website)

### 1.1 Beranda (Landing Page - `/`)
- **Hero Banner & Call-to-Action:** Judul menarik dengan penekanan pada rasa aman dan privasi, tombol pemesanan langsung (*Booking Sesi*), serta pengenalan profil psikolog.
- **Crisis & Emergency Alert:** Banner peringatan darurat yang menegaskan bahwa chat/layanan ini bukan untuk kegawatdaruratan mental, dilengkapi tombol panggilan langsung ke Hotline Kesehatan Jiwa (119 ext 8).
- **Pilar Nilai Utama:** Menyoroti legalitas psikolog berlisensi, keamanan data medis, dan fleksibilitas sesi (online/offline).
- **Showcase Psikolog & Layanan:** Cuplikan profil 4 psikolog dengan indikator kehadiran (*presence*) dan 4 layanan terkonfirmasi.

### 1.2 Katalog Layanan (`/services`)
- **Penyaringan Metode Sesi:** Tab filter untuk melihat semua metode, sesi online (Zoom/Voice Call), atau sesi tatap muka langsung (Pondok Bambu, Jakarta Timur).
- **Penjelasan Asesmen MHCU:** Pemberitahuan resmi bahwa laporan hasil asesmen MHCU memerlukan waktu analisis klinis hingga **2 minggu** setelah rangkaian sesi selesai.
- **Transparansi Tarif:**
  - Individual Counseling 60m (Online): Rp110.000
  - MHCU Assessment (Online): Rp89.000
  - Bundle MHCU + Sesi Hasil 30m + Konseling 60m (Online): Rp169.000
  - Individual Counseling 60m (Offline): Rp350.000

### 1.3 Tim Psikolog & Detail Profil (`/psychologists` & `/psychologists/:id`)
- **Pencarian & Filter Interaktif:** Filter cepat berdasarkan topik masalah (Parenting, Stres, Kecemasan, Quarter-Life, Burnout, Relasi, dll.) serta input pencarian nama dan pendekatan (CBT, SFBT, ABA, Humanistic).
- **Indikator Kehadiran (*Presence*):** Lencana status sesi aktual (*Tersedia Sesi*, *Online*, *Sedang Sesi*, *Offline*).
- **Halaman Detail Psikolog:** Memuat kredensial lengkap, biografi profesional, pola jadwal praktik rutin, pendekatan terapi, dan tombol reservasi yang langsung menautkan psikolog terpilih.

### 1.4 Pusat Bantuan (FAQ - `/faq`)
- **Accordion Interaktif:** Daftar tanya-jawab terstruktur dengan tab kategori (*Booking*, *Privasi*, *Reschedule*, *Layanan*) dan pencarian kata kunci instan.

### 1.5 Kontak & WhatsApp Click-to-Chat (`/contact`)
- **Click-to-Chat Dinamis:** Tautan langsung ke WhatsApp (`+6289630869804`) dengan pesan pembuka ramah yang tidak memuat data sensitif.
- **Informasi Lokasi Tatap Muka:** Rincian wilayah praktik offline di Pondok Bambu, Jakarta Timur dengan penegasan kebutuhan janji temu terlebih dahulu.

---

## 2. Content Management System (CMS Admin)

Dikelola melalui Portal Admin (`/admin/*`) yang diamankan oleh `ProtectedRoute` dengan wewenang role `admin` / `super_admin`:

1. **CMS Layanan & Tarif (`/admin/services`):**
   - Menampilkan seluruh katalog layanan aktif beserta durasi dan metode.
   - Kemampuan memperbarui tarif harga secara interaktif tanpa menyentuh kode program.
2. **CMS Psikolog (`/admin/psychologists`):**
   - Menampilkan daftar profil psikolog terdaftar, kredensial, fokus praktik, dan status ketersediaan.
3. **CMS FAQ (`/admin/faqs`):**
   - Formulir penambahan pertanyaan dan jawaban baru dengan pemilihan kategori.
   - Penghapusan dan pembaruan urutan FAQ secara real-time.
4. **CMS Pengaturan Situs (`/admin/settings`):**
   - Konfigurasi nomor WhatsApp operasional dan pesan default.
   - Pengaturan lead time pemesanan (default 24 jam).
   - Pengaturan alamat praktik tatap muka.

---

## 3. Hasil Pengujian Unit

Pengujian unit pada `src/features/public-site/publicSite.test.ts` memverifikasi:
- Integritas 4 layanan terkonfirmasi dan kecocokan tarif dengan dokumen spesifikasi.
- Keberadaan 4 profil psikolog awal beserta kredensial wajib.
- Validitas konstruksi tautan WhatsApp Click-to-Chat.
- Ketepatan penyaringan kategori FAQ.
