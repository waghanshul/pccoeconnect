import { useNavigate } from "react-router-dom";

interface PostHeaderProps {
  author: string;
  timestamp: string;
  avatar: string;
  content: string;
  authorId?: string;
}

export const PostHeader = ({ author, timestamp, avatar, content, authorId }: PostHeaderProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  return (
    <div className="flex items-start">
      <img 
        src={avatar} 
        alt={author} 
        className="w-10 h-10 rounded-full mr-3 cursor-pointer hover:opacity-90 transition-opacity" 
        onClick={handleProfileClick}
      />
      <div>
        <h3 
          className="font-semibold cursor-pointer hover:text-primary transition-colors"
          onClick={handleProfileClick}
        >
          {author}
        </h3>
        <p className="text-sm text-gray-500">{timestamp}</p>
        <p className="mt-2">{content}</p>
      </div>
    </div>
  );
};