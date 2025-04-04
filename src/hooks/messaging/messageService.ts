
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message, ReceiverProfile } from "./types";

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  try {
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
    // Get conversation participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('profile_id')
      .eq('conversation_id', conversationId);
      
    if (participantsError) throw participantsError;
    
    // Find the other participant (not current user)
    const otherParticipantId = participantsData.find(p => p.profile_id !== userId)?.profile_id;
    
    if (otherParticipantId) {
      // Get profile information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', otherParticipantId)
        .single();
        
      if (profileError) throw profileError;
      
      return profileData;
    }
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
  if (!content.trim() || !userId) return null;
  
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
        sender_id: userId,
        content: content,
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
    
    // Add sender info to the message
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
    // Only mark messages that were not sent by the current user and are unread
    const unreadMessages = messages.filter(msg => 
      msg.sender_id !== userId && msg.read_at === null
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
