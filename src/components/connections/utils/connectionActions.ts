
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ConnectionUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  role?: string;
}

// Handle sending connection request
export const sendConnectionRequest = async (userId: string, connectionId: string) => {
  const { error } = await supabase
    .from('connections_v2')
    .insert({
      sender_id: userId,
      receiver_id: connectionId,
      status: 'pending'
    });
    
  if (error) throw error;
  return true;
};

// Handle accepting connection request
export const acceptConnectionRequest = async (userId: string, connectionId: string) => {
  // Find the pending request from this user
  const { data: requestData, error: requestError } = await supabase
    .from('connections_v2')
    .select('id')
    .eq('sender_id', connectionId)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .single();
    
  if (requestError) throw requestError;
  
  // Update the request status to accepted
  const { error: updateError } = await supabase
    .from('connections_v2')
    .update({ status: 'accepted' })
    .eq('id', requestData.id);
    
  if (updateError) throw updateError;
  return true;
};

// Handle canceling a connection request
export const cancelConnectionRequest = async (userId: string, connectionId: string) => {
  const { error: deleteError } = await supabase
    .from('connections_v2')
    .delete()
    .eq('sender_id', userId)
    .eq('receiver_id', connectionId)
    .eq('status', 'pending');
    
  if (deleteError) throw deleteError;
  return true;
};

// Handle removing an existing connection - FIX: This function was not working correctly
export const removeConnection = async (userId: string, connectionId: string) => {
  try {
    console.log(`Attempting to remove connection between ${userId} and ${connectionId}`);
    
    // First try to delete where the current user is the sender
    const { data: senderData, error: senderError } = await supabase
      .from('connections_v2')
      .delete()
      .match({
        sender_id: userId,
        receiver_id: connectionId,
        status: 'accepted'
      })
      .select();
      
    if (senderError) {
      console.error("Error removing connection as sender:", senderError);
      // Don't throw here, try the other direction
    }
    
    // If no rows were deleted as sender, try as receiver
    if (!senderData || senderData.length === 0) {
      const { error: receiverError } = await supabase
        .from('connections_v2')
        .delete()
        .match({
          sender_id: connectionId,
          receiver_id: userId,
          status: 'accepted'
        });
        
      if (receiverError) {
        console.error("Error removing connection as receiver:", receiverError);
        throw receiverError;
      }
    }
    
    console.log(`Connection removed successfully`);
    return true;
  } catch (error) {
    console.error("Connection removal failed:", error);
    throw error;
  }
};
