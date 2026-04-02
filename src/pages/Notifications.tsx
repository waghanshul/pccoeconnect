import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { NotificationTabs } from "@/components/notifications/NotificationTabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, isLoading, refreshNotifications } = useNotifications(user?.id);
  const { handleAcceptConnection, handleRejectConnection } = useConnectionRequests(
    user?.id,
    refreshNotifications
  );
  const markedReadRef = useRef(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || isLoading || markedReadRef.current) return;
    
    const regularNotifications = notifications.filter(n => !n.isConnectionRequest);
    if (regularNotifications.length === 0) return;

    const markAsRead = async () => {
      try {
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
        const allReadIds = new Set(regularNotifications.map(n => n.id));
        setReadIds(allReadIds);
        markedReadRef.current = true;
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    markAsRead();
  }, [user, notifications, isLoading]);

  return (
    <AppLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <NotificationTabs
            notifications={notifications}
            onAcceptConnection={handleAcceptConnection}
            onRejectConnection={handleRejectConnection}
            readNotificationIds={readIds}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Notifications;
