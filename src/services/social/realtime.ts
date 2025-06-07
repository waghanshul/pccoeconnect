
import { supabase } from "@/integrations/supabase/client";
import { SocialPost } from "./types";
import { createDefaultAuthor } from "./types";
import { toast } from "sonner";

export const setupRealtimeSubscriptions = (
  onNewPost: (post: SocialPost) => void,
  onDeletePost: (postId: string) => void,
  onLikeChange: () => void,
  onNewComment: (postId: string) => void,
  onPollVote: (pollId: string) => void
): (() => void) => {
  // Subscribe to changes in posts
  const postsChannel = supabase
    .channel('social-feed-updates')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'social_posts' 
    }, (payload) => {
      // Fetch the new post with author info
      const newPostId = payload.new.id;
      const newPostUserId = payload.new.user_id;
      
      // First fetch the post data
      supabase
        .from('social_posts')
        .select(`*`)
        .eq('id', newPostId)
        .single()
        .then(({ data: postData, error: postError }) => {
          if (postError) {
            console.error("Error fetching new post:", postError);
            return;
          }
          
          // Then fetch the user profile separately
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newPostUserId)
            .single()
            .then(({ data: profileData, error: profileError }) => {
              // Create the author object with proper type checking
              const author = profileError || !profileData
                ? createDefaultAuthor()
                : { 
                    full_name: profileData.full_name, 
                    avatar_url: profileData.avatar_url 
                  };
              
              // Create properly typed post
              const newPost: SocialPost = {
                ...postData,
                author,
                likes_count: 0,
                comments_count: 0,
                user_has_liked: false
              };
              
              onNewPost(newPost);
              
              // Show notification for new post (except from current user)
              supabase.auth.getUser().then(({ data: { user } }) => {
                if (user && newPostUserId !== user.id) {
                  const authorName = profileData?.full_name || "Someone";
                  toast.success(`${authorName} created a new post`);
                }
              });
            });
        });
    })
    .on('postgres_changes', { 
      event: 'DELETE', 
      schema: 'public', 
      table: 'social_posts' 
    }, (payload) => {
      // Remove deleted post
      onDeletePost(payload.old.id);
    })
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'post_likes' 
    }, (payload) => {
      // Update likes for the post
      onLikeChange();
    })
    .on('postgres_changes', { 
      event: 'DELETE', 
      schema: 'public', 
      table: 'post_likes' 
    }, (payload) => {
      // Update likes for the post
      onLikeChange();
    })
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'post_comments' 
    }, (payload) => {
      // Update comments for the post
      const postId = payload.new.post_id;
      onNewComment(postId);
      
      // Show notification for new comment
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && payload.new.user_id !== user.id) {
          // Fetch commenter's profile
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single()
            .then(({ data: profileData }) => {
              const commenterName = profileData?.full_name || "Someone";
              toast.success(`${commenterName} commented on a post`);
            });
        }
      });
    })
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'poll_votes' 
    }, (payload) => {
      // Update poll votes
      const pollId = payload.new.poll_id;
      onPollVote(pollId);
    })
    .subscribe();
  
  // Return cleanup function
  return () => {
    supabase.removeChannel(postsChannel);
  };
};
