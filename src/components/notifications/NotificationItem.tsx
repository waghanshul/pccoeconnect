
import React, { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const categoryBadgeColors: Record<string, string> = {
  sports: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  exams: "bg-red-500/10 text-red-400 border-red-500/20",
  events: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  clubs: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  placements: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  celebrations: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  connections: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

interface SenderProfile {
  avatar_url?: string;
  full_name: string;
}

export interface NotificationItemProps {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category?: string;
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
  category,
  sender,
  isConnectionRequest,
  connectionId,
  onAcceptConnection,
  onRejectConnection
}: NotificationItemProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMM d, yyyy • h:mm a");
  };
  
  const handleAccept = async () => {
    if (!connectionId) return;
    setIsAccepting(true);
    try {
      await onAcceptConnection(connectionId);
      setIsHidden(true);
    } catch (error) {
      toast.error("Failed to accept connection");
    } finally {
      setIsAccepting(false);
    }
  };
  
  const handleReject = async () => {
    if (!connectionId) return;
    setIsRejecting(true);
    try {
      await onRejectConnection(connectionId);
      setIsHidden(true);
    } catch (error) {
      toast.error("Failed to reject connection");
    } finally {
      setIsRejecting(false);
    }
  };

  if (isHidden) return null;

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-start gap-3">
        {sender && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={sender.avatar_url} />
            <AvatarFallback>{sender.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{title}</h3>
            {category && !isConnectionRequest && (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryBadgeColors[category.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1.5">{content}</p>
          <p className="text-[10px] text-muted-foreground">
            {formatDate(created_at)}
          </p>
          
          {isConnectionRequest && connectionId && (
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm"
                onClick={handleAccept}
                disabled={isAccepting || isRejecting}
                className="gap-1.5 h-8 text-xs"
              >
                {isAccepting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReject}
                disabled={isAccepting || isRejecting}
                className="gap-1.5 h-8 text-xs"
              >
                {isRejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
