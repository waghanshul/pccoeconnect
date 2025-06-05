
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatWindow from "@/components/ChatWindow";
import MessagesSidebar from "./MessagesSidebar";
import NewConversationHandler from "./NewConversationHandler";
import EmptyMessageState from "./EmptyMessageState";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Friend } from "@/hooks/messaging/types";

const MessagesContainer = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserForNewChat, setSelectedUserForNewChat] = useState<Friend | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { user } = useAuth();
  
  const {
    conversations,
    friends,
    isLoading,
    searchUsers,
    createConversation
  } = useConversations();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to home");
      navigate('/');
    }
  }, [user, navigate]);

  const handleSearchUsers = async (query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      try {
        await searchUsers(query);
      } catch (error) {
        console.error("Error searching users:", error);
        toast({
          title: "Search Error",
          description: "Failed to search users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleFriendSelect = async (friendId: string) => {
    console.log("=== handleFriendSelect called ===");
    console.log("Friend ID:", friendId);
    console.log("Is creating conversation:", isCreatingConversation);
    
    if (isCreatingConversation) {
      console.log("Already creating conversation, ignoring request");
      return;
    }
    
    // Find the selected friend's profile
    const selectedFriend = friends.find(friend => friend.id === friendId);
    if (!selectedFriend) {
      console.error("Selected friend not found in friends list");
      toast({
        title: "User Not Found",
        description: "Selected user not found. Please try searching again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Selected friend:", selectedFriend);
    
    setSelectedUserForNewChat(selectedFriend);
    setIsCreatingConversation(true);
    
    try {
      console.log("Starting conversation creation...");
      const newConversationId = await createConversation(friendId);
      console.log("Conversation creation result:", newConversationId);
      
      if (newConversationId) {
        console.log("Successfully created/found conversation, navigating to:", newConversationId);
        navigate(`/messages/${newConversationId}`);
        // Clear the selected user since we now have a real conversation
        setSelectedUserForNewChat(null);
        toast({
          title: "Success",
          description: "Conversation started successfully!",
        });
      } else {
        console.error("Failed to create conversation - no ID returned");
        toast({
          title: "Creation Failed",
          description: "Failed to create conversation. Please check your connection and try again.",
          variant: "destructive",
        });
        setSelectedUserForNewChat(null);
      }
    } catch (error) {
      console.error("Error in handleFriendSelect:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setSelectedUserForNewChat(null);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendFirstMessage = async (content: string) => {
    console.log("=== handleSendFirstMessage called ===");
    console.log("Content:", content);
    console.log("Selected user:", selectedUserForNewChat);
    
    if (!selectedUserForNewChat || !content.trim()) {
      console.log("Invalid parameters for sending first message");
      return;
    }
    
    if (isCreatingConversation) {
      console.log("Already creating conversation, ignoring");
      return;
    }
    
    setIsCreatingConversation(true);
    
    try {
      console.log("Creating conversation for first message...");
      const newConversationId = await createConversation(selectedUserForNewChat.id);
      
      if (newConversationId) {
        console.log("Conversation created, navigating to send message...");
        navigate(`/messages/${newConversationId}`);
        setSelectedUserForNewChat(null);
        toast({
          title: "Success",
          description: "Conversation created! You can now send your message.",
        });
      } else {
        console.error("Failed to create conversation for first message");
        toast({
          title: "Creation Failed",
          description: "Failed to create conversation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending first message:", error);
      toast({
        title: "Unexpected Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Clear selected user when navigating to an existing conversation
  useEffect(() => {
    if (conversationId && conversationId !== 'null') {
      setSelectedUserForNewChat(null);
    }
  }, [conversationId]);

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <MessagesSidebar
        conversations={conversations}
        friends={friends}
        isLoading={isLoading}
        isSearching={isSearching}
        onFriendSelect={handleFriendSelect}
      />
      
      <div className="md:col-span-2">
        {conversationId && conversationId !== 'null' ? (
          <ChatWindow conversationId={conversationId} />
        ) : selectedUserForNewChat ? (
          <NewConversationHandler
            selectedUser={selectedUserForNewChat}
            isCreatingConversation={isCreatingConversation}
            onSendFirstMessage={handleSendFirstMessage}
          />
        ) : (
          <EmptyMessageState />
        )}
      </div>
    </>
  );
};

export default MessagesContainer;
