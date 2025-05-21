
import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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
  title,
  content,
  created_at,
  sender,
  isConnectionRequest,
  connectionId,
  onAcceptConnection,
  onRejectConnection
}: NotificationItemProps) => {
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMM d, yyyy • h:mm a");
  };

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
                onClick={() => onAcceptConnection(connectionId)}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRejectConnection(connectionId)}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
