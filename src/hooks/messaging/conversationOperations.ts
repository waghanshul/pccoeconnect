
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
      toast({
        title: "Error",
        description: "You must be logged in to create a conversation",
        variant: "destructive",
      });
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
    console.log("Creating new conversation...");
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      toast({
        title: "Error",
        description: `Failed to create conversation: ${conversationError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log("Created conversation:", conversationData.id);

    // Add participants - current user first
    console.log("Adding current user as participant...");
    const { error: currentUserError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationData.id,
        profile_id: userId
      });

    if (currentUserError) {
      console.error("Error adding current user:", currentUserError);
      toast({
        title: "Error",
        description: `Failed to add you to conversation: ${currentUserError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log("Added current user to conversation");

    // Add friend as participant
    console.log("Adding friend as participant...");
    const { error: friendError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationData.id,
        profile_id: friendId
      });

    if (friendError) {
      console.error("Error adding friend:", friendError);
      toast({
        title: "Error",
        description: `Failed to add friend to conversation: ${friendError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log("Added friend to conversation");
    console.log("Conversation created successfully:", conversationData.id);
    
    toast({
      title: "Success",
      description: "Conversation created successfully!",
    });
    
    return conversationData.id;

  } catch (error) {
    console.error("Error in createConversation:", error);
    toast({
      title: "Error",
      description: `Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
    return null;
  }
};
