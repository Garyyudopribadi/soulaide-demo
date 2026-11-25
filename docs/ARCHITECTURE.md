# Application Architecture

## 1. Recommended stack

- Frontend: React + Vite + TypeScript.
- Routing: React Router.
- Styling/UI: Tailwind CSS, shadcn/ui, Lucide.
- Forms: React Hook Form + Zod.
- Server state: TanStack Query.
- Backend platform: Supabase Auth, PostgreSQL, Storage, Realtime, Edge Functions.
- Payment gateway: Midtrans.
- WhatsApp: Click-to-Chat pada tahap awal; integrasi API resmi dapat dipertimbangkan kemudian.
- Hosting frontend: Vercel atau platform setara.

Periksa dependency dan struktur project yang sudah ada sebelum memasang atau mengganti package.

## 2. High-level boundaries

- **Public frontend:** hanya data publik yang memang boleh ditampilkan.
- **Authenticated frontend:** dashboard sesuai role.
- **Supabase Auth:** identitas dan sesi pengguna.
- **PostgreSQL + RLS:** sumber kebenaran data dan kontrol akses.
- **Edge Functions/server:** operasi privileged, pembuatan transaksi, validasi webhook, dan proses sensitif.
- **Storage:** file privat dengan policy dan signed URL.
- **Realtime:** pesan dan presence sesuai authorization.

## 3. Suggested source structure

```text
src/
  app/
    router/
    providers/
  components/
    ui/
    shared/
  features/
    auth/
    public-site/
    services/
    psychologists/
    booking/
    payments/
    customer/
    psychologist/
    admin/
    chat/
    notifications/
  lib/
    supabase/
    validation/
    utils/
  hooks/
  types/
  styles/
supabase/
  migrations/
  functions/
  seed/
docs/
```

## 4. Architecture rules

- Jangan menaruh Supabase service role key atau Midtrans server key di frontend.
- Semua operasi privileged dilakukan server-side.
- Frontend tidak boleh menjadi sumber kebenaran status pembayaran.
- Gunakan database transaction/RPC yang aman untuk reservasi slot.
- Validasi role di server/Edge Function dan RLS, bukan hanya menyembunyikan menu.
- Pisahkan data klinis dari data operasional umum.
- Jangan membuat mock UI seolah-olah terhubung ke backend jika belum benar-benar terimplementasi.

## 5. Existing project first

Sebelum coding:
1. Periksa `package.json`, struktur folder, konfigurasi Vite, TypeScript, Tailwind, dan routing.
2. Periksa konfigurasi Supabase yang sudah ada.
3. Jangan menghapus atau mengganti konfigurasi tanpa alasan dan laporan.
4. Buat perubahan kecil, terukur, dan mudah direview.
