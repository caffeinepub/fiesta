import React, { useRef, useState } from 'react';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadEventPhoto, useDeleteEventPhoto } from '../../hooks/useQueries';
import type { EventPhoto } from '../../backend';
import { toast } from 'sonner';
import { getEventPhotoSrc } from '../../utils/imageUtils';

interface EventPhotoUploadProps {
  photos: EventPhoto[];
}

export default function EventPhotoUpload({ photos }: EventPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadPhoto = useUploadEventPhoto();
  const deletePhoto = useDeleteEventPhoto();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await uploadPhoto.mutateAsync({
        bytes,
        contentType: file.type || 'image/jpeg',
        filename: file.name,
      });
      toast.success('Event photo uploaded successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photoId: bigint) => {
    try {
      await deletePhoto.mutateAsync(photoId);
      toast.success('Photo deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete photo');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Event Photos</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-gold text-gold hover:bg-gold/10"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" /> Add Photo</>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {photos.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-gold/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Click to upload event photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => {
            const src = getEventPhotoSrc(photo);
            return (
              <div key={photo.id.toString()} className="relative aspect-square rounded-lg overflow-hidden group bg-muted">
                {src ? (
                  <ThumbnailImage src={src} alt={photo.filename} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
        No Image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}
