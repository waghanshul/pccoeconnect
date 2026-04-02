import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTextPost } from "@/components/post/CreateTextPost";
import { CreateMediaPost } from "@/components/post/CreateMediaPost";
import { CreatePollPost } from "@/components/post/CreatePollPost";
import { useSocialStore } from "@/services/social";
import { Image, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const CreatePost = () => {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const { user } = useAuth();
  const { createPost, createPoll } = useSocialStore();

  const handleTextPost = async (content: string) => {
    if (!user) {
      toast.error("You must be logged in to post");
      return;
    }
    await createPost(content);
  };

  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'video/mp4', 'video/quicktime', 'video/webm'
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleMediaPost = async (file: File, description: string) => {
    if (!user) {
      toast.error("You must be logged in to post");
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Allowed: images, PDF, video.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    try {
      const fileType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type === 'application/pdf' 
          ? 'pdf' 
          : 'file';
      
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('post_media')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('post_media')
        .getPublicUrl(fileName);
      
      await createPost(description, publicUrl, fileType);
      
      toast.success("Post created successfully");
    } catch (error) {
      console.error("Error creating media post:", error);
      toast.error("Failed to upload file");
    }
  };

  const handlePollPost = async (question: string, options: string[]) => {
    if (!user) {
      toast.error("You must be logged in to post");
      return;
    }

    try {
      const pollId = await createPoll(question, options);
      if (!pollId) throw new Error("Failed to create poll");
      
      await createPost(question, undefined, 'poll', pollId);
      
      toast.success("Poll created successfully");
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsTextModalOpen(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-muted/40 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-200"
            >
              What's on your mind?
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 ml-[52px]">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground rounded-lg text-xs h-8"
              onClick={() => setIsMediaModalOpen(true)}
            >
              <Image className="h-4 w-4 text-emerald-400" />
              Media
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground rounded-lg text-xs h-8"
              onClick={() => setIsPollModalOpen(true)}
            >
              <BarChart2 className="h-4 w-4 text-amber-400" />
              Poll
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <CreateTextPost 
        isOpen={isTextModalOpen} 
        onClose={() => setIsTextModalOpen(false)} 
        onPost={handleTextPost} 
      />
      
      <CreateMediaPost 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onPost={handleMediaPost} 
      />
      
      <CreatePollPost 
        isOpen={isPollModalOpen} 
        onClose={() => setIsPollModalOpen(false)} 
        onPost={handlePollPost} 
      />
    </>
  );
};
