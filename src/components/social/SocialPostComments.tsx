
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useSocialStore } from "@/services/social";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialPostCommentsProps {
  postId: string;
}

export const SocialPostComments = ({ postId }: SocialPostCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { comments, addComment } = useSocialStore();
  
  const postComments = comments[postId] || [];
  
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    addComment(postId, newComment);
    setNewComment("");
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  if (!comments[postId]) {
    // Loading state
    return (
      <>
        <Separator />
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </CardContent>
      </>
    );
  }
  
  return (
    <>
      <Separator />
      <CardContent className="p-4">
        {postComments.length === 0 ? (
          <p className="text-center text-gray-500 my-2">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="mb-4 space-y-4">
            {postComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author?.avatar_url} />
                  <AvatarFallback>{comment.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <h4 className="font-semibold text-sm">{comment.author?.full_name || 'Anonymous'}</h4>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            className="flex-1"
          />
          
          <Button 
            size="icon"
            disabled={!newComment.trim()}
            onClick={handleSubmitComment}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
};
