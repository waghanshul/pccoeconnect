
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
    <div className="flex justify-between items-center p-2 w-full">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex-1 gap-2 rounded-lg transition-colors ${userHasLiked ? 'text-red-400 hover:text-red-300' : 'text-muted-foreground hover:text-foreground'}`}
        onClick={handleLikeToggle}
      >
        <Heart 
          className={`h-4 w-4 ${userHasLiked ? 'fill-red-400' : ''}`} 
        />
        <span className="text-xs">{userHasLiked ? 'Liked' : 'Like'}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex-1 gap-2 text-muted-foreground hover:text-foreground rounded-lg"
        onClick={handleCommentToggle}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-xs">Comment</span>
      </Button>
      
      <SharePostDialog postContent={postContent || ''} postAuthor={postAuthor}>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground hover:text-foreground rounded-lg">
          <Share className="h-4 w-4" />
          <span className="text-xs">Share</span>
        </Button>
      </SharePostDialog>
    </div>
  );
};
