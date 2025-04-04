
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Conversation } from "./types";

export const createConversation = async (
  friendId: string, 
  userId: string | undefined, 
  conversations: Conversation[]
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Check if conversation already exists with this friend
    let existingConversationId = "";
    
    for (const conv of conversations) {
      const isFriendInConv = conv.participants.some(p => p.id === friendId);
      if (isFriendInConv) {
        existingConversationId = conv.id;
        break;
      }
    }
    
    // If no existing conversation, create one
    if (!existingConversationId) {
      console.log("Creating new conversation");
      
      // First create the conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
        
      if (convError) {
        console.error("Error creating conversation:", convError);
        throw convError;
      }
      
      console.log("Created conversation:", newConv);
      existingConversationId = newConv.id;
      
      // Then add current user as participant
      const { error: currentUserPartError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: existingConversationId,
          profile_id: userId
        });
        
      if (currentUserPartError) {
        console.error("Error adding current user as participant:", currentUserPartError);
        throw currentUserPartError;
      }
      
      // Then add friend as participant
      const { error: friendPartError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: existingConversationId,
          profile_id: friendId
        });
        
      if (friendPartError) {
        console.error("Error adding friend as participant:", friendPartError);
        throw friendPartError;
      }
      
      console.log("Added participants to conversation");
    }
    
    return existingConversationId;
  } catch (error) {
    console.error("Error creating conversation:", error);
    toast({
      title: "Error",
      description: "Failed to start conversation",
      variant: "destructive",
    });
    throw error;
  }
};
