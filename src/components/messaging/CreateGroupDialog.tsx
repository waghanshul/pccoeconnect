import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createGroup } from "@/hooks/messaging/groupService";
import { Friend } from "@/hooks/messaging/types";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  friends: Friend[];
  onGroupCreated: (conversationId: string) => void;
}

export const CreateGroupDialog = ({ friends, onGroupCreated }: CreateGroupDialogProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = friends.filter(friend =>
    friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberToggle = (friendId: string) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!user?.id) return;
    
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsCreating(true);
    try {
      const conversationId = await createGroup(
        groupName.trim(),
        description.trim(),
        selectedMembers,
        user.id
      );

      if (conversationId) {
        toast.success("Group created successfully!");
        onGroupCreated(conversationId);
        setIsOpen(false);
        resetForm();
      } else {
        toast.error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Add Members ({selectedMembers.length} selected)</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredFriends.map((friend) => (
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
            {filteredFriends.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchQuery ? "No friends found" : "No friends available"}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};