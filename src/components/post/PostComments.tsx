import { useNavigate } from "react-router-dom";

interface Comment {
  author: string;
  content: string;
  timestamp: string;
}

interface PostCommentsProps {
  comments: Comment[];
}

export const PostComments = ({ comments }: PostCommentsProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="mt-4">
      {comments.map((comment, index) => (
        <div key={index} className="flex items-start mt-2">
          <img 
            src="https://via.placeholder.com/40" 
            alt={comment.author} 
            className="w-8 h-8 rounded-full mr-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleProfileClick}
          />
          <div>
            <h4 
              className="font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={handleProfileClick}
            >
              {comment.author}
            </h4>
            <p className="text-sm text-gray-500">{comment.content}</p>
            <p className="text-xs text-gray-400">{comment.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};