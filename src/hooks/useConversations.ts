
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

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
    read_at: string | null;
  };
  unread_count: number;
}

interface Friend {
  id: string;
  full_name: string;
  department?: string;
  avatar_url?: string;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchContacts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('message-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          // If new message is not from current user, update conversations
          if (payload.new.sender_id !== user?.id) {
            fetchConversations();
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  };

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
        setIsLoading(false);
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
      const conversationsWithDetails = await Promise.all((convsData || []).map(async (conv) => {
        // Get participants
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conv.id);
          
        if (participantsError) throw participantsError;
        
        const participantIds = participants.map(p => p.profile_id);
        
        // Get participant profiles (excluding current user)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', participantIds)
          .neq('id', user?.id);
          
        if (profilesError) throw profilesError;
        
        // Get last message
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('content, created_at, read_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (messagesError) throw messagesError;
        
        // Count unread messages
        const { count, error: countError } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read_at', null)
          .neq('sender_id', user?.id);
          
        if (countError) throw countError;
        
        return {
          ...conv,
          participants: profiles || [],
          last_message: messages && messages.length > 0 ? messages[0] : undefined,
          unread_count: count || 0
        };
      }));
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
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
        try {
          const { data: studentData } = await supabase
            .from('student_profiles')
            .select('department')
            .eq('id', profile.id)
            .single();
            
          return {
            ...profile,
            department: studentData?.department || undefined
          };
        } catch (err) {
          // If there's an error getting the student profile, just return the basic profile
          return profile;
        }
      }));
      
      setFriends(friendsWithDepartments);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    }
  };

  const searchUsers = async (query: string) => {
    try {
      if (!query.trim()) {
        await fetchContacts();
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', user?.id)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
        
      if (error) throw error;
      
      // Get additional data for student profiles where available
      const friendsWithDepartments = await Promise.all((data || []).map(async (profile) => {
        try {
          const { data: studentData } = await supabase
            .from('student_profiles')
            .select('department')
            .eq('id', profile.id)
            .single();
            
          return {
            ...profile,
            department: studentData?.department || undefined
          };
        } catch (err) {
          // If there's an error getting the student profile, just return the basic profile
          return profile;
        }
      }));
      
      setFriends(friendsWithDepartments);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (friendId: string) => {
    try {
      // Check if conversation already exists with this friend
      let existingConversationId = "";
      
      for (const conv of conversations) {
        const isFriendInConv = conv.participants.some(p => p.id === friendId);
        if (isFriendInConv) {
          existingConversationId = conv.id;
          break;
        }
      }
      
      // If no existing conversation, create one
      if (!existingConversationId) {
        console.log("Creating new conversation");
        
        // First create the conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
          
        if (convError) {
          console.error("Error creating conversation:", convError);
          throw convError;
        }
        
        console.log("Created conversation:", newConv);
        existingConversationId = newConv.id;
        
        // Then add current user as participant
        const { error: currentUserPartError } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: existingConversationId,
            profile_id: user?.id
          });
          
        if (currentUserPartError) {
          console.error("Error adding current user as participant:", currentUserPartError);
          throw currentUserPartError;
        }
        
        // Then add friend as participant
        const { error: friendPartError } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: existingConversationId,
            profile_id: friendId
          });
          
        if (friendPartError) {
          console.error("Error adding friend as participant:", friendPartError);
          throw friendPartError;
        }
        
        console.log("Added participants to conversation");
      }
      
      // Refresh conversations to include the new one
      await fetchConversations();
      
      return existingConversationId;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    conversations,
    friends,
    isLoading,
    fetchConversations,
    fetchContacts,
    searchUsers,
    createConversation
  };
};
