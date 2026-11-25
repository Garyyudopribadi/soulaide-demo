-- ==============================================================================
-- SOULAIDE PSYCHOLOGY PLATFORM - DATABASE SCHEMA
-- Migration: 20261122000001_create_soulaide_tables.sql
-- Mandatory Rule: Every custom table MUST use the exact prefix "Soulaide_"
-- All identifiers are quoted to prevent case folding in PostgreSQL.
-- ==============================================================================

-- 1. PROFILES & ROLES
CREATE TABLE public."Soulaide_profiles" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_user_roles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'psychologist', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Soulaide_user_roles_user_role_unique" UNIQUE (user_id, role)
);

CREATE TABLE public."Soulaide_staff_members" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PSYCHOLOGISTS & SERVICES
CREATE TABLE public."Soulaide_psychologists" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  credentials TEXT NOT NULL,
  bio TEXT,
  experience_years TEXT NOT NULL,
  initial_schedule TEXT,
  practice_areas TEXT[] NOT NULL DEFAULT '{}',
  approaches TEXT[] NOT NULL DEFAULT '{}',
  card_image_url TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_service_categories" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_services" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public."Soulaide_service_categories"(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  delivery_methods TEXT[] NOT NULL DEFAULT '{"online"}',
  price_online BIGINT,
  price_offline BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_service_psychologists" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public."Soulaide_services"(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Soulaide_service_psychologists_unique" UNIQUE (service_id, psychologist_id)
);

-- 3. SCHEDULING & BOOKINGS
CREATE TABLE public."Soulaide_psychologist_schedules" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Soulaide_schedule_time_check" CHECK (end_time > start_time)
);

CREATE TABLE public."Soulaide_availability_overrides" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_bookings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public."Soulaide_profiles"(id) ON DELETE RESTRICT,
  psychologist_id UUID NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public."Soulaide_services"(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  session_start_time TIME NOT NULL,
  session_end_time TIME NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('online', 'offline')),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'confirmed', 'reschedule_requested', 'rescheduled', 'completed', 'cancelled', 'no_show'
  )),
  notes TEXT,
  meeting_link TEXT,
  location_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Soulaide_booking_time_check" CHECK (session_end_time > session_start_time)
);

-- DOUBLE-BOOKING PREVENTION: Unique Partial Index on active booking slots
CREATE UNIQUE INDEX "Soulaide_bookings_no_overlap_idx"
ON public."Soulaide_bookings" (psychologist_id, session_date, session_start_time)
WHERE status IN ('pending_payment', 'confirmed', 'reschedule_requested', 'rescheduled');

CREATE TABLE public."Soulaide_booking_status_history" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public."Soulaide_bookings"(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_reschedule_requests" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public."Soulaide_bookings"(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposed_date DATE NOT NULL,
  proposed_start_time TIME NOT NULL,
  proposed_end_time TIME NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 4. INTAKE, CONSENT & CLINICAL RECORDS
CREATE TABLE public."Soulaide_client_profiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES public."Soulaide_profiles"(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT,
  occupation TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_assessments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public."Soulaide_profiles"(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public."Soulaide_bookings"(id) ON DELETE SET NULL,
  assessment_type TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_consent_records" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public."Soulaide_profiles"(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  version TEXT NOT NULL,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT
);

CREATE TABLE public."Soulaide_clinical_notes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public."Soulaide_bookings"(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public."Soulaide_profiles"(id) ON DELETE CASCADE,
  session_summary TEXT,
  clinical_observations TEXT,
  interventions_used TEXT,
  recommendations TEXT,
  is_confidential BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_clinical_reports" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public."Soulaide_bookings"(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public."Soulaide_profiles"(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENTS
CREATE TABLE public."Soulaide_payments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public."Soulaide_bookings"(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'failed', 'expired', 'refunded', 'partially_refunded'
  )),
  midtrans_order_id TEXT UNIQUE NOT NULL,
  midtrans_transaction_id TEXT,
  payment_type TEXT,
  payment_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_payment_webhook_events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_refunds" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public."Soulaide_payments"(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CHAT, PRESENCE & NOTIFICATIONS
CREATE TABLE public."Soulaide_conversations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public."Soulaide_bookings"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_conversation_participants" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public."Soulaide_conversations"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Soulaide_conversation_participants_unique" UNIQUE (conversation_id, user_id)
);

CREATE TABLE public."Soulaide_messages" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public."Soulaide_conversations"(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_psychologist_presence" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID UNIQUE NOT NULL REFERENCES public."Soulaide_psychologists"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'available', 'busy', 'away')),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_notifications" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CMS & AUDIT LOGS
CREATE TABLE public."Soulaide_cms_pages" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_faqs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_site_settings" (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."Soulaide_audit_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FREQUENT QUERY PATHS
CREATE INDEX "Soulaide_bookings_customer_id_idx" ON public."Soulaide_bookings" (customer_id);
CREATE INDEX "Soulaide_bookings_psychologist_id_idx" ON public."Soulaide_bookings" (psychologist_id);
CREATE INDEX "Soulaide_bookings_session_date_idx" ON public."Soulaide_bookings" (session_date);
CREATE INDEX "Soulaide_payments_booking_id_idx" ON public."Soulaide_payments" (booking_id);
CREATE INDEX "Soulaide_messages_conversation_id_idx" ON public."Soulaide_messages" (conversation_id);
CREATE INDEX "Soulaide_audit_logs_actor_id_idx" ON public."Soulaide_audit_logs" (actor_id);
