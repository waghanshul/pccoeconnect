import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Loader2,
  Trophy,
  GraduationCap,
  Calendar,
  Users,
  Briefcase,
  PartyPopper,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

const categoryStyles: Record<string, { border: string; iconBg: string; icon: React.ElementType }> = {
  sports: { border: "border-l-emerald-500", iconBg: "bg-emerald-500/10 text-emerald-500", icon: Trophy },
  exams: { border: "border-l-red-500", iconBg: "bg-red-500/10 text-red-500", icon: GraduationCap },
  events: { border: "border-l-blue-500", iconBg: "bg-blue-500/10 text-blue-500", icon: Calendar },
  clubs: { border: "border-l-purple-500", iconBg: "bg-purple-500/10 text-purple-500", icon: Users },
  placements: { border: "border-l-amber-500", iconBg: "bg-amber-500/10 text-amber-500", icon: Briefcase },
  celebrations: { border: "border-l-pink-500", iconBg: "bg-pink-500/10 text-pink-500", icon: PartyPopper },
  connections: { border: "border-l-primary", iconBg: "bg-primary/10 text-primary", icon: Bell },
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
  onRejectConnection,
}: NotificationItemProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const relativeTime = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "";

  const catKey = category?.toLowerCase() || "connections";
  const style = categoryStyles[catKey] || { border: "border-l-muted", iconBg: "bg-muted text-muted-foreground", icon: Bell };
  const CategoryIcon = style.icon;

  const handleAccept = async () => {
    if (!connectionId) return;
    setIsAccepting(true);
    try {
      await onAcceptConnection(connectionId);
      setIsHidden(true);
    } catch {
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
    } catch {
      toast.error("Failed to reject connection");
    } finally {
      setIsRejecting(false);
    }
  };

  if (isHidden) return null;

  // Connection request layout
  if (isConnectionRequest && connectionId) {
    return (
      <div className="bg-card border border-border border-l-2 border-l-primary rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={sender?.avatar_url} />
            <AvatarFallback className="text-sm font-medium">
              {sender?.full_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm truncate">{title}</h3>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{relativeTime}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{content}</p>

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
          </div>
        </div>
      </div>
    );
  }

  // Standard notification layout
  return (
    <div className={`bg-card border border-border border-l-2 ${style.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        {sender ? (
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={sender.avatar_url} />
            <AvatarFallback>{sender.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${style.iconBg}`}>
            <CategoryIcon className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{relativeTime}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{content}</p>
        </div>
      </div>
    </div>
  );
};
