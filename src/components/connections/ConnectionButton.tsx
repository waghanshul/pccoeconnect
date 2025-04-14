
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Clock, CheckCheck, Loader2 } from "lucide-react";
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
import { ConnectionUser, sendConnectionRequest, acceptConnectionRequest, cancelConnectionRequest, removeConnection } from "./utils/connectionActions";

interface ConnectionButtonProps {
  connection: ConnectionUser;
  isConnected: boolean;
  hasPendingRequest: boolean;
  hasReceivedRequest: boolean;
  userId: string | undefined;
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
  const [dialogAction, setDialogAction] = useState<'remove' | 'cancel'>('remove');

  const handleConnectionAction = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log("Connection state:", { isConnected, hasPendingRequest, hasReceivedRequest });
      
      // Case 1: Not connected and no pending request - Send connection request
      if (!isConnected && !hasPendingRequest && !hasReceivedRequest) {
        await sendConnectionRequest(userId, connection.id);
        toast.success(`Connection request sent to ${connection.full_name}`);
      }
      // Case 2: Request received - Accept connection
      else if (hasReceivedRequest) {
        await acceptConnectionRequest(userId, connection.id);
        toast.success(`You are now connected with ${connection.full_name}`);
      }
      // Case 3: Pending request sent - Cancel request (requires dialog)
      else if (hasPendingRequest) {
        if (!isDialogOpen) {
          setDialogAction('cancel');
          setIsDialogOpen(true);
          setIsLoading(false);
          return;
        }
        
        await cancelConnectionRequest(userId, connection.id);
        toast.success(`Connection request to ${connection.full_name} cancelled`);
        setIsDialogOpen(false);
      }
      // Case 4: Connected - Remove connection (requires dialog)
      else if (isConnected) {
        if (!isDialogOpen) {
          setDialogAction('remove');
          setIsDialogOpen(true);
          setIsLoading(false);
          return;
        }
        
        console.log("About to remove connection with:", connection.id);
        await removeConnection(userId, connection.id);
        toast.success(`You are no longer connected with ${connection.full_name}`);
        setIsDialogOpen(false);
      }
      
      // Notify parent component to refresh connection status
      onConnectionUpdate();
    } catch (error) {
      console.error("Error managing connection:", error);
      toast.error("Failed to update connection");
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure the button displays correctly based on the connection state
  const buttonText = () => {
    if (isConnected) return "Connected";
    if (hasPendingRequest) return "Requested";
    if (hasReceivedRequest) return "Accept";
    return "Connect";
  };

  const buttonIcon = () => {
    if (isConnected) return <CheckCheck className="h-4 w-4 mr-1" />;
    if (hasPendingRequest) return <Clock className="h-4 w-4 mr-1" />;
    if (hasReceivedRequest) return <UserPlus className="h-4 w-4 mr-1" />;
    return <UserPlus className="h-4 w-4 mr-1" />;
  };

  // Use correct button variant based on connection state
  const buttonVariant = () => {
    if (isConnected) return "default";
    if (hasReceivedRequest) return "default";
    return "outline";
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button 
        onClick={handleConnectionAction} 
        variant={buttonVariant()}
        size="sm" 
        className="flex-1"
        disabled={isLoading}
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading</>
        ) : (
          <>{buttonIcon()} {buttonText()}</>
        )}
      </Button>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dialogAction === 'remove' ? 'Remove Connection' : 'Cancel Request'}
          </DialogTitle>
          <DialogDescription>
            {dialogAction === 'remove' 
              ? `Are you sure you want to remove ${connection.full_name} from your connections?` 
              : `Are you sure you want to cancel your connection request to ${connection.full_name}?`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button 
            onClick={handleConnectionAction} 
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4 mr-1" />}
            {dialogAction === 'remove' ? 'Remove' : 'Cancel Request'}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
