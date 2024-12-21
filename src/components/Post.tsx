import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Comment {
  author: string;
  content: string;
  timestamp: string;
}

interface PostProps {
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  authorId?: string;
}

// Mock friends data - replace with real data when backend is integrated
const mockFriends = [
  { id: 1, name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
  { id: 2, name: "Rahul Patel", avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80" },
  { id: 3, name: "Anjali Desai", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80" },
];

export const Post = ({ author, content, timestamp, avatar, authorId }: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const navigate = useNavigate();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
  };

  const handleShare = (friendId: number, friendName: string) => {
    // In a real application, this would send the shared content to the friend's messages
    toast.success(`Shared with ${friendName}`, {
      onClick: () => navigate(`/messages/${friendId}`),
      className: "cursor-pointer hover:opacity-90"
    });
  };

  const comments: Comment[] = [
    { author: "John Doe", content: "Great post!", timestamp: "1m ago" },
    { author: "Jane Smith", content: "Thanks for sharing!", timestamp: "2m ago" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 transition-all duration-200">
      <div className="flex items-start">
        <img src={avatar} alt={author} className="w-10 h-10 rounded-full mr-3" />
        <div>
          <h3 className="font-semibold">{author}</h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
          <p className="mt-2">{content}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
        <button 
          onClick={handleLike}
          className="flex items-center space-x-2 hover:text-primary transition-colors"
        >
          <Heart 
            size={20} 
            className={`${isLiked ? 'fill-[#D946EF] text-[#D946EF]' : ''}`}
          />
          <span>{likeCount > 0 ? likeCount : ''} {isLiked ? 'Liked' : 'Like'}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 hover:text-primary transition-colors"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 p-2">
            {mockFriends.map((friend) => (
              <DropdownMenuItem
                key={friend.id}
                onClick={() => handleShare(friend.id, friend.name)}
                className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-200">{friend.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showComments && (
        <div className="mt-4">
          {comments.map((comment, index) => (
            <div key={index} className="flex items-start mt-2">
              <img src="https://via.placeholder.com/40" alt={comment.author} className="w-8 h-8 rounded-full mr-2" />
              <div>
                <h4 className="font-semibold">{comment.author}</h4>
                <p className="text-sm text-gray-500">{comment.content}</p>
                <p className="text-xs text-gray-400">{comment.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
