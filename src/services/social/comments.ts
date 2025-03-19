
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Comment } from "./types";
import { isValidProfile, createDefaultAuthor } from "./types";

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    // Fetch comments
    const { data: commentsData, error } = await supabase
      .from('post_comments')
      .select(`*`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Format and type check each comment
    const formattedComments: Comment[] = await Promise.all(commentsData.map(async (comment) => {
      // Fetch author profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', comment.user_id)
        .single();
      
      // Create author object with proper type checking
      const author = profileError || !profileData
        ? createDefaultAuthor()
        : { 
            full_name: profileData.full_name, 
            avatar_url: profileData.avatar_url 
          };
        
      return {
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at || '',
        author
      };
    }));
    
    return formattedComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    toast({
      title: "Error",
      description: "Failed to load comments",
      variant: "destructive",
    });
    return [];
  }
};

export const addComment = async (postId: string, content: string): Promise<Comment | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Insert comment
    const { data: commentData, error } = await supabase
      .from('post_comments')
      .insert({ 
        post_id: postId, 
        content, 
        user_id: user.id 
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Fetch user profile for the comment author
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    
    // Create author object with proper type checking
    const author = profileError || !profileData
      ? createDefaultAuthor()
      : { 
          full_name: profileData.full_name, 
          avatar_url: profileData.avatar_url 
        };
    
    // Create properly typed comment
    const newComment: Comment = {
      id: commentData.id,
      post_id: commentData.post_id,
      user_id: commentData.user_id,
      content: commentData.content,
      created_at: commentData.created_at || '',
      author
    };
    
    return newComment;
  } catch (error) {
    console.error("Error adding comment:", error);
    toast({
      title: "Error",
      description: "Failed to add comment",
      variant: "destructive",
    });
    return null;
  }
};
