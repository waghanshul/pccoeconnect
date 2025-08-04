-- Create security definer function to check if user is group lead or admin
CREATE OR REPLACE FUNCTION public.is_group_lead_or_admin(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.conversation_id = is_group_lead_or_admin.conversation_id 
    AND gm.profile_id = is_group_lead_or_admin.user_id
    AND gm.role IN ('lead', 'admin')
  );
END;
$function$

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Allow group creation and member management" ON public.group_members;

-- Create new INSERT policy that avoids recursion
CREATE POLICY "Allow group creation and member management" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  -- Allow user to add themselves as lead (for group creation)
  (profile_id = auth.uid() AND role = 'lead') 
  OR 
  -- Allow existing leads/admins to add other members (using security definer function)
  (added_by = auth.uid() AND is_group_lead_or_admin(conversation_id, auth.uid()))
);