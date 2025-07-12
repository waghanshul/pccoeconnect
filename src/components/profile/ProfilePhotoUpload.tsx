import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Crop as CropIcon, X } from "lucide-react";
import { toast } from "sonner";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from "@/integrations/supabase/client";
import { useUserStore } from "@/services/user";

interface ProfilePhotoUploadProps {
  currentAvatar: string;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export const ProfilePhotoUpload = ({ currentAvatar, userName, onAvatarUpdate }: ProfilePhotoUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUserProfile } = useUserStore();

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(crop);
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        }, 'image/jpeg', 0.8);
      });
    },
    []
  );

  const uploadCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('Please select and crop an image first');
      return;
    }

    setIsUploading(true);
    
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-avatar', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      if (data.avatar_url) {
        onAvatarUpdate(data.avatar_url);
        toast.success('Profile photo updated successfully!');
        setIsOpen(false);
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!imgSrc ? (
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentAvatar} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Photo
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Select an image file (max 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Crop your photo</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDialogClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="max-h-64 overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImgSrc('');
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={uploadCroppedImage}
                  disabled={!completedCrop || isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CropIcon className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};