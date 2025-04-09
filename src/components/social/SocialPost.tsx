
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Share, BarChart2, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useSocialStore, SocialPost as SocialPostType, Poll } from "@/services/social";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { SocialPostComments } from "./SocialPostComments";
import { useNavigate } from "react-router-dom";

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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Calculate total votes for poll
  const getTotalVotes = () => {
    if (!poll || !poll.votes) return 0;
    return Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  };
  
  // Get percentage for a poll option
  const getPercentage = (option: string) => {
    if (!poll || !poll.votes) return 0;
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    return Math.round((poll.votes[option] / totalVotes) * 100);
  };
  
  const renderFilePreview = () => {
    if (!post.file_url) return null;
    
    switch (post.file_type) {
      case 'image':
        return (
          <div className="mt-4 rounded-md overflow-hidden border">
            <img 
              src={post.file_url} 
              alt="Post attachment" 
              className="w-full object-cover max-h-96" 
            />
          </div>
        );
      case 'pdf':
        return (
          <a 
            href={post.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 p-4 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FileText className="text-red-500" />
            <span>View PDF document</span>
          </a>
        );
      case 'link':
        return (
          <a 
            href={post.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 p-4 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LinkIcon className="text-blue-500" />
            <span className="text-blue-500 overflow-hidden text-ellipsis">{post.file_url}</span>
          </a>
        );
      default:
        return null;
    }
  };
  
  const renderPoll = () => {
    if (post.file_type !== 'poll' || !poll) return null;
    
    const totalVotes = getTotalVotes();
    
    return (
      <div className="mt-4 border rounded-md p-4">
        <h3 className="font-semibold text-lg mb-2">{poll.question}</h3>
        <div className="space-y-3">
          {Array.isArray(poll.options) && poll.options.map((option, index) => {
            const percentage = getPercentage(option);
            const userVoted = poll.user_vote === option;
            const canVote = !poll.user_vote;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {userVoted && <div className="w-2 h-2 bg-primary rounded-full" />}
                    <span className={userVoted ? "font-medium" : ""}>{option}</span>
                  </div>
                  <span className="text-sm text-gray-500">{percentage}%</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Progress value={percentage} className="h-2 flex-grow" />
                  {canVote && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => handleVote(option)}
                    >
                      Vote
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-sm text-gray-500 mt-3">{totalVotes} votes</div>
      </div>
    );
  };
  
  const renderFileTypeIcon = () => {
    if (!post.file_type) return null;
    
    switch (post.file_type) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-gray-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-gray-500" />;
      case 'poll':
        return <BarChart2 className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Avatar 
            className="cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleProfileClick}
          >
            <AvatarImage src={post.author?.avatar_url} />
            <AvatarFallback>{post.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={handleProfileClick}
              >
                {post.author?.full_name || 'Anonymous'}
              </h3>
              {renderFileTypeIcon()}
            </div>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
            
            <div className="mt-2">
              <p className="whitespace-pre-line">{post.content}</p>
              
              {renderFilePreview()}
              {renderPoll()}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div>{post.likes_count || 0} likes</div>
          <div>{post.comments_count || 0} comments</div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-3 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
          onClick={handleLikeToggle}
        >
          <Heart 
            className={`mr-2 h-4 w-4 ${post.user_has_liked ? 'fill-red-500 text-red-500' : ''}`} 
          />
          {post.user_has_liked ? 'Liked' : 'Like'}
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
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
        >
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
      
      {showComments && (
        <SocialPostComments postId={post.id} />
      )}
    </Card>
  );
};
