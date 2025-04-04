
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ReceiverProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverProfile, setReceiverProfile] = useState<ReceiverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchConversationParticipants();
      const cleanup = setupRealtimeSubscription();
      
      return () => {
        cleanup();
      };
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Fetch sender profiles for each message
      const messagesWithSenders = await Promise.all((data || []).map(async (message) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', message.sender_id)
          .single();
          
        return {
          ...message,
          sender: profileData || undefined
        };
      }));
      
      setMessages(messagesWithSenders);
      
      // Mark messages as read
      markMessagesAsRead(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationParticipants = async () => {
    try {
      // Get conversation participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('profile_id')
        .eq('conversation_id', conversationId);
        
      if (participantsError) throw participantsError;
      
      // Find the other participant (not current user)
      const otherParticipantId = participantsData.find(p => p.profile_id !== user?.id)?.profile_id;
      
      if (otherParticipantId) {
        // Get profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherParticipantId)
          .single();
          
        if (profileError) throw profileError;
        
        setReceiverProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching conversation participants:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        async (payload) => {
          // Only process messages that aren't from the current user
          if (payload.new.sender_id !== user?.id) {
            // Fetch sender information
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();
            
            // Ensure the new message conforms to the Message interface
            const newMessage: Message = {
              id: payload.new.id,
              sender_id: payload.new.sender_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              read_at: payload.new.read_at,
              sender: profileData || undefined
            };
            
            setMessages(current => [...current, newMessage]);
            
            // Mark the message as read
            markMessagesAsRead([payload.new]);
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async (messagesToMark: any[]) => {
    try {
      // Only mark messages that were not sent by the current user and are unread
      const unreadMessages = messagesToMark.filter(msg => 
        msg.sender_id !== user?.id && msg.read_at === null
      );
      
      if (unreadMessages.length === 0) return;
      
      const messageIds = unreadMessages.map(msg => msg.id);
      
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);
        
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    
    try {
      console.log("Sending message to conversation:", conversationId);
      
      // First, update the conversation's updated_at timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError);
      }
      
      // Then insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content,
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      // Add sender info to the message with proper typing
      const newMessageWithSender: Message = {
        id: data.id,
        sender_id: data.sender_id,
        content: data.content,
        created_at: data.created_at,
        read_at: data.read_at,
        sender: {
          full_name: user?.user_metadata?.full_name || user?.email || 'You',
          avatar_url: user?.user_metadata?.avatar_url || null
        }
      };
      
      setMessages(current => [...current, newMessageWithSender]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    receiverProfile,
    isLoading,
    sendMessage
  };
};
