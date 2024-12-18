import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostProps {
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
}

export const Post = ({ author, content, timestamp, avatar }: PostProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 animate-fadeIn">
      <div className="flex items-center mb-4">
        <img src={avatar} alt={author} className="w-10 h-10 rounded-full mr-3" />
        <div>
          <h3 className="font-semibold text-gray-900">{author}</h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>
      <p className="text-gray-800 mb-4">{content}</p>
      <div className="flex items-center space-x-4 text-gray-500">
        <button className="flex items-center space-x-2 hover:text-primary transition-colors">
          <Heart size={20} />
          <span>Like</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary transition-colors">
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary transition-colors">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};