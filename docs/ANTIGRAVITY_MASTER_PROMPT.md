# Master Prompt — Soulaide Psychology Web Application

You are a senior full-stack engineer and product-minded software architect. Build the Soulaide Psychology web application inside the existing repository.

## Mandatory first action

Read the documentation in `docs/`, inspect the existing repository, and report the current state before making broad changes. Start with Phase 0 and Phase 1 only from `IMPLEMENTATION_PLAN.md`. Stop after those phases and wait for approval.

## Product

Build a professional, trustworthy, warm, modern psychology counseling platform with:
- Public landing page and service information.
- Four initial psychologist profiles, editable by admin.
- Schedule availability and booking.
- Online payment through Midtrans.
- WhatsApp Click-to-Chat.
- Customer dashboard.
- Psychologist dashboard.
- Admin/staff dashboard.
- Realtime informational chat and psychologist presence.
- CMS for content, services, prices, psychologist profiles, schedules, payment information, and FAQs.

Follow all requirements and unresolved decisions in the documentation. Never invent unconfirmed prices, policies, credentials, addresses, or clinical procedures.

## Stack

Use the existing project where possible. Target stack:
- React + Vite + TypeScript.
- React Router.
- Tailwind CSS and shadcn/ui.
- Lucide icons.
- React Hook Form + Zod.
- TanStack Query.
- Supabase Auth, PostgreSQL, Storage, Realtime, Edge Functions.
- Midtrans for payment.
- Vercel or equivalent deployment.

Do not replace working infrastructure without explaining why.

## CRITICAL DATABASE NAMING RULE

Every custom Supabase/PostgreSQL table created for this project MUST start with the exact prefix `Soulaide_`.

Examples:
- `Soulaide_profiles`
- `Soulaide_user_roles`
- `Soulaide_psychologists`
- `Soulaide_services`
- `Soulaide_bookings`
- `Soulaide_payments`
- `Soulaide_messages`

Because PostgreSQL folds unquoted identifiers to lowercase, always double-quote identifiers with this mixed-case prefix in SQL:

```sql
CREATE TABLE public."Soulaide_profiles" (...);
```

Use exact table names in Supabase queries:

```ts
supabase.from("Soulaide_profiles").select("*");
```

Apply the naming convention consistently to migrations, foreign key references, policies, triggers, indexes, seeds, and application queries. Do not rename or alter Supabase system tables/schemas. No custom table may be created without this prefix.

## Engineering rules

1. Inspect before modifying.
2. TypeScript strict; avoid `any`.
3. No frontend secrets. Never expose service role or Midtrans server key.
4. RLS is mandatory; frontend route guards are not security boundaries.
5. Validate all input on server and client.
6. Use atomic database logic to prevent double booking.
7. Payment status must come from verified server webhook, never browser redirect alone.
8. Keep booking status separate from payment status.
9. Protect assessment data and clinical notes with strict, separate access rules.
10. Do not log sensitive clinical data.
11. Do not create fake buttons or mock functionality presented as production-ready.
12. Build accessible responsive UI with loading, empty, error, and success states.
13. Add tests for critical workflows.
14. Update documentation when architecture or schema changes.
15. Do not silently overwrite or delete existing project files.

## Security and clinical privacy

Treat assessment answers, clinical notes, and related personal information as highly sensitive. Apply least privilege, RLS, private storage, signed URLs, and audit logging. General admin access must not automatically grant access to clinical notes. Chat/WhatsApp is not an emergency service or a replacement for counseling. Any crisis escalation process must be approved by the clinical lead.

## Initial data and business rules

Use `CONTENT_AND_SERVICES.md` for the initial psychologist profiles, service names, confirmed prices, and methods. Treat schedules as initial references, not guaranteed availability. Do not invent unconfirmed Soul Expert or offline prices.

Use `BOOKING_WORKFLOW.md` for initial booking assumptions. Clearly mark policies requiring approval rather than hard-coding them as final.

Use `ENVIRONMENT.md`: Vite variables use `VITE_` prefix, including `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Do not use `NEXT_PUBLIC_` in this Vite project.

## Required workflow

For the current task:
1. Audit repository and existing app.
2. Report existing structure, dependencies, configuration, and risks.
3. Implement only foundation work in Phase 0/1.
4. Run available lint, typecheck, tests, and build.
5. Update docs with actual findings.
6. Report changed files, commands run, results, unresolved decisions, and next recommended phase.
7. Stop and wait for approval.

Do not proceed to database implementation, payment integration, or dashboards until explicitly instructed.
