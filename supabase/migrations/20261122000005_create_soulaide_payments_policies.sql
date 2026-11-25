-- Migration: 20261122000005_create_soulaide_payments_policies.sql
-- Description: Policies for Soulaide payments, payment webhook events, and refunds

-- 1. Soulaide_payments: Allow operational admins full management
CREATE POLICY "Admins can manage payments"
ON public."Soulaide_payments" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

-- 2. Soulaide_payment_webhook_events: Restrict to admins and service_role
CREATE POLICY "Admins can manage webhook events"
ON public."Soulaide_payment_webhook_events" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

-- 3. Soulaide_refunds: Admins can manage all refunds
CREATE POLICY "Admins can manage refunds"
ON public."Soulaide_refunds" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

-- 4. Soulaide_refunds: Customers can view their own booking refunds
CREATE POLICY "Customers can view their booking refunds"
ON public."Soulaide_refunds" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public."Soulaide_payments" p
    JOIN public."Soulaide_bookings" b ON b.id = p.booking_id
    WHERE p.id = payment_id AND b.customer_id = auth.uid()
  )
);
