
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface PostCommentsProps {
  comments: Comment[];
  isLoading: boolean;
  postId: string;
}

export const PostComments = ({ comments, isLoading, postId }: PostCommentsProps) => {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");

  const handleProfileClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    // In a real app, you would submit to the database here
    console.log("Submitting comment:", newComment, "for post:", postId);
    
    // Clear input after submission
    setNewComment("");
  };

  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="flex justify-center my-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start mt-4">
              <img 
                src={comment.author.avatar} 
                alt={comment.author.name} 
                className="w-8 h-8 rounded-full mr-2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleProfileClick(comment.author.id)}
              />
              <div>
                <h4 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleProfileClick(comment.author.id)}
                >
                  {comment.author.name}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                <p className="text-xs text-gray-400 mt-1">{comment.timestamp}</p>
              </div>
            </div>
          ))}
          
          <div className="mt-4 flex gap-2">
            <Input 
              placeholder="Write a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSubmitComment();
              }}
            />
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
