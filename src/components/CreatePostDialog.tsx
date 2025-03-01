
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTextPost } from "@/components/post/CreateTextPost";
import { CreateMediaPost } from "@/components/post/CreateMediaPost";
import { CreatePollPost } from "@/components/post/CreatePollPost";
import { toast } from "sonner";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [postType, setPostType] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async () => {
    setIsSubmitting(true);
    
    // Simulate post creation
    setTimeout(() => {
      toast.success("Post created successfully!");
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  // These handlers will be passed to individual post type components
  const handleTextPost = (content: string) => {
    console.log("Text post content:", content);
    handleCreatePost();
  };

  const handleMediaPost = (file: File, description: string) => {
    console.log("Media post:", file.name, description);
    handleCreatePost();
  };

  const handlePollPost = (question: string, options: string[]) => {
    console.log("Poll post:", question, options);
    handleCreatePost();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share updates, photos, or create a poll for your college community.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={postType} onValueChange={setPostType} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="poll">Poll</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <CreateTextPost 
              isOpen={postType === "text"} 
              onClose={() => onOpenChange(false)} 
              onPost={handleTextPost} 
            />
          </TabsContent>
          
          <TabsContent value="media">
            <CreateMediaPost 
              isOpen={postType === "media"} 
              onClose={() => onOpenChange(false)} 
              onPost={handleMediaPost} 
            />
          </TabsContent>
          
          <TabsContent value="poll">
            <CreatePollPost 
              isOpen={postType === "poll"} 
              onClose={() => onOpenChange(false)} 
              onPost={handlePollPost} 
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreatePost} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
