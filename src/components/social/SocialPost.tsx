import { useState, useEffect } from "react";
import { useSocialStore, SocialPost as SocialPostType, Poll } from "@/services/social";
import { useNavigate } from "react-router-dom";
import { SocialPostComments } from "./SocialPostComments";
import { SocialPostHeader } from "./post/SocialPostHeader";
import { SocialPostMedia } from "./post/SocialPostMedia";
import { SocialPostPoll } from "./post/SocialPostPoll";
import { SocialPostActions } from "./post/SocialPostActions";
import { AnimatePresence, motion } from "framer-motion";

interface SocialPostProps {
  post: SocialPostType;
}

export const SocialPost = ({ post }: SocialPostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const { likePost, unlikePost, fetchComments, fetchPoll, votePoll } = useSocialStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (post.file_type === 'poll' && post.poll_id) {
      const loadPoll = async () => {
        const pollData = await fetchPoll(post.poll_id!);
        if (pollData) setPoll(pollData);
      };
      loadPoll();
    }
  }, [post.poll_id, post.file_type, fetchPoll]);
  
  const handleLikeToggle = () => {
    post.user_has_liked ? unlikePost(post.id) : likePost(post.id);
  };
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
    if (!showComments) fetchComments(post.id);
  };
  
  const handleVote = (option: string) => {
    if (post.poll_id && !poll?.user_vote) votePoll(post.poll_id, option);
  };
  
  const handleProfileClick = () => {
    if (post.user_id) navigate(`/user/${post.user_id}`);
  };
  
  return (
    <div className="border-b border-border px-4 py-4 hover:bg-muted/20 transition-colors duration-100">
      <SocialPostHeader 
        author={post.author}
        timestamp={post.created_at}
        fileType={post.file_type}
        userId={post.user_id}
        onProfileClick={handleProfileClick}
      />
      
      <div className="mt-2 pl-[52px]">
        <p className="whitespace-pre-line text-sm leading-relaxed">{post.content}</p>
        
        <SocialPostMedia fileUrl={post.file_url} fileType={post.file_type} />
        
        {post.file_type === 'poll' && (
          <SocialPostPoll poll={poll} handleVote={handleVote} />
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2 pl-[52px] text-xs text-muted-foreground">
        <div>{post.likes_count || 0} likes</div>
        <div>{post.comments_count || 0} comments</div>
      </div>
      
      <div className="pl-[52px] mt-1">
        <SocialPostActions
          likeCount={post.likes_count || 0}
          userHasLiked={post.user_has_liked || false}
          handleLikeToggle={handleLikeToggle}
          handleCommentToggle={handleCommentToggle}
          postContent={post.content}
          postAuthor={post.author?.full_name}
          postId={post.id}
        />
      </div>
      
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-[52px]"
          >
            <SocialPostComments postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
