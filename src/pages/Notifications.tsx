import { Loader2, Bell } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationTabs } from "@/components/notifications/NotificationTabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/ui/PageTransition";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, isLoading, refreshNotifications } = useNotifications(user?.id);
  const { handleAcceptConnection, handleRejectConnection } = useConnectionRequests(
    user?.id,
    refreshNotifications
  );
  const markedReadRef = useRef(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Auto-mark regular notifications as read when page loads
  useEffect(() => {
    if (!user || isLoading || markedReadRef.current) return;
    
    const regularNotifications = notifications.filter(n => !n.isConnectionRequest);
    if (regularNotifications.length === 0) return;

    const markAsRead = async () => {
      try {
        // Get already-read notification IDs
        const { data: existingReads } = await supabase
          .from('notification_reads')
          .select('notification_id')
          .eq('profile_id', user.id);

        const existingReadIds = new Set((existingReads || []).map(r => r.notification_id));
        const unreadNotifs = regularNotifications.filter(n => !existingReadIds.has(n.id));

        if (unreadNotifs.length > 0) {
          const inserts = unreadNotifs.map(n => ({
            notification_id: n.id,
            profile_id: user.id,
          }));
          await supabase.from('notification_reads').insert(inserts);
        }
        // Mark all regular notification IDs as read locally
        const allReadIds = new Set(regularNotifications.map(n => n.id));
        setReadIds(allReadIds);
        markedReadRef.current = true;
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    markAsRead();
  }, [user, notifications, isLoading]);

  const count = notifications.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>
        <div className="container mx-auto px-4 py-8 pt-16 md:pt-20 pb-24 md:pb-10 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            </div>
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
