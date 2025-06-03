
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Conversation } from "./types";

export const fetchConversations = async (userId: string | undefined): Promise<Conversation[]> => {
  try {
    if (!userId) {
      console.log("No user ID provided for fetching conversations");
      return [];
    }
    
    console.log("Fetching conversations for user:", userId);
    
    // Get all conversations where the current user is a participant
    const { data: participations, error: participationsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', userId);
      
    if (participationsError) {
      console.error("Error fetching participations:", participationsError);
      throw participationsError;
    }
    
    if (!participations || participations.length === 0) {
      console.log("No participations found for user");
      return [];
    }
    
    const conversationIds = participations.map(p => p.conversation_id);
    console.log("Found conversation IDs:", conversationIds);
    
    // Get basic conversation data
    const { data: convsData, error: convsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });
      
    if (convsError) {
      console.error("Error fetching conversations:", convsError);
      throw convsError;
    }
    
    console.log("Fetched conversations:", convsData);
    
    // For each conversation, get participants and last message
    const conversationsWithDetails = await Promise.all((convsData || []).map(async (conv) => {
      try {
        // Get participants
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conv.id);
          
        if (participantsError) {
          console.error("Error fetching participants for conversation", conv.id, ":", participantsError);
          throw participantsError;
        }
        
        const participantIds = participants?.map(p => p.profile_id) || [];
        
        // Get participant profiles (excluding current user)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', participantIds)
          .neq('id', userId);
          
        if (profilesError) {
          console.error("Error fetching profiles for conversation", conv.id, ":", profilesError);
          throw profilesError;
        }
        
        // Get last message
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('content, created_at, read_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (messagesError) {
          console.error("Error fetching last message for conversation", conv.id, ":", messagesError);
          // Don't throw here, just log the error and continue without last message
        }
        
        // Count unread messages
        const { count, error: countError } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .is('read_at', null)
          .neq('sender_id', userId);
          
        if (countError) {
          console.error("Error counting unread messages for conversation", conv.id, ":", countError);
          // Don't throw here, just continue without unread count
        }
        
        const conversationWithDetails = {
          ...conv,
          participants: profiles || [],
          last_message: messages && messages.length > 0 ? messages[0] : undefined,
          unread_count: count || 0
        };
        
        console.log("Conversation with details:", conversationWithDetails);
        return conversationWithDetails;
      } catch (error) {
        console.error("Error processing conversation", conv.id, ":", error);
        // Return basic conversation data if detailed fetch fails
        return {
          ...conv,
          participants: [],
          last_message: undefined,
          unread_count: 0
        };
      }
    }));
    
    console.log("Final conversations with details:", conversationsWithDetails);
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
