
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useNavigate, useParams } from "react-router-dom";
import ChatWindow from "@/components/ChatWindow";
import ConversationsList from "@/components/messaging/ConversationsList";
import NewMessageDialog from "@/components/messaging/NewMessageDialog";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/context/AuthContext";

const Messages = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserForNewChat, setSelectedUserForNewChat] = useState(null);
  const { user } = useAuth();
  
  const {
    conversations,
    friends,
    isLoading,
    fetchConversations,
    searchUsers,
    createConversation
  } = useConversations();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      setIsSearching(true);
      
      // Debounce search
      const handler = setTimeout(() => {
        searchUsers(query).finally(() => setIsSearching(false));
      }, 300);
      
      return () => clearTimeout(handler);
    } else {
      setIsSearching(false);
    }
  };

  const handleFriendSelect = async (friendId: string) => {
    console.log("Friend selected:", friendId);
    
    // Find the selected friend's profile
    const selectedFriend = friends.find(friend => friend.id === friendId);
    if (!selectedFriend) {
      console.error("Selected friend not found in friends list");
      return;
    }
    
    setSelectedUserForNewChat(selectedFriend);
    setIsOpen(false);
    
    try {
      console.log("Creating conversation for friend:", friendId);
      const newConversationId = await createConversation(friendId);
      console.log("Created/found conversation:", newConversationId);
      
      if (newConversationId) {
        navigate(`/messages/${newConversationId}`);
        // Clear the selected user since we now have a real conversation
        setSelectedUserForNewChat(null);
      } else {
        console.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error in handleFriendSelect:", error);
    }
  };

  const handleSendFirstMessage = async (content: string) => {
    if (!selectedUserForNewChat || !content.trim()) return;
    
    try {
      const newConversationId = await createConversation(selectedUserForNewChat.id);
      if (newConversationId) {
        navigate(`/messages/${newConversationId}`);
        setSelectedUserForNewChat(null);
      }
    } catch (error) {
      console.error("Error sending first message:", error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h1 className="text-xl font-semibold dark:text-white">Messages</h1>
                <NewMessageDialog
                  friends={friends}
                  isSearching={isSearching}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onFriendSelect={handleFriendSelect}
                  open={isOpen}
                  onOpenChange={setIsOpen}
                />
              </div>
              
              <ConversationsList 
                conversations={conversations}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            {conversationId && conversationId !== 'null' ? (
              <ChatWindow 
                conversationId={conversationId}
              />
            ) : selectedUserForNewChat ? (
              <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {selectedUserForNewChat.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold dark:text-white">
                      {selectedUserForNewChat.full_name}
                    </h2>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Start a conversation with {selectedUserForNewChat.full_name}
                  </p>
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          handleSendFirstMessage((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
                        if (input?.value.trim()) {
                          handleSendFirstMessage(input.value);
                        }
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
