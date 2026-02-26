import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import type { PortfolioImage } from '../../backend';
import { getPortfolioImageSrc } from '../../utils/imageUtils';

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  organizerName?: string;
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div className="w-full h-full bg-navy-100 flex items-center justify-center">
        <ImageOff className="w-6 h-6 text-navy-400 opacity-50" />
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

function LightboxImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-navy-400 opacity-50">
        <ImageOff className="w-16 h-16 mb-2" />
        <p className="text-sm">Image unavailable</p>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="max-h-[70vh] max-w-full object-contain rounded"
      onError={() => setErrored(true)}
    />
  );
}

export default function PortfolioGallery({ images, organizerName }: PortfolioGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const validImages = images.filter((img) => !!getPortfolioImageSrc(img));

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
        <ImageOff className="w-10 h-10 text-navy-300 opacity-50" />
        <p className="text-sm text-muted-foreground">No portfolio images available</p>
      </div>
    );
  }

  const goToPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((i) => (i! > 0 ? i! - 1 : validImages.length - 1));
  };

  const goToNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((i) => (i! < validImages.length - 1 ? i! + 1 : 0));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => {
          const src = getPortfolioImageSrc(img);
          const validIdx = validImages.indexOf(img);
          return (
            <button
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border border-navy-200 hover:border-gold-400 transition-colors cursor-pointer"
              onClick={() => src && setLightboxIndex(validIdx >= 0 ? validIdx : null)}
            >
              <ThumbnailImage src={src || ''} alt={`Portfolio image ${idx + 1}`} />
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent className="max-w-3xl bg-navy-900 border-navy-700">
          <div className="flex flex-col items-center gap-4">
            <p className="text-gold-400 font-playfair text-lg">
              {organizerName ? `${organizerName} — Portfolio` : 'Portfolio'}
            </p>

            <div className="relative flex items-center justify-center w-full min-h-[300px]">
              {validImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrev}
                  className="absolute left-0 text-white hover:bg-navy-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {lightboxIndex !== null && validImages[lightboxIndex] && (
                <LightboxImage
                  src={getPortfolioImageSrc(validImages[lightboxIndex]) || ''}
                  alt={`Portfolio image ${lightboxIndex + 1}`}
                />
              )}

              {validImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-0 text-white hover:bg-navy-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {lightboxIndex !== null && (
              <p className="text-white opacity-50 text-sm">
                {lightboxIndex + 1} / {validImages.length}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
