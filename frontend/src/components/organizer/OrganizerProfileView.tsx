import type { OrganizerProfile } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, Briefcase, DollarSign, Star, FileText } from 'lucide-react';
import PortfolioGallery from './PortfolioGallery';

interface OrganizerProfileViewProps {
  organizer: OrganizerProfile;
}

export default function OrganizerProfileView({ organizer }: OrganizerProfileViewProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl text-navy">{organizer.companyName}</CardTitle>
            <Badge
              variant={organizer.availabilityStatus === 'available' ? 'default' : 'secondary'}
            >
              {organizer.availabilityStatus === 'available' ? 'Available' : 'Busy'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 bg-gold/10 p-3 rounded-lg border border-gold/20">
            <Phone className="h-5 w-5 text-gold" />
            <div>
              <p className="text-xs text-gray-500">Contact Number</p>
              <p className="font-bold text-navy text-lg">{organizer.contactNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Experience</p>
                <p className="font-semibold">{organizer.experienceYears.toString()} years</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Pricing</p>
                <p className="font-semibold">{organizer.pricingRange}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <div>
                <p className="text-xs text-gray-500">Reviews</p>
                <p className="font-semibold">{organizer.totalReviews.toString()}</p>
              </div>
            </div>
          </div>

          {organizer.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-700">{organizer.description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Gallery — pass images directly from the profile */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl text-navy">Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioGallery images={organizer.portfolio_images} organizerName={organizer.companyName} />
        </CardContent>
      </Card>
    </div>
  );
}
