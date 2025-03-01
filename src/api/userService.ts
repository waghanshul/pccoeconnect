
import { apiClient, handleApiError, ApiResponse } from "./apiClient";

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  year?: string;
  bio?: string;
  interests?: string[];
  email?: string;
  phone?: string;
  availability?: 'available' | 'busy' | 'away' | 'inactive';
  prn?: string;
  branch?: string;
}

export const userService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch user profile") as Error };
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to update profile") as Error };
    }
  },

  /**
   * Get user availability status
   */
  async getUserAvailability(userId: string): Promise<ApiResponse<string>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('profiles')
        .select('availability')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data: data?.availability, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to get user availability") as Error };
    }
  },

  /**
   * Update user availability status
   */
  async updateUserAvailability(userId: string, status: 'available' | 'busy' | 'away' | 'inactive'): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase
        .from('profiles')
        .update({ availability: status })
        .eq('id', userId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Failed to update availability") as Error };
    }
  }
};
