import { useState } from 'react';
import type { OrganizerProfile as Organizer } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Briefcase, DollarSign, Image as ImageIcon, Calendar, ZoomIn } from 'lucide-react';
import { useGetOrganizerPortfolioImages } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import BookingRequestModal from '../booking/BookingRequestModal';

interface OrganizerCardProps {
  organizer: Organizer;
  isSelected?: boolean;
  onToggleSelection?: (organizerId: string) => void;
  onImageClick?: (imageSrc: string, allImages: string[], index: number) => void;
}

export default function OrganizerCard({ organizer, isSelected = false, onToggleSelection, onImageClick }: OrganizerCardProps) {
  const { identity } = useInternetIdentity();
  const { data: portfolioImages = [] } = useGetOrganizerPortfolioImages(organizer.userId);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const rating = Number(organizer.totalReviews) > 0 
    ? (Math.random() * 2 + 3).toFixed(1) 
    : 'N/A';

  const previewImages = portfolioImages.slice(0, 3);
  const isAuthenticated = !!identity;
  const showSelectionMode = onToggleSelection !== undefined;

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

  // Get all image sources for lightbox navigation
  const allImageSources = portfolioImages.map(img => getImageSrc(img.filename));

  const handleImageClick = (index: number) => {
    if (onImageClick && allImageSources.length > 0) {
      onImageClick(allImageSources[index], allImageSources, index);
    }
  };

  return (
    <>
      <Card className="shadow-soft hover:shadow-lg transition-shadow relative">
        {showSelectionMode && (
          <div className="absolute top-4 right-4 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(organizer.userId.toString())}
            />
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="text-xl text-navy pr-8">{organizer.companyName}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 bg-gold/10 p-2 rounded-lg">
            <Phone className="h-4 w-4 text-gold" />
            <span className="font-bold text-navy">{organizer.contactNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="h-4 w-4" />
            <span>{organizer.experienceYears.toString()} years experience</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{organizer.pricingRange}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <span className="text-sm font-semibold">{rating}</span>
            <span className="text-xs text-gray-500">({organizer.totalReviews.toString()} reviews)</span>
          </div>

          <Badge variant={organizer.availabilityStatus === 'available' ? 'default' : 'secondary'}>
            {organizer.availabilityStatus === 'available' ? 'Available' : 'Busy'}
          </Badge>

          {organizer.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{organizer.description}</p>
          )}

          {/* Portfolio Preview */}
          {previewImages.length > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Portfolio Preview</span>
                {portfolioImages.length > 3 && (
                  <span className="text-xs text-gray-500">+{portfolioImages.length - 3} more</span>
                )}
              </div>
              <div className="flex gap-2">
                {previewImages.map((image, index) => (
                  <div 
                    key={`${image.filename}-${index}`} 
                    className="flex-1 relative group cursor-pointer"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={getImageSrc(image.filename)}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-20 object-cover rounded aspect-square transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Zoom overlay indicator */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded flex items-center justify-center">
                      <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
              {onImageClick && (
                <p className="text-xs text-gray-500 mt-1 text-center">Click images to view full size</p>
              )}
            </div>
          )}

          {/* Book Now Button - Always show when authenticated */}
          {isAuthenticated && (
            <div className="pt-3 border-t">
              <Button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Request Modal */}
      <BookingRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        organizerId={organizer.userId}
        organizerName={organizer.companyName}
      />
    </>
  );
}
