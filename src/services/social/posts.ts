
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SocialPost } from "./types";
import { isValidProfile, createDefaultAuthor } from "./types";

export const fetchPosts = async (): Promise<SocialPost[]> => {
  try {
    // Get current user ID for checking likes
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // Fetch posts with author information directly
    const { data: postsData, error } = await supabase
      .from('social_posts')
      .select(`*`);
    
    if (error) throw error;
    
    // Format posts for display
    const formattedPosts = await Promise.all(postsData.map(async (post) => {
      // Check if user has liked this post
      const { data: likes, error: likesError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
      
      // Get likes count
      const { count: likesCount, error: countError } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      // Get comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      // Fetch author profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', post.user_id)
        .single();
      
      // Create author object with proper type checking
      const author = profileError || !profileData 
        ? createDefaultAuthor()
        : { 
            full_name: profileData.full_name, 
            avatar_url: profileData.avatar_url 
          };
        
      return {
        ...post,
        author,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        user_has_liked: likes && likes.length > 0
      } as SocialPost;
    }));
    
    return formattedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    toast.error("Failed to fetch posts");
    return [];
  }
};

export const createPost = async (
  content: string, 
  fileUrl?: string, 
  fileType?: string, 
  pollId?: string, 
  parentPostId?: string
): Promise<string | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        content,
        file_url: fileUrl,
        file_type: fileType,
        poll_id: pollId,
        parent_post_id: parentPostId,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success("Post created successfully!");
    
    return data?.id || null;
  } catch (error) {
    console.error("Error creating post:", error);
    toast.error("Failed to create post");
    return null;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    
    toast.success("Post deleted successfully!");
    
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error("Failed to delete post");
    return false;
  }
};

export const likePost = async (postId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('post_likes')
      .insert({ 
        post_id: postId,
        user_id: user.id
      });
    
    if (error) throw error;
    
    toast.success("Post liked!");
    return true;
  } catch (error) {
    console.error("Error liking post:", error);
    toast.error("Failed to like post");
    return false;
  }
};

export const unlikePost = async (postId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    toast.success("Post unliked");
    return true;
  } catch (error) {
    console.error("Error unliking post:", error);
    toast.error("Failed to unlike post");
    return false;
  }
};
