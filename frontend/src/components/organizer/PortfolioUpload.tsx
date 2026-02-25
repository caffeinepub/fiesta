import React, { useRef, useState } from 'react';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddPortfolioImage, useDeletePortfolioImage } from '../../hooks/useQueries';
import type { PortfolioImage } from '../../backend';
import { toast } from 'sonner';
import { getPortfolioImageSrc } from '../../utils/imageUtils';

interface PortfolioUploadProps {
  images: PortfolioImage[];
  organizerId: string;
}

export default function PortfolioUpload({ images, organizerId }: PortfolioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const addImage = useAddPortfolioImage();
  const deleteImage = useDeletePortfolioImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await addImage.mutateAsync({ bytes, filename: file.name });
      toast.success('Portfolio image uploaded successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await deleteImage.mutateAsync(filename);
      toast.success('Image deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete image');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Portfolio Images</h3>
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
            <><Upload className="h-4 w-4 mr-2" /> Add Image</>
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

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-gold/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Click to upload portfolio images</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, idx) => {
            const src = getPortfolioImageSrc(image);
            return (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group bg-muted">
                {src ? (
                  <ThumbnailImage src={src} alt={`Portfolio ${idx + 1}`} />
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
                    onClick={() => handleDelete(image.filename)}
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
