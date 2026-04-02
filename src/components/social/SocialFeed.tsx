import { useEffect } from "react";
import { useSocialStore } from "@/services/social";
import { SocialPost } from "./SocialPost";
import { CreatePost } from "./CreatePost";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedList } from "@/components/ui/AnimatedList";

export const SocialFeed = () => {
  const { posts, isLoading, fetchPosts, setupRealtimeSubscriptions } = useSocialStore();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchPosts();
    const cleanup = setupRealtimeSubscriptions();
    return () => {
      cleanup();
    };
  }, [fetchPosts, setupRealtimeSubscriptions]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full animate-shimmer" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 animate-shimmer" />
                  <Skeleton className="h-3 w-20 animate-shimmer" />
                </div>
              </div>
              <Skeleton className="h-24 w-full mb-4 rounded-lg animate-shimmer" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
                <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
                <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {user && <CreatePost />}
      
      {posts.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
        </Card>
      ) : (
        <AnimatedList className="space-y-4" staggerDelay={0.08}>
          {posts.map((post) => (
            <SocialPost key={post.id} post={post} />
          ))}
        </AnimatedList>
      )}
    </div>
  );
};
