import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadStubProps {
  label?: string;
  accept?: string;
  onUpload?: (file: File) => void;
}

export function FileUploadStub({ 
  label = 'Upload file', 
  accept = '.pdf,.doc,.docx',
  onUpload 
}: FileUploadStubProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      onUpload?.(droppedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onUpload?.(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
        <File className="h-8 w-8 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={removeFile}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        'hover:border-primary/50'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Drag and drop your file here, or
      </p>
      <label>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />
        <Button variant="outline" size="sm" asChild>
          <span className="cursor-pointer">{label}</span>
        </Button>
      </label>
    </div>
  );
}
