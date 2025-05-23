
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
    
    // First check if there's already a connection (in either direction)
    const { data: existingConnection, error: checkError } = await supabase
      .from('connections_v2')
      .select('id, status')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${connectionId}),and(sender_id.eq.${connectionId},receiver_id.eq.${userId})`)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking existing connections:", checkError);
      throw checkError;
    }
    
    // If there's an existing connection, handle it based on status
    if (existingConnection) {
      if (existingConnection.status === 'rejected') {
        // Delete the rejected connection first
        const { error: deleteError } = await supabase
          .from('connections_v2')
          .delete()
          .eq('id', existingConnection.id);
          
        if (deleteError) {
          console.error("Error deleting rejected connection:", deleteError);
          throw deleteError;
        }
        
        console.log("Deleted rejected connection before sending new request");
      } else if (existingConnection.status === 'pending') {
        console.warn("A connection request already exists");
        toast.error("A connection request already exists");
        return false;
      } else if (existingConnection.status === 'accepted') {
        console.warn("You are already connected with this user");
        toast.error("You are already connected with this user");
        return false;
      }
    }
    
    // Now send the connection request using direct insert instead of RPC
    const { data, error } = await supabase
      .from('connections_v2')
      .insert({
        sender_id: userId,
        receiver_id: connectionId,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error inserting connection request:", error);
      throw error;
    }
    
    console.log("Connection request sent successfully:", data);
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
    
    // First verify that there is a pending request
    const { data: checkData, error: checkError } = await supabase
      .from('connections_v2')
      .select('id')
      .eq('sender_id', connectionId)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking pending request:", checkError);
      throw checkError;
    }
    
    if (!checkData) {
      console.warn("No pending request found to reject");
      toast.error("No pending connection request found");
      return false;
    }
    
    // Delete the pending request instead of marking as rejected
    const { error: deleteError } = await supabase
      .from('connections_v2')
      .delete()
      .eq('id', checkData.id);
      
    if (deleteError) {
      console.error("Error deleting connection request:", deleteError);
      toast.error("Failed to reject connection request");
      throw deleteError;
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
    
    // Verify that there is a pending request
    const { data: checkData, error: checkError } = await supabase
      .from('connections_v2')
      .select('id')
      .eq('sender_id', userId)
      .eq('receiver_id', connectionId)
      .eq('status', 'pending')
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking pending request:", checkError);
      throw checkError;
    }
    
    if (!checkData) {
      console.warn("No pending request found to cancel");
      toast.error("No pending connection request found");
      return false;
    }
    
    // Delete the pending request
    const { error: deleteError } = await supabase
      .from('connections_v2')
      .delete()
      .eq('id', checkData.id);
      
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
    
    // Check if connection exists in either direction
    const { data: connection, error: checkError } = await supabase
      .from('connections_v2')
      .select('id')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${connectionId},status.eq.accepted),and(sender_id.eq.${connectionId},receiver_id.eq.${userId},status.eq.accepted)`)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking connection:", checkError);
      throw checkError;
    }
    
    if (!connection) {
      console.error("No connection found to remove");
      toast.error("Connection not found");
      return false;
    }
    
    // Delete the connection using the ID
    const { error: deleteError } = await supabase
      .from('connections_v2')
      .delete()
      .eq('id', connection.id);
      
    if (deleteError) {
      console.error("Error removing connection:", deleteError);
      toast.error("Failed to remove connection");
      throw deleteError;
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
