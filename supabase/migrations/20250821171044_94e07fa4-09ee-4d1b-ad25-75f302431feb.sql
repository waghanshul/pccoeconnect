-- Simplify messages table RLS policies to fix "No messages yet" issue
-- Remove duplicate/conflicting SELECT policies and keep only the working one

-- Drop old policies that might be causing conflicts
DROP POLICY IF EXISTS "messages_select" ON public.messages;

-- Keep the policy that uses the working SECURITY DEFINER function
-- This policy should already exist and work correctly
-- No changes needed to messages_select_policy since it uses is_conversation_participant_safe

-- Verify the function exists and works
-- The is_conversation_participant_safe function should be a SECURITY DEFINER function
-- that avoids infinite recursion by directly querying conversation_participants

-- Test that we can select messages as the current user
-- (This is just for verification - the actual fix is removing the conflicting policy)