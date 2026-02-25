import React, { useState } from 'react';
import { Clock, DollarSign, Users, Phone, ZoomIn, Star } from 'lucide-react';
import type { OrganizerProfile, PortfolioImage } from '../../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookingRequestModal from '../booking/BookingRequestModal';
import { getPortfolioImageSrc } from '../../utils/imageUtils';

interface OrganizerCardProps {
  organizer: OrganizerProfile;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  // Legacy prop from GuestOrganizerBrowsing — kept for compatibility
  onToggleSelection?: (organizerId: string) => void;
  onImageClick?: (images: PortfolioImage[], index: number) => void;
}

export default function OrganizerCard({
  organizer,
  isSelected,
  onSelect,
  onToggleSelection,
  onImageClick,
}: OrganizerCardProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const previewImages = organizer.portfolio_images.slice(0, 3);

  const handleSelectChange = (checked: boolean) => {
    if (onSelect) onSelect(checked);
    if (onToggleSelection) onToggleSelection(organizer.userId.toString());
  };

  return (
    <div
      className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected ? 'ring-2 ring-gold border-gold' : 'border-border hover:border-gold/50'
      }`}
    >
      {/* Portfolio Preview */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {previewImages.length > 0 ? (
          <div
            className={`grid h-full ${
              previewImages.length === 1
                ? 'grid-cols-1'
                : previewImages.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
            } gap-0.5`}
          >
            {previewImages.map((image, idx) => {
              const src = getPortfolioImageSrc(image);
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden cursor-pointer group bg-muted"
                  onClick={() => onImageClick?.(organizer.portfolio_images, idx)}
                >
                  {src ? (
                    <ThumbnailImage src={src} alt={`Portfolio ${idx + 1}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">No portfolio images</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
          Click images to view full size
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{organizer.companyName}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-gold" />
              <span className="text-sm font-bold text-gold">{organizer.contactNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={organizer.availabilityStatus === 'available' ? 'default' : 'secondary'}
            >
              {organizer.availabilityStatus === 'available' ? 'Available' : 'Busy'}
            </Badge>
            {(onSelect || onToggleSelection) && (
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={(e) => handleSelectChange(e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
            <Clock className="h-3 w-3 text-gold mb-1" />
            <span className="font-semibold">{organizer.experienceYears.toString()}yr</span>
            <span className="text-muted-foreground">Exp</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
            <DollarSign className="h-3 w-3 text-gold mb-1" />
            <span className="font-semibold text-center leading-tight">{organizer.pricingRange}</span>
            <span className="text-muted-foreground">Price</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
            <Star className="h-3 w-3 text-gold mb-1" />
            <span className="font-semibold">{organizer.totalReviews.toString()}</span>
            <span className="text-muted-foreground">Reviews</span>
          </div>
        </div>

        {/* Description */}
        {organizer.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{organizer.description}</p>
        )}

        {/* Book Now Button */}
        <Button
          className="w-full bg-navy text-white hover:bg-navy/90"
          onClick={() => setBookingModalOpen(true)}
        >
          <Clock className="h-4 w-4 mr-2" />
          Book Now
        </Button>
      </div>

      <BookingRequestModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        organizerId={organizer.userId.toString()}
        organizerName={organizer.companyName}
      />
    </div>
  );
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">
        No Image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform group-hover:scale-105"
      onError={() => setErrored(true)}
    />
  );
}
