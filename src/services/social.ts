
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export type PostType = 'text' | 'image' | 'pdf' | 'link' | 'poll';

export interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  file_url?: string;
  file_type?: string;
  poll_id?: string;
  parent_post_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  votes?: Record<string, number>; // Option -> count
  user_vote?: string; // The option the user voted for
}

interface SocialStore {
  posts: SocialPost[];
  isLoading: boolean;
  comments: Record<string, Comment[]>;
  polls: Record<string, Poll>;
  
  fetchPosts: () => Promise<void>;
  createPost: (content: string, fileUrl?: string, fileType?: string, pollId?: string, parentPostId?: string) => Promise<string | null>;
  deletePost: (postId: string) => Promise<void>;
  
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  
  createPoll: (question: string, options: string[]) => Promise<string | null>;
  votePoll: (pollId: string, option: string) => Promise<void>;
  fetchPoll: (pollId: string) => Promise<Poll | null>;
  
  setupRealtimeSubscriptions: () => () => void;
}

// Helper to check if a profiles object is valid and not an error
const isValidProfile = (profiles: any): profiles is { full_name: string; avatar_url?: string } => {
  return profiles && 
         typeof profiles === 'object' && 
         !('error' in profiles) && 
         typeof profiles.full_name === 'string';
};

// Create a default author object for fallback
const createDefaultAuthor = () => ({ 
  full_name: 'Anonymous' 
});

export const useSocialStore = create<SocialStore>((set, get) => ({
  posts: [],
  isLoading: false,
  comments: {},
  polls: {},
  
  fetchPosts: async () => {
    try {
      set({ isLoading: true });
      
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
      
      set({ posts: formattedPosts, isLoading: false });
      
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
      set({ isLoading: false });
    }
  },
  
  createPost: async (content, fileUrl, fileType, pollId, parentPostId) => {
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
      
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      
      return data?.id || null;
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return null;
    }
  },
  
  deletePost: async (postId) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      set((state) => ({
        posts: state.posts.filter(post => post.id !== postId)
      }));
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  },
  
  likePost: async (postId) => {
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
      
      // Update local state
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) + 1, user_has_liked: true } 
            : post
        )
      }));
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  },
  
  unlikePost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1), user_has_liked: false } 
            : post
        )
      }));
    } catch (error) {
      console.error("Error unliking post:", error);
      toast({
        title: "Error",
        description: "Failed to unlike post",
        variant: "destructive",
      });
    }
  },
  
  fetchComments: async (postId) => {
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
      
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: formattedComments
        }
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    }
  },
  
  addComment: async (postId, content) => {
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
      
      // Update local state with properly typed comment
      set((state) => {
        const postComments = state.comments[postId] || [];
        const newComment: Comment = {
          id: commentData.id,
          post_id: commentData.post_id,
          user_id: commentData.user_id,
          content: commentData.content,
          created_at: commentData.created_at || '',
          author
        };
        
        return {
          comments: {
            ...state.comments,
            [postId]: [...postComments, newComment]
          },
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, comments_count: (post.comments_count || 0) + 1 } 
              : post
          )
        };
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  },
  
  createPoll: async (question, options) => {
    try {
      // Insert poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          question,
          options: options
        })
        .select()
        .single();
      
      if (pollError) throw pollError;
      
      return pollData?.id || null;
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
      return null;
    }
  },
  
  votePoll: async (pollId, option) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Insert vote
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          choice: option,
          user_id: user.id
        });
      
      if (error) throw error;
      
      // Refetch poll data
      await get().fetchPoll(pollId);
      
      toast({
        title: "Success",
        description: "Vote recorded successfully",
      });
    } catch (error) {
      console.error("Error voting on poll:", error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  },
  
  fetchPoll: async (pollId) => {
    try {
      // Get poll data
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();
      
      if (pollError) throw pollError;
      
      // Get vote counts
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('choice')
        .eq('poll_id', pollId);
      
      if (votesError) throw votesError;
      
      // Get current user's vote
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userVote, error: userVoteError } = await supabase
        .from('poll_votes')
        .select('choice')
        .eq('poll_id', pollId)
        .eq('user_id', user?.id)
        .maybeSingle();
      
      // Count votes for each option
      const voteCount: Record<string, number> = {};
      
      // Ensure options is treated as string array
      const pollOptions = Array.isArray(pollData.options) 
        ? pollData.options 
        : typeof pollData.options === 'string' 
          ? JSON.parse(pollData.options) 
          : [];
      
      // Initialize vote counts for each option
      pollOptions.forEach((option: string) => {
        voteCount[option] = 0;
      });
      
      // Count votes
      votesData.forEach((vote) => {
        if (voteCount[vote.choice] !== undefined) {
          voteCount[vote.choice]++;
        }
      });
      
      const poll: Poll = {
        id: pollData.id,
        question: pollData.question,
        options: pollOptions,
        created_at: pollData.created_at,
        votes: voteCount,
        user_vote: userVote?.choice
      };
      
      // Update store
      set((state) => ({
        polls: {
          ...state.polls,
          [pollId]: poll
        }
      }));
      
      return poll;
    } catch (error) {
      console.error("Error fetching poll:", error);
      return null;
    }
  },
  
  setupRealtimeSubscriptions: () => {
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
                
                // Add to state with properly typed post
                set((state) => ({
                  posts: [{
                    ...postData,
                    author,
                    likes_count: 0,
                    comments_count: 0,
                    user_has_liked: false
                  } as SocialPost, ...state.posts]
                }));
              });
          });
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'social_posts' 
      }, (payload) => {
        // Remove deleted post
        set((state) => ({
          posts: state.posts.filter(post => post.id !== payload.old.id)
        }));
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'post_likes' 
      }, (payload) => {
        // Update likes for the post
        const postId = payload.new.post_id;
        get().fetchPosts(); // Refresh to get accurate counts
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'post_likes' 
      }, (payload) => {
        // Update likes for the post
        const postId = payload.old.post_id;
        get().fetchPosts(); // Refresh to get accurate counts
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'post_comments' 
      }, (payload) => {
        // Update comments for the post
        const postId = payload.new.post_id;
        get().fetchComments(postId);
        
        // Update comment count
        set((state) => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, comments_count: (post.comments_count || 0) + 1 } 
              : post
          )
        }));
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'poll_votes' 
      }, (payload) => {
        // Update poll votes
        const pollId = payload.new.poll_id;
        get().fetchPoll(pollId);
      })
      .subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(postsChannel);
    };
  }
}));
