
export interface Conversation {
  id: string;
  updated_at: string;
  participants: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }[];
  last_message?: {
    content: string;
    created_at: string;
    read_at: string | null;
  };
  unread_count: number;
}

export interface Friend {
  id: string;
  full_name: string;
  department?: string;
  avatar_url?: string;
}
