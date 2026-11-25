-- ==============================================================================
-- SOULAIDE PSYCHOLOGY PLATFORM - DATABASE FUNCTIONS & ATOMIC BOOKING
-- Migration: 20261122000002_create_soulaide_functions_and_atomic_booking.sql
-- ==============================================================================

-- 1. Helper function: Get user role safely
CREATE OR REPLACE FUNCTION public."Soulaide_get_user_role"(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public."Soulaide_user_roles"
  WHERE user_id = p_user_id
  ORDER BY CASE
    WHEN role = 'super_admin' THEN 1
    WHEN role = 'admin' THEN 2
    WHEN role = 'psychologist' THEN 3
    ELSE 4
  END
  LIMIT 1;
$$;

-- 2. Helper function: Check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public."Soulaide_is_admin"(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."Soulaide_user_roles"
    WHERE user_id = p_user_id AND role IN ('admin', 'super_admin')
  );
$$;

-- 3. Helper function: Check if user is psychologist
CREATE OR REPLACE FUNCTION public."Soulaide_is_psychologist"(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."Soulaide_user_roles"
    WHERE user_id = p_user_id AND role = 'psychologist'
  );
$$;

-- 4. Helper function: Get psychologist ID by auth user ID
CREATE OR REPLACE FUNCTION public."Soulaide_get_psychologist_id"(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public."Soulaide_psychologists"
  WHERE user_id = p_user_id
  LIMIT 1;
$$;

-- 5. Atomic Slot Reservation & Double Booking Prevention RPC
-- This function takes a transaction lock on the psychologist and target date,
-- checks availability and active bookings, and safely inserts the booking.
CREATE OR REPLACE FUNCTION public."Soulaide_reserve_slot_atomic"(
  p_customer_id UUID,
  p_psychologist_id UUID,
  p_service_id UUID,
  p_session_date DATE,
  p_session_start_time TIME,
  p_delivery_method TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_booking_code TEXT;
  v_service_duration INTEGER;
  v_session_end_time TIME;
  v_conflict_count INTEGER;
  v_lead_time_hours NUMERIC;
BEGIN
  -- Verify authentication
  IF auth.uid() IS NULL OR auth.uid() <> p_customer_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized booking request');
  END IF;

  -- Verify lead time (at least 24 hours prior to session start)
  SELECT EXTRACT(EPOCH FROM ((p_session_date + p_session_start_time)::timestamptz - NOW())) / 3600.0
  INTO v_lead_time_hours;

  IF v_lead_time_hours < 24.0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking lead time minimal 24 jam sebelum sesi berlangsung'
    );
  END IF;

  -- Acquire exclusive advisory lock for this psychologist on this specific date
  -- to eliminate race conditions from concurrent bookings
  PERFORM pg_advisory_xact_lock(
    hashtext(p_psychologist_id::text),
    p_session_date - '2020-01-01'::date
  );

  -- Retrieve service duration
  SELECT duration_minutes INTO v_service_duration
  FROM public."Soulaide_services"
  WHERE id = p_service_id AND is_active = TRUE;

  IF v_service_duration IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Layanan tidak ditemukan atau tidak aktif');
  END IF;

  -- Calculate end time
  v_session_end_time := p_session_start_time + (v_service_duration || ' minutes')::interval;

  -- Check if slot is already occupied by an active booking
  SELECT COUNT(*) INTO v_conflict_count
  FROM public."Soulaide_bookings"
  WHERE psychologist_id = p_psychologist_id
    AND session_date = p_session_date
    AND status IN ('pending_payment', 'confirmed', 'reschedule_requested', 'rescheduled')
    AND (
      (session_start_time <= p_session_start_time AND session_end_time > p_session_start_time) OR
      (session_start_time < v_session_end_time AND session_end_time >= v_session_end_time) OR
      (session_start_time >= p_session_start_time AND session_end_time <= v_session_end_time)
    );

  IF v_conflict_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Slot waktu tersebut sudah dipesan. Silakan pilih slot lain.'
    );
  END IF;

  -- Generate readable booking code (e.g. SLD-YYYYMMDD-XXXX)
  v_booking_code := 'SLD-' || TO_CHAR(p_session_date, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 4));

  -- Insert booking
  INSERT INTO public."Soulaide_bookings" (
    booking_code,
    customer_id,
    psychologist_id,
    service_id,
    session_date,
    session_start_time,
    session_end_time,
    delivery_method,
    status,
    notes
  ) VALUES (
    v_booking_code,
    p_customer_id,
    p_psychologist_id,
    p_service_id,
    p_session_date,
    p_session_start_time,
    v_session_end_time,
    p_delivery_method,
    'pending_payment',
    p_notes
  ) RETURNING id INTO v_booking_id;

  -- Record initial status history
  INSERT INTO public."Soulaide_booking_status_history" (
    booking_id,
    from_status,
    to_status,
    changed_by,
    reason
  ) VALUES (
    v_booking_id,
    NULL,
    'pending_payment',
    p_customer_id,
    'Inisiasi reservasi sesi awal'
  );

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', v_booking_code
  );
END;
$$;

-- 6. Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public."Soulaide_handle_updated_at"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attach triggers to all tables with updated_at
CREATE TRIGGER "Soulaide_profiles_updated_at"
BEFORE UPDATE ON public."Soulaide_profiles"
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_updated_at"();

CREATE TRIGGER "Soulaide_psychologists_updated_at"
BEFORE UPDATE ON public."Soulaide_psychologists"
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_updated_at"();

CREATE TRIGGER "Soulaide_services_updated_at"
BEFORE UPDATE ON public."Soulaide_services"
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_updated_at"();

CREATE TRIGGER "Soulaide_bookings_updated_at"
BEFORE UPDATE ON public."Soulaide_bookings"
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_updated_at"();

CREATE TRIGGER "Soulaide_payments_updated_at"
BEFORE UPDATE ON public."Soulaide_payments"
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_updated_at"();

CREATE TRIGGER "Soulaide_clinical_notes_updated_at"
BEFORE UPDATE ON public."Soulaide_clinical_notes"
FOR EACH ROW EXECUTE FUNCTION public."Soulaide_handle_updated_at"();
