
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Users } from "lucide-react";

interface ConversationListItemProps {
  conversation: {
    id: string;
    updated_at: string;
    is_group?: boolean;
    group_name?: string;
    group_description?: string;
    group_avatar_url?: string;
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
    member_count?: number;
  };
  isActive: boolean;
}

const ConversationListItem = ({ conversation, isActive }: ConversationListItemProps) => {
  const navigate = useNavigate();
  const participant = conversation.participants[0];
  const isGroup = conversation.is_group;
  
  const displayName = isGroup 
    ? conversation.group_name 
    : participant?.full_name || 'Unknown User';
    
  const displayAvatar = isGroup 
    ? conversation.group_avatar_url 
    : participant?.avatar_url;

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
      className={`w-full flex items-center gap-3 p-3.5 transition-all duration-200 text-left border-l-2 ${
        isActive 
          ? 'bg-primary/10 border-l-primary' 
          : 'border-l-transparent hover:bg-muted/30'
      }`}
    >
      <div className="flex-shrink-0 relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={displayAvatar || undefined} />
          <AvatarFallback className={`text-sm ${isGroup ? "bg-primary/10 text-primary" : ""}`}>
            {isGroup ? (
              <Users className="h-5 w-5" />
            ) : (
              displayName?.charAt(0) || '?'
            )}
          </AvatarFallback>
        </Avatar>
        {conversation.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-medium">
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium truncate">
              {displayName}
            </h2>
            {isGroup && conversation.member_count && (
              <p className="text-[10px] text-muted-foreground">
                {conversation.member_count} members
              </p>
            )}
          </div>
          {conversation.last_message?.created_at && (
            <span className="text-[10px] text-muted-foreground ml-2">
              {formatRelativeTime(conversation.last_message.created_at)}
            </span>
          )}
        </div>
        <p className={`text-xs truncate mt-0.5 ${
          conversation.unread_count > 0 
            ? 'text-foreground font-medium' 
            : 'text-muted-foreground'
        }`}>
          {conversation.last_message?.content || 'No messages yet'}
        </p>
      </div>
    </button>
  );
};

export default ConversationListItem;
