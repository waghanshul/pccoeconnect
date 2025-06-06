
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
    if (conversationId && conversationId !== 'null') {
      fetchMessagesData();
      fetchConversationParticipantsData();
      const cleanup = setupRealtimeSubscription();
      
      return () => {
        cleanup();
      };
    } else {
      setMessages([]);
      setReceiverProfile(null);
      setIsLoading(false);
    }
  }, [conversationId, user?.id]);

  const fetchMessagesData = async () => {
    if (!conversationId || conversationId === 'null') return;
    
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
    if (!conversationId || conversationId === 'null') return;
    
    const profileData = await fetchConversationParticipants(conversationId, user?.id);
    setReceiverProfile(profileData);
  };

  const setupRealtimeSubscription = () => {
    if (!conversationId || conversationId === 'null' || !user?.id) {
      return () => {};
    }
    
    return setupMessageRealtimeSubscription(
      conversationId,
      user?.id,
      (newMessage) => {
        setMessages(current => {
          // Check if message already exists to prevent duplicates
          const messageExists = current.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return current;
          }
          return [...current, newMessage];
        });
      },
      (messagesToMark) => markMessagesAsRead(messagesToMark, user?.id)
    );
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || !conversationId || conversationId === 'null') return;
    
    try {
      const newMessage = await sendMessageService(content, conversationId, user.id);
      
      if (newMessage) {
        console.log("Message sent successfully, realtime will handle adding to list");
        // Don't add the message to the local state here
        // Let the realtime subscription handle it to avoid duplicates
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
