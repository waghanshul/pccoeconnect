import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, UserPlus, UserCheck, Loader2, GraduationCap, Cpu } from "lucide-react";
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
    try { await onConnectClick(); } finally { setIsLoading(false); }
  };

  return (
    <div>
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl" />
      
      {/* Avatar + info */}
      <div className="px-4 -mt-12">
        <div className="flex items-end justify-between">
          <div className="relative">
            <Avatar className="w-20 h-20 ring-4 ring-background">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xl">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            {isOwnProfile && onAvatarUpdate && (
              <ProfilePhotoUpload
                currentAvatar={avatar}
                userName={name}
                onAvatarUpdate={onAvatarUpdate}
              />
            )}
          </div>
          
          <div className="flex gap-2 pb-1">
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={onMessageClick}>
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Button>
            {!isOwnProfile && (
              <Button
                variant={isConnected ? "default" : "outline"}
                size="sm"
                className="gap-2 h-8 text-xs"
                onClick={handleConnect}
                disabled={isLoading || isConnected}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isConnected ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isConnected ? "Connected" : "Connect"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <h1 className="text-xl font-bold">{name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {role === 'student' ? <GraduationCap className="w-4 h-4 text-primary" /> : <Cpu className="w-4 h-4 text-primary" />}
              {role}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {connectionCount} Connections
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
