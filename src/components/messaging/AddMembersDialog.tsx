import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2 } from "lucide-react";
import { addGroupMember } from "@/hooks/messaging/groupService";
import { Friend } from "@/hooks/messaging/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AddMembersDialogProps {
  conversationId: string;
  friends: Friend[];
  existingMemberIds: string[];
  onMemberAdded: () => void;
  trigger: React.ReactNode;
}

export const AddMembersDialog = ({
  conversationId,
  friends,
  existingMemberIds,
  onMemberAdded,
  trigger
}: AddMembersDialogProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out friends who are already members
  const availableFriends = friends.filter(friend => 
    !existingMemberIds.includes(friend.id) &&
    friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberToggle = (friendId: string) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembers = async () => {
    if (!user?.id || selectedMembers.length === 0) return;

    setIsAdding(true);
    try {
      const promises = selectedMembers.map(memberId =>
        addGroupMember(conversationId, memberId, user.id)
      );

      const results = await Promise.all(promises);
      const successful = results.filter(Boolean).length;

      if (successful === selectedMembers.length) {
        toast.success(`${successful} member(s) added successfully!`);
      } else if (successful > 0) {
        toast.success(`${successful} of ${selectedMembers.length} member(s) added`);
      } else {
        toast.error("Failed to add members");
      }

      if (successful > 0) {
        onMemberAdded();
        setIsOpen(false);
        setSelectedMembers([]);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="pl-10"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedMembers.length} member(s) selected
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <Checkbox
                  id={friend.id}
                  checked={selectedMembers.includes(friend.id)}
                  onCheckedChange={() => handleMemberToggle(friend.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.avatar_url} />
                  <AvatarFallback>
                    {friend.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{friend.full_name}</p>
                  {friend.department && (
                    <p className="text-xs text-muted-foreground">{friend.department}</p>
                  )}
                </div>
              </div>
            ))}
            {availableFriends.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchQuery ? "No friends found" : "All friends are already members"}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              className="flex-1"
              disabled={isAdding || selectedMembers.length === 0}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedMembers.length} Member(s)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};