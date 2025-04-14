
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
  try {
    const { error } = await supabase
      .from('connections_v2')
      .insert({
        sender_id: userId,
        receiver_id: connectionId,
        status: 'pending'
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sending connection request:", error);
    throw error;
  }
};

// Handle accepting connection request
export const acceptConnectionRequest = async (userId: string, connectionId: string) => {
  try {
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
  } catch (error) {
    console.error("Error accepting connection request:", error);
    throw error;
  }
};

// Handle canceling a connection request
export const cancelConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    const { error: deleteError } = await supabase
      .from('connections_v2')
      .delete()
      .eq('sender_id', userId)
      .eq('receiver_id', connectionId)
      .eq('status', 'pending');
      
    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error("Error canceling connection request:", error);
    throw error;
  }
};

// Fix: Completely rewritten to avoid RLS issues and properly remove connections
export const removeConnection = async (userId: string, connectionId: string) => {
  try {
    console.log(`Attempting to remove connection between ${userId} and ${connectionId}`);
    
    // First try to delete where the current user is the sender
    const { data: senderData, error: senderError } = await supabase
      .from('connections_v2')
      .delete()
      .eq('sender_id', userId)
      .eq('receiver_id', connectionId)
      .eq('status', 'accepted');
      
    if (senderError) {
      console.error("Error removing connection as sender:", senderError);
      // Don't throw here, try the other direction
    }
    
    // Define a type guard to check if data is an array
    const isDataArray = (data: any): data is any[] => {
      return Array.isArray(data);
    };
    
    // If no rows were affected as sender, try as receiver
    if (!senderData || !isDataArray(senderData) || senderData.length === 0) {
      const { data: receiverData, error: receiverError } = await supabase
        .from('connections_v2')
        .delete()
        .eq('sender_id', connectionId)
        .eq('receiver_id', userId)
        .eq('status', 'accepted');
        
      if (receiverError) {
        console.error("Error removing connection as receiver:", receiverError);
        throw receiverError;
      }
      
      if (!receiverData || !isDataArray(receiverData) || receiverData.length === 0) {
        console.error("No connection found to remove");
        throw new Error("Connection not found");
      }
    }
    
    console.log(`Connection removed successfully`);
    return true;
  } catch (error) {
    console.error("Connection removal failed:", error);
    throw error;
  }
};
