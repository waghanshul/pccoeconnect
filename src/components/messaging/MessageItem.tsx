
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
      <div className="flex items-end gap-2 max-w-[70%]">
        {!isOwnMessage && (
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={message.sender?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {message.sender?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted/60 rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <span className={`text-[10px] mt-1 block ${isOwnMessage ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {formatTime(message.created_at)}
          </span>
        </div>
        
        {isOwnMessage && (
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
