import { Post } from "@/components/Post";
import { Navigation } from "@/components/Navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface PostType {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string;
}

const Index = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            author_id,
            content,
            created_at,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }
        
        // Transform the data to match the PostType interface
        const formattedPosts = data.map(post => ({
          id: post.id,
          author_id: post.author_id,
          content: post.content,
          created_at: format(new Date(post.created_at), 'PPpp'),
          author_name: post.profiles.full_name,
          author_avatar: post.profiles.avatar_url || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80",
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    
    fetchPosts();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        {posts.map((post, index) => (
          <Post
            key={post.id}
            id={post.id}
            author={post.author_name}
            content={post.content}
            timestamp={post.created_at}
            avatar={post.author_avatar}
            authorId={post.author_id}
          />
        ))}
      </main>
    </div>
  );
};

export default Index;
