
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";

export const setupMessageRealtimeSubscription = (
  conversationId: string,
  userId: string | undefined,
  onNewMessage: (message: Message) => void,
  markMessagesAsRead: (messages: any[]) => void
) => {
  console.log("Setting up realtime subscription for conversation:", conversationId);
  
  const channel = supabase
    .channel(`chat-${conversationId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, 
      async (payload) => {
        console.log("Received new message via realtime:", payload);
        
        // Process all messages, including our own for immediate UI feedback
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();
        
        // Create the new message object
        const newMessage: Message = {
          id: payload.new.id,
          sender_id: payload.new.sender_id,
          content: payload.new.content,
          created_at: payload.new.created_at,
          read_at: payload.new.read_at,
          sender: profileData || undefined
        };
        
        onNewMessage(newMessage);
        
        // Only mark as read if message is from another user
        if (payload.new.sender_id !== userId) {
          markMessagesAsRead([payload.new]);
        }
      })
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
    });
    
  return () => {
    console.log("Cleaning up realtime subscription");
    supabase.removeChannel(channel);
  };
};
