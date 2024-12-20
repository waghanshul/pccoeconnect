import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Comment {
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
}

interface PostProps {
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  authorId?: string;
}

export const Post = ({ author, content, timestamp, avatar, authorId }: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const hashtags = content.match(/#[a-zA-Z0-9]+/g) || [];
  
  const formattedContent = content.split(" ").map((word, index) => {
    if (word.startsWith("#")) {
      return <span key={index} className="text-primary hover:underline cursor-pointer">{word}</span>;
    }
    return word + " ";
  });

  const comments: Comment[] = [
    {
      author: "Jane Smith",
      content: "Great post! Looking forward to collaborating.",
      timestamp: "1 hour ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 animate-fadeIn">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${authorId}`} className="flex items-center hover:opacity-80">
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{author}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{timestamp}</p>
          </div>
        </Link>
      </div>
      <p className="text-gray-800 dark:text-gray-200 mb-4">{formattedContent}</p>
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {hashtags.map((tag, index) => (
            <span key={index} className="text-sm text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
        <button className="flex items-center space-x-2 hover:text-primary transition-colors">
          <Heart size={20} />
          <span>Like</span>
        </button>
        <button 
          className="flex items-center space-x-2 hover:text-primary transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary transition-colors">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {comments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-3 mb-4">
              <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="font-semibold text-sm dark:text-gray-100">{comment.author}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{comment.timestamp}</p>
              </div>
            </div>
          ))}
          
          <div className="flex items-center space-x-2 mt-4">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              className="text-primary hover:text-primary/80 transition-colors"
              onClick={() => {
                if (newComment.trim()) {
                  setNewComment("");
                }
              }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
