import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/hooks/messaging/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { isValidProfile, createDefaultAuthor } from "@/services/social/types";

const POST_LINK_REGEX = /\/post\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

interface PostPreviewData {
  content: string;
  authorName: string;
  authorAvatar?: string;
}

const PostLinkPreview = ({ postId }: { postId: string }) => {
  const [data, setData] = useState<PostPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data: post } = await supabase
        .from("social_posts")
        .select("content, profiles:user_id(full_name, avatar_url)")
        .eq("id", postId)
        .single();

      if (post) {
        const author = isValidProfile(post.profiles) ? post.profiles : createDefaultAuthor();
        setData({
          content: post.content,
          authorName: author.full_name,
          authorAvatar: author.avatar_url,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [postId]);

  if (loading || !data) return null;

  return (
    <button
      onClick={() => navigate(`/post/${postId}`)}
      className="mt-2 w-full text-left rounded-lg border border-border/50 bg-background/50 p-2.5 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="h-5 w-5">
          <AvatarImage src={data.authorAvatar} />
          <AvatarFallback className="text-[10px]">{data.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium truncate">{data.authorName}</span>
        <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto flex-shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {data.content.length > 120 ? data.content.substring(0, 120) + "..." : data.content}
      </p>
    </button>
  );
};

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

  const postMatch = message.content.match(POST_LINK_REGEX);
  const postId = postMatch ? postMatch[1] : null;

  // Render message content, hiding the raw URL line if we show a preview
  const renderContent = () => {
    if (!postId) return <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>;

    // Remove the 👉 URL line from displayed text since we show a card
    const cleanedContent = message.content.replace(/\n*👉\s*https?:\/\/\S+/g, '').trim();
    return (
      <>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{cleanedContent}</p>
        <PostLinkPreview postId={postId} />
      </>
    );
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
              : "bg-muted rounded-bl-md"
          }`}
        >
          {renderContent()}
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
