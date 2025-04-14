
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
    console.log(`Sending connection request from ${userId} to ${connectionId}`);
    
    const { error } = await supabase
      .from('connections_v2')
      .insert({
        sender_id: userId,
        receiver_id: connectionId,
        status: 'pending'
      });
      
    if (error) {
      console.error("Error in sendConnectionRequest:", error);
      throw error;
    }
    
    console.log("Connection request sent successfully");
    toast.success("Connection request sent!");
    return true;
  } catch (error) {
    console.error("Error sending connection request:", error);
    toast.error("Failed to send connection request");
    throw error;
  }
};

// Handle accepting connection request
export const acceptConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    console.log(`Accepting connection request from ${connectionId} to ${userId}`);
    
    // Use the secure function we created to accept the connection request
    const { data, error } = await supabase
      .rpc('accept_connection_request', {
        current_user_id: userId,
        sender_id: connectionId
      });
      
    if (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
      throw error;
    }
    
    console.log("Connection request accepted successfully");
    toast.success("Connection request accepted");
    return true;
  } catch (error) {
    console.error("Error accepting connection request:", error);
    toast.error("Failed to accept connection request");
    throw error;
  }
};

// Handle canceling a connection request
export const cancelConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    console.log(`Canceling connection request from ${userId} to ${connectionId}`);
    
    const { error: deleteError } = await supabase
      .from('connections_v2')
      .delete()
      .eq('sender_id', userId)
      .eq('receiver_id', connectionId)
      .eq('status', 'pending');
      
    if (deleteError) {
      console.error("Error deleting connection request:", deleteError);
      toast.error("Failed to cancel connection request");
      throw deleteError;
    }
    
    console.log("Connection request canceled successfully");
    toast.success("Connection request canceled");
    return true;
  } catch (error) {
    console.error("Error canceling connection request:", error);
    toast.error("Failed to cancel connection request");
    throw error;
  }
};

// Handle removing an established connection
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
    
    // Check if anything was deleted
    const isDeletedAsSender = senderData !== null && senderData !== undefined;
    
    if (!isDeletedAsSender) {
      console.log("No connection found as sender, trying as receiver");
      
      // If no rows were affected as sender, try as receiver
      const { data: receiverData, error: receiverError } = await supabase
        .from('connections_v2')
        .delete()
        .eq('sender_id', connectionId)
        .eq('receiver_id', userId)
        .eq('status', 'accepted');
        
      if (receiverError) {
        console.error("Error removing connection as receiver:", receiverError);
        toast.error("Failed to remove connection");
        throw receiverError;
      }
      
      // Check if anything was deleted
      const isDeletedAsReceiver = receiverData !== null && receiverData !== undefined;
      
      if (!isDeletedAsReceiver) {
        console.error("No connection found to remove");
        toast.error("Connection not found");
        throw new Error("Connection not found");
      }
    }
    
    console.log(`Connection removed successfully`);
    toast.success("Connection removed");
    return true;
  } catch (error) {
    console.error("Connection removal failed:", error);
    toast.error("Failed to remove connection");
    throw error;
  }
};
