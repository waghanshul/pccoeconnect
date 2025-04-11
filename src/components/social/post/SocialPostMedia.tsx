
import { FileText, LinkIcon } from "lucide-react";

interface SocialPostMediaProps {
  fileUrl?: string;
  fileType?: string;
}

export const SocialPostMedia = ({ fileUrl, fileType }: SocialPostMediaProps) => {
  if (!fileUrl) return null;
  
  switch (fileType) {
    case 'image':
      return (
        <div className="mt-4 rounded-md overflow-hidden border">
          <img 
            src={fileUrl} 
            alt="Post attachment" 
            className="w-full object-cover max-h-96" 
          />
        </div>
      );
    case 'pdf':
      return (
        <a 
          href={fileUrl} 
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
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 p-4 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LinkIcon className="text-blue-500" />
          <span className="text-blue-500 overflow-hidden text-ellipsis">{fileUrl}</span>
        </a>
      );
    default:
      return null;
  }
};
