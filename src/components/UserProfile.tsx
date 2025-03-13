
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  BookOpen, 
  Heart, 
  MessageSquare, 
  Cpu, 
  Mail, 
  Phone, 
  Globe,
  CircleCheck,
  CircleSlash,
  CircleAlert,
  CircleX,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore, UserStatus } from "@/services/user";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

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

const availabilityIcons = {
  online: <CircleCheck className="w-6 h-6 text-green-500" />,
  busy: <CircleSlash className="w-6 h-6 text-red-500" />,
  away: <CircleAlert className="w-6 h-6 text-yellow-500" />,
  offline: <CircleX className="w-6 h-6 text-gray-500" />
};

const availabilityLabels = {
  online: 'Online',
  busy: 'Busy',
  offline: 'Offline'
};

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
      const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);
      
      if (error) throw error;
      setConnectionCount(count || 0);
    } catch (error) {
      console.error("Error fetching connection count:", error);
    }
  };

  const checkConnection = async () => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('follower_id', authUser.id)
        .eq('following_id', user.id);
      
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
      <CardHeader className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-gray-700">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <button 
              onClick={handleAvailabilityChange}
              className="absolute -bottom-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform"
              title={`Current status: ${availabilityLabels[user.status] || user.status}`}
            >
              {availabilityIcons[user.status] || availabilityIcons.offline}
            </button>
          )}
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold dark:text-white">{user.name}</CardTitle>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Cpu className="w-4 h-4" />
            <p className="text-muted-foreground dark:text-gray-400">{user.role}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Users className="w-4 h-4" />
            <p className="text-muted-foreground dark:text-gray-400">{connectionCount} Connections</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-primary hover:text-white dark:text-gray-200 dark:hover:text-white transition-colors duration-200"
              onClick={handleMessage}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            
            {!isOwnProfile && authUser && (
              <Button 
                variant={isConnected ? "default" : "outline"}
                className="gap-2"
                onClick={handleConnect}
              >
                <Users className="w-4 h-4" />
                {isConnected ? "Connected" : "Connect"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium dark:text-gray-200">Academic Details</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {user.department} • {user.year} Year
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <BookOpen className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium dark:text-gray-200">Bio</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">{user.bio || "No bio available"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Heart className="w-5 h-5 text-primary mt-1" />
            <div className="w-full">
              <p className="font-medium dark:text-gray-200">Interests</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-primary/10 dark:bg-primary/20 text-primary rounded-full transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground dark:text-gray-400">No interests listed</p>
                )}
              </div>
            </div>
          </div>

          {user.email && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium dark:text-gray-200">Email</p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          )}

          {user.phone && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium dark:text-gray-200">Phone</p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium dark:text-gray-200">Profile Visibility</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {user.isPublic ? 'Public Profile' : 'Private Profile'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
