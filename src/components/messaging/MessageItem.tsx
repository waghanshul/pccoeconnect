
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/hooks/messaging/types";

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="flex items-start gap-2 max-w-[70%]">
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={message.sender?.avatar_url || undefined} />
            <AvatarFallback>
              {message.sender?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div
          className={`rounded-lg p-3 ${
            isOwnMessage
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <span className="text-xs opacity-70 mt-1 block">
            {formatTime(message.created_at)}
          </span>
        </div>
        
        {isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
