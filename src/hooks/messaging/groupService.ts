import { supabase } from "@/integrations/supabase/client";

export interface GroupMember {
  id: string;
  profile_id: string;
  role: 'lead' | 'admin' | 'member';
  joined_at: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface GroupConversation {
  id: string;
  group_name: string;
  group_description?: string;
  group_avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export const createGroup = async (
  groupName: string,
  description: string,
  initialMembers: string[],
  userId: string
): Promise<string | null> => {
  try {
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        is_group: true,
        group_name: groupName,
        group_description: description,
        created_by: userId
      })
      .select()
      .single();

    if (convError || !conversation) {
      console.error('Error creating group conversation:', convError);
      return null;
    }

    // Add creator as lead
    const membersToAdd = [
      { conversation_id: conversation.id, profile_id: userId, role: 'lead', added_by: userId },
      ...initialMembers.map(memberId => ({
        conversation_id: conversation.id,
        profile_id: memberId,
        role: 'member' as const,
        added_by: userId
      }))
    ];

    const { error: membersError } = await supabase
      .from('group_members')
      .insert(membersToAdd);

    if (membersError) {
      console.error('Error adding group members:', membersError);
      return null;
    }

    // Add all members to conversation_participants for compatibility
    const participantsToAdd = [userId, ...initialMembers].map(memberId => ({
      conversation_id: conversation.id,
      profile_id: memberId
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsToAdd);

    if (participantsError) {
      console.error('Error adding conversation participants:', participantsError);
    }

    return conversation.id;
  } catch (error) {
    console.error('Error creating group:', error);
    return null;
  }
};

export const fetchGroupMembers = async (conversationId: string): Promise<GroupMember[]> => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        profile_id,
        role,
        joined_at,
        profiles!group_members_profile_id_fkey(full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('joined_at');

    if (error) {
      console.error('Error fetching group members:', error);
      return [];
    }

    return (data || []).map(member => ({
      id: member.id,
      profile_id: member.profile_id,
      role: member.role as 'lead' | 'admin' | 'member',
      joined_at: member.joined_at,
      profile: member.profiles as { full_name: string; avatar_url?: string }
    }));
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};

export const addGroupMember = async (
  conversationId: string,
  profileId: string,
  addedBy: string
): Promise<boolean> => {
  try {
    // Add to group_members
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        conversation_id: conversationId,
        profile_id: profileId,
        role: 'member',
        added_by: addedBy
      });

    if (memberError) {
      console.error('Error adding group member:', memberError);
      return false;
    }

    // Add to conversation_participants for compatibility
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationId,
        profile_id: profileId
      });

    if (participantError) {
      console.error('Error adding conversation participant:', participantError);
    }

    return true;
  } catch (error) {
    console.error('Error adding group member:', error);
    return false;
  }
};

export const removeGroupMember = async (
  conversationId: string,
  profileId: string
): Promise<boolean> => {
  try {
    // Remove from group_members
    const { error: memberError } = await supabase
      .from('group_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId);

    if (memberError) {
      console.error('Error removing group member:', memberError);
      return false;
    }

    // Remove from conversation_participants
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId);

    if (participantError) {
      console.error('Error removing conversation participant:', participantError);
    }

    return true;
  } catch (error) {
    console.error('Error removing group member:', error);
    return false;
  }
};

export const updateMemberRole = async (
  conversationId: string,
  profileId: string,
  newRole: 'admin' | 'member'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_members')
      .update({ role: newRole })
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error updating member role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating member role:', error);
    return false;
  }
};

export const leaveGroup = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user is the lead
    const { data: member } = await supabase
      .from('group_members')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('profile_id', userId)
      .single();

    if (member?.role === 'lead') {
      console.error('Group lead cannot leave the group');
      return false;
    }

    return await removeGroupMember(conversationId, userId);
  } catch (error) {
    console.error('Error leaving group:', error);
    return false;
  }
};