
import { useMessages } from "@/hooks/useMessages";
import ChatHeader from "@/components/messaging/ChatHeader";
import MessagesList from "@/components/messaging/MessagesList";
import MessageInput from "@/components/messaging/MessageInput";

interface ChatWindowProps {
  conversationId: string;
  selectedUser?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

const ChatWindow = ({ conversationId, selectedUser }: ChatWindowProps) => {
  const { messages, receiverProfile, isLoading, sendMessage } = useMessages(conversationId);

  if (!conversationId) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
      </div>
    );
  }

  // Use selectedUser if provided (for new conversations), otherwise use receiverProfile
  const displayProfile = selectedUser || receiverProfile;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
      <ChatHeader receiverProfile={displayProfile} />
      <MessagesList messages={messages} isLoading={isLoading} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatWindow;
