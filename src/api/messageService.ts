
import { apiClient, handleApiError, ApiResponse } from "./apiClient";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    name: string;
    avatar_url: string;
  };
  receiver?: {
    name: string;
    avatar_url: string;
  };
}

export interface Conversation {
  user: {
    id: string;
    name: string;
    avatar_url: string;
    availability?: string;
  };
  lastMessage: {
    content: string;
    created_at: string;
    read: boolean;
    is_sender: boolean;
  };
  unreadCount: number;
}

export const messageService = {
  /**
   * Send a message to another user
   */
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<ApiResponse<Message>> {
    try {
      const { data, error } = await apiClient.supabase
        .from("messages")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
        })
        .select("*")
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, "Failed to send message") as Error,
      };
    }
  },

  /**
   * Get messages between the current user and another user
   */
  async getConversation(
    userId: string,
    otherUserId: string
  ): Promise<ApiResponse<Message[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Filter for only messages between these two users
      const messages = data.filter(
        (message) =>
          (message.sender_id === userId && message.receiver_id === otherUserId) ||
          (message.sender_id === otherUserId && message.receiver_id === userId)
      );

      return { data: messages, error: null };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, "Failed to fetch conversation") as Error,
      };
    }
  },

  /**
   * Get all conversations for the current user
   */
  async getConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    try {
      // This is a complex query that would need to be handled by the backend
      // For now, returning mock data
      return {
        data: [],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleApiError(error, "Failed to fetch conversations") as Error,
      };
    }
  },

  /**
   * Mark a conversation as read
   */
  async markConversationAsRead(
    userId: string,
    otherUserId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase
        .from("messages")
        .update({ read: true })
        .eq("receiver_id", userId)
        .eq("sender_id", otherUserId)
        .eq("read", false);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return {
        data: false,
        error: handleApiError(error, "Failed to mark conversation as read") as Error,
      };
    }
  },
};
