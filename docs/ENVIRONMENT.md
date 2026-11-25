# Environment Configuration

## 1. Vite frontend variables

Untuk Vite gunakan prefix `VITE_`, bukan `NEXT_PUBLIC_`.

Contoh `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Hanya masukkan nilai yang memang aman untuk diekspos ke browser.

## 2. Server/Edge Function secrets

Simpan secrets di environment server/Supabase Edge Function secrets, bukan di `.env` frontend yang dibundle.

Contoh nama konfigurasi (sesuaikan implementasi dan dokumentasi provider):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY` (gunakan sesuai kebutuhan dan klasifikasi provider)
- `MIDTRANS_IS_PRODUCTION`
- `WHATSAPP_NUMBER`

Jangan commit file `.env` aktual. Commit `.env.example` tanpa secret.

## 3. Rules

- Jangan pernah menggunakan service role key pada frontend.
- Jangan menggunakan Midtrans server key pada frontend.
- Validasi environment saat aplikasi/backend start.
- Pisahkan development, staging, dan production.
- Rotasi secret jika terlanjur terekspos.
