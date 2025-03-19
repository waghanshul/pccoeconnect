
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import ConversationListItem from "./ConversationListItem";

interface Conversation {
  id: string;
  updated_at: string;
  participants: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }[];
  last_message?: {
    content: string;
    created_at: string;
    read_at: string | null;
  };
  unread_count: number;
}

interface ConversationsListProps {
  conversations: Conversation[];
  isLoading: boolean;
}

const ConversationsList = ({ conversations, isLoading }: ConversationsListProps) => {
  const { conversationId } = useParams();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="divide-y dark:divide-gray-700">
      {conversations.length > 0 ? (
        conversations.map((conversation) => (
          <ConversationListItem 
            key={conversation.id} 
            conversation={conversation} 
            isActive={conversationId === conversation.id}
          />
        ))
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No conversations yet. Start a new message!
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
