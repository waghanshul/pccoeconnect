
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTextPost } from "@/components/post/CreateTextPost";
import { CreateMediaPost } from "@/components/post/CreateMediaPost";
import { CreatePollPost } from "@/components/post/CreatePollPost";
import { useSocialStore } from "@/services/social";
import { File, Image, MessageSquare, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
        <CardContent className="pt-5 pb-4">
          <Tabs defaultValue="post">
            <TabsList className="grid grid-cols-3 mb-4 bg-muted/50">
              <TabsTrigger value="post" className="flex items-center gap-2 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Post</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2 text-xs sm:text-sm">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
              <TabsTrigger value="poll" className="flex items-center gap-2 text-xs sm:text-sm">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Poll</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="post">
              <Button 
                variant="outline" 
                className="w-full text-left justify-start px-4 py-5 h-auto text-muted-foreground hover:text-foreground"
                onClick={() => setIsTextModalOpen(true)}
              >
                What's on your mind?
              </Button>
            </TabsContent>
            
            <TabsContent value="media">
              <Button 
                variant="outline" 
                className="w-full text-left justify-start px-4 py-5 h-auto text-muted-foreground hover:text-foreground"
                onClick={() => setIsMediaModalOpen(true)}
              >
                Share a photo, document or link
              </Button>
            </TabsContent>
            
            <TabsContent value="poll">
              <Button 
                variant="outline" 
                className="w-full text-left justify-start px-4 py-5 h-auto text-muted-foreground hover:text-foreground"
                onClick={() => setIsPollModalOpen(true)}
              >
                Create a poll
              </Button>
            </TabsContent>
          </Tabs>
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
