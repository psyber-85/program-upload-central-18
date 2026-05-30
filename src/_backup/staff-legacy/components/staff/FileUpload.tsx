import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  bucket: string;
  folder?: string;
  onUpload: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  existingUrl?: string;
  onRemove?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder = '',
  onUpload,
  accept = 'image/*,.pdf',
  maxSizeMB = 5,
  label = 'Upload Document',
  existingUrl,
  onRemove,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ 
        title: `File too large`, 
        description: `Maximum size is ${maxSizeMB}MB`,
        variant: 'destructive' 
      });
      return;
    }

    setIsUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const uniqueName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniqueName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setFileName(file.name);
      onUpload(urlData.publicUrl);
      toast({ title: 'File uploaded successfully!' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload failed', 
        description: error.message || 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  };

  const getFileIcon = () => {
    if (fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || existingUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  if (existingUrl || fileName) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          {getFileIcon()}
          <span className="flex-1 text-sm truncate">
            {fileName || 'Uploaded file'}
          </span>
          {existingUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={existingUrl} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Max {maxSizeMB}MB. Accepted: images, PDF
      </p>
    </div>
  );
};

export default FileUpload;
