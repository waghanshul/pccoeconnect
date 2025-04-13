
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface MessageButtonProps {
  connectionId: string;
  isConnected: boolean;
  onMessageClick: (connectionId: string) => void;
}

export const MessageButton = ({ 
  connectionId, 
  isConnected, 
  onMessageClick 
}: MessageButtonProps) => {
  const handleClick = () => {
    onMessageClick(connectionId);
  };

  return (
    <Button 
      onClick={handleClick} 
      variant="outline" 
      size="sm" 
      className="flex-1"
      disabled={!isConnected}
    >
      <MessageSquare className="h-4 w-4 mr-1" /> Message
    </Button>
  );
};
