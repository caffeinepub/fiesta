import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetOrganizer } from '../hooks/useQueries';
import OrganizerProfileForm from '../components/organizer/OrganizerProfileForm';
import OrganizerProfileView from '../components/organizer/OrganizerProfileView';
import PortfolioUpload from '../components/organizer/PortfolioUpload';
import PortfolioGallery from '../components/organizer/PortfolioGallery';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: organizer, isLoading, isFetched } = useGetOrganizer(identity?.getPrincipal() || null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  const hasProfile = !!organizer;
  const showForm = !hasProfile || isEditing;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-navy">Organizer Dashboard</h1>
        {hasProfile && (
          <Button onClick={() => navigate({ to: '/organizer/bookings' })}>
            View Booking Requests
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading profile...</p>
      ) : showForm ? (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl text-navy">
              {hasProfile ? 'Edit Your Profile' : 'Create Your Organizer Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrganizerProfileForm 
              existingProfile={organizer || undefined}
              onSuccess={() => {
                setIsEditing(false);
              }}
            />
            {hasProfile && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                className="mt-4 w-full"
              >
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div>
            <OrganizerProfileView organizer={organizer} />
            <Button onClick={() => setIsEditing(true)} className="mt-4">
              Edit Profile
            </Button>
          </div>

          {/* Portfolio Management Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy">Portfolio Management</h2>
            
            <PortfolioUpload />
            
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl text-navy">Your Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioGallery organizerId={identity.getPrincipal()} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
