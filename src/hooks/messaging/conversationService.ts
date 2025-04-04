
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Conversation } from "./types";

export const fetchConversations = async (userId: string | undefined): Promise<Conversation[]> => {
  try {
    if (!userId) return [];
    
    // Get all conversations where the current user is a participant
    const { data: participations, error: participationsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', userId);
      
    if (participationsError) throw participationsError;
    
    if (!participations || participations.length === 0) {
      return [];
    }
    
    const conversationIds = participations.map(p => p.conversation_id);
    
    // Get basic conversation data
    const { data: convsData, error: convsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });
      
    if (convsError) throw convsError;
    
    // For each conversation, get participants and last message
    const conversationsWithDetails = await Promise.all((convsData || []).map(async (conv) => {
      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('profile_id')
        .eq('conversation_id', conv.id);
        
      if (participantsError) throw participantsError;
      
      const participantIds = participants.map(p => p.profile_id);
      
      // Get participant profiles (excluding current user)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', participantIds)
        .neq('id', userId);
        
      if (profilesError) throw profilesError;
      
      // Get last message
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('content, created_at, read_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (messagesError) throw messagesError;
      
      // Count unread messages
      const { count, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('read_at', null)
        .neq('sender_id', userId);
        
      if (countError) throw countError;
      
      return {
        ...conv,
        participants: profiles || [],
        last_message: messages && messages.length > 0 ? messages[0] : undefined,
        unread_count: count || 0
      };
    }));
    
    return conversationsWithDetails;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    toast({
      title: "Error",
      description: "Failed to load conversations",
      variant: "destructive",
    });
    return [];
  }
};
