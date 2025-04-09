
import { useState } from "react";
import { Search, Loader2, UserPlus, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { toggleConnection } from "@/hooks/messaging/friendsService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Friend {
  id: string;
  full_name: string;
  department?: string;
  avatar_url?: string;
  isConnected?: boolean;
}

interface NewMessageDialogProps {
  friends: Friend[];
  isSearching: boolean;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFriendSelect: (friendId: string) => void;
  onConnectionToggle?: (friendId: string, isConnected: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConnectionsView?: boolean;
}

const NewMessageDialog = ({
  friends,
  isSearching,
  searchQuery,
  onSearchChange,
  onFriendSelect,
  onConnectionToggle,
  open,
  onOpenChange,
  isConnectionsView = false
}: NewMessageDialogProps) => {
  const { user } = useAuth();
  const [updatingConnection, setUpdatingConnection] = useState<string | null>(null);

  const handleConnectionToggle = async (friend: Friend, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent button click
    
    if (!user || !onConnectionToggle) return;
    setUpdatingConnection(friend.id);
    
    const isConnected = await toggleConnection(
      user.id, 
      friend.id, 
      friend.isConnected || false
    );
    
    onConnectionToggle(friend.id, isConnected);
    setUpdatingConnection(null);
    
    toast({
      title: isConnected ? "Connected" : "Disconnected",
      description: isConnected 
        ? `You are now connected with ${friend.full_name}` 
        : `You have disconnected from ${friend.full_name}`,
      variant: isConnected ? "default" : "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {isConnectionsView ? "Manage Connections" : "New Message"}
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {isConnectionsView ? "Manage Connections" : "New Message"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isConnectionsView ? "Search connections..." : "Search contacts..."}
              value={searchQuery}
              onChange={onSearchChange}
              className="pl-9 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
              </div>
            ) : friends.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                {searchQuery 
                  ? "No users found" 
                  : isConnectionsView 
                    ? "No connections available" 
                    : "No contacts available"}
              </p>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onFriendSelect(friend.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-white"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>
                      {friend.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{friend.full_name}</p>
                    {friend.department && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{friend.department}</p>
                    )}
                  </div>
                  {onConnectionToggle && (
                    <Button
                      size="sm"
                      variant={friend.isConnected ? "outline" : "secondary"}
                      className="ml-auto"
                      onClick={(e) => handleConnectionToggle(friend, e)}
                      disabled={updatingConnection === friend.id}
                    >
                      {updatingConnection === friend.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : friend.isConnected ? (
                        <UserCheck className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;
