# Payment Integration

## 1. Provider

Payment gateway yang direncanakan: Midtrans. Konfirmasi produk Midtrans (Snap/Core API), metode pembayaran, akun merchant, dan environment sebelum implementasi.

## 2. Secure flow

1. Frontend meminta pembuatan transaksi untuk booking yang valid.
2. Edge Function memverifikasi JWT, ownership, harga dari database, dan status booking.
3. Edge Function membuat transaksi ke Midtrans menggunakan server key dari secret environment.
4. Frontend menerima token/redirect data yang aman untuk memulai pembayaran.
5. Midtrans mengirim webhook ke endpoint backend.
6. Backend memverifikasi signature dan detail transaksi.
7. Backend memproses event secara idempotent.
8. Backend memperbarui payment record dan booking state sesuai aturan.
9. Customer melihat status yang dibaca ulang dari backend/database.

## 3. Critical rules

- Jangan pernah menaruh Midtrans Server Key di frontend.
- Jangan percaya callback browser sebagai bukti pembayaran.
- Jangan mengubah status paid berdasarkan query parameter redirect.
- Verifikasi signature dan nominal, order ID, currency, dan merchant context.
- Simpan webhook event untuk audit dan deduplication.
- Pastikan event duplicate/out-of-order tidak merusak state.
- Harga dihitung dari data database yang dipercaya, bukan nominal yang dikirim browser.

## 4. Unconfirmed decisions

- Midtrans Snap atau integrasi lain.
- Metode pembayaran yang diaktifkan.
- Masa berlaku pembayaran/hold slot.
- Kebijakan refund, partial refund, dan cancellation.
- Biaya admin dan apakah ditanggung customer atau Soulaide.

Jangan mengarang keputusan di atas.
