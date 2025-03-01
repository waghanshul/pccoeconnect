
import { apiClient, handleApiError, ApiResponse } from "./apiClient";

export interface Poll {
  id: string;
  created_by: string;
  group_id?: string;
  question: string;
  options: string[];
  created_at: string;
  end_time?: string;
}

export interface PollResponse {
  poll_id: string;
  user_id: string;
  selected_option: number;
  created_at: string;
}

export interface PollResult {
  option: string;
  count: number;
  percentage: number;
}

export const pollService = {
  /**
   * Create a new poll
   */
  async createPoll(userId: string, question: string, options: string[], groupId?: string, endTime?: string): Promise<ApiResponse<Poll>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('polls')
        .insert({
          created_by: userId,
          group_id: groupId,
          question,
          options,
          end_time: endTime,
        })
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to create poll") as Error };
    }
  },

  /**
   * Get all polls
   */
  async getPolls(limit = 10, offset = 0): Promise<ApiResponse<Poll[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('polls')
        .select('*, profiles(name, avatar)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch polls") as Error };
    }
  },

  /**
   * Get poll details
   */
  async getPollById(pollId: string): Promise<ApiResponse<Poll>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('polls')
        .select('*, profiles(name, avatar)')
        .eq('id', pollId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch poll") as Error };
    }
  },

  /**
   * Submit a response to a poll
   */
  async submitPollResponse(pollId: string, userId: string, selectedOption: number): Promise<ApiResponse<PollResponse>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('poll_responses')
        .insert({
          poll_id: pollId,
          user_id: userId,
          selected_option: selectedOption,
        })
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to submit poll response") as Error };
    }
  },

  /**
   * Get poll results
   */
  async getPollResults(pollId: string): Promise<ApiResponse<PollResult[]>> {
    try {
      // This would typically be a database function in a real implementation
      const { data: poll, error: pollError } = await apiClient.supabase
        .from('polls')
        .select('options')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      const { data: responses, error: responsesError } = await apiClient.supabase
        .from('poll_responses')
        .select('selected_option')
        .eq('poll_id', pollId);

      if (responsesError) throw responsesError;

      // Calculate results
      const options = poll.options;
      const results: PollResult[] = options.map((option, index) => {
        const count = responses.filter(r => r.selected_option === index).length;
        const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0;
        return { option, count, percentage };
      });

      return { data: results, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to get poll results") as Error };
    }
  },

  /**
   * Check if a user has already responded to a poll
   */
  async hasUserRespondedToPoll(pollId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { count, error } = await apiClient.supabase
        .from('poll_responses')
        .select('*', { count: 'exact', head: true })
        .eq('poll_id', pollId)
        .eq('user_id', userId);

      if (error) throw error;
      return { data: (count ?? 0) > 0, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Failed to check poll response") as Error };
    }
  },
};
