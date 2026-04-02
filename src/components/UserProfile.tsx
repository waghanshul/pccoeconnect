import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore, UserStatus } from "@/services/user";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileDetails } from "./profile/ProfileDetails";
import { availabilityLabels } from "./profile/ProfileStatus";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    department: string;
    year: string;
    bio: string;
    interests: string[];
    isPublic: boolean;
    email: string;
    phone: string;
    status: UserStatus;
  };
  isOwnProfile?: boolean;
}

export const UserProfile = ({ user, isOwnProfile = false }: UserProfileProps) => {
  const navigate = useNavigate();
  const { updateUserStatus, updateUserAvatar } = useUserStore();
  const { user: authUser } = useAuth();
  const [connectionCount, setConnectionCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isPendingRequest, setIsPendingRequest] = useState(false);

  useEffect(() => {
    if (user.id) { fetchConnectionCount(); checkConnection(); }
  }, [user.id]);

  const fetchConnectionCount = async () => {
    try {
      const { data, error } = await supabase
        .from('connections_v2')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');
      if (error) throw error;
      setConnectionCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching connection count:", error);
    }
  };

  const checkConnection = async () => {
    if (!authUser || authUser.id === user.id) return;
    try {
      const { data: acceptedData, error: acceptedError } = await supabase
        .from('connections_v2')
        .select('*')
        .or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${authUser.id})`)
        .eq('status', 'accepted');
      if (acceptedError) throw acceptedError;
      setIsConnected(acceptedData && acceptedData.length > 0);
      
      if (!isConnected) {
        const { data: pendingData, error: pendingError } = await supabase
          .from('connections_v2')
          .select('*')
          .eq('sender_id', authUser.id)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
        if (pendingError) throw pendingError;
        setIsPendingRequest(pendingData && pendingData.length > 0);
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
    }
  };

  const handleMessage = () => {
    navigate("/messages");
    toast.success("Redirecting to messages with " + user.name);
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    updateUserAvatar(newAvatarUrl);
  };

  const handleConnect = async () => {
    if (!authUser || isOwnProfile) return;
    try {
      if (isConnected) { toast.info("Already connected"); return; }
      else if (isPendingRequest) {
        const { error } = await supabase.from('connections_v2').delete()
          .eq('sender_id', authUser.id).eq('receiver_id', user.id).eq('status', 'pending');
        if (error) throw error;
        setIsPendingRequest(false);
        toast.success("Connection request canceled");
      } else {
        const { error } = await supabase.from('connections_v2').insert({
          sender_id: authUser.id, receiver_id: user.id, status: 'pending'
        });
        if (error) throw error;
        setIsPendingRequest(true);
        toast.success(`Connection request sent to ${user.name}`);
      }
    } catch (error) {
      console.error("Error updating connection:", error);
      toast.error("Failed to update connection");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader 
        name={user.name}
        avatar={user.avatar}
        role={user.role}
        connectionCount={connectionCount}
        isOwnProfile={isOwnProfile}
        isConnected={isConnected}
        onMessageClick={handleMessage}
        onConnectClick={handleConnect}
        onAvatarUpdate={isOwnProfile ? handleAvatarUpdate : undefined}
      />
      <div className="mt-6 border-t border-border pt-6">
        <ProfileDetails 
          department={user.department}
          year={user.year}
          bio={user.bio}
          interests={user.interests}
          isPublic={user.isPublic}
          email={user.email}
          phone={user.phone}
        />
      </div>
    </div>
  );
};
