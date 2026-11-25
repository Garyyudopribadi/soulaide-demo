-- ==============================================================================
-- SOULAIDE PSYCHOLOGY PLATFORM - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20261122000003_create_soulaide_rls_policies.sql
-- ==============================================================================

-- Enable RLS on all custom tables
ALTER TABLE public."Soulaide_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_staff_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_psychologists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_service_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_service_psychologists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_psychologist_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_availability_overrides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_booking_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_reschedule_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_client_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_consent_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_clinical_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_clinical_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_payment_webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_refunds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_conversation_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_psychologist_presence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_cms_pages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_faqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Soulaide_audit_logs" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PUBLIC READ POLICIES (Anonymous & Authenticated)
-- ------------------------------------------------------------------------------

-- Public can read active psychologists
CREATE POLICY "Public can view active psychologists"
ON public."Soulaide_psychologists" FOR SELECT
USING (is_active = TRUE OR public."Soulaide_is_admin"(auth.uid()));

-- Public can view service categories and active services
CREATE POLICY "Public can view service categories"
ON public."Soulaide_service_categories" FOR SELECT
USING (TRUE);

CREATE POLICY "Public can view active services"
ON public."Soulaide_services" FOR SELECT
USING (is_active = TRUE OR public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Public can view active service psychologists"
ON public."Soulaide_service_psychologists" FOR SELECT
USING (TRUE);

-- Public can view active psychologist schedules & overrides (for calendar slot display)
CREATE POLICY "Public can view active schedules"
ON public."Soulaide_psychologist_schedules" FOR SELECT
USING (is_active = TRUE OR public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Public can view availability overrides"
ON public."Soulaide_availability_overrides" FOR SELECT
USING (TRUE);

-- Public can view presence
CREATE POLICY "Public can view psychologist presence"
ON public."Soulaide_psychologist_presence" FOR SELECT
USING (TRUE);

-- Public can view published CMS pages and active FAQs
CREATE POLICY "Public can view published CMS pages"
ON public."Soulaide_cms_pages" FOR SELECT
USING (is_published = TRUE OR public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Public can view active FAQs"
ON public."Soulaide_faqs" FOR SELECT
USING (is_active = TRUE OR public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Public can view public site settings"
ON public."Soulaide_site_settings" FOR SELECT
USING (TRUE);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILE & CLIENT INTAKE POLICIES
-- ------------------------------------------------------------------------------

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile"
ON public."Soulaide_profiles" FOR SELECT
USING (auth.uid() = id OR public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Users can update own profile"
ON public."Soulaide_profiles" FOR UPDATE
USING (auth.uid() = id);

-- Client profiles (emergency contacts, DOB, etc.)
CREATE POLICY "Customers can manage own client profile"
ON public."Soulaide_client_profiles" FOR ALL
USING (auth.uid() = customer_id);

CREATE POLICY "Assigned psychologists can view client profile"
ON public."Soulaide_client_profiles" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_bookings" b
    WHERE b.customer_id = public."Soulaide_client_profiles".customer_id
      AND b.psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid())
      AND b.status IN ('confirmed', 'completed')
  )
);

-- Assessments & Consent
CREATE POLICY "Customers can view own assessments"
ON public."Soulaide_assessments" FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert own assessments"
ON public."Soulaide_assessments" FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Assigned psychologists can view client assessments"
ON public."Soulaide_assessments" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_bookings" b
    WHERE b.id = public."Soulaide_assessments".booking_id
      AND b.psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid())
  )
);

CREATE POLICY "Customers can manage own consent records"
ON public."Soulaide_consent_records" FOR ALL
USING (auth.uid() = customer_id);

-- ------------------------------------------------------------------------------
-- 3. BOOKINGS & PAYMENTS POLICIES
-- ------------------------------------------------------------------------------

-- Bookings access
CREATE POLICY "Customers can view own bookings"
ON public."Soulaide_bookings" FOR SELECT
USING (
  auth.uid() = customer_id OR
  psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
  public."Soulaide_is_admin"(auth.uid())
);

CREATE POLICY "Customers can create bookings for themselves"
ON public."Soulaide_bookings" FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers and Admins can update booking"
ON public."Soulaide_bookings" FOR UPDATE
USING (
  auth.uid() = customer_id OR
  psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
  public."Soulaide_is_admin"(auth.uid())
);

-- Status history
CREATE POLICY "Participants can view booking status history"
ON public."Soulaide_booking_status_history" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_bookings" b
    WHERE b.id = booking_id AND (
      b.customer_id = auth.uid() OR
      b.psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
      public."Soulaide_is_admin"(auth.uid())
    )
  )
);

-- Reschedule requests
CREATE POLICY "Participants can manage reschedule requests"
ON public."Soulaide_reschedule_requests" FOR ALL
USING (
  requested_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public."Soulaide_bookings" b
    WHERE b.id = booking_id AND (
      b.psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
      public."Soulaide_is_admin"(auth.uid())
    )
  )
);

-- Payments
CREATE POLICY "Customers can view own payments"
ON public."Soulaide_payments" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_bookings" b
    WHERE b.id = booking_id AND b.customer_id = auth.uid()
  ) OR public."Soulaide_is_admin"(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 4. CLINICAL PRIVACY POLICIES (STRICT LEAST PRIVILEGE)
-- Clinical notes must NOT be visible to general operational admins!
-- Only assigned psychologist or clinical super_admin.
-- ------------------------------------------------------------------------------

CREATE POLICY "Assigned psychologist can view clinical notes"
ON public."Soulaide_clinical_notes" FOR SELECT
USING (
  psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
  (public."Soulaide_is_admin"(auth.uid()) AND public."Soulaide_get_user_role"(auth.uid()) = 'super_admin')
);

CREATE POLICY "Assigned psychologist can insert and update clinical notes"
ON public."Soulaide_clinical_notes" FOR ALL
USING (
  psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid())
);

CREATE POLICY "Assigned psychologist can manage clinical reports"
ON public."Soulaide_clinical_reports" FOR ALL
USING (
  psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
  (public."Soulaide_is_admin"(auth.uid()) AND public."Soulaide_get_user_role"(auth.uid()) = 'super_admin')
);

-- ------------------------------------------------------------------------------
-- 5. CHAT, PRESENCE & NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Participants can view conversations"
ON public."Soulaide_conversations" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_conversation_participants" cp
    WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
  ) OR public."Soulaide_is_admin"(auth.uid())
);

CREATE POLICY "Participants can view messages"
ON public."Soulaide_messages" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_conversation_participants" cp
    WHERE cp.conversation_id = public."Soulaide_messages".conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can insert messages"
ON public."Soulaide_messages" FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public."Soulaide_conversation_participants" cp
    WHERE cp.conversation_id = public."Soulaide_messages".conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Psychologist can update own presence"
ON public."Soulaide_psychologist_presence" FOR ALL
USING (
  psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()) OR
  public."Soulaide_is_admin"(auth.uid())
);

CREATE POLICY "Users can manage own notifications"
ON public."Soulaide_notifications" FOR ALL
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. ADMIN CMS, AUDIT LOGS & SETTINGS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY "Admins can manage psychologists"
ON public."Soulaide_psychologists" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage services"
ON public."Soulaide_services" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage service categories"
ON public."Soulaide_service_categories" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage schedules"
ON public."Soulaide_psychologist_schedules" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage overrides"
ON public."Soulaide_availability_overrides" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage CMS pages"
ON public."Soulaide_cms_pages" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage FAQs"
ON public."Soulaide_faqs" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can manage site settings"
ON public."Soulaide_site_settings" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Admins can view audit logs"
ON public."Soulaide_audit_logs" FOR SELECT
USING (public."Soulaide_is_admin"(auth.uid()));
