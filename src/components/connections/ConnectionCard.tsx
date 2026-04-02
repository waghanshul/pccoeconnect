import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ConnectionButton } from "./ConnectionButton";
import { MessageButton } from "./MessageButton";
import { ConnectionUser } from "./utils/connectionActions";

export interface ConnectionCardProps {
  connection: ConnectionUser;
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMessage = (connectionId: string) => {
    navigate(`/messages?user=${connectionId}`);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/30 transition-colors duration-150">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={connection.avatar_url} />
        <AvatarFallback>{connection.full_name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium truncate">{connection.full_name}</h3>
          {connection.role && (
            <Badge variant="outline" className="text-[10px] font-normal shrink-0">
              {connection.role}
            </Badge>
          )}
        </div>
        {connection.department && (
          <p className="text-xs text-muted-foreground truncate">{connection.department}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ConnectionButton
          connection={connection}
          isConnected={isConnected}
          hasPendingRequest={hasPendingRequest}
          hasReceivedRequest={hasReceivedRequest}
          userId={user?.id}
          onConnectionUpdate={onConnectionUpdate}
        />
        <MessageButton
          connectionId={connection.id}
          isConnected={isConnected}
          onMessageClick={handleMessage}
        />
      </div>
    </div>
  );
};
