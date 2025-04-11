
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSocialStore, SocialPost as SocialPostType, Poll } from "@/services/social";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SocialPostComments } from "./SocialPostComments";
import { SocialPostHeader } from "./post/SocialPostHeader";
import { SocialPostMedia } from "./post/SocialPostMedia";
import { SocialPostPoll } from "./post/SocialPostPoll";
import { SocialPostActions } from "./post/SocialPostActions";

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
        if (pollData) {
          setPoll(pollData);
        }
      };
      
      loadPoll();
    }
  }, [post.poll_id, post.file_type, fetchPoll]);
  
  const handleLikeToggle = () => {
    if (post.user_has_liked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments(post.id);
    }
  };
  
  const handleVote = (option: string) => {
    if (post.poll_id && !poll?.user_vote) {
      votePoll(post.poll_id, option);
    }
  };
  
  const handleProfileClick = () => {
    if (post.user_id) {
      console.log("Navigating to user profile:", post.user_id);
      navigate(`/user/${post.user_id}`);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <SocialPostHeader 
          author={post.author}
          timestamp={post.created_at}
          fileType={post.file_type}
          userId={post.user_id}
          onProfileClick={handleProfileClick}
        />
        
        <div className="mt-2">
          <p className="whitespace-pre-line">{post.content}</p>
          
          <SocialPostMedia 
            fileUrl={post.file_url} 
            fileType={post.file_type}
          />
          
          {post.file_type === 'poll' && (
            <SocialPostPoll 
              poll={poll} 
              handleVote={handleVote}
            />
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div>{post.likes_count || 0} likes</div>
          <div>{post.comments_count || 0} comments</div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-0">
        <SocialPostActions
          likeCount={post.likes_count || 0}
          userHasLiked={post.user_has_liked || false}
          handleLikeToggle={handleLikeToggle}
          handleCommentToggle={handleCommentToggle}
        />
      </CardFooter>
      
      {showComments && (
        <SocialPostComments postId={post.id} />
      )}
    </Card>
  );
};
