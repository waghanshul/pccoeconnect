import { supabase } from "@/integrations/supabase/client";

interface ModerationResult {
  flagged: boolean;
  reason?: string;
}

export const moderateContent = async (content: string): Promise<ModerationResult> => {
  const { data, error } = await supabase.functions.invoke("moderate-content", {
    body: { content },
  });

  if (error) {
    console.error("Moderation service error:", error);
    // Allow content through if moderation service is down (fail-open)
    return { flagged: false };
  }

  return data as ModerationResult;
};
