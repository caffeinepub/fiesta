import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllOrganizers } from '../hooks/useQueries';
import OrganizerCard from '../components/organizer/OrganizerCard';
import { Button } from '@/components/ui/button';
import type { OrganizerProfile, PortfolioImage } from '../backend';
import { getPortfolioImageSrc } from '../utils/imageUtils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function GuestOrganizerBrowsing() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: organizers, isLoading } = useGetAllOrganizers();
  const [selectedOrganizers, setSelectedOrganizers] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{
    images: PortfolioImage[];
    index: number;
  } | null>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  if (!identity) return null;

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
      search: { ids: selectedIds },
    });
  };

  const handleImageClick = (images: PortfolioImage[], index: number) => {
    setLightbox({ images, index });
  };

  const closeLightbox = () => setLightbox(null);

  const goToPrevious = () => {
    if (lightbox && lightbox.index > 0) {
      setLightbox({ ...lightbox, index: lightbox.index - 1 });
    }
  };

  const goToNext = () => {
    if (lightbox && lightbox.index < lightbox.images.length - 1) {
      setLightbox({ ...lightbox, index: lightbox.index + 1 });
    }
  };

  const currentSrc =
    lightbox ? getPortfolioImageSrc(lightbox.images[lightbox.index]) : null;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Find Organizers</h1>
            <p className="text-gray-600">
              Browse available event organizers and book directly or compare multiple options
            </p>
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
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full rounded-xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">
                Portfolio Image {lightbox.index + 1} of {lightbox.images.length}
              </h3>
              <button
                onClick={closeLightbox}
                className="text-white hover:text-gold transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Image */}
            <div className="relative bg-navy-800 min-h-64 flex items-center justify-center">
              <LightboxImage src={currentSrc} alt={`Portfolio ${lightbox.index + 1}`} />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <button
                onClick={goToPrevious}
                disabled={lightbox.index === 0}
                className="flex items-center gap-1 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" /> Previous
              </button>
              <span className="text-white/50 text-sm">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
              <button
                onClick={goToNext}
                disabled={lightbox.index === lightbox.images.length - 1}
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
