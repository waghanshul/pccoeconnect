
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
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

  console.log(`Connection ${connection.full_name} - isConnected: ${isConnected}, hasPendingRequest: ${hasPendingRequest}, hasReceivedRequest: ${hasReceivedRequest}`);

  const handleMessage = (connectionId: string) => {
    // Navigate to messages page with this connection
    navigate(`/messages?user=${connectionId}`);
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
      </CardFooter>
    </Card>
  );
};
