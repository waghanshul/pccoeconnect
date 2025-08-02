-- Fix security warning for is_group_member function
CREATE OR REPLACE FUNCTION public.is_group_member(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.conversation_id = is_group_member.conversation_id 
    AND gm.profile_id = is_group_member.user_id
  );
END;
$$;