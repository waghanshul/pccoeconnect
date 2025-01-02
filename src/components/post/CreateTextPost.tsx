import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreateTextPostProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string) => void;
}

export const CreateTextPost = ({ isOpen, onClose, onPost }: CreateTextPostProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }
    onPost(content);
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Text Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Post</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};