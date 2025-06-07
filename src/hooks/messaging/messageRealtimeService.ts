
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";
import { toast } from "sonner";

export const setupMessageRealtimeSubscription = (
  conversationId: string,
  userId: string | undefined,
  onNewMessage: (message: Message) => void,
  markMessagesAsRead: (messages: any[]) => void
) => {
  console.log("Setting up realtime subscription for conversation:", conversationId);
  
  if (!conversationId || !userId) {
    console.log("Invalid parameters for realtime subscription");
    return () => {};
  }
  
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
        
        try {
          // Fetch sender profile for the new message
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();
          
          if (profileError) {
            console.error("Error fetching sender profile:", profileError);
          }
          
          // Create the new message object
          const newMessage: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            read_at: payload.new.read_at,
            sender: profileData || undefined
          };
          
          console.log("Processed new message:", newMessage);
          onNewMessage(newMessage);
          
          // Show notification if message is from another user
          if (payload.new.sender_id !== userId) {
            const senderName = profileData?.full_name || "Someone";
            toast.success(`New message from ${senderName}`);
            console.log("Marking new message as read");
            markMessagesAsRead([payload.new]);
          }
        } catch (error) {
          console.error("Error processing new message:", error);
        }
      })
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log("Message updated via realtime:", payload);
        // Handle message updates (like read receipts)
      }
    )
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
      if (status === 'SUBSCRIBED') {
        console.log("Successfully subscribed to realtime updates for conversation:", conversationId);
      } else if (status === 'CHANNEL_ERROR') {
        console.error("Error subscribing to realtime updates");
      }
    });
    
  return () => {
    console.log("Cleaning up realtime subscription for conversation:", conversationId);
    supabase.removeChannel(channel);
  };
};
