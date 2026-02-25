import React, { useState, useEffect } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import type { PortfolioImage } from '../../backend';
import { getPortfolioImageSrc } from '../../utils/imageUtils';

interface PortfolioGalleryProps {
  images: PortfolioImage[];
  organizerName?: string;
}

export default function PortfolioGallery({ images, organizerName }: PortfolioGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i !== null ? Math.min(i + 1, images.length - 1) : null));
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i !== null ? Math.max(i - 1, 0) : null));
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm">No portfolio images yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((image, idx) => {
          const src = getPortfolioImageSrc(image);
          return (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted"
              onClick={() => setLightboxIndex(idx)}
            >
              {src ? (
                <img
                  src={src}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const existing = parent.querySelector('.img-placeholder');
                      if (!existing) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'img-placeholder w-full h-full flex items-center justify-center text-muted-foreground text-xs absolute inset-0';
                        placeholder.textContent = 'No Image';
                        parent.appendChild(placeholder);
                      }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-navy-900 rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">
                {organizerName ? `${organizerName} — ` : ''}Portfolio Image {lightboxIndex + 1} of {images.length}
              </h3>
              <button onClick={() => setLightboxIndex(null)} className="text-white hover:text-gold transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative bg-navy-800 min-h-64 flex items-center justify-center">
              <LightboxImage
                src={getPortfolioImageSrc(images[lightboxIndex])}
                alt={`Portfolio ${lightboxIndex + 1}`}
              />
            </div>
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <button
                onClick={() => setLightboxIndex(i => (i !== null ? Math.max(i - 1, 0) : null))}
                disabled={lightboxIndex === 0}
                className="flex items-center gap-1 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" /> Previous
              </button>
              <span className="text-white/50 text-sm">{lightboxIndex + 1} / {images.length}</span>
              <button
                onClick={() => setLightboxIndex(i => (i !== null ? Math.min(i + 1, images.length - 1) : null))}
                disabled={lightboxIndex === images.length - 1}
                className="flex items-center gap-1 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              >
                Next <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LightboxImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <div className="text-white/50 text-sm p-8">Image Not Found</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full max-h-[70vh] object-contain"
      onError={() => setErrored(true)}
    />
  );
}
