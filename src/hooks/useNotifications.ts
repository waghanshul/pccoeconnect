
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
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

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching notifications for user:", userId);
      
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
      
      console.log("Regular notifications fetched:", notificationData?.length || 0);
      
      // First get connection requests
      const { data: connectionRequests, error: connectionError } = await supabase
        .from('connections_v2')
        .select('id, created_at, sender_id')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (connectionError) throw connectionError;
      
      console.log("Connection requests fetched:", connectionRequests?.length || 0);
      
      // Create an array to store connection notifications
      const connectionNotifications: Notification[] = [];
      
      // Process each connection request
      if (connectionRequests && connectionRequests.length > 0) {
        // Get all sender IDs
        const senderIds = connectionRequests.map(request => request.sender_id);
        
        // Fetch all profiles in one query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, avatar_url, full_name')
          .in('id', senderIds);
          
        if (profilesError) throw profilesError;
        
        // Create a map of profiles by ID for easy lookup
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        // Create a notification for each connection request
        for (const request of connectionRequests) {
          const profile = profilesMap.get(request.sender_id);
          
          if (profile) {
            connectionNotifications.push({
              id: `connection-${request.id}`,
              title: 'Connection Request',
              content: `${profile.full_name || 'Someone'} wants to connect with you`,
              category: 'connections',
              created_at: request.created_at,
              sender_id: request.sender_id,
              sender: {
                avatar_url: profile.avatar_url,
                full_name: profile.full_name || 'Unknown User'
              },
              isConnectionRequest: true,
              connectionId: request.sender_id
            });
          }
        }
      }
      
      console.log("Connection notifications created:", connectionNotifications.length);
      
      // Combine both types of notifications and sort by date
      const allNotifications: Notification[] = [...(notificationData || []), ...connectionNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log("Total notifications after combining:", allNotifications.length);
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up realtime subscription for notifications
      const channel = supabase
        .channel('notification-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            console.log("Notification change detected, refreshing...");
            fetchNotifications();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'connections_v2' },
          (payload) => {
            console.log("Connection change detected in useNotifications:", payload);
            fetchNotifications();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    isLoading,
    refreshNotifications: fetchNotifications
  };
};
