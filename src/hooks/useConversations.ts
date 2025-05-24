
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Conversation, Friend } from "./messaging/types";
import { fetchConversations } from "./messaging/conversationService";
import { fetchContacts, searchUsers as searchUsersService } from "./messaging/friendsService";
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
    console.log("Fetching contacts data...");
    const result = await fetchContacts(user?.id);
    console.log("Contacts fetched:", result);
    setFriends(result);
  };

  const searchUsers = async (query: string) => {
    console.log("Searching users with query:", query);
    const result = await searchUsersService(query, user?.id);
    console.log("Search results:", result);
    setFriends(result);
  };

  const createConversation = async (friendId: string) => {
    console.log("Creating conversation with friend:", friendId);
    const conversationId = await createConversationService(friendId, user?.id, conversations);
    if (conversationId) {
      // Refresh conversations to include the new one
      await fetchConversationsData();
    }
    return conversationId;
  };

  return {
    conversations,
    friends,
    isLoading,
    fetchConversations: fetchConversationsData,
    fetchContacts: fetchContactsData,
    searchUsers,
    createConversation
  };
};

export default useConversations;
