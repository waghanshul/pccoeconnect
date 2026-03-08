
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Cpu, Users, UserPlus, UserCheck, Loader2, GraduationCap } from "lucide-react";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { useState } from "react";

interface ProfileHeaderProps {
  name: string;
  avatar: string;
  role: string;
  connectionCount: number;
  isOwnProfile: boolean;
  isConnected: boolean;
  onMessageClick: () => void;
  onConnectClick: () => void;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export const ProfileHeader = ({
  name,
  avatar,
  role,
  connectionCount,
  isOwnProfile,
  isConnected,
  onMessageClick,
  onConnectClick,
  onAvatarUpdate
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
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-50 blur-sm" />
        <Avatar className="relative w-24 h-24 ring-2 ring-background">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        {isOwnProfile && onAvatarUpdate && (
          <ProfilePhotoUpload
            currentAvatar={avatar}
            userName={name}
            onAvatarUpdate={onAvatarUpdate}
          />
        )}
      </div>
      <div className="text-center space-y-3">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {role === 'student' ? <GraduationCap className="w-4 h-4 text-primary" /> : <Cpu className="w-4 h-4 text-primary" />}
            <span>{role}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{connectionCount} Connections</span>
          </div>
        </div>
        <div className="flex gap-2 justify-center pt-1">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={onMessageClick}
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
          
          {!isOwnProfile && (
            <Button 
              variant={isConnected ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={handleConnect}
              disabled={isLoading || isConnected}
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
