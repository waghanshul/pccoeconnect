import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share } from "lucide-react";
import { SharePostDialog } from "@/components/social/SharePostDialog";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showBurst, setShowBurst] = useState(false);

  const onLike = () => {
    if (!userHasLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
    handleLikeToggle();
  };

  return (
    <div className="flex justify-between items-center p-2 w-full">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex-1 gap-2 rounded-lg transition-colors relative overflow-hidden ${userHasLiked ? 'text-red-400 hover:text-red-300' : 'text-muted-foreground hover:text-foreground'}`}
        onClick={onLike}
      >
        <span className="relative">
          <Heart 
            className={`h-4 w-4 transition-transform duration-200 ${userHasLiked ? 'fill-red-400 scale-110' : ''}`} 
          />
          <AnimatePresence>
            {showBurst && (
              <motion.span
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="h-4 w-4 fill-red-400 text-red-400" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
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
