import type { OrganizerProfile as Organizer } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, Briefcase, DollarSign, Star } from 'lucide-react';
import PortfolioGallery from './PortfolioGallery';

interface OrganizerProfileViewProps {
  organizer: Organizer;
}

export default function OrganizerProfileView({ organizer }: OrganizerProfileViewProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl text-navy">{organizer.companyName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-gold/10 p-3 rounded-lg">
            <Phone className="h-5 w-5 text-gold" />
            <span className="font-bold text-navy text-lg">{organizer.contactNumber}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-600" />
              <span>{organizer.experienceYears.toString()} years experience</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <span>{organizer.pricingRange}</span>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gold fill-gold" />
              <span>{organizer.totalReviews.toString()} reviews</span>
            </div>

            <div>
              <Badge variant={organizer.availabilityStatus === 'available' ? 'default' : 'secondary'}>
                {organizer.availabilityStatus === 'available' ? 'Available' : 'Busy'}
              </Badge>
            </div>
          </div>

          {organizer.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-navy mb-2">About</h3>
              <p className="text-gray-600">{organizer.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Gallery Section */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl text-navy">Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioGallery organizerId={organizer.userId} />
        </CardContent>
      </Card>
    </div>
  );
}
