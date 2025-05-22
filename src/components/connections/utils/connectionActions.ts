
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ConnectionUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  role?: string;
}

// Define a type for the RPC function responses
interface RPCResponse {
  success: boolean;
  error?: string;
  connection_id?: string;
}

// Handle sending connection request
export const sendConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    console.log(`Sending connection request from ${userId} to ${connectionId}`);
    
    const { data, error } = await supabase
      .rpc('send_connection_request', {
        sender_user_id: userId,
        receiver_user_id: connectionId
      });
      
    if (error) {
      console.error("Error in sendConnectionRequest:", error);
      throw error;
    }
    
    // Type assertion to handle the RPC response properly
    const response = data as unknown as RPCResponse;
    
    if (!response.success) {
      console.warn("Request unsuccessful:", response.error);
      toast.error(response.error || "Failed to send connection request");
      return false;
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
    
    const { data, error } = await supabase
      .rpc('accept_connection_request', {
        receiver_user_id: userId,
        sender_user_id: connectionId
      });
      
    if (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
      throw error;
    }
    
    // Type assertion to handle the RPC response properly
    const response = data as unknown as RPCResponse;
    
    if (!response.success) {
      console.warn("Request unsuccessful:", response.error);
      toast.error(response.error || "Failed to accept connection request");
      return false;
    }
    
    console.log("Connection request accepted successfully:", data);
    toast.success("Connection request accepted");
    return true;
  } catch (error) {
    console.error("Error accepting connection request:", error);
    toast.error("Failed to accept connection request");
    throw error;
  }
};

// Handle rejecting a connection request
export const rejectConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    console.log(`Rejecting connection request from ${connectionId} to ${userId}`);
    
    const { data, error } = await supabase
      .rpc('reject_connection_request', {
        receiver_user_id: userId,
        sender_user_id: connectionId
      });
      
    if (error) {
      console.error("Error rejecting connection request:", error);
      toast.error("Failed to reject connection request");
      throw error;
    }
    
    // Type assertion to handle the RPC response properly
    const response = data as unknown as RPCResponse;
    
    if (!response.success) {
      console.warn("Request unsuccessful:", response.error);
      toast.error(response.error || "Failed to reject connection request");
      return false;
    }
    
    console.log("Connection request rejected successfully");
    toast.success("Connection request rejected");
    return true;
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    toast.error("Failed to reject connection request");
    throw error;
  }
};

// Handle canceling a connection request
export const cancelConnectionRequest = async (userId: string, connectionId: string) => {
  try {
    console.log(`Canceling connection request from ${userId} to ${connectionId}`);
    
    // Since we don't have a specific function for cancellation, we'll use a direct delete
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
    
    // Try both directions of the connection
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
    
    // Check if anything was deleted - Fix for TS18047: 'senderData' is possibly 'null'
    const isDeletedAsSender = senderData && Array.isArray(senderData) && senderData.length > 0;
    
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
      
      // Check if anything was deleted - Fix for TS18047: 'receiverData' is possibly 'null'
      const isDeletedAsReceiver = receiverData && Array.isArray(receiverData) && receiverData.length > 0;
      
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
