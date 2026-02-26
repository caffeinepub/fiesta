import React, { useState } from 'react';
import { useGetAllOrganizers } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OrganizerCard from '../components/organizer/OrganizerCard';
import EventPhotoLightbox from '../components/organizer/EventPhotoLightbox';
import type { OrganizerProfile } from '../backend';

export default function GuestOrganizerBrowsing() {
  const { identity } = useInternetIdentity();
  const { data: organizers = [], isLoading } = useGetAllOrganizers();
  const [viewWorkOrganizer, setViewWorkOrganizer] = useState<OrganizerProfile | null>(null);

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-playfair font-bold text-navy-900 mb-2">
            Please Log In
          </h2>
          <p className="text-muted-foreground">
            You need to be logged in to browse organizers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-navy-900 mb-2">
            Find Organisers
          </h1>
          <p className="text-muted-foreground">
            Browse and connect with professional event organisers.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-900" />
          </div>
        ) : organizers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No organisers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizers.map((organizer) => (
              <OrganizerCard
                key={organizer.userId.toString()}
                organizer={organizer}
                onViewWork={() => setViewWorkOrganizer(organizer)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Photo Lightbox */}
      {viewWorkOrganizer && (
        <EventPhotoLightbox
          open={!!viewWorkOrganizer}
          onOpenChange={(open) => {
            if (!open) setViewWorkOrganizer(null);
          }}
          organizerId={viewWorkOrganizer.userId.toString()}
          organizerName={viewWorkOrganizer.companyName}
        />
      )}
    </div>
  );
}
