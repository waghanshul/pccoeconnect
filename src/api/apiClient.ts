
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Generic error handler for API calls
 */
export const handleApiError = (error: any, customMessage?: string) => {
  console.error("API Error:", error);
  toast.error(customMessage || error.message || "An unexpected error occurred");
  return null;
};

/**
 * Common API response type
 */
export type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Base API client with common functionality
 */
export const apiClient = {
  supabase: supabase
};
