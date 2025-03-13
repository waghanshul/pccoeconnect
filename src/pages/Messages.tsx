
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Plus, User, Search, Send } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ChatWindow from "@/components/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface Conversation {
  id: string;
  updated_at: string;
  participants: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface Friend {
  id: string;
  full_name: string;
  department?: string;
  avatar_url?: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchContacts();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      
      // Get all conversations where the current user is a participant
      const { data: participations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', user?.id);
        
      if (participationsError) throw participationsError;
      
      if (!participations || participations.length === 0) {
        setConversations([]);
        return;
      }
      
      const conversationIds = participations.map(p => p.conversation_id);
      
      // Get basic conversation data
      const { data: convsData, error: convsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });
        
      if (convsError) throw convsError;
      
      // For each conversation, get participants and last message
      const conversationsWithDetails = await Promise.all(convsData.map(async (conv) => {
        // Get participants
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conv.id);
          
        if (participantsError) throw participantsError;
        
        const participantIds = participants.map(p => p.profile_id);
        
        // Get participant profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', participantIds)
          .neq('id', user?.id); // Exclude current user
          
        if (profilesError) throw profilesError;
        
        // Get last message
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (messagesError) throw messagesError;
        
        return {
          ...conv,
          participants: profiles || [],
          last_message: messages && messages.length > 0 ? messages[0] : undefined
        };
      }));
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      // For simplicity, we're getting all users except the current user
      // In a real app, you'd want to filter for friends/connections
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', user?.id);
        
      if (error) throw error;
      
      // Get additional data for student profiles where available
      const friendsWithDepartments = await Promise.all((data || []).map(async (profile) => {
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('department')
          .eq('id', profile.id)
          .single();
          
        return {
          ...profile,
          department: studentData?.department
        };
      }));
      
      setFriends(friendsWithDepartments);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFriendSelect = async (friendId: string) => {
    setIsOpen(false);
    
    try {
      // Check if conversation already exists with this friend
      let conversationId = "";
      
      for (const conv of conversations) {
        const isFriendInConv = conv.participants.some(p => p.id === friendId);
        if (isFriendInConv) {
          conversationId = conv.id;
          break;
        }
      }
      
      // If no existing conversation, create one
      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
          
        if (convError) throw convError;
        
        conversationId = newConv.id;
        
        // Add participants
        const participantsToAdd = [
          { conversation_id: conversationId, profile_id: user?.id },
          { conversation_id: conversationId, profile_id: friendId }
        ];
        
        const { error: partError } = await supabase
          .from('conversation_participants')
          .insert(participantsToAdd);
          
        if (partError) throw partError;
      }
      
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Format relative time (e.g., "2h ago")
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return format(date, 'MMM d');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h1 className="text-xl font-semibold dark:text-white">Messages</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle className="dark:text-white">New Message</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search contacts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </div>
                      <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {filteredFriends.map((friend) => (
                          <button
                            key={friend.id}
                            onClick={() => handleFriendSelect(friend.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-white"
                          >
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                              {friend.avatar_url ? (
                                <img src={friend.avatar_url} alt={friend.full_name} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">{friend.full_name}</p>
                              {friend.department && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{friend.department}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {conversations.length > 0 ? (
                    conversations.map((conv) => {
                      const participant = conv.participants[0]; // First (or only) other participant
                      return (
                        <Link
                          key={conv.id}
                          to={`/messages/${conv.id}`}
                          className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${userId === conv.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                        >
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              {participant?.avatar_url ? (
                                <img src={participant.avatar_url} alt={participant.full_name} className="h-12 w-12 rounded-full object-cover" />
                              ) : (
                                <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {participant?.full_name || 'Unknown User'}
                              </h2>
                              {conv.last_message?.created_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatRelativeTime(conv.last_message.created_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {conv.last_message?.content || 'No messages yet'}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No conversations yet. Start a new message!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            {userId ? (
              <ChatWindow 
                userId={userId} 
              />
            ) : (
              <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
