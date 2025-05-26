
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Conversation } from "./types";

export const createConversation = async (
  friendId: string, 
  userId: string | undefined, 
  existingConversations: Conversation[]
): Promise<string | null> => {
  try {
    if (!userId) {
      console.error("No user ID provided");
      return null;
    }

    console.log("Creating conversation between:", userId, "and", friendId);

    // Check if conversation already exists between these two users
    const existingConversation = existingConversations.find(conv => 
      conv.participants.some(p => p.id === friendId)
    );

    if (existingConversation) {
      console.log("Conversation already exists:", existingConversation.id);
      return existingConversation.id;
    }

    // Create new conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }

    console.log("Created conversation:", conversationData.id);

    // Add participants - both users
    const participants = [
      { conversation_id: conversationData.id, profile_id: userId },
      { conversation_id: conversationData.id, profile_id: friendId }
    ];

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      throw participantsError;
    }

    console.log("Added participants to conversation");
    
    return conversationData.id;

  } catch (error) {
    console.error("Error in createConversation:", error);
    toast({
      title: "Error",
      description: "Failed to create conversation",
      variant: "destructive",
    });
    return null;
  }
};
