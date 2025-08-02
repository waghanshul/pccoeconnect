import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Crown, Shield, User, UserMinus } from "lucide-react";
import { GroupMember, removeGroupMember, updateMemberRole } from "@/hooks/messaging/groupService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GroupMembersListProps {
  members: GroupMember[];
  isLoading: boolean;
  currentUserId: string;
  conversationId: string;
  onMemberRemoved: () => void;
  onRoleUpdated: () => void;
}

export const GroupMembersList = ({
  members,
  isLoading,
  currentUserId,
  conversationId,
  onMemberRemoved,
  onRoleUpdated
}: GroupMembersListProps) => {
  const currentUserRole = members.find(m => m.profile_id === currentUserId)?.role;
  const canManageMembers = currentUserRole === 'lead';

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the group?`)) return;

    try {
      const success = await removeGroupMember(conversationId, memberId);
      if (success) {
        toast.success(`${memberName} removed from group`);
        onMemberRemoved();
      } else {
        toast.error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: 'admin' | 'member', memberName: string) => {
    try {
      const success = await updateMemberRole(conversationId, memberId, newRole);
      if (success) {
        toast.success(`${memberName} is now ${newRole === 'admin' ? 'an admin' : 'a member'}`);
        onRoleUpdated();
      } else {
        toast.error("Failed to update member role");
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Failed to update member role");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'lead':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'admin':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.profile.avatar_url} />
              <AvatarFallback>
                {member.profile.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{member.profile.full_name}</p>
              <Badge variant="secondary" className={`text-xs ${getRoleColor(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="ml-1 capitalize">{member.role}</span>
              </Badge>
            </div>
          </div>

          {canManageMembers && member.profile_id !== currentUserId && member.role !== 'lead' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {member.role === 'member' && (
                  <DropdownMenuItem 
                    onClick={() => handleRoleUpdate(member.profile_id, 'admin', member.profile.full_name)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Make Admin
                  </DropdownMenuItem>
                )}
                {member.role === 'admin' && (
                  <DropdownMenuItem 
                    onClick={() => handleRoleUpdate(member.profile_id, 'member', member.profile.full_name)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Remove Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleRemoveMember(member.profile_id, member.profile.full_name)}
                  className="text-destructive"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove from Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}
    </div>
  );
};