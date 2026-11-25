# Booking and Scheduling Implementation (Phase 5)

Dokumentasi implementasi alur pemesanan jadwal konseling, mesin kalkulasi ketersediaan slot, pencegahan double booking atomik, dan manajemen perubahan jadwal (reschedule) untuk platform psikologi Soulaide.

---

## 1. Kebijakan & Aturan Bisnis Jadwal

1. **Lead Time Pemesanan Minimal 24 Jam:**
   - Pemesanan sesi konseling wajib dilakukan minimal **24 jam** sebelum waktu mulai sesi.
   - Sistem menolak pemesanan di hari yang sama (*same-day booking*) guna memberi waktu persiapan profesional bagi psikolog pendamping.
2. **Zona Waktu Operasional:**
   - Seluruh jadwal diinterpretasikan dalam zona waktu **WIB (`Asia/Jakarta`, UTC+7)**.
3. **Kebijakan Perubahan Jadwal (Reschedule):**
   - Batas pengajuan reschedule minimal **8 jam** sebelum waktu sesi.
   - Reschedule diajukan melalui portal klien dan tercatat dalam tabel `public."Soulaide_reschedule_requests"`.
   - Batas maksimal pengajuan reschedule adalah 1 kali per nomor pesanan.
4. **Pemisahan Status Booking & Status Pembayaran:**
   - **Status Booking:** `pending_payment`, `confirmed`, `reschedule_requested`, `rescheduled`, `completed`, `cancelled`, `no_show`.
   - **Status Pembayaran:** `pending`, `paid`, `failed`, `expired`, `refunded`, `partially_refunded`.

---

## 2. Arsitektur Pencegahan Double-Booking

Pencegahan bentrok jadwal diterapkan pada tingkat basis data melalui:
1. **Advisory Transaction Locking:**
   Fungsi `Soulaide_reserve_slot_atomic` mengunci slot psikolog pada tanggal terkait menggunakan `pg_advisory_xact_lock(hashtext(psychologist_id), date_offset)`.
2. **Unique Partial Index Constraint:**
   Index `Soulaide_bookings_no_overlap_idx` memastikan integritas bahwa tidak ada dua pemesanan aktif yang dapat memiliki `(psychologist_id, session_date, session_start_time)` yang identik.
3. **Pencatatan Jejak Status Atomik:**
   Setiap reservasi langsung membuat entri riwayat pada `public."Soulaide_booking_status_history"`.

---

## 3. Alur Pengalaman Pengguna (5-Step Customer Flow)

Pada antarmuka [src/features/booking/BookingPage.tsx](file:///F:/Garyudo.my.id/soulaide-webapp/src/features/booking/BookingPage.tsx):
- **Langkah 1 (Layanan & Metode):** Memilih kategori layanan (Soul Guidance / Soul Expert) dan metode pelaksanaan (Online Zoom/Voice Call atau Offline di Pondok Bambu).
- **Langkah 2 (Psikolog):** Memilih psikolog pendamping dengan peninjauan kredensial, keahlian, dan pola jadwal rutin.
- **Langkah 3 (Jadwal & Slot):** Memilih tanggal (14 hari ke depan dengan filter 24h lead time) dan slot jam yang aktif.
- **Langkah 4 (Intake & Persetujuan):** Catatan keluhan awal klien, peringatan batas darurat medis, dan persetujuan *Informed Consent*.
- **Langkah 5 (Konfirmasi & Kode Booking):** Menampilkan rincian reservasi yang berhasil dikunci, kode booking unik (format `SLD-YYYYMMDD-XXXX`), dan tombol lanjutan pembayaran.

---

## 4. Manajemen Jadwal di Portal Klien

Pada antarmuka [src/features/customer/CustomerDashboardPage.tsx](file:///F:/Garyudo.my.id/soulaide-webapp/src/features/customer/CustomerDashboardPage.tsx):
- **Daftar Sesi Konseling:** Menampilkan sesi mendatang, lencana status (`Menunggu Pembayaran`, `Terkonfirmasi`, `Pengajuan Reschedule`, dll.), rincian waktu WIB, dan nama psikolog.
- **Aksi Cepat:**
  - Tombol *Bayar Sekarang* bagi sesi berstatus `pending_payment`.
  - Formulir modal *Ajukan Reschedule* dengan validasi batas waktu >= 8 jam.
  - Opsi *Batalkan Sesi* yang mencatat alasan pembatalan ke riwayat status.

---

## 5. Hasil Pengujian Unit

Pengujian pada `src/features/booking/booking.test.ts` memverifikasi:
- Penolakan reservasi di bawah 24 jam lead time dan penerimaan reservasi di atas 24 jam.
- Penolakan pengajuan reschedule di bawah 8 jam dan kelayakan di atas 8 jam.
- Algoritma deteksi bentrok slot waktu (interval overlap vs adjacent slots).
- Generator tanggal yang memastikan pemesanan dimulai besok dan tidak pernah hari ini.
