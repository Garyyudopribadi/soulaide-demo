-- Migration: 20261122000007_create_soulaide_admin_policies.sql
-- Description: Policies for admin booking operations, role management, and audit logs

-- 1. Soulaide_user_roles: Users can view own role, Admins can view all, Super Admins can manage
CREATE POLICY "Users and admins can view roles"
ON public."Soulaide_user_roles" FOR SELECT
USING (auth.uid() = user_id OR public."Soulaide_is_admin"(auth.uid()));

CREATE POLICY "Super admins can manage user roles"
ON public."Soulaide_user_roles" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()) AND public."Soulaide_get_user_role"(auth.uid()) = 'super_admin');

-- 2. Soulaide_bookings: Operational admins full management
CREATE POLICY "Admins can manage all bookings"
ON public."Soulaide_bookings" FOR ALL
USING (public."Soulaide_is_admin"(auth.uid()));

-- 3. Soulaide_audit_logs: Allow insert for system/admin tracking
CREATE POLICY "Authenticated users can insert audit logs"
ON public."Soulaide_audit_logs" FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
