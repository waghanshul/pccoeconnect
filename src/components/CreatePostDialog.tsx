
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
            <CreateTextPost />
          </TabsContent>
          
          <TabsContent value="media">
            <CreateMediaPost />
          </TabsContent>
          
          <TabsContent value="poll">
            <CreatePollPost />
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
