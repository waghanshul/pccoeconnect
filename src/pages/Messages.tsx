
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ChatWindow from "@/components/ChatWindow";
import ConversationsList from "@/components/messaging/ConversationsList";
import NewMessageDialog from "@/components/messaging/NewMessageDialog";
import { useConversations } from "@/hooks/useConversations";

const Messages = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    conversations,
    friends,
    isLoading,
    fetchConversations,
    searchUsers,
    createConversation
  } = useConversations();

  useEffect(() => {
    // Check if we have an initialContactId in location state
    const state = location.state as { initialContactId?: string } | null;
    if (state?.initialContactId) {
      handleFriendSelect(state.initialContactId);
      // Clear the state to prevent handling it again on navigation
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    
    // Debounce search
    const handler = setTimeout(() => {
      searchUsers(query).finally(() => setIsSearching(false));
    }, 300);
    
    return () => clearTimeout(handler);
  };

  const handleFriendSelect = async (friendId: string) => {
    setIsOpen(false);
    
    try {
      const conversationId = await createConversation(friendId);
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error in handleFriendSelect:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
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
            {conversationId ? (
              <ChatWindow 
                conversationId={conversationId}
              />
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
