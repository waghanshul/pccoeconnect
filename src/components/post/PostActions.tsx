import { Heart, MessageCircle, Share2 } from "lucide-react";
import { SharePostDialog } from "@/components/social/SharePostDialog";

interface PostActionsProps {
  onCommentToggle: () => void;
  onLike: () => void;
  isLiked: boolean;
  likeCount: number;
  postContent?: string;
  postAuthor?: string;
  postId?: string;
}

export const PostActions = ({ onCommentToggle, onLike, isLiked, likeCount, postContent, postAuthor, postId }: PostActionsProps) => {
  return (
    <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
      <button 
        onClick={onLike}
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
      <SharePostDialog postContent={postContent || ''} postAuthor={postAuthor}>
        <button className="flex items-center space-x-2 hover:text-primary transition-colors">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </SharePostDialog>
    </div>
  );
};
