import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { SocialPost } from "@/components/social/SocialPost";
import { SocialPost as SocialPostType } from "@/services/social";
import { isValidProfile, createDefaultAuthor } from "@/services/social/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<SocialPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (postId) fetchPost();
  }, [postId, user?.id]);

  const fetchPost = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("id", postId)
        .single();

      if (error || !data) { setNotFound(true); return; }

      const author = isValidProfile(data.profiles) ? data.profiles : createDefaultAuthor();
      const { count: likesCount } = await supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", postId);
      const { count: commentsCount } = await supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", postId);

      let userHasLiked = false;
      if (user?.id) {
        const { data: likeData } = await supabase.from("post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
        userHasLiked = !!likeData;
      }

      setPost({
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        file_url: data.file_url || undefined,
        file_type: data.file_type || undefined,
        poll_id: data.poll_id || undefined,
        parent_post_id: data.parent_post_id || undefined,
        created_at: data.created_at || "",
        updated_at: data.updated_at || "",
        author,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        user_has_liked: userHasLiked,
      });
    } catch (err) {
      console.error("Error fetching post:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notFound ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium">Post not found</p>
            <p className="text-sm text-muted-foreground mt-1">This post may have been deleted.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/home")}>Go to Home</Button>
          </div>
        ) : post ? (
          <SocialPost post={post} />
        ) : null}
      </div>
    </AppLayout>
  );
};

export default PostView;
