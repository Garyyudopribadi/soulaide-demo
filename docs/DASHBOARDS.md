# Dashboard Requirements & UI Architecture

## 1. Shared dashboard shell

All authenticated workspaces (`/dashboard`, `/psychologist`, `/admin`) use the shared
`DashboardShell` component instead of the public marketing header/footer.

- **Desktop:** fixed dark-plum sidebar with brand, user identity, grouped navigation,
  role badge, security note, site link, and sign-out.
- **Mobile:** the sidebar becomes an accessible slide-over drawer with a backdrop,
  Escape-to-close, and body scroll lock.
- **Top bar:** current workspace/section, date, notification shortcut (when available),
  public-site link, and compact user chip.
- **Content area:** warm ivory canvas, max-width container, and a subtle entrance animation
  that respects `prefers-reduced-motion`.
- **Navigation:** role-specific only. The UI never exposes a menu item that the role
  cannot use, and server-side/RLS authorization remains the source of truth.

Shared UI primitives live in `src/components/dashboard/`:

- `DashboardShell.tsx` — workspace chrome and navigation.
- `DashboardPageHeader.tsx` — overview hero heading with actions and status meta.
- `DashboardSubHeader.tsx` — compact section heading for non-overview tabs.
- `StatCard.tsx` — KPI tile with tone, hint, and optional navigation.
- `DashboardSection.tsx` — consistent card section with title, description, icon, action.
- `DashboardCharts.tsx` — dependency-free 7-day load chart and status breakdown.
- `src/lib/dashboard.ts` — date-window, count, formatting, initials, and profile
  completion helpers (unit tested).

## 2. Customer dashboard

Information architecture:

1. **Beranda saya** — greeting, next-session hero, KPI row, attention queue, profile
   completion, account/privacy summary, recent payments.
2. **Sesi konseling** — upcoming/history filters, search, payment, join, chat,
   reschedule, and cancel actions.
3. **Tagihan & kwitansi** — invoice history and printable receipt.
4. **Profil & consent** — identity, emergency contact, and informed-consent archive.
5. **Notifikasi** — unread state and mark-as-read actions.

The next-session hero prioritizes the immediately useful action: pay, join the online
room, or coordinate via chat. If there is no upcoming session, the empty state invites a
new booking without implying urgency.

## 3. Psychologist dashboard

Information architecture:

1. **Beranda praktik** — greeting, live presence control, KPI row, today's agenda,
   pending clinical notes, upcoming sessions, 7-day load, availability summary, and
   privacy reminder.
2. **Jadwal sesi** — today/upcoming/completed/all filters, search, join links, clinical
   notes, and client coordination.
3. **Ketersediaan** — recurring weekly practice hours and 24-hour preparation rule.

Clinical notes remain reachable only through authorized session surfaces. The dashboard
does not surface another psychologist's bookings or notes.

## 4. Admin dashboard

Information architecture:

1. **Ringkasan** — operational KPIs, action queue (pending payments, reschedule
   requests, failed/expired transactions), upcoming sessions, recent audit activity,
   weekly load, status distribution, and ecosystem readiness.
2. **Reservasi & Jadwal** — operational booking table, status filters, search, method
   filter, status changes, and psychologist reassignment.
3. **Pembayaran & Refund** — Midtrans reconciliation and refund workflow.
4. **Layanan & Tarif / Profil Psikolog / Pusat Bantuan / Pengaturan Situs** — CMS.
5. **Staf & Otoritas** — role management with the Super Admin guard.
6. **Jejak Audit** — searchable audit trail and metadata inspection.

Admin surfaces never expose clinical-note content. KPI and audit views are operational
only.

## 5. UX requirements

- Every dashboard has loading, empty, error, and success states.
- Tables and lists support relevant search/filter controls.
- Status labels are human-readable and consistently toned.
- Destructive actions require confirmation.
- Layouts are responsive for mobile, tablet, and desktop.
- Navigation, stat tiles, and section actions have accessible labels and keyboard focus.
- Role-specific menus are hidden when irrelevant, but permission enforcement stays in
  the database and service layer.
- Clinical and payment status must be presented descriptively, never as a guarantee of
  clinical outcome or gateway settlement.
