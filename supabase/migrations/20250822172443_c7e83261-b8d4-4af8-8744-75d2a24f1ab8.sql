-- Create improved function to check if user can access conversation messages
-- This handles both direct messages (conversation_participants) and group messages (group_members)
CREATE OR REPLACE FUNCTION is_user_in_conversation(conversation_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is in conversation_participants (direct messages)
  IF EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversation_id_param 
    AND profile_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is in group_members (group conversations)
  IF EXISTS (
    SELECT 1 FROM group_members 
    WHERE conversation_id = conversation_id_param 
    AND profile_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update messages RLS policy to use the new function
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;

CREATE POLICY "messages_select_policy" 
ON public.messages 
FOR SELECT 
USING (is_user_in_conversation(conversation_id, auth.uid()));

-- Update messages insert policy to use the new function  
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

CREATE POLICY "messages_insert_policy" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() 
  AND is_user_in_conversation(conversation_id, auth.uid())
);