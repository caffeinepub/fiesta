import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, DollarSign, Phone, FileText } from 'lucide-react';
import PortfolioGallery from './PortfolioGallery';
import type { OrganizerProfile } from '../../backend';

interface OrganizerProfileViewProps {
  profile: OrganizerProfile;
}

export default function OrganizerProfileView({ profile }: OrganizerProfileViewProps) {
  const isAvailable = profile.availabilityStatus === 'available';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-navy-200">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-2xl font-playfair text-navy-900">
                {profile.companyName}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Organizer since{' '}
                {new Date(Number(profile.createdAt) / 1_000_000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
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
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 bg-navy-50 rounded-lg">
              <Clock className="w-5 h-5 text-gold-500 mb-1" />
              <span className="text-lg font-bold text-navy-900">
                {Number(profile.experienceYears)}
              </span>
              <span className="text-xs text-muted-foreground">Years Exp.</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-navy-50 rounded-lg">
              <Star className="w-5 h-5 text-gold-500 fill-gold-500 mb-1" />
              <span className="text-lg font-bold text-navy-900">
                {Number(profile.totalReviews)}
              </span>
              <span className="text-xs text-muted-foreground">Reviews</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-navy-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-gold-500 mb-1" />
              <span className="text-sm font-bold text-navy-900 text-center">
                {profile.pricingRange}
              </span>
              <span className="text-xs text-muted-foreground">Pricing</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-navy-50 rounded-lg">
              <Phone className="w-5 h-5 text-gold-500 mb-1" />
              <span className="text-sm font-bold text-navy-900 text-center">
                {profile.contactNumber}
              </span>
              <span className="text-xs text-muted-foreground">Contact</span>
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <div className="flex gap-2">
              <FileText className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{profile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Images — only portfolio_images, never event photos */}
      <Card className="border-navy-200">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-navy-900">Portfolio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showcase images from this organizer's portfolio.
          </p>
        </CardHeader>
        <CardContent>
          <PortfolioGallery
            images={profile.portfolio_images}
            organizerName={profile.companyName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
