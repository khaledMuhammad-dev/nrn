'use client';

import { useRef, useState, useCallback } from 'react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  path: string;
  accept?: string;
  onUploadComplete: (url: string) => void;
  label?: string;
  preview?: string;
  className?: string;
}

export function FileUpload({ path, accept = 'image/*,.pdf', onUploadComplete, label, preview, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    const filename = `${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, `${path}/${filename}`);
    const task = uploadBytesResumable(fileRef, file);

    task.on(
      'state_changed',
      (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => { console.error(err); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setPreviewUrl(URL.createObjectURL(file));
        onUploadComplete(url);
        setUploading(false);
        setProgress(100);
      }
    );
  }, [path, onUploadComplete]);

  const handleFile = (file: File | undefined) => {
    if (file) upload(file);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {previewUrl ? (
        <div className="relative w-full">
          <img src={previewUrl} alt="Preview" className="h-32 w-full rounded object-cover" />
          <button
            onClick={() => { setPreviewUrl(null); setProgress(0); }}
            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-1 text-sm font-medium">{label ?? 'Click or drag to upload'}</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP, PDF</p>
        </div>
      )}

      {uploading && (
        <div className="mt-2 w-full">
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {!previewUrl && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          type="button"
        >
          <Upload className="mr-1 h-3 w-3" />
          {uploading ? `Uploading ${Math.round(progress)}%` : 'Select File'}
        </Button>
      )}
    </div>
  );
}
