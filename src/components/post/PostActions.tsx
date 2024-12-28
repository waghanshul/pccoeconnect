import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PostActionsProps {
  onCommentToggle: () => void;
}

// Mock friends data - keep it here since it's specific to sharing functionality
const mockFriends = [
  { id: 1, name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
  { id: 2, name: "Rahul Patel", avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80" },
  { id: 3, name: "Anjali Desai", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80" },
];

export const PostActions = ({ onCommentToggle }: PostActionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const navigate = useNavigate();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
  };

  const handleShare = (friendId: number, friendName: string) => {
    toast(`Shared with ${friendName}`, {
      action: {
        label: 'View chat',
        onClick: () => navigate(`/messages/${friendId}`)
      },
      className: "cursor-pointer hover:opacity-90"
    });
  };

  return (
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
        onClick={onCommentToggle}
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
  );
};
