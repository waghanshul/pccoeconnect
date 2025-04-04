
import { supabase } from "@/integrations/supabase/client";

export const setupRealtimeSubscription = (
  userId: string | undefined, 
  onUpdate: () => void
) => {
  if (!userId) return () => {};
  
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
        if (payload.new.sender_id !== userId) {
          onUpdate();
        }
      })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
