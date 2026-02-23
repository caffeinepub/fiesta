import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllOrganizers } from '../hooks/useQueries';
import OrganizerCard from '../components/organizer/OrganizerCard';
import { Button } from '@/components/ui/button';
import { Principal } from '@dfinity/principal';
import type { OrganizerProfile } from '../backend';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function GuestOrganizerBrowsing() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: organizers, isLoading } = useGetAllOrganizers();
  const [selectedOrganizers, setSelectedOrganizers] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<{ src: string; images: string[]; index: number } | null>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      
      if (e.key === 'Escape') {
        setLightboxImage(null);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  if (!identity) {
    return null;
  }

  const handleToggleSelection = (organizerId: string) => {
    setSelectedOrganizers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(organizerId)) {
        newSet.delete(organizerId);
      } else {
        newSet.add(organizerId);
      }
      return newSet;
    });
  };

  const handleCompare = () => {
    const selectedIds = Array.from(selectedOrganizers);
    navigate({ 
      to: '/guest/organizers/compare',
      search: { ids: selectedIds }
    });
  };

  const handleImageClick = (imageSrc: string, allImages: string[], index: number) => {
    setLightboxImage({ src: imageSrc, images: allImages, index });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const goToPrevious = () => {
    if (lightboxImage && lightboxImage.index > 0) {
      const newIndex = lightboxImage.index - 1;
      setLightboxImage({
        ...lightboxImage,
        src: lightboxImage.images[newIndex],
        index: newIndex,
      });
    }
  };

  const goToNext = () => {
    if (lightboxImage && lightboxImage.index < lightboxImage.images.length - 1) {
      const newIndex = lightboxImage.index + 1;
      setLightboxImage({
        ...lightboxImage,
        src: lightboxImage.images[newIndex],
        index: newIndex,
      });
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Find Organizers</h1>
            <p className="text-gray-600">Browse available event organizers and book directly or compare multiple options</p>
          </div>
          {selectedOrganizers.size > 0 && (
            <Button 
              onClick={handleCompare}
              className="bg-gold hover:bg-gold-dark text-navy font-semibold"
            >
              Compare Selected ({selectedOrganizers.size})
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading organizers...</p>
        ) : organizers && organizers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizers.map((organizer) => (
              <OrganizerCard
                key={organizer.userId.toString()}
                organizer={organizer}
                isSelected={selectedOrganizers.has(organizer.userId.toString())}
                onToggleSelection={handleToggleSelection}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No organizers found.</p>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxImage !== null} onOpenChange={closeLightbox}>
        <DialogContent 
          className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95 border-none"
          onPointerDownOutside={closeLightbox}
        >
          {lightboxImage && (
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-white text-lg">
                    Portfolio Image {lightboxImage.index + 1} of {lightboxImage.images.length}
                  </DialogTitle>
                  <button
                    onClick={closeLightbox}
                    className="text-white hover:text-gray-300 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div className="flex-1 flex items-center justify-center p-4 pt-16 pb-20">
                <img
                  src={lightboxImage.src}
                  alt={`Portfolio ${lightboxImage.index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext x="400" y="300" font-family="Arial" font-size="24" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Navigation Controls */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex justify-between items-center max-w-md mx-auto">
                  <Button
                    variant="ghost"
                    onClick={goToPrevious}
                    disabled={lightboxImage.index === 0}
                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-white text-sm font-medium">
                    {lightboxImage.index + 1} / {lightboxImage.images.length}
                  </span>
                  
                  <Button
                    variant="ghost"
                    onClick={goToNext}
                    disabled={lightboxImage.index === lightboxImage.images.length - 1}
                    className="text-white hover:text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Left/Right Click Areas for Navigation */}
              {lightboxImage.index > 0 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer hover:bg-white/5 transition-colors"
                  aria-label="Previous image"
                />
              )}
              {lightboxImage.index < lightboxImage.images.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-0 bottom-0 w-1/4 cursor-pointer hover:bg-white/5 transition-colors"
                  aria-label="Next image"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
