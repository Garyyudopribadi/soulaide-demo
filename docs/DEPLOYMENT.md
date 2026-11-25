# Deployment Checklist

## 1. Before deployment

- [ ] Semua migration direview dan sudah diuji di staging.
- [ ] Semua custom tables menggunakan prefix `Soulaide_`.
- [ ] RLS dan authorization diuji untuk setiap role.
- [ ] Tidak ada secret di repository atau frontend bundle.
- [ ] Environment production sudah disiapkan.
- [ ] Domain dan HTTPS aktif.
- [ ] Redirect URL Supabase Auth dikonfigurasi.
- [ ] Payment webhook URL production dikonfigurasi dan diverifikasi.
- [ ] WhatsApp contact diverifikasi.
- [ ] Konten, harga, profil, kebijakan, dan jadwal telah disetujui.
- [ ] Privacy notice dan consent telah direview pihak yang berwenang.
- [ ] Backup dan recovery plan tersedia.

## 2. After deployment

- [ ] Test sign up/sign in.
- [ ] Test booking end-to-end.
- [ ] Test payment sandbox/production sesuai tahap.
- [ ] Test webhook.
- [ ] Test WhatsApp link.
- [ ] Test role access dan RLS.
- [ ] Periksa error monitoring tanpa mengirim data sensitif.
- [ ] Periksa performa dan responsive UI.

## 3. Rollback

Dokumentasikan cara rollback frontend dan database migration sebelum rilis. Jangan menjalankan destructive migration di production tanpa backup dan persetujuan.
