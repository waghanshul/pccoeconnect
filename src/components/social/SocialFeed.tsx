import { useEffect } from "react";
import { useSocialStore } from "@/services/social";
import { SocialPost } from "./SocialPost";
import { CreatePost } from "./CreatePost";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedList } from "@/components/ui/AnimatedList";

export const SocialFeed = () => {
  const { posts, isLoading, fetchPosts, setupRealtimeSubscriptions } = useSocialStore();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchPosts();
    const cleanup = setupRealtimeSubscriptions();
    return () => { cleanup(); };
  }, [fetchPosts, setupRealtimeSubscriptions]);
  
  if (isLoading) {
    return (
      <div className="border border-border rounded-xl bg-card divide-y divide-border">
        {[1, 2].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-20 w-full mb-3 rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {user && <CreatePost />}
      
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No posts yet. Be the first to post!
        </div>
      ) : (
        <AnimatedList staggerDelay={0.06}>
          {posts.map((post) => (
            <SocialPost key={post.id} post={post} />
          ))}
        </AnimatedList>
      )}
    </div>
  );
};
