
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

  const handleMediaPost = async (file: File, description: string) => {
    if (!user) {
      toast.error("You must be logged in to post");
      return;
    }

    try {
      // Determine file type
      const fileType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type === 'application/pdf' 
          ? 'pdf' 
          : 'file';
      
      // Upload to Supabase Storage
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('post_media')
        .upload(fileName, file);
        
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post_media')
        .getPublicUrl(fileName);
      
      // Create post with file reference
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
      // Create poll
      const pollId = await createPoll(question, options);
      if (!pollId) throw new Error("Failed to create poll");
      
      // Create post with poll reference
      await createPost(question, undefined, 'poll', pollId);
      
      toast.success("Poll created successfully");
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Tabs defaultValue="post">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="post" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Post</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
              <TabsTrigger value="poll" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Poll</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="post">
              <div className="flex flex-col">
                <Button 
                  variant="outline" 
                  className="text-left justify-start px-4 py-6 h-auto"
                  onClick={() => setIsTextModalOpen(true)}
                >
                  What's on your mind?
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="media">
              <div className="flex flex-col">
                <Button 
                  variant="outline" 
                  className="text-left justify-start px-4 py-6 h-auto"
                  onClick={() => setIsMediaModalOpen(true)}
                >
                  Share a photo, document or link
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="poll">
              <div className="flex flex-col">
                <Button 
                  variant="outline" 
                  className="text-left justify-start px-4 py-6 h-auto"
                  onClick={() => setIsPollModalOpen(true)}
                >
                  Create a poll
                </Button>
              </div>
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
