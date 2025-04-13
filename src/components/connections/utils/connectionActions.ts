
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

// Handle removing an existing connection
export const removeConnection = async (userId: string, connectionId: string) => {
  const { error: deleteError } = await supabase
    .from('connections_v2')
    .delete()
    .or(`sender_id.eq.${userId}.and.receiver_id.eq.${connectionId},sender_id.eq.${connectionId}.and.receiver_id.eq.${userId}`)
    .eq('status', 'accepted');
    
  if (deleteError) {
    console.error("Error removing connection:", deleteError);
    throw deleteError;
  }
  
  console.log(`Connection removed successfully`);
  return true;
};
