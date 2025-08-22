
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message, ReceiverProfile } from "./types";

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    console.log("Fetching messages for conversation:", conversationId);
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No active session, cannot fetch messages");
      throw new Error("Authentication required");
    }
    
    console.log("Authenticated user for message fetch:", session.user.id);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching messages:", error);
      console.error("Error details:", { code: error.code, message: error.message, details: error.details });
      throw error;
    }
    
    console.log("Fetched messages count:", data?.length);
    console.log("Fetched messages:", data);
    
    // Fetch sender profiles for each message
    const messagesWithSenders = await Promise.all((data || []).map(async (message) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', message.sender_id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile for message", message.id, ":", profileError);
        }
        
        return {
          ...message,
          sender: profileData || undefined
        };
      } catch (error) {
        console.error("Error processing message", message.id, ":", error);
        return {
          ...message,
          sender: undefined
        };
      }
    }));
    
    console.log("Messages with senders:", messagesWithSenders);
    return messagesWithSenders;
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast({
      title: "Error",
      description: "Failed to load messages",
      variant: "destructive",
    });
    return [];
  }
};

export const fetchConversationParticipants = async (conversationId: string, userId: string | undefined): Promise<ReceiverProfile | null> => {
  try {
    console.log("Fetching participants for conversation:", conversationId, "excluding user:", userId);
    
    // Get conversation participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('profile_id')
      .eq('conversation_id', conversationId);
      
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }
    
    console.log("Found participants:", participantsData);
    
    // Find the other participant (not current user)
    const otherParticipantId = participantsData?.find(p => p.profile_id !== userId)?.profile_id;
    
    if (otherParticipantId) {
      console.log("Found other participant:", otherParticipantId);
      
      // Get profile information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', otherParticipantId)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      console.log("Found profile data:", profileData);
      return profileData;
    }
    
    console.log("No other participant found");
    return null;
  } catch (error) {
    console.error("Error fetching conversation participants:", error);
    return null;
  }
};

export const sendMessage = async (
  content: string, 
  conversationId: string, 
  userId: string | undefined
): Promise<Message | null> => {
  if (!content.trim() || !userId) {
    console.log("Invalid parameters for sending message");
    return null;
  }
  
  try {
    console.log("Sending message to conversation:", conversationId, "from user:", userId);
    
    // First, update the conversation's updated_at timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
      
    if (updateError) {
      console.error("Error updating conversation timestamp:", updateError);
      // Don't fail the message send for this
    }
    
    // Then insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content,
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
    
    console.log("Message sent successfully:", data);
    
    return {
      id: data.id,
      sender_id: data.sender_id,
      content: data.content,
      created_at: data.created_at,
      read_at: data.read_at,
      sender: null // Will be populated later
    };
  } catch (error) {
    console.error("Error sending message:", error);
    toast({
      title: "Error",
      description: "Failed to send message",
      variant: "destructive",
    });
    return null;
  }
};

export const markMessagesAsRead = async (messages: any[], userId: string | undefined) => {
  try {
    if (!userId) return;
    
    // Only mark messages that were not sent by the current user and are unread
    const unreadMessages = messages.filter(msg => 
      msg.sender_id !== userId && msg.read_at === null
    );
    
    if (unreadMessages.length === 0) return;
    
    const messageIds = unreadMessages.map(msg => msg.id);
    console.log("Marking messages as read:", messageIds);
    
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds);
      
    if (error) {
      console.error("Error marking messages as read:", error);
    } else {
      console.log("Messages marked as read successfully");
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};
