
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";

export const setupMessageRealtimeSubscription = (
  conversationId: string,
  userId: string | undefined,
  onNewMessage: (message: Message) => void,
  markMessagesAsRead: (messages: any[]) => void
) => {
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
        if (payload.new.sender_id !== userId) {
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
          
          onNewMessage(newMessage);
          
          // Mark the message as read
          markMessagesAsRead([payload.new]);
        }
      })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
