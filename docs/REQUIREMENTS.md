# Product Requirements

## 1. Public website

- Landing page dengan value proposition, CTA booking, ringkasan layanan, profil psikolog, FAQ, dan kontak.
- Halaman detail layanan dan profil psikolog.
- Informasi metode sesi online/offline, alur booking, pembayaran, pembatalan, dan kebijakan.
- SEO metadata, responsive layout, loading state, empty state, dan error state.
- Konten utama dikelola dari dashboard admin/CMS.

## 2. Customer account

- Registrasi, login, logout, reset password, dan pengelolaan profil.
- Persetujuan kebijakan privasi dan consent yang relevan.
- Melihat booking aktif, riwayat, detail sesi, dan status pembayaran.
- Melihat jadwal yang tersedia dan memilih layanan/psikolog/metode.
- Melakukan pembayaran online.
- Menerima notifikasi status booking dan pembayaran.
- Meminta perubahan jadwal sesuai kebijakan.

## 3. Booking

- Pilih layanan, metode sesi, psikolog (jika layanan mengizinkan pilihan), tanggal, dan slot.
- Validasi lead time minimum 24 jam sebagai kebijakan awal yang perlu dikonfirmasi.
- Slot dikunci/dipesan secara atomik di database untuk mencegah dua klien mendapat slot sama.
- Booking dan pembayaran mempunyai status terpisah.
- Sediakan riwayat perubahan status.
- Kebijakan awal: maksimal satu kali reschedule; permintaan minimal 8 jam sebelum sesi. Konfirmasi sebelum diberlakukan.
- Toleransi keterlambatan awal: 5 menit; batas tunggu awal: 10 menit. Konfirmasi sebelum diberlakukan.

## 4. Payments

- Integrasi payment gateway Midtrans.
- Pembuatan transaksi dilakukan melalui backend/Edge Function.
- Status pembayaran hanya diperbarui berdasarkan webhook tervalidasi atau pemeriksaan server-side yang sah.
- Simpan referensi transaksi, nominal, mata uang, status, waktu, dan metadata minimum yang diperlukan.
- Dukung idempotency dan pencatatan event webhook.

## 5. Psychologist dashboard

- Ringkasan jadwal dan booking yang ditugaskan.
- Detail booking sesuai kebutuhan profesional.
- Pengaturan ketersediaan dan status presence.
- Akses catatan/asesmen hanya sesuai kewenangan dan kebutuhan.
- Tidak boleh mengakses booking psikolog lain tanpa izin.

## 6. Admin dashboard

- CRUD konten CMS, FAQ, layanan, kategori, harga, metode sesi, dan profil psikolog.
- Kelola jadwal dan pengecualian ketersediaan.
- Kelola booking, status operasional, dan pembayaran.
- Kelola akun staf dan role sesuai kewenangan.
- Audit log untuk tindakan penting.
- Admin operasional umum tidak otomatis memperoleh akses ke catatan klinis.

## 7. Live chat and WhatsApp

- Customer dapat melihat apakah psikolog online dan apakah sedang tersedia untuk chat.
- Chat real-time menggunakan Supabase Realtime.
- Status presence: `offline`, `online`, `available`, `busy`, `away`.
- WhatsApp Click-to-Chat untuk koordinasi booking.
- Jangan mengirim jawaban asesmen atau data klinis sensitif melalui pesan WhatsApp biasa.

## 8. Non-functional requirements

- TypeScript strict mode.
- Validasi input client dan server.
- RLS aktif pada seluruh tabel yang berisi data pengguna.
- Tidak ada secret di bundle frontend.
- Logging tidak boleh memuat data klinis sensitif.
- Aplikasi responsif dan accessible.
- Migrations dapat dijalankan ulang secara terkontrol dan terdokumentasi.
- Automated tests untuk alur kritis.
