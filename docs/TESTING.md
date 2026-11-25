# Testing Strategy

## 1. Baseline checks

- `npm run typecheck` (atau script ekuivalen yang tersedia).
- `npm run lint`.
- `npm run test`.
- `npm run build`.

Gunakan nama script yang sesuai dengan project; jangan mengasumsikan semuanya sudah tersedia.

## 2. Authentication

- Customer dapat sign up/sign in/sign out.
- Session refresh dan password reset berjalan.
- User tidak dapat menetapkan role privileged sendiri.
- Route dashboard role lain ditolak.

## 3. RLS

Uji sebagai:
- Anonymous.
- Customer A dan Customer B.
- Psychologist A dan Psychologist B.
- Admin.
- Super admin.

Pastikan customer tidak dapat membaca data customer lain; psikolog tidak dapat membaca booking yang tidak ditugaskan; admin operasional tidak otomatis dapat membaca catatan klinis.

## 4. Booking

- Slot yang tersedia dapat dipesan.
- Slot yang sudah diambil tidak dapat dipesan lagi.
- Dua request bersamaan untuk slot sama hanya menghasilkan satu keberhasilan.
- Lead time dan kebijakan jadwal divalidasi di server.
- Status history tercatat.
- Reschedule mengikuti aturan.

## 5. Payment

- Server membuat transaksi dengan nominal dari database.
- Browser redirect tidak otomatis membuat status paid.
- Webhook signature invalid ditolak.
- Duplicate webhook idempotent.
- Nominal/order ID mismatch ditolak.
- Status payment dan booking konsisten.

## 6. Storage and chat

- File privat tidak dapat diakses tanpa authorization.
- Signed URL memiliki masa berlaku terbatas.
- Hanya participant conversation dapat membaca pesan.
- Presence tidak memberikan akses ke data privat.
- Pesan dan log tidak membocorkan data klinis.

## 7. UI

- Loading, empty, error, success state.
- Mobile/tablet/desktop.
- Keyboard navigation dan focus state.
- Form validation dan accessible labels.
