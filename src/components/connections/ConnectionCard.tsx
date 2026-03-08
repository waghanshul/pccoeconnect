import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ConnectionButton } from "./ConnectionButton";
import { MessageButton } from "./MessageButton";
import { ConnectionUser } from "./utils/connectionActions";
import { motion } from "framer-motion";

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
    navigate(`/messages?user=${connectionId}`);
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/40 group-hover:to-blue-400/40 rounded-full transition-all duration-300 blur-sm" />
                <Avatar className="relative h-11 w-11 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={connection.avatar_url} />
                  <AvatarFallback>
                    {connection.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h3 className="font-medium">{connection.full_name}</h3>
                {connection.role && (
                  <Badge variant="outline" className="text-[10px] font-normal mt-0.5">
                    {connection.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 pt-0">
          {connection.department && (
            <p className="text-xs text-muted-foreground">
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
    </motion.div>
  );
};
