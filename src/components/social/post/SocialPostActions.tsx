
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share } from "lucide-react";
import { SharePostDialog } from "@/components/social/SharePostDialog";

interface SocialPostActionsProps {
  likeCount: number;
  userHasLiked: boolean;
  handleLikeToggle: () => void;
  handleCommentToggle: () => void;
  postContent?: string;
  postAuthor?: string;
}

export const SocialPostActions = ({ 
  likeCount, 
  userHasLiked, 
  handleLikeToggle, 
  handleCommentToggle,
  postContent,
  postAuthor,
}: SocialPostActionsProps) => {
  return (
    <div className="flex justify-between items-center p-3">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex-1"
        onClick={handleLikeToggle}
      >
        <Heart 
          className={`mr-2 h-4 w-4 ${userHasLiked ? 'fill-red-500 text-red-500' : ''}`} 
        />
        {userHasLiked ? 'Liked' : 'Like'}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex-1"
        onClick={handleCommentToggle}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Comment
      </Button>
      
      <SharePostDialog postContent={postContent || ''} postAuthor={postAuthor}>
        <Button variant="ghost" size="sm" className="flex-1">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </SharePostDialog>
    </div>
  );
};
