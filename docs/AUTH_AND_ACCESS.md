# Authentication and Access Control

## 1. Authentication

Gunakan Supabase Auth untuk:
- Sign up dan sign in.
- Sign out.
- Password reset.
- Session refresh.
- Email verification bila diaktifkan.
- Penanganan akun nonaktif/ditangguhkan.

Jangan membuat sistem password sendiri.

## 2. Roles

Role awal:
- `customer`
- `psychologist`
- `admin`
- `super_admin`

Role harus ditetapkan dan diverifikasi di backend/database. Jangan menerima role dari input form publik sebagai otoritas.

## 3. Authorization

- Gunakan route guards untuk pengalaman navigasi.
- Gunakan RLS sebagai enforcement utama data.
- Edge Functions harus memvalidasi JWT dan role/permission.
- Jangan hanya menyembunyikan tombol/menu untuk mengamankan operasi.
- Terapkan prinsip least privilege.

## 4. Dashboard route examples

Contoh route konseptual:
- `/dashboard` — customer
- `/psychologist` — psychologist
- `/admin` — admin
- `/admin/settings` — admin dengan permission sesuai
- `/admin/users` — admin berwenang

Sesuaikan route dengan struktur project yang sudah ada.

## 5. Account lifecycle

- Sediakan loading state saat session diperiksa.
- Tangani expired session dan refresh.
- Hindari redirect loop.
- Jangan tampilkan data dashboard sebelum role berhasil diverifikasi.
- Catat perubahan role dan tindakan admin penting di audit log.
