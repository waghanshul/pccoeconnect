-- Create message type enum
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'video', 'pdf');

-- Extend conversations table for groups
ALTER TABLE public.conversations 
ADD COLUMN is_group BOOLEAN DEFAULT false,
ADD COLUMN group_name TEXT,
ADD COLUMN group_description TEXT,
ADD COLUMN created_by UUID REFERENCES public.profiles(id),
ADD COLUMN group_avatar_url TEXT;

-- Create group members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_by UUID REFERENCES public.profiles(id),
  UNIQUE(conversation_id, profile_id)
);

-- Extend messages table for file support
ALTER TABLE public.messages 
ADD COLUMN message_type message_type DEFAULT 'text',
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size BIGINT;

-- Create message read status table
CREATE TABLE public.message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, profile_id)
);

-- Enable RLS on new tables
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_members
CREATE POLICY "Group members can view other members" 
ON public.group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.conversation_id = group_members.conversation_id 
    AND gm.profile_id = auth.uid()
  )
);

CREATE POLICY "Group members can be added by existing members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  added_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.conversation_id = group_members.conversation_id 
    AND gm.profile_id = auth.uid()
    AND gm.role IN ('lead', 'admin')
  )
);

CREATE POLICY "Group leads and admins can remove members" 
ON public.group_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.conversation_id = group_members.conversation_id 
    AND gm.profile_id = auth.uid()
    AND gm.role IN ('lead', 'admin')
  ) OR profile_id = auth.uid()
);

CREATE POLICY "Group leads can update member roles" 
ON public.group_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.conversation_id = group_members.conversation_id 
    AND gm.profile_id = auth.uid()
    AND gm.role = 'lead'
  )
);

-- RLS policies for message_read_status
CREATE POLICY "Users can view read status for their conversations" 
ON public.message_read_status 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_read_status.message_id 
    AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read" 
ON public.message_read_status 
FOR INSERT 
WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger for group_members
CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_timestamp();

-- Create storage bucket for group files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('group-files', 'group-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for group files
CREATE POLICY "Group members can view group files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'group-files' AND
  EXISTS (
    SELECT 1 FROM public.group_members gm
    JOIN public.messages m ON m.conversation_id = gm.conversation_id
    WHERE gm.profile_id = auth.uid() 
    AND m.file_url LIKE '%' || name || '%'
  )
);

CREATE POLICY "Authenticated users can upload group files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'group-files' AND
  auth.uid() IS NOT NULL
);

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION public.is_group_member(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.conversation_id = is_group_member.conversation_id 
    AND gm.profile_id = is_group_member.user_id
  );
END;
$$;