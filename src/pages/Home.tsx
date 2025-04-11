
import { Navigation } from "@/components/Navigation";
import { Post } from "@/components/Post";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PostData {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const Home = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // Using the posts table structure which has author_id instead of user_id
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          user:profiles!posts_author_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
        return;
      }
      
      // Map the data to match the PostData interface
      const formattedPosts = data.map((post: any) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        author_id: post.author_id,
        user: post.user
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Home Feed</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Post 
                key={post.id}
                id={post.id}
                author={post.user.full_name}
                authorId={post.user.id}
                content={post.content}
                timestamp={format(new Date(post.created_at), 'PPpp')}
                avatar={post.user.avatar_url || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No posts yet. Check back later!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
