
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime changes relevant to conversations so the UI stays in sync:
 * - messages: when a new message is inserted by someone else
 * - conversations: when a group/direct conversation is created or updated
 * - conversation_participants: when the current user is added/removed
 * - group_members: when group memberships change (add/remove/role changes)
 *
 * onUpdate() should re-fetch the conversations list.
 */
export const setupRealtimeSubscription = (
  userId: string | undefined,
  onUpdate: () => void
) => {
  if (!userId) return () => {};

  const channelName = `messaging-realtime-${userId}`;
  const channel = supabase.channel(channelName);

  // 1) New messages from others -> refresh conversations
  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => {
      const senderId = (payload as any)?.new?.sender_id;
      if (senderId !== userId) {
        onUpdate();
      }
    }
  );

  // 2) Conversation lifecycle (create/update group or DM) -> refresh
  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "conversations" },
    () => {
      onUpdate();
    }
  );

  // 3) Participant changes affecting the current user -> refresh
  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "conversation_participants" },
    (payload) => {
      const newProfileId = (payload as any)?.new?.profile_id;
      const oldProfileId = (payload as any)?.old?.profile_id;
      if (newProfileId === userId || oldProfileId === userId) {
        onUpdate();
      }
    }
  );

  // 4) Group membership changes (adds/removes/role updates) -> refresh
  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "group_members" },
    () => {
      onUpdate();
    }
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

