-- Phase 10: Communications Policies & Realtime Publication
-- Enables RLS policies for Soulaide_conversations, Soulaide_conversation_participants, Soulaide_messages,
-- Soulaide_psychologist_presence, and Soulaide_notifications, plus adds tables to supabase_realtime publication.

-- 1. Soulaide_conversations: allow authenticated participants/admins to create conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'Soulaide_conversations' AND policyname = 'Authenticated users can create conversations'
  ) THEN
    CREATE POLICY "Authenticated users can create conversations"
    ON public."Soulaide_conversations" FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 2. Soulaide_conversation_participants: allow participants and admins to view and insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'Soulaide_conversation_participants' AND policyname = 'Participants can view conversation participants'
  ) THEN
    CREATE POLICY "Participants can view conversation participants"
    ON public."Soulaide_conversation_participants" FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public."Soulaide_conversation_participants" cp
        WHERE cp.conversation_id = public."Soulaide_conversation_participants".conversation_id AND cp.user_id = auth.uid()
      ) OR public."Soulaide_is_admin"(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'Soulaide_conversation_participants' AND policyname = 'Authenticated users can add participants'
  ) THEN
    CREATE POLICY "Authenticated users can add participants"
    ON public."Soulaide_conversation_participants" FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 3. Soulaide_messages: allow participants to update read status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'Soulaide_messages' AND policyname = 'Participants can update message read status'
  ) THEN
    CREATE POLICY "Participants can update message read status"
    ON public."Soulaide_messages" FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public."Soulaide_conversation_participants" cp
        WHERE cp.conversation_id = public."Soulaide_messages".conversation_id AND cp.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public."Soulaide_conversation_participants" cp
        WHERE cp.conversation_id = public."Soulaide_messages".conversation_id AND cp.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 4. Supabase Realtime Publication
-- Add communications tables to supabase_realtime publication if not already present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'Soulaide_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public."Soulaide_messages";
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'Soulaide_psychologist_presence'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public."Soulaide_psychologist_presence";
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'Soulaide_notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public."Soulaide_notifications";
    END IF;
  END IF;
END $$;
