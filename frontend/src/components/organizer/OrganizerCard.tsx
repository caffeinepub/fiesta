import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign, Images, CalendarCheck } from 'lucide-react';
import BookingRequestModal from '../booking/BookingRequestModal';
import type { OrganizerProfile } from '../../backend';
import { getPortfolioImageSrc } from '../../utils/imageUtils';

interface OrganizerCardProps {
  organizer: OrganizerProfile;
  onViewWork?: () => void;
}

export default function OrganizerCard({ organizer, onViewWork }: OrganizerCardProps) {
  const [bookingOpen, setBookingOpen] = useState(false);

  const isAvailable = organizer.availabilityStatus === 'available';

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-navy-200">
        {/* Portfolio preview strip — shows portfolio images only */}
        {organizer.portfolio_images.length > 0 && (
          <div className="flex h-24 overflow-hidden">
            {organizer.portfolio_images.slice(0, 3).map((img, idx) => {
              const src = getPortfolioImageSrc(img);
              return src ? (
                <img
                  key={idx}
                  src={src}
                  alt={`Portfolio ${idx + 1}`}
                  className="flex-1 object-cover"
                />
              ) : null;
            })}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-playfair text-navy-900">
              {organizer.companyName}
            </CardTitle>
            <Badge
              variant={isAvailable ? 'default' : 'secondary'}
              className={
                isAvailable
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-600'
              }
            >
              {isAvailable ? 'Available' : 'Busy'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{organizer.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-gold-500" />
              <span>{Number(organizer.experienceYears)} yrs exp</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5 text-gold-500" />
              <span>{organizer.pricingRange}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
              <span>{Number(organizer.totalReviews)} reviews</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-gold-500" />
              <span className="truncate">{organizer.contactNumber}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {onViewWork && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gold-500 text-gold-700 hover:bg-gold-50 hover:text-gold-800 gap-1"
                onClick={onViewWork}
              >
                <Images className="w-3.5 h-3.5" />
                View Work
              </Button>
            )}
            <Button
              size="sm"
              className={`flex-1 bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-1 ${!onViewWork ? 'w-full' : ''}`}
              onClick={() => setBookingOpen(true)}
              disabled={!isAvailable}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingRequestModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        organizerId={organizer.userId.toString()}
        organizerName={organizer.companyName}
      />
    </>
  );
}
