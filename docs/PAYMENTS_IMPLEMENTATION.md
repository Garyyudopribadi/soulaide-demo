# Payment Implementation (Phase 6)

## 1. Overview & Architecture

Integrasi pembayaran Soulaide menggunakan **Midtrans Snap API** dengan arsitektur **Zero-Trust Client Security**:
- **Midtrans Server Key** dirahasiakan sepenuhnya di lingkungan backend/Supabase Edge Function (`MIDTRANS_SERVER_KEY`), tidak pernah terekspos ke bundle JavaScript frontend.
- **Kalkulasi Harga Terpercaya:** Jumlah tagihan (`gross_amount`) selalu diambil langsung dari entitas database `Soulaide_services.price` yang terhubung dengan `Soulaide_bookings.service_id`. Klien browser dilarang mengirimkan nominal harga.
- **Verifikasi Kriptografis Webhook:** Midtrans HTTP notification divalidasi menggunakan algoritma hashing SHA-512 sesuai spesifikasi resmi Midtrans:
  $$\text{Signature} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{MIDTRANS\_SERVER\_KEY})$$
- **Idempotensi & Anti-Replay:** Setiap notifikasi webhook dicatat dalam tabel `public."Soulaide_payment_webhook_events"`. Event duplikat atau event *out-of-order* dicegah dari merusak status transaksi.
- **Verifikasi Server-Authoritative:** Klien tidak pernah mempercayai redirect URL browser sebagai bukti lunas. Klien selalu memverifikasi status pembayaran langsung dari database yang diperbarui oleh webhook terenkripsi.

---

## 2. Struktur Database & Kebijakan RLS

Sesuai aturan utama proyek, seluruh tabel custom menggunakan prefix persis `Soulaide_`:

1. **`public."Soulaide_payments"`**:
   - `id`: UUID (PK)
   - `booking_id`: UUID (FK ke `Soulaide_bookings`)
   - `amount`: BIGINT (Nominal dalam IDR)
   - `status`: `'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded'`
   - `midtrans_order_id`: TEXT (Unique)
   - `midtrans_transaction_id`: TEXT (Dari Midtrans)
   - `payment_type`: TEXT (e.g. `gopay`, `bank_transfer`, `qris`, `credit_card`)
   - `payment_time`: TIMESTAMPTZ

2. **`public."Soulaide_payment_webhook_events"`**:
   - `id`: UUID (PK)
   - `event_id`: TEXT (Unique deduplication key: `${transaction_id}:${status_code}:${transaction_status}`)
   - `order_id`: TEXT
   - `raw_payload`: JSONB
   - `status`: TEXT (`'processed'`)
   - `processed_at`: TIMESTAMPTZ

3. **`public."Soulaide_refunds"`**:
   - `id`: UUID (PK)
   - `payment_id`: UUID (FK ke `Soulaide_payments`)
   - `amount`: BIGINT
   - `reason`: TEXT
   - `status`: `'pending' | 'completed' | 'failed'`

---

## 3. Komponen Backend (Supabase Edge Functions)

### A. Edge Function `create-payment` (`supabase/functions/create-payment/index.ts`)
- Memvalidasi JWT token pengguna melalui `auth.getUser()`.
- Memastikan `booking.customer_id === user.id`.
- Memastikan status booking adalah `pending_payment`.
- Mengambil harga dari `Soulaide_services.price`.
- Mengirim request ke Midtrans Snap API `POST /snap/v1/transactions` dengan otorisasi Basic Auth server key.
- Merekam record transaksi ke `Soulaide_payments` dengan status `pending`.
- Mengembalikan `{ token, redirect_url, order_id, amount }`.
- Menyediakan fallback simulasi otomatis jika `MIDTRANS_SERVER_KEY` belum terkonfigurasi.

### B. Edge Function `midtrans-webhook` (`supabase/functions/midtrans-webhook/index.ts`)
- Menerima payload POST dari notifikasi webhook Midtrans.
- Menghitung hash SHA-512 dari `order_id + status_code + gross_amount + server_key`.
- Menolak notifikasi jika signature tidak cocok (HTTP 403 Forbidden).
- Memeriksa idempotensi deduplikasi event ke tabel `Soulaide_payment_webhook_events`.
- Melakukan transisi status state machine:
  - `settlement` atau `capture` (fraud_status: `accept`) $\rightarrow$ Payment: `paid`, Booking: `confirmed`.
  - `pending` $\rightarrow$ Payment: `pending`, Booking: `pending_payment`.
  - `deny`, `cancel` $\rightarrow$ Payment: `failed`, Booking: `cancelled`.
  - `expire` $\rightarrow$ Payment: `expired`, Booking: `cancelled`.
  - `refund`, `partial_refund` $\rightarrow$ Payment: `refunded`/`partially_refunded`.
- Mencatat seluruh siklus ke `Soulaide_audit_logs`.

---

## 4. Antarmuka Frontend & Integrasi

1. **`src/features/payments/types.ts`:**
   - Definisi tipe TypeScript untuk `PaymentRecord`, `PaymentStatus`, `MidtransSnapOptions`, dan deklarasi global `window.snap`.

2. **`src/features/payments/midtransCrypto.ts`:**
   - Fungsi kalkulasi dan verifikasi SHA-512 cross-platform Web Crypto API.
   - Fungsi pemetaan status deterministik `mapMidtransStatusToPaymentState()`.

3. **`src/features/payments/paymentService.ts`:**
   - Pemanggilan Supabase Edge Function `create-payment` dan query database verifikasi.

4. **`src/features/payments/PaymentStatusBadge.tsx`:**
   - Badge visual status pembayaran dengan indikator ikon intuitif.

5. **`src/features/payments/MidtransSnapModal.tsx`:**
   - Modal pembayaran terintegrasi dengan pemuatan dinamis skrip `snap.js`.
   - Mendukung popup Snap (`window.snap.pay`) dan tautan langsung ke tab baru jika popup diblokir browser.
   - Peringatan keamanan enkripsi dan tombol periksa status dari database.

6. **Integrasi ke Halaman Pemesanan & Dashboard Klien:**
   - `src/features/booking/BookingPage.tsx`: Integrasi tombol "Bayar Sekarang via Midtrans" langsung setelah reservasi slot berhasil dikunci di Step 5.
   - `src/features/customer/CustomerDashboardPage.tsx`: Tombol bayar pada setiap sesi berstatus `pending_payment` yang memicu modal pembayaran Snap.

---

## 5. Ringkasan Pengujian Unit

Seluruh pengujian berada di `src/features/payments/payments.test.ts`:
- Perhitungan hash SHA-512 berukuran 128 karakter heksadesimal.
- Verifikasi keberhasilan tanda tangan digital yang sah.
- Penolakan tanda tangan palsu / manipulasi nominal `gross_amount`.
- Penolakan tanda tangan dari server key asing.
- Transisi state status Midtrans (`settlement`, `capture`, `challenge`, `deny`, `cancel`, `expire`, `refund`).
