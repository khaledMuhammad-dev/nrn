'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  path: string;
  accept?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
  label?: string;
  preview?: string;
  className?: string;
}

export function FileUpload({ path, accept = 'image/*,.pdf', onUploadComplete, onDelete, label, preview, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(preview ?? null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preview) {
      setPreviewUrl(preview);
      setUploadedUrl(preview);
    }
  }, [preview]);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(30);
    const filePath = `${path}/${Date.now()}_${file.name}`;
    const form = new FormData();
    form.append('file', file);
    form.append('path', filePath);
    try {
      setProgress(60);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedUrl(json.data.url);
      onUploadComplete(json.data.url);
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [path, onUploadComplete]);

  const handleDelete = async () => {
    if (uploadedUrl) {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadedUrl }),
      }).catch(() => {});
    }
    setPreviewUrl(null);
    setUploadedUrl(null);
    setProgress(0);
    onDelete?.();
  };

  const handleFile = (file: File | undefined) => { if (file) upload(file); };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        !previewUrl && !uploading && 'cursor-pointer',
        className
      )}
      onClick={() => { if (!previewUrl && !uploading) inputRef.current?.click(); }}
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
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="pointer-events-none text-center">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-1 text-sm font-medium">{label ?? 'Click or drag to upload'}</p>
          <p className="text-xs text-muted-foreground">{accept.includes('pdf') ? 'JPG, PNG, WebP, PDF' : 'JPG, PNG, WebP'}</p>
        </div>
      )}

      {uploading && (
        <div className="mt-2 w-full">
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
