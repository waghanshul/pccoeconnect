-- Clean up duplicate/conflicting policies on messages to rely on is_user_in_conversation only
-- Note: Do not alter reserved schemas. Only modify public.messages policies

-- Drop older policies that reference only conversation_participants or duplicate names
DO $$
BEGIN
  -- Safely drop if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_update'
  ) THEN
    EXECUTE 'DROP POLICY "messages_update" ON public.messages';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_insert'
  ) THEN
    EXECUTE 'DROP POLICY "messages_insert" ON public.messages';
  END IF;
END $$;

-- Ensure clear, non-duplicated policies using is_user_in_conversation()
-- Keep/select policy (recreate to be explicit)
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
CREATE POLICY "messages_select_policy"
ON public.messages
FOR SELECT
USING (public.is_user_in_conversation(conversation_id, auth.uid()));

-- Insert policy: only sender can insert AND must belong to conversation (direct or group)
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_user_in_conversation(conversation_id, auth.uid())
);

-- Update policy: only sender can update own messages
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
CREATE POLICY "messages_update_policy"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid());
