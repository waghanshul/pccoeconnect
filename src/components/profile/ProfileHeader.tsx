
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Cpu, Users, UserPlus, UserCheck, UserMinus, Loader2 } from "lucide-react";
import { ProfileStatus } from "./ProfileStatus";
import { UserStatus } from "@/services/user";
import { useState } from "react";

interface ProfileHeaderProps {
  name: string;
  avatar: string;
  role: string;
  status: UserStatus;
  connectionCount: number;
  isOwnProfile: boolean;
  isConnected: boolean;
  onMessageClick: () => void;
  onConnectClick: () => void;
  onStatusChange: () => void;
}

export const ProfileHeader = ({
  name,
  avatar,
  role,
  status,
  connectionCount,
  isOwnProfile,
  isConnected,
  onMessageClick,
  onConnectClick,
  onStatusChange
}: ProfileHeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnectClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  const getConnectionIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isConnected) return <UserCheck className="w-4 h-4" />;
    return <UserPlus className="w-4 h-4" />;
  };

  return (
    <CardHeader className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-gray-700">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <ProfileStatus 
            status={status} 
            onClick={onStatusChange}
            className="absolute -bottom-2 -right-2" 
          />
        )}
      </div>
      <div className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold dark:text-white">{name}</CardTitle>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Cpu className="w-4 h-4" />
          <p className="text-muted-foreground dark:text-gray-400">{role}</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Users className="w-4 h-4" />
          <p className="text-muted-foreground dark:text-gray-400">{connectionCount} Connections</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            className="gap-2 hover:bg-primary hover:text-white dark:text-gray-200 dark:hover:text-white transition-colors duration-200"
            onClick={onMessageClick}
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
          
          {!isOwnProfile && (
            <Button 
              variant={isConnected ? "default" : "outline"}
              className="gap-2"
              onClick={handleConnect}
              disabled={isLoading}
            >
              {getConnectionIcon()}
              {isConnected ? "Connected" : "Connect"}
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
