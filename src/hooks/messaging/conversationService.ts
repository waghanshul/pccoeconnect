
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Conversation } from "./types";

// Helper function to verify database-level authentication
async function verifyDatabaseAuth(): Promise<boolean> {
  try {
    // Ensure a client session exists
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No active session for DB auth verification");
      return false;
    }

    // Small delay to allow auth header propagation
    await new Promise((r) => setTimeout(r, 100));

    // Lightweight probe query; success indicates headers are set and DB is reachable
    const { error } = await supabase
      .from('profiles')
      .select('id', { head: true, count: 'exact' })
      .eq('id', session.user.id)
      .limit(1);

    if (error) {
      console.log("DB probe failed:", error.message);
      return false;
    }

    console.log("Database auth probe succeeded");
    return true;
  } catch (err) {
    console.log("Database auth verification failed:", err);
    return false;
  }
}

// Helper function to safely fetch messages with auth verification and retries
async function fetchMessagesForConversation(conversationId: string): Promise<any> {
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const isReady = await verifyDatabaseAuth();
      if (!isReady) {
        console.log(`Auth not ready (attempt ${attempt + 1}) for conversation ${conversationId}`);
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
        continue;
      }

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('content, created_at, read_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (messagesError) {
        console.error("Error fetching last message for conversation", conversationId, ":", messagesError);
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
        continue;
      }

      if (messages && messages.length > 0) {
        console.log(`Found last message for conversation ${conversationId}:`, messages[0].content);
        return messages[0];
      }

      // No messages found yet, retry a few times in case of timing issues
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }

    console.log(`No messages found for conversation ${conversationId} after retries`);
    return undefined;
  } catch (err) {
    console.error("Exception when fetching messages for conversation", conversationId, ":", err);
    return undefined;
  }
}

export const fetchConversations = async (userId: string | undefined): Promise<Conversation[]> => {
  try {
    if (!userId) {
      console.log("No user ID provided for fetching conversations");
      return [];
    }
    
    // Verify database-level authentication before proceeding
    const isDbAuthReady = await verifyDatabaseAuth();
    if (!isDbAuthReady) {
      console.log("Database authentication not ready - retrying...");
      
      // Wait and retry with exponential backoff
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        const retryAuthReady = await verifyDatabaseAuth();
        if (retryAuthReady) {
          console.log("Database authentication ready after retry", i + 1);
          break;
        }
        if (i === 2) {
          console.log("Database authentication still not ready after retries - cannot fetch conversations");
          return [];
        }
      }
    }
    
    console.log("Fetching conversations for user:", userId);
    
    // Get all conversations where the current user is a participant (direct messages)
    const { data: participations, error: participationsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', userId);
      
    if (participationsError) {
      console.error("Error fetching participations:", participationsError);
      throw participationsError;
    }
    
    // Get all group conversations where the current user is a member
    const { data: groupMemberships, error: groupMembershipsError } = await supabase
      .from('group_members')
      .select('conversation_id')
      .eq('profile_id', userId);
      
    if (groupMembershipsError) {
      console.error("Error fetching group memberships:", groupMembershipsError);
      throw groupMembershipsError;
    }
    
    // Combine both types of conversations
    const directConversationIds = participations?.map(p => p.conversation_id) || [];
    const groupConversationIds = groupMemberships?.map(g => g.conversation_id) || [];
    const allConversationIds = [...new Set([...directConversationIds, ...groupConversationIds])];
    
    console.log("Found direct conversation IDs:", directConversationIds);
    console.log("Found group conversation IDs:", groupConversationIds);
    console.log("All conversation IDs:", allConversationIds);
    
    if (allConversationIds.length === 0) {
      console.log("No conversations found for user");
      return [];
    }
    
    // Get basic conversation data
    const { data: convsData, error: convsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', allConversationIds)
      .order('updated_at', { ascending: false });
      
    if (convsError) {
      console.error("Error fetching conversations:", convsError);
      throw convsError;
    }
    
    console.log("Fetched conversations:", convsData);
    
    // For each conversation, get participants and last message
    const conversationsWithDetails = await Promise.all((convsData || []).map(async (conv) => {
      try {
        // Get participants - different logic for groups vs direct messages
        let participantIds: string[] = [];
        
        if (conv.is_group) {
          // For groups, get members from group_members table
          const { data: groupMembers, error: groupMembersError } = await supabase
            .from('group_members')
            .select('profile_id')
            .eq('conversation_id', conv.id);
            
          if (groupMembersError) {
            console.error("Error fetching group members for conversation", conv.id, ":", groupMembersError);
          } else {
            participantIds = groupMembers?.map(m => m.profile_id) || [];
          }
        } else {
          // For direct messages, get from conversation_participants
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('profile_id')
            .eq('conversation_id', conv.id);
            
          if (participantsError) {
            console.error("Error fetching participants for conversation", conv.id, ":", participantsError);
          } else {
            participantIds = participants?.map(p => p.profile_id) || [];
          }
        }
        
        console.log(`Found ${participantIds.length} participants for ${conv.is_group ? 'group' : 'direct'} conversation ${conv.id}:`, participantIds);
        
        // Get participant profiles (for groups show all, for direct messages exclude current user)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', participantIds)
          .neq('id', conv.is_group ? '' : userId); // Include all for groups, exclude current user for direct messages
          
        if (profilesError) {
          console.error("Error fetching profiles for conversation", conv.id, ":", profilesError);
          throw profilesError;
        }
        
        // Get last message using the safe fetch function
        const lastMessage = await fetchMessagesForConversation(conv.id);
        
        // Count unread messages
        const { count, error: countError } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .is('read_at', null)
          .neq('sender_id', userId);

        // Get member count for groups
        let memberCount;
        if (conv.is_group) {
          const { count: groupMemberCount, error: memberCountError } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          if (!memberCountError) {
            memberCount = groupMemberCount || 0;
          }
        }
          
        if (countError) {
          console.error("Error counting unread messages for conversation", conv.id, ":", countError);
          // Don't throw here, just continue without unread count
        }
        
        const conversationWithDetails = {
          ...conv,
          participants: profiles || [],
          last_message: lastMessage,
          unread_count: count || 0,
          member_count: memberCount
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
