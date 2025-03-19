
import { useEffect } from "react";
import { useSocialStore } from "@/services/social";
import { SocialPost } from "./SocialPost";
import { CreatePost } from "./CreatePost";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SocialFeed = () => {
  const { posts, isLoading, fetchPosts, setupRealtimeSubscriptions } = useSocialStore();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchPosts();
    
    // Set up realtime subscriptions
    const cleanup = setupRealtimeSubscriptions();
    
    return () => {
      cleanup();
    };
  }, [fetchPosts, setupRealtimeSubscriptions]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-32 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-32 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      {user && <CreatePost />}
      
      {posts.length === 0 ? (
        <Card className="text-center p-6">
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        </Card>
      ) : (
        posts.map((post) => (
          <SocialPost key={post.id} post={post} />
        ))
      )}
    </div>
  );
};
