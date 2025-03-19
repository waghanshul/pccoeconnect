
import { User } from "@supabase/supabase-js";

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

// Helper to check if a profiles object is valid and not an error
export const isValidProfile = (profiles: any): profiles is { full_name: string; avatar_url?: string } => {
  return profiles && 
         typeof profiles === 'object' && 
         !('error' in profiles) && 
         typeof profiles.full_name === 'string';
};

// Create a default author object for fallback
export const createDefaultAuthor = () => ({ 
  full_name: 'Anonymous' 
});
