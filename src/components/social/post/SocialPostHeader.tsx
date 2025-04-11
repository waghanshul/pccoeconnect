
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { BarChart2, FileText, Image as ImageIcon, LinkIcon } from "lucide-react";

interface SocialPostHeaderProps {
  author?: {
    full_name: string;
    avatar_url?: string;
  };
  timestamp: string;
  fileType?: string;
  userId?: string;
  onProfileClick: () => void;
}

export const SocialPostHeader = ({ 
  author, 
  timestamp, 
  fileType, 
  onProfileClick 
}: SocialPostHeaderProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const renderFileTypeIcon = () => {
    if (!fileType) return null;
    
    switch (fileType) {
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
    <div className="flex items-start gap-3">
      <Avatar 
        className="cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onProfileClick}
      >
        <AvatarImage src={author?.avatar_url} />
        <AvatarFallback>{author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 
            className="font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={onProfileClick}
          >
            {author?.full_name || 'Anonymous'}
          </h3>
          {renderFileTypeIcon()}
        </div>
        <p className="text-sm text-gray-500">{formatDate(timestamp)}</p>
      </div>
    </div>
  );
};
