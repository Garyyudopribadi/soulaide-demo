# Authentication and Authorization Implementation (Phase 3)

Dokumentasi implementasi autentikasi, otorisasi berbasis peran (RBAC), siklus sesi, dan rute terlindungi untuk platform psikologi Soulaide.

---

## 1. Arsitektur Autentikasi

1. **Provider Identitas:** Menggunakan **Supabase Auth** untuk mengelola pendaftaran (*sign up*), masuk (*sign in*), keluar (*sign out*), reset kata sandi, dan refresh token otomatis.
2. **Sinkronisasi Profil & Penetapan Peran Otomatis (Database Trigger):**
   - Berkas: `supabase/migrations/20261122000004_create_soulaide_auth_triggers.sql`
   - Fungsi `Soulaide_handle_new_user()` dipicu segera setelah user baru tercipta di `auth.users`:
     - Membuat entri di `public."Soulaide_profiles"` dengan data `email`, `full_name`, dan `avatar_url`.
     - Menetapkan peran awal secara aman: `customer` di `public."Soulaide_user_roles"`.
   - **Keamanan:** Peran `admin` atau `psychologist` **tidak dapat diinjeksi** melalui form registrasi publik karena penetapan peran dikendalikan penuh oleh database trigger dan otorisasi super admin.

---

## 2. Pengelolaan State Autentikasi (Client-Side)

- **`src/features/auth/AuthContext.tsx` & `src/features/auth/useAuth.ts`:**
  - Menyimpan status user aktif, session JWT, data profil, dan role (`customer`, `psychologist`, `admin`, `super_admin`).
  - Memanfaatkan `supabase.auth.onAuthStateChange` untuk mendeteksi perubahan sesi real-time (login, logout, token refresh).
  - Menyediakan penanganan loading state saat sesi diverifikasi untuk mencegah *flash of unauthenticated content* atau *redirect loops*.

---

## 3. Route Protection & RBAC

- **Komponen `ProtectedRoute` (`src/features/auth/ProtectedRoute.tsx`):**
  - Mencegah akses pengguna tanpa login dan mengalihkan ke `/login` dengan menyimpan rute asal pada `location.state.from`.
  - Memeriksa wewenang role berdasarkan properti `allowedRoles`:
    - Area Klien (`/dashboard/*`): role `customer` atau `super_admin`.
    - Area Psikolog (`/psychologist/*`): role `psychologist` atau `super_admin`.
    - Area Admin (`/admin/*`): role `admin` atau `super_admin`.
  - Jika peran tidak sesuai, dialihkan ke halaman informatif `/unauthorized` tanpa mengekspos data internal.

---

## 4. Alur & Halaman yang Disediakan

- **Masuk (`/login`):** Validasi form, pemrosesan otentikasi via Supabase, penanganan error ramah pengguna, dan pengalihan dinamis ke dashboard sesuai peran.
- **Pendaftaran (`/register`):** Input nama lengkap, email, password (minimal 6 karakter), serta penanganan konfirmasi email jika diaktifkan.
- **Lupa Kata Sandi (`/forgot-password`):** Pengiriman tautan reset kata sandi ke email terdaftar via `supabase.auth.resetPasswordForEmail`.
- **Perbarui Kata Sandi (`/reset-password`):** Form pembaharuan kata sandi baru dengan konfirmasi via `supabase.auth.updateUser`.
- **Akses Ditolak (`/unauthorized`):** Tampilan peringatan peran tidak memiliki hak akses beserta tombol navigasi ke dashboard masing-masing peran.
- **Navigasi Dinamis (`Header.tsx`):** Menampilkan status user, badge role, tombol pintas dashboard, dan tombol keluar saat sesi aktif.

---

## 5. Pengujian & Verifikasi

Pengujian unit pada `src/features/auth/auth.test.ts` mencakup:
- Validasi matriks otorisasi per peran.
- Verifikasi hak universal peran `super_admin`.
- Penolakan akses tamu (*unauthenticated*).
- Validasi panjang minimal kata sandi dan pencocokan konfirmasi password.
