
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share2, Search, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fetchContacts } from "@/hooks/messaging/friendsService";
import { createConversation } from "@/hooks/messaging/conversationOperations";
import { fetchConversations } from "@/hooks/messaging/conversationService";

interface Friend {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface SharePostDialogProps {
  postContent: string;
  postAuthor?: string;
  children?: React.ReactNode;
}

export const SharePostDialog = ({ postContent, postAuthor, children }: SharePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && user?.id) {
      loadFriends();
    }
  }, [open, user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const contacts = await fetchContacts(user.id);
      setFriends(contacts);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (friend: Friend) => {
    if (!user?.id) return;
    setSending(friend.id);

    try {
      // Get existing conversations to check for duplicates
      const conversations = await fetchConversations(user.id);
      
      // Find or create conversation with this friend
      const conversationId = await createConversation(friend.id, user.id, conversations);
      
      if (!conversationId) {
        toast.error("Failed to create conversation");
        return;
      }

      // Build shared post message
      const sharedMessage = `📤 Shared a post${postAuthor ? ` by ${postAuthor}` : ''}:\n\n"${postContent.length > 200 ? postContent.substring(0, 200) + '...' : postContent}"`;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Send the message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: sharedMessage,
        });

      if (error) throw error;

      setOpen(false);
      toast.success(`Shared with ${friend.full_name}`, {
        action: {
          label: 'View chat',
          onClick: () => navigate(`/messages/${conversationId}`)
        },
      });
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    } finally {
      setSending(null);
    }
  };

  const filtered = friends.filter(f =>
    f.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share post with a friend</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className="max-h-64">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              {friends.length === 0 ? "No connections yet" : "No friends match your search"}
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleShare(friend)}
                  disabled={sending === friend.id}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={friend.avatar_url} />
                    <AvatarFallback>{friend.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left text-sm font-medium">{friend.full_name}</span>
                  {sending === friend.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
