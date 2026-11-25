# Soulaide — Project Documentation

Dokumentasi awal untuk pengembangan web application Soulaide Psychology.

## Isi folder

| Dokumen | Isi |
|---|---|
| `PROJECT_OVERVIEW.md` | Visi produk, ruang lingkup, pengguna, dan prinsip utama |
| `REQUIREMENTS.md` | Kebutuhan fungsional dan non-fungsional |
| `ARCHITECTURE.md` | Arsitektur aplikasi dan teknologi |
| `DATABASE.md` | Konvensi database, rancangan tabel, relasi, dan aturan migrasi |
| `AUTH_AND_ACCESS.md` | Autentikasi, role, route protection, dan otorisasi |
| `SECURITY_AND_PRIVACY.md` | RLS, privasi data psikologis, audit, dan penyimpanan |
| `BOOKING_WORKFLOW.md` | Alur jadwal, slot, booking, perubahan jadwal |
| `PAYMENTS.md` | Alur pembayaran Midtrans dan webhook |
| `DASHBOARDS.md` | Kebutuhan dashboard customer, psikolog, dan admin |
| `LIVE_CHAT_AND_WHATSAPP.md` | Presence, live chat, dan WhatsApp |
| `CONTENT_AND_SERVICES.md` | Konten publik, layanan, harga, psikolog, dan CMS |
| `IMPLEMENTATION_PLAN.md` | Tahapan implementasi |
| `TESTING.md` | Skenario pengujian minimum |
| `ENVIRONMENT.md` | Environment variables dan konfigurasi |
| `DEPLOYMENT.md` | Checklist deployment |
| `ANTIGRAVITY_MASTER_PROMPT.md` | Prompt utama untuk coding agent |

## Cara menggunakan

1. Letakkan folder `docs/` ini di root repository project.
2. Minta coding agent membaca `docs/README.md` dan seluruh dokumen relevan sebelum mengubah kode.
3. Mulai dari Phase 0 dan Phase 1 pada `IMPLEMENTATION_PLAN.md`.
4. Jangan mengerjakan fase berikutnya sebelum fase sebelumnya diuji dan dilaporkan.
5. Lengkapi keputusan yang masih berstatus **Perlu konfirmasi** sebelum mengaktifkannya di production.

## Status dokumen

Dokumen ini merupakan baseline kebutuhan dan rancangan awal, bukan bukti bahwa fitur atau database sudah dibuat. Detail yang belum dipastikan ditandai secara eksplisit agar tidak dibuat-buat.
