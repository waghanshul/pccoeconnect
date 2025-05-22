
import React, { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SenderProfile {
  avatar_url?: string;
  full_name: string;
}

export interface NotificationItemProps {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sender?: SenderProfile;
  isConnectionRequest?: boolean;
  connectionId?: string;
  onAcceptConnection: (connectionId: string) => Promise<void>;
  onRejectConnection: (connectionId: string) => Promise<void>;
}

export const NotificationItem = ({
  id,
  title,
  content,
  created_at,
  sender,
  isConnectionRequest,
  connectionId,
  onAcceptConnection,
  onRejectConnection
}: NotificationItemProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMM d, yyyy • h:mm a");
  };
  
  const handleAccept = async () => {
    if (!connectionId) {
      console.error("Cannot accept connection: connectionId is missing");
      return;
    }
    
    setIsAccepting(true);
    try {
      await onAcceptConnection(connectionId);
      setIsHidden(true); // Hide the notification after successful acceptance
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    } finally {
      setIsAccepting(false);
    }
  };
  
  const handleReject = async () => {
    if (!connectionId) {
      console.error("Cannot reject connection: connectionId is missing");
      return;
    }
    
    setIsRejecting(true);
    try {
      await onRejectConnection(connectionId);
      setIsHidden(true); // Hide the notification after successful rejection
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast.error("Failed to reject connection");
    } finally {
      setIsRejecting(false);
    }
  };

  // If notification is hidden (after action), don't render anything
  if (isHidden) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
      <div className="flex items-start gap-4">
        {sender && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={sender.avatar_url} />
            <AvatarFallback>
              {sender.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{content}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(created_at)}
          </p>
          
          {isConnectionRequest && connectionId && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={handleAccept}
                disabled={isAccepting || isRejecting}
                className="flex items-center gap-1"
              >
                {isAccepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReject}
                disabled={isAccepting || isRejecting}
                className="flex items-center gap-1"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
