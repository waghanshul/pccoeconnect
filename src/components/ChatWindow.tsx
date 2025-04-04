
import { useMessages } from "@/hooks/useMessages";
import ChatHeader from "@/components/messaging/ChatHeader";
import MessagesList from "@/components/messaging/MessagesList";
import MessageInput from "@/components/messaging/MessageInput";

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const { messages, receiverProfile, isLoading, sendMessage } = useMessages(conversationId);

  if (!conversationId) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
      <ChatHeader receiverProfile={receiverProfile} />
      <MessagesList messages={messages} isLoading={isLoading} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatWindow;
