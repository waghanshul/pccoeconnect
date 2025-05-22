
import { useState } from "react";
import { acceptConnectionRequest, rejectConnectionRequest } from "@/components/connections/utils/connectionActions";
import { toast } from "sonner";

export const useConnectionRequests = (userId: string | undefined, onUpdate: () => void) => {
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  const handleAcceptConnection = async (connectionId: string): Promise<void> => {
    if (!userId) {
      toast.error("You must be logged in to accept connections");
      return;
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, [connectionId]: true }));
      
      // Use the enhanced function that calls the database function
      const result = await acceptConnectionRequest(userId, connectionId);
      
      if (result) {
        console.log("Connection accepted successfully");
        
        // Force refresh of notifications after status change
        onUpdate();
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleRejectConnection = async (connectionId: string): Promise<void> => {
    if (!userId) {
      toast.error("You must be logged in to reject connections");
      return;
    }
    
    try {
      setIsProcessing(prev => ({ ...prev, [connectionId]: true }));
      
      // Use the enhanced function that calls the database function
      const result = await rejectConnectionRequest(userId, connectionId);
      
      if (result) {
        console.log("Connection rejected successfully");
        
        // Force refresh of notifications after rejection
        onUpdate();
      }
    } catch (error) {
      console.error("Error rejecting connection request:", error);
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
