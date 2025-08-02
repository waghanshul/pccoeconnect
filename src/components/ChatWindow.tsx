
import { useMessages } from "@/hooks/useMessages";
import ChatHeader from "@/components/messaging/ChatHeader";
import { GroupChatHeader } from "@/components/messaging/GroupChatHeader";
import MessagesList from "@/components/messaging/MessagesList";
import MessageInput from "@/components/messaging/MessageInput";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/context/AuthContext";

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
  const { conversations, friends, fetchConversations } = useConversations();
  const { user } = useAuth();
  
  const currentConversation = conversations.find(c => c.id === conversationId);
  const isGroup = currentConversation?.is_group;

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
      {isGroup && currentConversation ? (
        <GroupChatHeader
          conversationId={conversationId}
          groupName={currentConversation.group_name || "Group Chat"}
          groupDescription={currentConversation.group_description}
          groupAvatarUrl={currentConversation.group_avatar_url}
          memberCount={currentConversation.member_count}
          friends={friends}
          currentUserId={user?.id || ""}
          onMemberAdded={fetchConversations}
        />
      ) : (
        <ChatHeader receiverProfile={displayProfile} />
      )}
      <MessagesList messages={messages} isLoading={isLoading} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatWindow;
