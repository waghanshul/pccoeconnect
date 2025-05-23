
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { ConnectionUser, sendConnectionRequest, acceptConnectionRequest, cancelConnectionRequest } from "./utils/connectionActions";

interface ConnectionButtonProps {
  connection: ConnectionUser;
  isConnected: boolean;
  hasPendingRequest: boolean;
  hasReceivedRequest: boolean;
  userId?: string;
  onConnectionUpdate: () => void;
}

export const ConnectionButton = ({
  connection,
  isConnected,
  hasPendingRequest,
  hasReceivedRequest,
  userId,
  onConnectionUpdate
}: ConnectionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localConnectionState, setLocalConnectionState] = useState({
    isConnected,
    hasPendingRequest,
    hasReceivedRequest
  });

  // Update local state when props change
  useEffect(() => {
    setLocalConnectionState({
      isConnected,
      hasPendingRequest,
      hasReceivedRequest
    });
  }, [isConnected, hasPendingRequest, hasReceivedRequest]);

  // Handle connection actions with optimistic UI updates
  const handleConnectionAction = async () => {
    if (!userId) return;
    
    // If already connected, do nothing - connections are permanent
    if (localConnectionState.isConnected) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Connection state:", { isConnected: localConnectionState.isConnected, hasPendingRequest: localConnectionState.hasPendingRequest, hasReceivedRequest: localConnectionState.hasReceivedRequest });
      
      // Case 1: Not connected and no pending request - Send connection request
      if (!localConnectionState.hasPendingRequest && !localConnectionState.hasReceivedRequest) {
        // Optimistic UI update
        setLocalConnectionState(prev => ({ ...prev, hasPendingRequest: true }));
        
        await sendConnectionRequest(userId, connection.id);
        onConnectionUpdate();
      }
      // Case 2: Request received - Accept connection
      else if (localConnectionState.hasReceivedRequest) {
        // Optimistic UI update
        setLocalConnectionState(prev => ({ 
          isConnected: true, 
          hasPendingRequest: false, 
          hasReceivedRequest: false 
        }));
        
        await acceptConnectionRequest(userId, connection.id);
        onConnectionUpdate();
      }
      // Case 3: Pending request sent - Cancel request (requires dialog)
      else if (localConnectionState.hasPendingRequest) {
        if (!isDialogOpen) {
          setIsDialogOpen(true);
          setIsLoading(false);
          return;
        }
        
        setLocalConnectionState(prev => ({ 
          isConnected: false, 
          hasPendingRequest: false, 
          hasReceivedRequest: false 
        }));
        
        await cancelConnectionRequest(userId, connection.id);
        setIsDialogOpen(false);
        onConnectionUpdate();
      }
    } catch (error) {
      console.error("Error managing connection:", error);
      // Revert to original state on error
      setLocalConnectionState({
        isConnected,
        hasPendingRequest,
        hasReceivedRequest
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button display logic
  const buttonText = () => {
    if (localConnectionState.isConnected) return "Connected";
    if (localConnectionState.hasPendingRequest) return "Requested";
    if (localConnectionState.hasReceivedRequest) return "Accept";
    return "Connect";
  };

  const buttonIcon = () => {
    if (localConnectionState.isConnected) return <CheckCheck className="h-4 w-4 mr-1" />;
    if (localConnectionState.hasPendingRequest) return <Clock className="h-4 w-4 mr-1" />;
    if (localConnectionState.hasReceivedRequest) return <UserPlus className="h-4 w-4 mr-1" />;
    return <UserPlus className="h-4 w-4 mr-1" />;
  };

  const buttonVariant = () => {
    if (localConnectionState.isConnected) return "default";
    if (localConnectionState.hasReceivedRequest) return "default";
    return "outline";
  };

  // Only show dialog for canceling pending requests
  const showCancelDialog = localConnectionState.hasPendingRequest && !localConnectionState.isConnected;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button 
        onClick={handleConnectionAction} 
        variant={buttonVariant()}
        size="sm" 
        className="flex-1"
        disabled={isLoading || localConnectionState.isConnected}
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading</>
        ) : (
          <>{buttonIcon()} {buttonText()}</>
        )}
      </Button>
      
      {showCancelDialog && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your connection request to {connection.full_name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button 
              onClick={handleConnectionAction} 
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Request"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Keep Request</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
