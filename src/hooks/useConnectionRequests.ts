
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { acceptConnectionRequest } from "@/components/connections/utils/connectionActions";

export const useConnectionRequests = (userId: string | undefined, onUpdate: () => void) => {
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  const handleAcceptConnection = async (connectionId: string) => {
    if (!userId) return;
    
    try {
      setIsProcessing(prev => ({ ...prev, [connectionId]: true }));
      
      // Use the connection utility to accept the request
      await acceptConnectionRequest(userId, connectionId);
      
      // Force refresh of notifications after status change
      onUpdate();
      
      console.log("Connection request accepted successfully");
      return true;
    } catch (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    if (!userId) return;
    
    try {
      setIsProcessing(prev => ({ ...prev, [connectionId]: true }));
      
      // Reject the request (delete it)
      const { error } = await supabase
        .from('connections_v2')
        .delete()
        .eq('sender_id', connectionId)
        .eq('receiver_id', userId)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      // Force refresh of notifications after deletion
      onUpdate();
      
      console.log("Connection request rejected successfully");
      return true;
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      toast.error("Failed to reject connection request");
      throw error;
    } finally {
      setIsProcessing(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  return {
    handleAcceptConnection,
    handleRejectConnection,
    isProcessing
  };
};
