
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, UserPlus, Loader2, Link2, Check, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    avatar_url?: string;
    department?: string;
    role?: string;
  };
  isConnected: boolean;
  hasPendingRequest?: boolean;
  hasReceivedRequest?: boolean;
  onConnectionUpdate: () => void;
}

export const ConnectionCard = ({ 
  connection, 
  isConnected,
  hasPendingRequest = false,
  hasReceivedRequest = false,
  onConnectionUpdate 
}: ConnectionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'remove' | 'cancel'>('remove');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleConnectionAction = async () => {
    if (!user) return;
    
    // If already connected or has pending request, show confirmation dialog
    if (isConnected) {
      setDialogAction('remove');
      setShowConfirmDialog(true);
      return;
    } else if (hasPendingRequest) {
      setDialogAction('cancel');
      setShowConfirmDialog(true);
      return;
    }
    
    setIsLoading(true);
    try {
      if (hasReceivedRequest) {
        // Accept request using connections_v2 table
        const { data: requestData } = await supabase
          .from('connections_v2')
          .select('id')
          .eq('sender_id', connection.id)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .single();
          
        if (requestData) {
          const { error: updateError } = await supabase
            .from('connections_v2')
            .update({ status: 'accepted' })
            .eq('id', requestData.id);
            
          if (updateError) throw updateError;
          toast.success(`You are now connected with ${connection.full_name}`);
        }
      } else {
        // Send new connection request
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
      
      // Trigger refresh of connections
      onConnectionUpdate();
    } catch (error) {
      console.error("Error handling connection action:", error);
      toast.error("Failed to process connection action");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmedAction = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (dialogAction === 'remove') {
        // Remove connection - need to check both directions
        const { error: deleteError } = await supabase
          .from('connections_v2')
          .delete()
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${connection.id},receiver_id.eq.${connection.id}`)
          .eq('status', 'accepted');
          
        if (deleteError) throw deleteError;
        toast.success(`Disconnected from ${connection.full_name}`);
      } else if (dialogAction === 'cancel') {
        // Cancel pending request
        const { error: deleteError } = await supabase
          .from('connections_v2')
          .delete()
          .eq('sender_id', user.id)
          .eq('receiver_id', connection.id)
          .eq('status', 'pending');
          
        if (deleteError) throw deleteError;
        toast.success(`Connection request canceled`);
      }
      
      // Trigger refresh of connections
      onConnectionUpdate();
    } catch (error) {
      console.error("Error handling confirmed action:", error);
      toast.error("Failed to process action");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleMessage = async () => {
    // Create a conversation and navigate to it
    try {
      // Check if a conversation already exists
      const { data: existingConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false });
        
      const otherParticipantConversations = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', connection.id);
        
      // Find common conversation IDs
      const userConvIds = existingConversations?.map(c => c.conversation_id) || [];
      const otherConvIds = otherParticipantConversations.data?.map(c => c.conversation_id) || [];
      const commonConvIds = userConvIds.filter(id => otherConvIds.includes(id));
      
      let conversationId;
      
      if (commonConvIds.length > 0) {
        // Use existing conversation
        conversationId = commonConvIds[0];
      } else {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
          
        if (convError) throw convError;
        
        conversationId = newConversation.id;
        
        // Add participants
        const participants = [
          { conversation_id: conversationId, profile_id: user?.id },
          { conversation_id: conversationId, profile_id: connection.id }
        ];
        
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participants);
          
        if (participantsError) throw participantsError;
      }
      
      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  // Get button properties based on connection state
  const getConnectionButtonProps = () => {
    if (isLoading) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        label: "Loading",
        variant: "outline" as const,
        tooltip: "Processing..."
      };
    } else if (isConnected) {
      return {
        icon: <Link2 className="h-4 w-4" />,
        label: "Connected",
        variant: "default" as const,
        tooltip: "Remove connection"
      };
    } else if (hasPendingRequest) {
      return {
        icon: <Clock className="h-4 w-4" />,
        label: "Requested",
        variant: "outline" as const,
        tooltip: "Cancel request"
      };
    } else if (hasReceivedRequest) {
      return {
        icon: <Check className="h-4 w-4" />,
        label: "Accept",
        variant: "secondary" as const,
        tooltip: "Accept connection request"
      };
    } else {
      return {
        icon: <UserPlus className="h-4 w-4" />,
        label: "Connect",
        variant: "outline" as const,
        tooltip: "Send connection request"
      };
    }
  };

  const buttonProps = getConnectionButtonProps();

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
                <AvatarFallback>{connection.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{connection.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {connection.department ? `${connection.department}` : connection.role || 'Student'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleMessage}
                title="Message"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button 
                variant={buttonProps.variant}
                size="sm"
                onClick={handleConnectionAction}
                disabled={isLoading}
                title={buttonProps.tooltip}
                className="flex items-center gap-1 min-w-[100px] justify-center"
              >
                {buttonProps.icon}
                {buttonProps.label}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'remove' ? 'Remove Connection' : 'Cancel Request'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'remove' 
                ? `Are you sure you want to remove ${connection.full_name} from your connections?` 
                : `Are you sure you want to cancel your connection request to ${connection.full_name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedAction} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {dialogAction === 'remove' ? 'Remove' : 'Cancel Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
