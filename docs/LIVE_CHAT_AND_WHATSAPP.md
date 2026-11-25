# Live Chat and WhatsApp

## 1. Live chat

Gunakan Supabase Realtime untuk pesan dan presence, dengan RLS/authorization yang sesuai.

Fitur:
- Conversation dan participant membership.
- Pengiriman dan penerimaan pesan real-time.
- Timestamp dan status pengiriman bila didukung.
- Riwayat percakapan hanya untuk participant yang berhak.
- Notifikasi pesan baru.
- Presence psikolog.

## 2. Presence statuses

- `offline`: tidak terhubung.
- `online`: sedang online.
- `available`: online dan bersedia menerima chat.
- `busy`: sedang tidak menerima chat baru.
- `away`: sementara tidak aktif.

Online tidak selalu berarti available.

## 3. Chat boundaries

- Chat hanya untuk pertanyaan informasi/koordinasi, kecuali Soulaide menyetujui cakupan lain.
- Jangan menjanjikan diagnosis atau terapi melalui chat.
- Tampilkan disclaimer bahwa chat bukan pengganti konseling atau layanan darurat.
- Prosedur eskalasi krisis harus disusun dan disetujui clinical lead.
- Jangan menaruh data asesmen atau catatan klinis di pesan WhatsApp.

## 4. WhatsApp Click-to-Chat

Nomor awal yang diberikan untuk konfigurasi: `+6289630869804`.

Gunakan format link WhatsApp yang sesuai dan pesan awal yang tidak memuat data sensitif. Nomor harus dapat diubah dari konfigurasi/CMS admin.

Contoh pesan awal:
"Halo Soulaide, saya ingin bertanya mengenai layanan dan proses booking konseling."

Verifikasi kepemilikan dan kesiapan nomor sebelum production.

## 5. Future enhancement

WhatsApp Business Platform/API dapat dipertimbangkan untuk template notification dan automasi setelah kebutuhan, biaya, consent, dan provider disetujui.
