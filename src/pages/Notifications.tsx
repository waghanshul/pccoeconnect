
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationTabs } from "@/components/notifications/NotificationTabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";

const Notifications = () => {
  const { user } = useAuth();
  
  const { notifications, isLoading, refreshNotifications } = useNotifications(user?.id);
  const { handleAcceptConnection, handleRejectConnection } = useConnectionRequests(
    user?.id, 
    refreshNotifications
  );

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
          <NotificationTabs
            notifications={notifications}
            onAcceptConnection={handleAcceptConnection}
            onRejectConnection={handleRejectConnection}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
