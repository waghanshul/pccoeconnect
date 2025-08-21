
-- 1) Helper functions (SECURITY DEFINER, no recursion)
CREATE OR REPLACE FUNCTION public.is_group_lead_or_admin(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.conversation_id = is_group_lead_or_admin.conversation_id
      AND gm.profile_id = is_group_lead_or_admin.user_id
      AND gm.role IN ('lead','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_lead(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.conversation_id = is_group_lead.conversation_id
      AND gm.profile_id = is_group_lead.user_id
      AND gm.role = 'lead'
  );
$$;

-- Allow authenticated users to execute these helpers
GRANT EXECUTE ON FUNCTION public.is_group_lead_or_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_lead(uuid, uuid) TO authenticated;

-- 2) Replace all group_members RLS policies to avoid recursion
DROP POLICY IF EXISTS "Allow group creation and member management" ON public.group_members;
DROP POLICY IF EXISTS "Group leads and admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Group leads can update member roles" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;

-- INSERT: allow creator to add themselves as 'lead', or existing lead/admin to add others
CREATE POLICY "Allow group creation and member management"
ON public.group_members
FOR INSERT
WITH CHECK (
  (profile_id = auth.uid() AND role = 'lead')
  OR
  (added_by = auth.uid() AND public.is_group_lead_or_admin(conversation_id, auth.uid()))
);

-- SELECT: any member of the group can see members
-- (uses existing SECURITY DEFINER function already present in your DB)
CREATE POLICY "Group members can view other members"
ON public.group_members
FOR SELECT
USING (public.is_group_member(conversation_id, auth.uid()));

-- UPDATE: only group leads can change roles
CREATE POLICY "Group leads can update member roles"
ON public.group_members
FOR UPDATE
USING (public.is_group_lead(conversation_id, auth.uid()));

-- DELETE: lead/admin can remove members; users can remove themselves
CREATE POLICY "Group leads and admins can remove members"
ON public.group_members
FOR DELETE
USING (
  public.is_group_lead_or_admin(conversation_id, auth.uid())
  OR profile_id = auth.uid()
);

-- 3) Data integrity and performance
-- Unique membership per group
CREATE UNIQUE INDEX IF NOT EXISTS group_members_conversation_profile_uidx
ON public.group_members (conversation_id, profile_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS group_members_conversation_id_idx
ON public.group_members (conversation_id);

CREATE INDEX IF NOT EXISTS group_members_profile_id_idx
ON public.group_members (profile_id);

-- 4) Enforce at least one 'lead' per group (prevent removing/demoting the last lead)
CREATE OR REPLACE FUNCTION public.prevent_removing_last_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'lead' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.conversation_id = OLD.conversation_id
          AND gm.id <> OLD.id
          AND gm.role = 'lead'
      ) THEN
        RAISE EXCEPTION 'Cannot remove the last group lead';
      END IF;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'lead' AND NEW.role <> 'lead' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.conversation_id = NEW.conversation_id
          AND gm.profile_id <> OLD.profile_id
          AND gm.role = 'lead'
      ) THEN
        RAISE EXCEPTION 'Cannot demote the only group lead';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_removing_last_lead_delete ON public.group_members;
DROP TRIGGER IF EXISTS trg_prevent_removing_last_lead_update ON public.group_members;

CREATE TRIGGER trg_prevent_removing_last_lead_delete
BEFORE DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.prevent_removing_last_lead();

CREATE TRIGGER trg_prevent_removing_last_lead_update
BEFORE UPDATE OF role ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.prevent_removing_last_lead();
