
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
      
      const success = await acceptConnectionRequest(userId, connectionId);
      
      if (success) {
        console.log("Connection request accepted successfully");
        onUpdate();
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
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
      
      toast.success("Connection request rejected");
      onUpdate();
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      toast.error("Failed to reject connection request");
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
