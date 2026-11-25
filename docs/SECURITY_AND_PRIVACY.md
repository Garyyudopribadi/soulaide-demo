# Security and Privacy

## 1. Sensitive information

Platform dapat memproses informasi terkait kesehatan mental, asesmen, dan catatan konseling. Perlakukan data tersebut sebagai sangat sensitif.

- Kumpulkan hanya data yang benar-benar diperlukan.
- Jelaskan tujuan penggunaan dan dasar pemrosesan melalui privacy notice/consent yang ditinjau pihak berwenang.
- Batasi akses berdasarkan tugas.
- Jangan menampilkan data klinis dalam dashboard admin operasional umum.
- Jangan mengirim jawaban asesmen atau catatan klinis melalui WhatsApp biasa.
- Hindari data sensitif di URL, analytics, error tracking, dan log.

## 2. Database security

- RLS aktif untuk seluruh tabel yang terekspos.
- Policy diuji dengan beberapa role.
- Gunakan server-side validation.
- Jangan menaruh service role key di frontend.
- Gunakan Edge Functions untuk operasi privileged.
- Gunakan signed URL berumur pendek untuk file privat.
- Batasi bucket storage dan file type/size.

## 3. Clinical records

- Pisahkan clinical notes, assessment answers, dan operational booking data.
- Hanya psikolog yang ditugaskan dan role profesional yang secara sah berwenang dapat mengakses catatan terkait.
- Admin teknis tidak otomatis boleh membaca isi catatan klinis.
- Catat akses/perubahan penting tanpa menyalin isi klinis ke audit log.

## 4. Audit

Audit log untuk tindakan seperti:
- Perubahan role.
- Perubahan harga dan layanan.
- Perubahan jadwal dan booking.
- Perubahan status pembayaran/refund.
- Akses atau perubahan data sensitif bila diperlukan.

Simpan metadata minimum: actor, action, entity, timestamp, dan metadata non-sensitif.

## 5. Crisis and emergency boundaries

- Chat bukan layanan darurat dan bukan pengganti sesi konseling.
- Tampilkan arahan bantuan darurat yang sudah disetujui clinical lead.
- Jangan membuat protokol klinis sendiri. Prosedur eskalasi harus ditinjau dan disahkan oleh penanggung jawab profesional.
