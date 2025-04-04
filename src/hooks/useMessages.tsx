
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Message, ReceiverProfile } from "./messaging/types";
import { 
  fetchMessages, 
  fetchConversationParticipants, 
  sendMessage as sendMessageService,
  markMessagesAsRead 
} from "./messaging/messageService";
import { setupMessageRealtimeSubscription } from "./messaging/messageRealtimeService";

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverProfile, setReceiverProfile] = useState<ReceiverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (conversationId) {
      fetchMessagesData();
      fetchConversationParticipantsData();
      const cleanup = setupRealtimeSubscription();
      
      return () => {
        cleanup();
      };
    }
  }, [conversationId]);

  const fetchMessagesData = async () => {
    try {
      setIsLoading(true);
      const messagesData = await fetchMessages(conversationId);
      setMessages(messagesData);
      
      // Mark messages as read
      markMessagesAsRead(messagesData, user?.id);
    } catch (error) {
      console.error("Error in fetchMessagesData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationParticipantsData = async () => {
    const profileData = await fetchConversationParticipants(conversationId, user?.id);
    setReceiverProfile(profileData);
  };

  const setupRealtimeSubscription = () => {
    return setupMessageRealtimeSubscription(
      conversationId,
      user?.id,
      (newMessage) => {
        setMessages(current => [...current, newMessage]);
      },
      (messagesToMark) => markMessagesAsRead(messagesToMark, user?.id)
    );
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    
    try {
      const newMessage = await sendMessageService(content, conversationId, user.id);
      
      if (newMessage) {
        // Add sender info to the message with proper typing
        const newMessageWithSender: Message = {
          ...newMessage,
          sender: {
            full_name: user?.user_metadata?.full_name || user?.email || 'You',
            avatar_url: user?.user_metadata?.avatar_url || null
          }
        };
        
        setMessages(current => [...current, newMessageWithSender]);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
    }
  };

  return {
    messages,
    receiverProfile,
    isLoading,
    sendMessage
  };
};

export default useMessages;
