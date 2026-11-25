# Booking and Scheduling Workflow

## 1. Booking flow

1. Customer login/registrasi.
2. Customer memilih kategori dan layanan.
3. Customer memilih metode online/offline.
4. Customer memilih psikolog bila pilihan tersedia.
5. Sistem menampilkan slot berdasarkan jadwal dan pengecualian yang aktif.
6. Customer memilih tanggal dan waktu.
7. Sistem memvalidasi lead time, kapasitas, dan eligibility.
8. Sistem membuat reservasi secara atomik.
9. Customer melanjutkan pembayaran.
10. Payment webhook tervalidasi memperbarui payment status.
11. Booking dikonfirmasi sesuai aturan bisnis.
12. Notifikasi dikirim kepada customer dan psikolog yang ditugaskan.

## 2. Schedule model

Data jadwal psikolog adalah pola ketersediaan, bukan jaminan bahwa slot masih kosong. Availability harus memperhitungkan:
- Jadwal rutin.
- Pengecualian/cuti.
- Booking yang sudah aktif.
- Durasi layanan dan buffer time bila ditentukan.
- Zona waktu `Asia/Jakarta`.
- Status psikolog dan metode layanan.

## 3. Initial policy assumptions — require approval

- Minimum booking lead time: 24 jam.
- Tidak menerima booking di hari yang sama.
- Maksimal satu kali reschedule.
- Reschedule request minimal 8 jam sebelum sesi.
- Toleransi keterlambatan: 5 menit.
- Waktu tunggu maksimum: 10 menit.

Jangan menganggap asumsi di atas sebagai kebijakan final sebelum disetujui Soulaide.

## 4. Double-booking prevention

- Reservasi harus dilakukan melalui transaksi database/RPC yang aman.
- Gunakan unique constraint atau row locking sesuai model slot.
- Jangan hanya melakukan pengecekan availability di frontend.
- Dua request bersamaan untuk slot yang sama hanya boleh menghasilkan satu reservasi berhasil.
- Tentukan masa berlaku hold pembayaran dan mekanisme pelepasan slot; nilainya perlu dikonfirmasi.

## 5. Status model

Pisahkan status booking dari status pembayaran.

Contoh status booking (finalisasi bersama tim):
- `pending_payment`
- `confirmed`
- `reschedule_requested`
- `rescheduled`
- `completed`
- `cancelled`
- `no_show`

Contoh status pembayaran:
- `pending`
- `paid`
- `failed`
- `expired`
- `refunded`
- `partially_refunded`

Simpan perubahan status dalam history table.

## 6. Reschedule and cancellation

- Validasi batas waktu berdasarkan waktu sesi dan timezone yang benar.
- Simpan siapa yang meminta dan alasan kategori bila diperlukan.
- Jangan menghapus booking lama; simpan riwayat.
- Aturan refund dan cancellation fee perlu keputusan bisnis tertulis.
