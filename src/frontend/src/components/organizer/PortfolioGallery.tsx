import { useState } from 'react';
import { useGetOrganizerPortfolioImages } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { Principal } from '@dfinity/principal';

interface PortfolioGalleryProps {
  organizerId: Principal;
}

export default function PortfolioGallery({ organizerId }: PortfolioGalleryProps) {
  const { data: images = [], isLoading } = useGetOrganizerPortfolioImages(organizerId);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Helper function to get image source
  const getImageSrc = (filename: string): string => {
    // First check if it's in sessionStorage (recently uploaded)
    const cachedUrl = sessionStorage.getItem(`portfolio_${filename}`);
    if (cachedUrl) {
      return cachedUrl;
    }
    // Otherwise use the static assets path
    return `/assets/portfolios/${filename}`;
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading portfolio...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">No portfolio images yet</p>
        <p className="text-sm text-gray-500 mt-1">Upload images to showcase your work</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.filename}-${index}`}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
            onClick={() => openLightbox(index)}
          >
            <img
              src={getImageSrc(image.filename)}
              alt={`Portfolio ${index + 1}`}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext x="150" y="150" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Portfolio Image {selectedImageIndex !== null ? selectedImageIndex + 1 : ''} of {images.length}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImageIndex !== null && (
            <div className="relative">
              <img
                src={getImageSrc(images[selectedImageIndex].filename)}
                alt={`Portfolio ${selectedImageIndex + 1}`}
                className="w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext x="400" y="300" font-family="Arial" font-size="24" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                }}
              />
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  {selectedImageIndex + 1} / {images.length}
                </span>
                
                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={selectedImageIndex === images.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
