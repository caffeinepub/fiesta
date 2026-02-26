import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Images } from 'lucide-react';
import { useGetOrganizerEventPhotos } from '../../hooks/useQueries';
import type { EventPhoto } from '../../backend';

interface EventPhotoLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId: string;
  organizerName: string;
}

function getEventPhotoUrl(photo: EventPhoto): string {
  try {
    return photo.blob.getDirectURL();
  } catch {
    return '';
  }
}

function PhotoThumbnail({
  photo,
  isActive,
  onClick,
}: {
  photo: EventPhoto;
  isActive: boolean;
  onClick: () => void;
}) {
  const [errored, setErrored] = useState(false);
  const url = getEventPhotoUrl(photo);

  return (
    <button
      onClick={onClick}
      className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
        isActive ? 'border-gold-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
      }`}
    >
      {!errored && url ? (
        <img
          src={url}
          alt={photo.filename}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="w-full h-full bg-navy-800 flex items-center justify-center">
          <Images className="w-4 h-4 text-gold-400 opacity-50" />
        </div>
      )}
    </button>
  );
}

function LightboxImage({ photo }: { photo: EventPhoto }) {
  const [errored, setErrored] = useState(false);
  const url = getEventPhotoUrl(photo);

  if (!errored && url) {
    return (
      <img
        src={url}
        alt={photo.filename}
        className="max-h-[60vh] max-w-full object-contain rounded-lg"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-gold-400 opacity-50">
      <Images className="w-16 h-16 mb-2" />
      <p className="text-sm">Image unavailable</p>
    </div>
  );
}

export default function EventPhotoLightbox({
  open,
  onOpenChange,
  organizerId,
  organizerName,
}: EventPhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: photos = [], isLoading } = useGetOrganizerEventPhotos(
    open ? organizerId : undefined,
  );

  // Reset index when organizer changes or dialog opens
  useEffect(() => {
    setCurrentIndex(0);
  }, [organizerId, open]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, goToPrev, goToNext, onOpenChange]);

  const currentPhoto = photos[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-navy-900 border-navy-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold-400 font-playfair text-xl flex items-center gap-2">
            <Images className="w-5 h-5" />
            {organizerName} — Event Photos
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-400" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <Images className="w-16 h-16 text-gold-400 opacity-40" />
            <p className="text-lg font-semibold text-white opacity-70">No event photos available</p>
            <p className="text-sm text-white opacity-40">
              This organizer hasn't uploaded any event photos yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative flex items-center justify-center bg-navy-800 rounded-lg min-h-[300px] p-4">
              {photos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-navy-700 z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {currentPhoto && <LightboxImage photo={currentPhoto} />}

              {photos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-navy-700 z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Photo info */}
            {currentPhoto && (
              <div className="text-center text-sm text-white opacity-60">
                {currentPhoto.filename} &nbsp;·&nbsp; {currentIndex + 1} / {photos.length}
              </div>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap">
                {photos.map((photo, idx) => (
                  <PhotoThumbnail
                    key={photo.id.toString()}
                    photo={photo}
                    isActive={idx === currentIndex}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
