import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, MoreVertical, UserPlus, Settings } from "lucide-react";
import { GroupMember, fetchGroupMembers } from "@/hooks/messaging/groupService";
import { GroupMembersList } from "./GroupMembersList";
import { AddMembersDialog } from "./AddMembersDialog";
import { Friend } from "@/hooks/messaging/types";

interface GroupChatHeaderProps {
  conversationId: string;
  groupName: string;
  groupDescription?: string;
  groupAvatarUrl?: string;
  memberCount?: number;
  friends: Friend[];
  currentUserId: string;
  onMemberAdded: () => void;
}

export const GroupChatHeader = ({
  conversationId,
  groupName,
  groupDescription,
  groupAvatarUrl,
  memberCount,
  friends,
  currentUserId,
  onMemberAdded
}: GroupChatHeaderProps) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const groupMembers = await fetchGroupMembers(conversationId);
      setMembers(groupMembers);
    } catch (error) {
      console.error("Error loading group members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showMembers && members.length === 0) {
      loadMembers();
    }
  }, [showMembers, conversationId]);

  const currentUserRole = members.find(m => m.profile_id === currentUserId)?.role;
  const canAddMembers = currentUserRole === 'lead' || currentUserRole === 'admin';

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={groupAvatarUrl} />
          <AvatarFallback className="bg-primary/10">
            <Users className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{groupName}</h3>
          <p className="text-sm text-muted-foreground">
            {memberCount || members.length} members
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dialog open={showMembers} onOpenChange={setShowMembers}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
            </DialogHeader>
            <GroupMembersList
              members={members}
              isLoading={isLoading}
              currentUserId={currentUserId}
              conversationId={conversationId}
              onMemberRemoved={loadMembers}
              onRoleUpdated={loadMembers}
            />
          </DialogContent>
        </Dialog>

        {canAddMembers && (
          <AddMembersDialog
            conversationId={conversationId}
            friends={friends}
            existingMemberIds={members.map(m => m.profile_id)}
            onMemberAdded={() => {
              loadMembers();
              onMemberAdded();
            }}
            trigger={
              <Button variant="ghost" size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
            }
          />
        )}

        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};