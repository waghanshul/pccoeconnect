
import { apiClient, handleApiError, ApiResponse } from "./apiClient";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  related_id?: string;
  created_at: string;
  read: boolean;
}

export const notificationService = {
  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit = 20): Promise<ApiResponse<Notification[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch notifications") as Error };
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Failed to mark notification as read") as Error };
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Failed to mark all notifications as read") as Error };
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await apiClient.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return { data: count ?? 0, error: null };
    } catch (error) {
      return { data: 0, error: handleApiError(error, "Failed to get unread count") as Error };
    }
  },
};
