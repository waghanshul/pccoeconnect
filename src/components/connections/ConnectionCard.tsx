
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader,
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus,
  UserMinus,
  Clock,
  CheckCheck,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    avatar_url?: string;
    department?: string;
    role?: string;
  };
  isConnected: boolean;
  hasPendingRequest: boolean;
  hasReceivedRequest: boolean;
  onConnectionUpdate: () => void;
}

export const ConnectionCard = ({ 
  connection, 
  isConnected,
  hasPendingRequest,
  hasReceivedRequest,
  onConnectionUpdate 
}: ConnectionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'remove' | 'cancel'>('remove');
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log(`Connection ${connection.full_name} - isConnected: ${isConnected}, hasPendingRequest: ${hasPendingRequest}, hasReceivedRequest: ${hasReceivedRequest}`);

  const handleConnectionAction = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Case 1: Not connected and no pending request - Send connection request
      if (!isConnected && !hasPendingRequest && !hasReceivedRequest) {
        const { error } = await supabase
          .from('connections_v2')
          .insert({
            sender_id: user.id,
            receiver_id: connection.id,
            status: 'pending'
          });
          
        if (error) throw error;
        
        toast.success(`Connection request sent to ${connection.full_name}`);
      }
      // Case 2: Request received - Accept connection
      else if (hasReceivedRequest) {
        // Find the pending request from this user
        const { data: requestData, error: requestError } = await supabase
          .from('connections_v2')
          .select('id')
          .eq('sender_id', connection.id)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .single();
          
        if (requestError) throw requestError;
        
        // Update the request status to accepted
        const { error: updateError } = await supabase
          .from('connections_v2')
          .update({ status: 'accepted' })
          .eq('id', requestData.id);
          
        if (updateError) throw updateError;
        
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
        
        // Delete the pending request
        const { error: deleteError } = await supabase
          .from('connections_v2')
          .delete()
          .eq('sender_id', user.id)
          .eq('receiver_id', connection.id)
          .eq('status', 'pending');
          
        if (deleteError) throw deleteError;
        
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
        
        // Fix: Delete the connection in either direction using a proper OR condition
        const { error: deleteError } = await supabase
          .from('connections_v2')
          .delete()
          .or(`sender_id.eq.${user.id}.and.receiver_id.eq.${connection.id},sender_id.eq.${connection.id}.and.receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');
          
        if (deleteError) {
          console.error("Error removing connection:", deleteError);
          throw deleteError;
        }
        
        console.log(`Connection with ${connection.full_name} removed successfully`);
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

  const handleMessage = () => {
    // Navigate to messages page with this connection
    navigate(`/messages?user=${connection.id}`);
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={connection.avatar_url} />
              <AvatarFallback>
                {connection.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{connection.full_name}</h3>
              {connection.role && (
                <Badge variant="outline" className="text-xs font-normal">
                  {connection.role}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-0">
        {connection.department && (
          <p className="text-sm text-muted-foreground">
            {connection.department}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleConnectionAction} 
              variant={isConnected ? "default" : hasReceivedRequest ? "default" : "outline"}
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
          </DialogTrigger>
          
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
        
        <Button 
          onClick={handleMessage} 
          variant="outline" 
          size="sm" 
          className="flex-1"
          disabled={!isConnected}
        >
          <MessageSquare className="h-4 w-4 mr-1" /> Message
        </Button>
      </CardFooter>
    </Card>
  );
};
