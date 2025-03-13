
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
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
          <Tabs defaultValue="sports" className="w-full">
            <TabsList className="w-full justify-start mb-8 overflow-x-auto bg-white dark:bg-gray-800">
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              <TabsTrigger value="placements">Placements</TabsTrigger>
              <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
            </TabsList>

            {["sports", "exams", "events", "clubs", "placements", "celebrations"].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {getNotificationsByCategory(category).length > 0 ? (
                  getNotificationsByCategory(category).map((notification) => (
                    <div key={notification.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
                      <h3 className="font-semibold dark:text-white">{notification.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{notification.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
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
