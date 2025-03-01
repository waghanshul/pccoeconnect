
import { apiClient, handleApiError, ApiResponse } from "./apiClient";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  hashtags?: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export const postService = {
  /**
   * Create a new text post
   */
  async createTextPost(userId: string, content: string, hashtags?: string[]): Promise<ApiResponse<Post>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          hashtags,
        })
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to create post") as Error };
    }
  },

  /**
   * Get posts with pagination
   */
  async getPosts(limit = 10, offset = 0): Promise<ApiResponse<Post[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('posts')
        .select('*, profiles(name, avatar)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch posts") as Error };
    }
  },

  /**
   * Get posts for a specific user
   */
  async getUserPosts(userId: string, limit = 10, offset = 0): Promise<ApiResponse<Post[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch user posts") as Error };
    }
  },

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<ApiResponse<Like>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
        })
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to like post") as Error };
    }
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await apiClient.supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: handleApiError(error, "Failed to unlike post") as Error };
    }
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, userId: string, content: string): Promise<ApiResponse<Comment>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
        })
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to add comment") as Error };
    }
  },

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const { data, error } = await apiClient.supabase
        .from('comments')
        .select('*, profiles(name, avatar)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleApiError(error, "Failed to fetch comments") as Error };
    }
  },
};
