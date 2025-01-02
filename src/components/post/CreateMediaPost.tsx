import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface CreateMediaPostProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (file: File, description: string) => void;
}

export const CreateMediaPost = ({ isOpen, onClose, onPost }: CreateMediaPostProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    onPost(file, description);
    setFile(null);
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp4"
            />
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {file ? file.name : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, XLS, PNG, JPG, GIF, MP4
            </p>
          </div>
          <Textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Share</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};