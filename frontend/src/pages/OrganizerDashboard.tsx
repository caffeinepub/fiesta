import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetOrganizerProfile,
  useGetCallerPortfolioImages,
  useGetEventPhotos,
  useGetOrganizerBookings,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import OrganizerProfileForm from '../components/organizer/OrganizerProfileForm';
import OrganizerProfileView from '../components/organizer/OrganizerProfileView';
import PortfolioUpload from '../components/organizer/PortfolioUpload';
import EventPhotoUpload from '../components/organizer/EventPhotoUpload';
import OrganizerBookingList from '../components/booking/OrganizerBookingList';
import { Button } from '@/components/ui/button';
import { Edit2, Images, Camera, AlertCircle, CalendarDays } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function OrganizerDashboard() {
  const { identity } = useInternetIdentity();
  const organizerId = identity?.getPrincipal().toString();

  // Use the caller-specific endpoint that returns null (not trap) when no profile exists
  const {
    data: organizer,
    isLoading: organizerLoading,
    isFetched: organizerFetched,
    error: organizerError,
  } = useGetOrganizerProfile();

  // Use the caller-specific portfolio images endpoint
  const {
    data: portfolioImages = [],
    isLoading: portfolioLoading,
  } = useGetCallerPortfolioImages();

  // Event photos — gracefully returns [] if no organizer profile yet
  const {
    data: eventPhotos = [],
    isLoading: photosLoading,
  } = useGetEventPhotos();

  // Organizer's incoming booking requests
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
  } = useGetOrganizerBookings(organizerId);

  const [isEditing, setIsEditing] = useState(false);

  // Not logged in
  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-playfair font-bold text-navy-900 mb-2">Please Log In</h2>
          <p className="text-muted-foreground">
            You need to be logged in to access your organizer dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Loading state — wait for the profile query to complete
  if (organizerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-900" />
          <p className="text-muted-foreground text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // Error state — show a descriptive message instead of blank screen
  if (organizerError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load dashboard</AlertTitle>
          <AlertDescription>
            {organizerError instanceof Error
              ? organizerError.message
              : 'An unexpected error occurred. Please refresh the page and try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-navy-900">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, portfolio, and event photos.
            </p>
          </div>
          {organizer && !isEditing && (
            <Button
              variant="outline"
              className="border-navy-300 text-navy-700 hover:bg-navy-50 gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Section */}
        {!organizer || isEditing ? (
          <Card className="border-navy-200">
            <CardHeader>
              <CardTitle className="font-playfair text-navy-900">
                {organizer ? 'Edit Profile' : 'Create Your Profile'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizerProfileForm
                existingProfile={organizer ?? undefined}
                onSuccess={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <OrganizerProfileView profile={organizer} />
        )}

        {/* Only show upload sections and bookings if organizer profile exists */}
        {organizer && (
          <>
            <Separator className="border-navy-100" />

            {/* ── Booking Requests Section ── */}
            <Card className="border-navy-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-gold-500" />
                  <CardTitle className="font-playfair text-navy-900">Booking Requests</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review and manage incoming booking requests from guests.
                </p>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy-900" />
                  </div>
                ) : (
                  <OrganizerBookingList bookings={bookings} />
                )}
              </CardContent>
            </Card>

            <Separator className="border-navy-100" />

            {/* ── Portfolio Images Section ── */}
            <Card className="border-navy-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Images className="w-5 h-5 text-gold-500" />
                  <CardTitle className="font-playfair text-navy-900">Portfolio Images</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Showcase your best work. These images appear on your public profile.
                </p>
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy-900" />
                  </div>
                ) : (
                  <PortfolioUpload
                    images={portfolioImages}
                    organizerId={organizerId!}
                  />
                )}
              </CardContent>
            </Card>

            <Separator className="border-navy-100" />

            {/* ── Events Photos Section ── */}
            <Card className="border-navy-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gold-500" />
                  <CardTitle className="font-playfair text-navy-900">Events Photos</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload photos from your past events. Customers can preview these when browsing
                  organisers.
                </p>
              </CardHeader>
              <CardContent>
                {photosLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy-900" />
                  </div>
                ) : (
                  <EventPhotoUpload
                    photos={eventPhotos}
                    organizerId={organizerId!}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
