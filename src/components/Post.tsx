
import { useState, useEffect } from "react";
import { PostHeader } from "./post/PostHeader";
import { PostActions } from "./post/PostActions";
import { PostComments } from "./post/PostComments";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface PostProps {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  authorId?: string;
}

export const Post = ({ id, author, content, timestamp, avatar, authorId }: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, id]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      // Simulate fetching comments from a database
      // In a real app, you'd fetch from a comments table related to posts
      
      // For now, let's use these mock comments
      const mockComments: Comment[] = [
        { 
          id: "1",
          author: { 
            id: "user1", 
            name: "John Doe", 
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=256&q=80" 
          },
          content: "Great post!", 
          timestamp: format(new Date(Date.now() - 60000), 'PPpp')
        },
        { 
          id: "2",
          author: { 
            id: "user2", 
            name: "Jane Smith", 
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80" 
          },
          content: "Thanks for sharing this information!", 
          timestamp: format(new Date(Date.now() - 120000), 'PPpp')
        },
      ];
      
      setComments(mockComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // These would be implemented with real database interactions in a complete app
  const handleLike = async () => {
    setUserLiked(!userLiked);
    setLikeCount(userLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 transition-all duration-200">
      <PostHeader 
        author={author}
        timestamp={timestamp}
        avatar={avatar}
        content={content}
        authorId={authorId}
      />
      
      <PostActions 
        onCommentToggle={handleComment}
        onLike={handleLike}
        isLiked={userLiked}
        likeCount={likeCount}
      />

      {showComments && (
        <PostComments 
          comments={comments} 
          isLoading={isLoading} 
          postId={id}
        />
      )}
    </div>
  );
};
