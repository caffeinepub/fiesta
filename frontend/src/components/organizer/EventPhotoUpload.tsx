import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Images, Loader2 } from 'lucide-react';
import { useUploadEventPhoto, useDeleteEventPhoto } from '../../hooks/useQueries';
import type { EventPhoto } from '../../backend';
import { getEventPhotoSrc } from '../../utils/imageUtils';

interface EventPhotoUploadProps {
  photos: EventPhoto[];
  organizerId: string;
}

function ThumbnailImage({ photo }: { photo: EventPhoto }) {
  const [errored, setErrored] = useState(false);
  const src = getEventPhotoSrc(photo);

  if (errored || !src) {
    return (
      <div className="w-full h-full bg-navy-100 flex items-center justify-center">
        <Images className="w-6 h-6 text-navy-400 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={photo.filename}
      className="w-full h-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

export default function EventPhotoUpload({ photos, organizerId }: EventPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadMutation = useUploadEventPhoto();
  const deleteMutation = useDeleteEventPhoto();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      await uploadMutation.mutateAsync({
        file,
        onProgress: (pct) => setUploadProgress(pct),
      });
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photoId: bigint) => {
    await deleteMutation.mutateAsync(photoId);
  };

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploadMutation.isPending}
        />
        <Button
          variant="outline"
          className="border-gold-400 text-gold-600 hover:bg-gold-50 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Event Photo
            </>
          )}
        </Button>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-navy-200 rounded-lg text-center gap-2">
          <Images className="w-10 h-10 text-navy-300 opacity-50" />
          <p className="text-sm text-muted-foreground">No event photos uploaded yet</p>
          <p className="text-xs text-muted-foreground opacity-70">
            Upload photos from your past events to showcase your work
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id.toString()}
              className="relative group aspect-square rounded-lg overflow-hidden border border-navy-200"
            >
              <ThumbnailImage photo={photo} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
