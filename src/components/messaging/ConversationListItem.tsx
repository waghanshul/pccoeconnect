
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ConversationListItemProps {
  conversation: {
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
  };
  isActive: boolean;
}

const ConversationListItem = ({ conversation, isActive }: ConversationListItemProps) => {
  const navigate = useNavigate();
  const participant = conversation.participants[0]; // First (or only) other participant

  // Format relative time (e.g., "2h ago")
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return format(date, 'MMM d');
  };

  return (
    <button
      onClick={() => navigate(`/messages/${conversation.id}`)}
      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
        isActive ? 'bg-gray-50 dark:bg-gray-700' : ''
      }`}
    >
      <div className="flex-shrink-0 relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={participant?.avatar_url || undefined} />
          <AvatarFallback>
            {participant?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        {conversation.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {participant?.full_name || 'Unknown User'}
          </h2>
          {conversation.last_message?.created_at && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(conversation.last_message.created_at)}
            </span>
          )}
        </div>
        <p className={`text-sm truncate ${
          conversation.unread_count > 0 
            ? 'text-gray-900 dark:text-white font-medium' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {conversation.last_message?.content || 'No messages yet'}
        </p>
      </div>
    </button>
  );
};

export default ConversationListItem;
