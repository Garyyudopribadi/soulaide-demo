# Customer Dashboard Implementation (Phase 7)

## 1. Overview

Portal Klien (Customer Dashboard) Soulaide dirancang sebagai *hub* terintegrasi bagi klien untuk:
1. Memantau sesi konseling mendatang dan riwayat sesi sebelumnya.
2. Membuka room konseling online atau melihat petunjuk lokasi klinik tatap muka.
3. Melakukan pembayaran invoice tertunda secara instan melalui Midtrans Snap.
4. Melihat, mencetak, atau menyimpan kwitansi resmi (*receipt invoice*) berformat standar akuntansi.
5. Memperbarui profil akun, identitas kependudukan, dan data kontak darurat (*emergency contact*).
6. Mengakses arsip dokumen *Informed Consent* yang telah ditandatangani secara digital dengan jaminan kerahasiaan Kode Etik Psikologi HIMPSI.
7. Mengakses kotak notifikasi real-time dan ruang chat koordinasi pra-sesi yang dilengkapi **Disclaimer Tanggap Darurat Krisis**.

---

## 2. Workspace Shell & Information Architecture

Portal klien memakai `DashboardShell` bersama sehingga header publik dan tab horizontal
digantikan sidebar yang tenang dan fokus.

- Navigasi dikelompokkan menjadi **Ringkasan**, **Layanan**, dan **Akun**.
- Badge sidebar menandai sesi mendatang, tagihan tertunda, dan notifikasi belum dibaca.
- Mobile memakai drawer aksesibel dengan backdrop, Escape, dan scroll lock.
- Top bar menyediakan akses cepat ke notifikasi dan situs publik.

Tab portal:

- `overview`: Beranda saya
- `sessions`: Sesi konseling
- `payments`: Tagihan & kwitansi
- `profile`: Profil & consent
- `notifications`: Notifikasi

## 3. Struktur Modul & Komponen

Modul portal klien diimplementasikan di `src/features/customer/`:

1. **`CustomerDashboardPage.tsx`:**
   - Halaman utama portal dengan shell, ringkasan KPI (Sesi Mendatang, Sesi Selesai,
     Total Pembayaran Lunas, Notifikasi Baru), dan navigasi role-aware.
   - Dialog reschedule kini berupa modal terfokus dengan informasi kebijakan yang jelas.

2. **`CustomerOverviewTab.tsx`:**
   - Hero sesi berikutnya dengan aksi bayar, buka ruang online, atau chat koordinasi.
   - Antrean perhatian: pembayaran tertunda, notifikasi baru, kelengkapan profil, dan
     informed consent.
   - Daftar sesi mendatang, transaksi terakhir, progres profil, ringkasan kontak darurat,
     serta akses bantuan.

3. **`CustomerSessionsTab.tsx`:**
   - Filter sub-kategori: *Sesi Mendatang*, *Riwayat Sesi*, dan *Semua Sesi*.
   - Filter pencarian berbasis kode booking, nama psikolog, atau judul layanan.
   - Tombol dinamis sesuai status sesi:
     - *Bayar Sekarang* (jika status `pending_payment`)
     - *Buka Room Konseling Online* (jika status `confirmed` & delivery method `online`)
     - *Chat Koordinasi* (membuka `CustomerChatModal`)
     - *Reschedule* (validasi batas minimal 8 jam sebelum sesi)
     - *Batalkan Sesi*

4. **`CustomerPaymentsTab.tsx` & `CustomerReceiptModal.tsx`:**
   - Menampilkan daftar transaksi dari tabel database `Soulaide_payments`.
   - Ringkasan akumulasi pengeluaran konseling yang berstatus lunas.
   - Modal kwitansi elektronik resmi lengkap dengan No. Kwitansi (Order ID), nama layanan, tanggal bayar, segel lunas terverifikasi, dan fitur *Print / Save PDF*.

5. **`CustomerProfileTab.tsx`:**
   - Formulir update identitas dasar (Nama, No. WhatsApp).
   - Formulir data demografis & kontak darurat (Tanggal lahir, jenis kelamin, pekerjaan, nama kontak darurat, no. telepon, hubungan).
   - Arsip dokumen persetujuan (*Informed Consent*) dari tabel `Soulaide_consent_records`.
   - Penjelasan klausul privasi isolasi RLS (Row Level Security) yang menegaskan bahwa staf administrasi umum dilarang mengakses catatan klinis klien.

6. **`CustomerNotificationsTab.tsx`:**
   - Daftar notifikasi pengguna dari tabel `Soulaide_notifications`.
   - Indikator pesan belum dibaca dan tombol aksi *Tandai Semua Dibaca*.
   - Navigasi otomatis jika notifikasi menyertakan tautan aksi.

7. **`CustomerChatModal.tsx`:**
   - Ruang koordinasi pesan pra-sesi antara klien dan psikolog pendamping.
   - **Klausul Wajib Tanggap Darurat (Crisis Disclaimer):**
     Menegaskan bahwa fitur chat ini murni untuk koordinasi teknis, BUKAN penanganan gawat darurat atau konseling medis. Klien yang berada dalam krisis darurat mental medis diarahkan langsung ke Hotline Kemenkes 119 ext. 8 atau IGD rumah sakit terdekat.

---

## 4. Layanan & Integrasi Database (`customerService.ts`)

- `fetchCustomerClientProfile(userId)`: Mengambil data profil klien dari `public."Soulaide_client_profiles"`.
- `updateCustomerClientProfile(userId, profileData)`: Melakukan upsert data demografis dan kontak darurat.
- `updateUserProfile(userId, data)`: Memperbarui data pengguna di `public."Soulaide_profiles"`.
- `fetchCustomerPaymentHistory(userId)`: Mengambil riwayat pembayaran dari `public."Soulaide_payments"` berelasi dengan sesi booking.
- `fetchCustomerConsents(userId)`: Membaca arsip persetujuan dari `public."Soulaide_consent_records"`.
- `fetchCustomerNotifications(userId)`: Membaca notifikasi dari `public."Soulaide_notifications"`.
- `markNotificationRead(notificationId)` & `markAllNotificationsRead(userId)`: Memperbarui flag `is_read`.

---

## 5. Hasil Pengujian Unit

Seluruh pengujian fungsionalitas dan logika bisnis pada `src/features/customer/customer.test.ts` berhasil:
- Pemisahan akurat antara sesi mendatang dan riwayat sesi lampau.
- Pencarian dan pemfilteran multi-parameter (kode booking, psikolog, layanan).
- Kalkulasi total pembayaran yang hanya mengakumulasi transaksi berstatus `paid`.
- Perhitungan akurat notifikasi yang belum dibaca (*unread counter*).
- Helper bersama di `src/lib/dashboard.test.ts` menguji jendela 7 hari, penghitungan sesi per
  tanggal, label tanggal relatif, format waktu, inisial, dan kelengkapan profil.
