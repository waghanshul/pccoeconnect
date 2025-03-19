
import { create } from "zustand";
import { SocialPost, Comment, Poll } from "./types";
import * as PostService from "./posts";
import * as CommentService from "./comments";
import * as PollService from "./polls";
import { setupRealtimeSubscriptions } from "./realtime";

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
  
  setupRealtimeSubscriptions: () => (() => void);
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  posts: [],
  isLoading: false,
  comments: {},
  polls: {},
  
  fetchPosts: async () => {
    try {
      set({ isLoading: true });
      const formattedPosts = await PostService.fetchPosts();
      set({ posts: formattedPosts, isLoading: false });
    } catch (error) {
      console.error("Error in fetchPosts:", error);
      set({ isLoading: false });
    }
  },
  
  createPost: async (content, fileUrl, fileType, pollId, parentPostId) => {
    const postId = await PostService.createPost(content, fileUrl, fileType, pollId, parentPostId);
    return postId;
  },
  
  deletePost: async (postId) => {
    const success = await PostService.deletePost(postId);
    if (success) {
      set((state) => ({
        posts: state.posts.filter(post => post.id !== postId)
      }));
    }
  },
  
  likePost: async (postId) => {
    const success = await PostService.likePost(postId);
    if (success) {
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) + 1, user_has_liked: true } 
            : post
        )
      }));
    }
  },
  
  unlikePost: async (postId) => {
    const success = await PostService.unlikePost(postId);
    if (success) {
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1), user_has_liked: false } 
            : post
        )
      }));
    }
  },
  
  fetchComments: async (postId) => {
    const formattedComments = await CommentService.fetchComments(postId);
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: formattedComments
      }
    }));
  },
  
  addComment: async (postId, content) => {
    const newComment = await CommentService.addComment(postId, content);
    if (newComment) {
      set((state) => {
        const postComments = state.comments[postId] || [];
        
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
    }
  },
  
  createPoll: async (question, options) => {
    return await PollService.createPoll(question, options);
  },
  
  votePoll: async (pollId, option) => {
    const success = await PollService.votePoll(pollId, option);
    if (success) {
      await get().fetchPoll(pollId);
    }
  },
  
  fetchPoll: async (pollId) => {
    const poll = await PollService.fetchPoll(pollId);
    if (poll) {
      set((state) => ({
        polls: {
          ...state.polls,
          [pollId]: poll
        }
      }));
    }
    return poll;
  },
  
  setupRealtimeSubscriptions: () => {
    // Set up realtime subscriptions with callbacks
    return setupRealtimeSubscriptions(
      // onNewPost
      (newPost) => {
        set((state) => ({
          posts: [newPost, ...state.posts]
        }));
      },
      // onDeletePost
      (postId) => {
        set((state) => ({
          posts: state.posts.filter(post => post.id !== postId)
        }));
      },
      // onLikeChange
      () => {
        get().fetchPosts();
      },
      // onNewComment
      (postId) => {
        get().fetchComments(postId);
        
        // Update comment count
        set((state) => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, comments_count: (post.comments_count || 0) + 1 } 
              : post
          )
        }));
      },
      // onPollVote
      (pollId) => {
        get().fetchPoll(pollId);
      }
    );
  }
}));

// Export types
export * from "./types";
