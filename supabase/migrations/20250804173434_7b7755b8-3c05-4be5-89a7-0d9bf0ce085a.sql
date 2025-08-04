-- Fix the RLS policy for group_members to allow group creation
-- The current policy is too restrictive for initial group creation

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Group members can be added by existing members" ON public.group_members;

-- Create a new policy that allows:
-- 1. Users to add themselves as lead when creating a new group
-- 2. Existing leads/admins to add other members
CREATE POLICY "Allow group creation and member management" ON public.group_members
FOR INSERT WITH CHECK (
  -- Allow if user is adding themselves as lead (group creation)
  (profile_id = auth.uid() AND role = 'lead')
  OR
  -- Allow if user is already a lead/admin in this conversation adding others
  (added_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.conversation_id = group_members.conversation_id 
    AND gm.profile_id = auth.uid() 
    AND gm.role IN ('lead', 'admin')
  ))
);

-- Fix the foreign key reference issue in fetchGroupMembers
-- Let's check if the foreign key exists and create a proper relationship
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_members_profile_id_fkey'
  ) THEN
    ALTER TABLE public.group_members 
    ADD CONSTRAINT group_members_profile_id_fkey 
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id);
  END IF;
END $$;