import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationTabs } from "@/components/notifications/NotificationTabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/ui/PageTransition";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, isLoading, refreshNotifications } = useNotifications(user?.id);
  const { handleAcceptConnection, handleRejectConnection, isProcessing } = useConnectionRequests(
    user?.id, 
    refreshNotifications
  );

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('notification-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'connections_v2' }, () => {
          refreshNotifications();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          refreshNotifications();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, refreshNotifications]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 pt-16 md:pt-20 pb-24 md:pb-10">
          <h1 className="text-3xl font-bold mb-6">Notifications</h1>
          
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
      </PageTransition>
    </div>
  );
};

export default Notifications;
