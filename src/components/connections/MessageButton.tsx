
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      onMessageClick(connectionId);
    } finally {
      // In a real app with navigation, this might not execute
      // but we'll add it for completeness
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      variant="outline" 
      size="sm" 
      className="flex-1"
      disabled={!isConnected || isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4 mr-1" />
      )}
      Message
    </Button>
  );
};
