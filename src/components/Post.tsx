
import { useState } from "react";
import { PostHeader } from "./post/PostHeader";
import { PostActions } from "./post/PostActions";
import { PostComments } from "./post/PostComments";

interface Comment {
  author: string;
  content: string;
  timestamp: string;
}

interface Author {
  name: string;
  avatar: string;
  branch?: string;
  year?: string;
  authorId?: string;
}

interface PostProps {
  author: Author;
  content: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export const Post = ({ author, content, timestamp, likes = 0, comments: commentCount = 0, shares = 0 }: PostProps) => {
  const [showComments, setShowComments] = useState(false);

  const comments: Comment[] = [
    { author: "John Doe", content: "Great post!", timestamp: "1m ago" },
    { author: "Jane Smith", content: "Thanks for sharing!", timestamp: "2m ago" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 transition-all duration-200">
      <PostHeader 
        author={author.name}
        timestamp={timestamp}
        avatar={author.avatar}
        content={content}
        authorId={author.authorId}
      />
      
      <PostActions 
        onCommentToggle={() => setShowComments(!showComments)}
      />

      {showComments && <PostComments comments={comments} />}
    </div>
  );
};
