
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Check, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptConnectionRequest } from "@/components/connections/utils/connectionActions";

interface Notification {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  sender_id?: string;
  sender?: {
    avatar_url?: string;
    full_name: string;
  };
  isConnectionRequest?: boolean;
  connectionId?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up realtime subscription for notifications
      const channel = supabase
        .channel('notification-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            fetchNotifications();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'connections_v2' },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Fetch regular notifications with explicit join on sender profiles
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id(
            avatar_url,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (notificationError) throw notificationError;
      
      // First get connection requests
      const { data: connectionRequests, error: connectionError } = await supabase
        .from('connections_v2')
        .select('id, created_at, sender_id')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (connectionError) throw connectionError;
      
      // Then get the profile information separately for each sender
      const connectionNotifications: Notification[] = [];
      
      // Process each connection request
      for (const request of connectionRequests || []) {
        // Get the sender profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', request.sender_id)
          .single();
        
        // Create a notification object with the sender profile info
        connectionNotifications.push({
          id: `connection-${request.id}`,
          title: 'Connection Request',
          content: `${profileData?.full_name || 'Someone'} wants to connect with you`,
          category: 'connections',
          created_at: request.created_at,
          sender_id: request.sender_id,
          sender: {
            avatar_url: profileData?.avatar_url,
            full_name: profileData?.full_name || 'Unknown User'
          },
          isConnectionRequest: true,
          connectionId: request.sender_id
        });
      }
      
      // Combine both types of notifications and sort by date
      const allNotifications: Notification[] = [...(notificationData || []), ...connectionNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle connection request response
  const handleConnectionRequest = async (connectionId: string, accept: boolean) => {
    try {
      if (!user) return;
      
      if (accept) {
        // Use the acceptConnectionRequest function from the imported module
        const success = await acceptConnectionRequest(user.id, connectionId);
        
        if (success) {
          toast.success("Connection request accepted");
          // Refresh notifications
          fetchNotifications();
        }
      } else {
        // Reject the request (delete it)
        const { error } = await supabase
          .from('connections_v2')
          .delete()
          .eq('sender_id', connectionId)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
          
        if (error) throw error;
        
        toast.success("Connection request rejected");
        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
      toast.error("Failed to process connection request");
    }
  };

  // Function to group notifications by category
  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(notif => notif.category.toLowerCase() === category.toLowerCase());
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Notifications</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="w-full justify-start mb-8 overflow-x-auto bg-white dark:bg-gray-800">
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              <TabsTrigger value="placements">Placements</TabsTrigger>
              <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
            </TabsList>

            {["connections", "sports", "exams", "events", "clubs", "placements", "celebrations"].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {getNotificationsByCategory(category).length > 0 ? (
                  getNotificationsByCategory(category).map((notification) => (
                    <div key={notification.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
                      <div className="flex items-start gap-4">
                        {notification.sender && (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.sender.avatar_url} />
                            <AvatarFallback>
                              {notification.sender.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold dark:text-white">{notification.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{notification.content}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.created_at)}
                          </p>
                          
                          {notification.isConnectionRequest && notification.connectionId && (
                            <div className="flex gap-2 mt-4">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleConnectionRequest(notification.connectionId!, true)}
                                className="flex items-center gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleConnectionRequest(notification.connectionId!, false)}
                                className="flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                    <p className="text-gray-600 dark:text-gray-300">No {category} notifications found</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Notifications;
