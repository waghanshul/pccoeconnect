import { supabase } from "@/integrations/supabase/client";

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export const uploadFile = async (
  file: File,
  conversationId: string,
  userId: string
): Promise<FileUploadResult | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${conversationId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('group-files')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('group-files')
      .getPublicUrl(fileName);

    // Determine file type based on extension
    let fileType = 'file';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type === 'application/pdf') fileType = 'pdf';

    return {
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('group-files')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const getFilePreviewUrl = (fileName: string): string => {
  const { data } = supabase.storage
    .from('group-files')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};