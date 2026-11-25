-- Migration: 20261122000006_create_soulaide_psychologist_policies.sql
-- Description: Policies for psychologists to manage own schedules, availability, and presence

-- 1. Psychologists can view and update their own profile
CREATE POLICY "Psychologists can update own record"
ON public."Soulaide_psychologists" FOR UPDATE
USING (user_id = auth.uid());

-- 2. Psychologists can manage their own recurring schedules
CREATE POLICY "Psychologists can manage own schedules"
ON public."Soulaide_psychologist_schedules" FOR ALL
USING (psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()));

-- 3. Psychologists can manage their own availability overrides
CREATE POLICY "Psychologists can manage own overrides"
ON public."Soulaide_availability_overrides" FOR ALL
USING (psychologist_id = public."Soulaide_get_psychologist_id"(auth.uid()));
