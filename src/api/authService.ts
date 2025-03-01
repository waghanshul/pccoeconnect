
import { apiClient, handleApiError, ApiResponse } from "./apiClient";
import { FormData } from "@/utils/validation";

export interface AuthSession {
  user: {
    id: string;
    email: string;
  } | null;
  session: any;
}

export const authService = {
  /**
   * Check if a user with the given PRN already exists
   */
  async checkExistingUser(prn: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('profiles')
        .select('id')
        .eq('prn', prn)
        .single();

      return { 
        data: data ? { existingUser: data } : { existingUser: null }, 
        error: error ? { checkError: error } : null 
      };
    } catch (error) {
      return { data: { existingUser: null }, error: handleApiError(error, "Error checking user") as Error };
    }
  },

  /**
   * Register a new user
   */
  async registerUser(values: FormData): Promise<ApiResponse<any>> {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await apiClient.supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            prn: values.prn,
            branch: values.branch,
            year: values.year
          }
        }
      });

      if (authError) throw authError;

      return { data: { user: authData }, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Registration failed") as Error };
    }
  },

  /**
   * Login a user
   */
  async loginUser(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    try {
      const { data, error } = await apiClient.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Login failed") as Error };
    }
  },

  /**
   * Logout the current user
   */
  async logoutUser(): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase.auth.signOut();
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Logout failed") as Error };
    }
  },

  /**
   * Get the current session
   */
  async getCurrentSession(): Promise<ApiResponse<AuthSession>> {
    try {
      const { data, error } = await apiClient.supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to get current session") as Error };
    }
  },
};
