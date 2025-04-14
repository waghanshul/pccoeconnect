
import { Card } from "@/components/ui/card";
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
  const { updateUserStatus } = useUserStore();
  const { user: authUser } = useAuth();
  const [connectionCount, setConnectionCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user.id) {
      fetchConnectionCount();
      checkConnection();
    }
  }, [user.id]);

  const fetchConnectionCount = async () => {
    try {
      // Update to use connections_v2 table with accepted status for proper counting
      const { data, error } = await supabase
        .from('connections_v2')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      const count = data?.length || 0;
      console.log(`Found ${count} connections for user ${user.id}`);
      setConnectionCount(count);
    } catch (error) {
      console.error("Error fetching connection count:", error);
    }
  };

  const checkConnection = async () => {
    if (!authUser || authUser.id === user.id) return;
    
    try {
      // Check if there's an accepted connection between the two users
      const { data, error } = await supabase
        .from('connections_v2')
        .select('*')
        .or(`sender_id.eq.${authUser.id}.and.receiver_id.eq.${user.id},sender_id.eq.${user.id}.and.receiver_id.eq.${authUser.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;
      setIsConnected(data && data.length > 0);
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const handleMessage = () => {
    navigate("/messages");
    toast.success("Redirecting to messages with " + user.name);
  };

  const handleAvailabilityChange = async () => {
    if (!isOwnProfile) return;
    
    const statusOptions: UserStatus[] = ['online', 'busy', 'offline'];
    const currentIndex = statusOptions.indexOf(user.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const newStatus = statusOptions[nextIndex];
    
    await updateUserStatus(newStatus);
    toast.success(`Status updated to ${availabilityLabels[newStatus]}`);
  };

  const handleConnect = async () => {
    if (!authUser || isOwnProfile) return;
    
    try {
      if (isConnected) {
        // Disconnect
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('follower_id', authUser.id)
          .eq('following_id', user.id);
        
        if (error) throw error;
        setIsConnected(false);
        setConnectionCount(prev => Math.max(0, prev - 1));
        toast.success(`Disconnected from ${user.name}`);
      } else {
        // Connect
        const { error } = await supabase
          .from('connections')
          .insert({
            follower_id: authUser.id,
            following_id: user.id
          });
        
        if (error) throw error;
        setIsConnected(true);
        setConnectionCount(prev => prev + 1);
        toast.success(`Connected with ${user.name}`);
      }
    } catch (error) {
      console.error("Error updating connection:", error);
      toast.error("Failed to update connection");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 shadow-xl">
      <ProfileHeader 
        name={user.name}
        avatar={user.avatar}
        role={user.role}
        status={user.status}
        connectionCount={connectionCount}
        isOwnProfile={isOwnProfile}
        isConnected={isConnected}
        onMessageClick={handleMessage}
        onConnectClick={handleConnect}
        onStatusChange={handleAvailabilityChange}
      />
      <ProfileDetails 
        department={user.department}
        year={user.year}
        bio={user.bio}
        interests={user.interests}
        isPublic={user.isPublic}
        email={user.email}
        phone={user.phone}
      />
    </Card>
  );
};
