import { Loader2, Bell, CheckCheck } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationTabs } from "@/components/notifications/NotificationTabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/ui/PageTransition";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, isLoading, refreshNotifications } = useNotifications(user?.id);
  const { handleAcceptConnection, handleRejectConnection } = useConnectionRequests(
    user?.id,
    refreshNotifications
  );
  const [markedRead, setMarkedRead] = useState(false);

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

  const count = notifications.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 pt-16 md:pt-20 pb-24 md:pb-10 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
              {count > 0 && !markedRead && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-1.5">
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground gap-1.5"
                onClick={() => setMarkedRead(true)}
                disabled={markedRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markedRead ? "Done" : "Mark all read"}
              </Button>
            )}
          </div>

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
