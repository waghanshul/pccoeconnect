
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Conversation } from "./types";

export const createConversation = async (
  friendId: string, 
  userId: string | undefined, 
  existingConversations: Conversation[]
): Promise<string | null> => {
  console.log("=== Starting conversation creation process ===");
  console.log("Friend ID:", friendId);
  console.log("User ID:", userId);
  console.log("Existing conversations count:", existingConversations.length);

  try {
    if (!userId) {
      console.error("ERROR: No user ID provided");
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a conversation",
        variant: "destructive",
      });
      return null;
    }

    if (friendId === userId) {
      console.error("ERROR: Cannot create conversation with yourself");
      toast({
        title: "Invalid Action",
        description: "Cannot create conversation with yourself",
        variant: "destructive",
      });
      return null;
    }

    // Check if conversation already exists between these two users
    console.log("Checking for existing conversation...");
    const existingConversation = existingConversations.find(conv => 
      conv.participants.some(p => p.id === friendId)
    );

    if (existingConversation) {
      console.log("Found existing conversation:", existingConversation.id);
      toast({
        title: "Conversation Exists",
        description: "Opening existing conversation",
      });
      return existingConversation.id;
    }

    console.log("No existing conversation found, creating new one...");

    // Step 1: Create new conversation
    console.log("Step 1: Creating conversation record...");
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      console.error("ERROR: Failed to create conversation:", conversationError);
      toast({
        title: "Database Error",
        description: `Failed to create conversation: ${conversationError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log("✓ Conversation created successfully:", conversationData.id);

    // Step 2: Add current user as participant
    console.log("Step 2: Adding current user as participant...");
    const { error: userParticipantError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationData.id,
        profile_id: userId
      });

    if (userParticipantError) {
      console.error("ERROR: Failed to add current user as participant:", userParticipantError);
      
      // Cleanup: Delete the conversation since we couldn't add participants
      console.log("Cleaning up conversation due to participant error...");
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationData.id);
        
      toast({
        title: "Database Error",
        description: `Failed to add you to conversation: ${userParticipantError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log("✓ Current user added as participant");

    // Step 3: Add friend as participant
    console.log("Step 3: Adding friend as participant...");
    const { error: friendParticipantError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationData.id,
        profile_id: friendId
      });

    if (friendParticipantError) {
      console.error("ERROR: Failed to add friend as participant:", friendParticipantError);
      
      // Cleanup: Delete the conversation and existing participant
      console.log("Cleaning up conversation due to friend participant error...");
      await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationData.id);
      
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationData.id);
        
      toast({
        title: "Database Error",
        description: `Failed to add friend to conversation: ${friendParticipantError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log("✓ Friend added as participant");

    // Step 4: Verify conversation was created properly
    console.log("Step 4: Verifying conversation creation...");
    const { data: verificationData, error: verificationError } = await supabase
      .from('conversation_participants')
      .select('profile_id')
      .eq('conversation_id', conversationData.id);

    if (verificationError) {
      console.error("ERROR: Failed to verify conversation:", verificationError);
    } else {
      console.log("✓ Verification successful. Participants:", verificationData?.map(p => p.profile_id));
    }

    console.log("=== Conversation creation completed successfully ===");
    console.log("Final conversation ID:", conversationData.id);
    
    toast({
      title: "Success",
      description: "Conversation created successfully!",
    });
    
    return conversationData.id;

  } catch (error) {
    console.error("=== UNEXPECTED ERROR in createConversation ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    toast({
      title: "Unexpected Error",
      description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
    return null;
  }
};
