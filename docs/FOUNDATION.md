# Foundation Architecture (Phase 1)

Dokumentasi implementasi fondasi aplikasi web Soulaide Psychology.

---

## 1. Perubahan & Pengaturan Konfigurasi Dasar

- **Package Manager Fix:**
  - Ditambahkan `.npmrc` dengan `node-linker=hoisted` untuk menjamin kompatibilitas resolusi modul di environment Windows.
- **Path Alias:**
  - Ditambahkan alias `@/*` -> `./src/*` pada `tsconfig.app.json` dan `vite.config.ts`.
- **Scripts `package.json`:**
  - `pnpm dev`: Menjalankan Vite development server.
  - `pnpm build`: Menjalankan TypeScript typecheck (`tsc -b`) dan Vite production bundle.
  - `pnpm lint`: Menjalankan ESLint flat config.
  - `pnpm typecheck`: Menjalankan `tsc -b` tanpa build.
  - `pnpm test`: Menjalankan Vitest suite.
  - `pnpm preview`: Membuka preview build lokal.

---

## 2. Dependensi Fondasi yang Dipasang

- **Routing:** `react-router-dom` (v7)
- **Styling & Icons:** `tailwindcss` (v4), `@tailwindcss/vite`, `clsx`, `tailwind-merge`, `lucide-react`
- **State & Data Fetching:** `@tanstack/react-query` (v5)
- **Backend Client:** `@supabase/supabase-js` (v2)
- **Form & Validation:** `react-hook-form`, `zod`
- **Testing:** `vitest`

---

## 3. Struktur Direktori Berbasis Fitur (`src/`)

```text
src/
  app/
    providers/
      AppProviders.tsx
      QueryProvider.tsx
    router/
      index.tsx
  components/
    ui/
      button.tsx
      badge.tsx
      card.tsx
    shared/
      Header.tsx
      Footer.tsx
      Layout.tsx
      LoadingState.tsx
      ErrorState.tsx
      EmptyState.tsx
  features/
    admin/
      AdminDashboardPage.tsx
    auth/
      LoginPage.tsx
      RegisterPage.tsx
    booking/
      BookingPage.tsx
    chat/
    customer/
      CustomerDashboardPage.tsx
    notifications/
    payments/
    psychologist/
      PsychologistDashboardPage.tsx
    psychologists/
      data.ts
    public-site/
      LandingPage.tsx
      ServicesPage.tsx
      PsychologistsPage.tsx
      FaqPage.tsx
      ContactPage.tsx
      NotFoundPage.tsx
    services/
  lib/
    supabase/
      client.ts
    utils.ts
    utils.test.ts
  types/
    database.ts
    index.ts
  App.tsx
  index.css
  main.tsx
```

---

## 4. Setup Supabase Client & Konvensi Tabel `Soulaide_`

- File: `src/lib/supabase/client.ts`
- Menggunakan `createClient<Database>` yang mengimpor definisi tipe dari `src/types/database.ts`.
- **CRITICAL RULE:** Seluruh tabel database custom didefinisikan dengan prefix `Soulaide_`:
  - `Soulaide_profiles`
  - `Soulaide_user_roles`
  - `Soulaide_psychologists`
  - `Soulaide_services`
  - `Soulaide_bookings`
  - `Soulaide_payments`
  - `Soulaide_psychologist_presence`
- Variabel environment diverifikasi menggunakan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## 5. Hasil Verifikasi Fondasi

Semua tahapan pengujian dasar telah dijalankan dan berhasil 100%:
1. `pnpm typecheck` (`tsc -b`): **Exit 0 (No type errors)**
2. `pnpm lint` (`eslint .`): **Exit 0 (No lint errors)**
3. `pnpm test` (`vitest run`): **Exit 0 (3/3 unit tests passing)**
4. `pnpm build` (`vite build`): **Exit 0 (Production bundle built successfully)**
