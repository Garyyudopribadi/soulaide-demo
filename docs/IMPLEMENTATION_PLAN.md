# Implementation Plan

Kerjakan bertahap. Jangan melanjutkan fase berikutnya sebelum fase aktif diuji, didokumentasikan, dan direview.

## Phase 0 — Project audit

- Audit struktur repository dan package.
- Periksa konfigurasi Vite/React/TypeScript.
- Periksa konfigurasi Supabase dan env.
- Identifikasi fitur yang sudah ada.
- Catat risiko dan gap.
- Jangan overwrite konfigurasi tanpa alasan.

**Deliverables:** `docs/PROJECT_AUDIT.md`, daftar temuan, rencana perubahan.

## Phase 1 — Foundation

- Rapikan konfigurasi dasar tanpa merusak project.
- Setup routing dan layout dasar bila belum tersedia.
- Setup design system/tokens dan komponen dasar.
- Setup Supabase client dengan environment Vite.
- Setup lint/typecheck/test scripts.
- Buat skeleton folder berbasis fitur.

**Deliverables:** aplikasi dapat dijalankan, typecheck/lint berjalan, dokumentasi foundation.

## Phase 2 — Database and security

- Rancang schema final.
- Buat migrations dengan semua custom table berprefix `Soulaide_`.
- Buat indexes, constraints, functions/RPC, dan RLS.
- Buat seed data non-sensitif.
- Uji policy per role.

**Gate:** tidak ada tabel custom tanpa prefix; RLS teruji.

## Phase 3 — Authentication and authorization

- Supabase Auth flows.
- Profile creation/update.
- Role assignment secure.
- Protected routes dan server-side authorization.
- Password reset dan session handling.

## Phase 4 — Public website and CMS

- Landing page.
- Service pages.
- Psychologist profiles.
- FAQ/contact.
- CMS admin untuk konten.
- Responsive/accessibility/SEO.

## Phase 5 — Booking and scheduling

- Schedule management.
- Availability calculation.
- Atomic slot reservation.
- Booking creation and status history.
- Customer booking flow.
- Reschedule/cancel policy.

## Phase 6 — Payments

- Midtrans server integration.
- Edge Function transaction creation.
- Webhook signature verification.
- Idempotency and reconciliation.
- Payment status UI.

## Phase 7 — Customer dashboard

- Upcoming/history booking.
- Payment history.
- Profile and consent.
- Notifications and permitted chat.

## Phase 8 — Psychologist dashboard

- Assigned bookings.
- Calendar and availability.
- Presence.
- Access-controlled client information and clinical workflows.

## Phase 9 — Admin dashboard

- CMS.
- Services and pricing.
- Psychologists and schedules.
- Booking operations.
- Payment operations.
- Staff and roles.
- Audit logs.

## Phase 10 — Communications

- WhatsApp Click-to-Chat.
- Realtime chat.
- Presence and notification.
- Crisis disclaimer and approved escalation information.

## Phase 11 — Production readiness

- Security review.
- RLS and role tests.
- Payment sandbox-to-production checklist.
- Performance/accessibility checks.
- Backup and recovery plan.
- Monitoring and error handling.
- Deployment and handover documentation.

## Working agreement for coding agents

1. Mulai hanya dari Phase 0 dan Phase 1.
2. Jangan membuat semua fitur sekaligus.
3. Jangan menghapus file atau konfigurasi yang sudah ada tanpa penjelasan.
4. Setelah fase selesai, laporkan file yang berubah, keputusan, test yang dijalankan, hasil, dan blocker.
5. Berhenti dan tunggu instruksi sebelum fase berikutnya.

---

## Final Project Status Summary (All Phases 100% Completed)

| Phase | Nama Fase | Status | Dokumen Referensi |
| :--- | :--- | :---: | :--- |
| **Phase 0** | Project Audit | ✅ COMPLETED | [docs/PROJECT_AUDIT.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/PROJECT_AUDIT.md) |
| **Phase 1** | Foundation | ✅ COMPLETED | [docs/FOUNDATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/FOUNDATION.md) |
| **Phase 2** | Database & Security | ✅ COMPLETED | [docs/DATABASE_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/DATABASE_IMPLEMENTATION.md) |
| **Phase 3** | Authentication & Authorization | ✅ COMPLETED | [docs/AUTH_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/AUTH_IMPLEMENTATION.md) |
| **Phase 4** | Public Website & CMS | ✅ COMPLETED | [docs/PUBLIC_WEBSITE_AND_CMS.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/PUBLIC_WEBSITE_AND_CMS.md) |
| **Phase 5** | Booking & Scheduling | ✅ COMPLETED | [docs/BOOKING_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/BOOKING_IMPLEMENTATION.md) |
| **Phase 6** | Payments & Midtrans | ✅ COMPLETED | [docs/PAYMENTS_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/PAYMENTS_IMPLEMENTATION.md) |
| **Phase 7** | Customer Dashboard | ✅ COMPLETED | [docs/CUSTOMER_DASHBOARD_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/CUSTOMER_DASHBOARD_IMPLEMENTATION.md) |
| **Phase 8** | Psychologist Dashboard | ✅ COMPLETED | [docs/PSYCHOLOGIST_DASHBOARD_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/PSYCHOLOGIST_DASHBOARD_IMPLEMENTATION.md) |
| **Phase 9** | Admin Operations | ✅ COMPLETED | [docs/ADMIN_DASHBOARD_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/ADMIN_DASHBOARD_IMPLEMENTATION.md) |
| **Phase 10** | Communications & Presence | ✅ COMPLETED | [docs/COMMUNICATIONS_IMPLEMENTATION.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/COMMUNICATIONS_IMPLEMENTATION.md) |
| **Phase 11** | Production Readiness | ✅ COMPLETED | [docs/PRODUCTION_READINESS.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/PRODUCTION_READINESS.md) & [docs/DEPLOYMENT_AND_HANDOVER.md](file:///F:/Garyudo.my.id/soulaide-webapp/docs/DEPLOYMENT_AND_HANDOVER.md) |

