
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Conversation, Friend } from "./messaging/types";
import { fetchConversations } from "./messaging/conversationService";
import { fetchContacts, searchUsers as searchUsersService, toggleConnection } from "./messaging/friendsService";
import { createConversation as createConversationService } from "./messaging/conversationOperations";
import { setupRealtimeSubscription } from "./messaging/realtimeService";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversationsData();
      fetchContactsData();
      const cleanup = setupRealtimeSubscription(user?.id, fetchConversationsData);
      
      return cleanup;
    }
  }, [user]);

  const fetchConversationsData = async () => {
    setIsLoading(true);
    const result = await fetchConversations(user?.id);
    setConversations(result);
    setIsLoading(false);
  };

  const fetchContactsData = async () => {
    const result = await fetchContacts(user?.id);
    setFriends(result);
  };

  const searchUsers = async (query: string) => {
    const result = await searchUsersService(query, user?.id);
    setFriends(result);
    return result;
  };

  const createConversation = async (friendId: string) => {
    const conversationId = await createConversationService(friendId, user?.id, conversations);
    // Refresh conversations to include the new one
    await fetchConversationsData();
    return conversationId;
  };

  const toggleUserConnection = async (targetUserId: string, isConnected: boolean) => {
    if (!user) return isConnected;
    
    const newStatus = await toggleConnection(user.id, targetUserId, isConnected);
    
    // Update the friends list to reflect the new connection status
    setFriends(prev => 
      prev.map(friend => 
        friend.id === targetUserId 
          ? { ...friend, isConnected: newStatus }
          : friend
      )
    );
    
    return newStatus;
  };

  return {
    conversations,
    friends,
    isLoading,
    fetchConversations: fetchConversationsData,
    fetchContacts: fetchContactsData,
    searchUsers,
    createConversation,
    toggleConnection: toggleUserConnection
  };
};

export default useConversations;
