
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
    if (user?.id) {
      console.log("User authenticated, setting up conversations for user:", user.id);
      fetchConversationsData();
      fetchContactsData();
      const cleanup = setupRealtimeSubscription(user.id, fetchConversationsData);
      
      return cleanup;
    } else {
      console.log("No authenticated user, clearing conversations");
      setConversations([]);
      setFriends([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchConversationsData = async () => {
    if (!user?.id) {
      console.log("No user ID for fetching conversations");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching conversations for user:", user.id);
      const result = await fetchConversations(user.id);
      console.log("Fetched conversations:", result);
      setConversations(result);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContactsData = async () => {
    if (!user?.id) {
      console.log("No user ID for fetching contacts");
      return;
    }
    
    try {
      console.log("Fetching contacts data for user:", user.id);
      const result = await fetchContacts(user.id);
      console.log("Contacts fetched:", result);
      setFriends(result);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setFriends([]);
    }
  };

  const searchUsers = async (query: string) => {
    if (!user?.id) {
      console.log("No user ID for searching users");
      return;
    }
    
    try {
      console.log("Searching users with query:", query);
      const result = await searchUsersService(query, user.id);
      console.log("Search results:", result);
      setFriends(result);
    } catch (error) {
      console.error("Error searching users:", error);
      setFriends([]);
    }
  };

  const createConversation = async (friendId: string) => {
    if (!user?.id) {
      console.error("No user ID available for conversation creation");
      return null;
    }
    
    console.log("=== useConversations.createConversation called ===");
    console.log("Friend ID:", friendId);
    console.log("User ID:", user.id);
    console.log("Current conversations count:", conversations.length);
    
    try {
      const conversationId = await createConversationService(friendId, user.id, conversations);
      if (conversationId) {
        console.log("Conversation created/found:", conversationId);
        // Refresh conversations to include the new one
        console.log("Refreshing conversations list...");
        await fetchConversationsData();
        return conversationId;
      }
      console.error("Failed to create conversation - no ID returned");
      return null;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
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
