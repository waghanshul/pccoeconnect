
import { apiClient, handleApiError, ApiResponse } from "./apiClient";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const messageService = {
  /**
   * Send a message to another user
   */
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<ApiResponse<Message>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          read: false,
        })
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to send message") as Error };
    }
  },

  /**
   * Get all messages in a conversation between two users
   */
  async getConversation(userId1: string, userId2: string): Promise<ApiResponse<Message[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch conversation") as Error };
    }
  },

  /**
   * Mark messages as read
   */
  async markAsRead(messageIds: string[]): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Failed to mark messages as read") as Error };
    }
  },

  /**
   * Get all conversations for a user with the latest message
   */
  async getUserConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    try {
      // This is a more complex query that would typically require a SQL function
      // or custom endpoint in a real implementation
      const { data, error } = await apiClient.supabase
        .rpc('get_user_conversations', { user_id: userId });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch conversations") as Error };
    }
  },
};
