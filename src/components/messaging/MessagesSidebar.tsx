
import { useState } from "react";
import ConversationsList from "./ConversationsList";
import NewMessageDialog from "./NewMessageDialog";
import { Friend, Conversation } from "@/hooks/messaging/types";

interface MessagesSidebarProps {
  conversations: Conversation[];
  friends: Friend[];
  isLoading: boolean;
  isSearching: boolean;
  onFriendSelect: (friendId: string) => void;
}

const MessagesSidebar = ({
  conversations,
  friends,
  isLoading,
  isSearching,
  onFriendSelect
}: MessagesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFriendSelect = (friendId: string) => {
    onFriendSelect(friendId);
    setIsOpen(false);
  };

  return (
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
  );
};

export default MessagesSidebar;
