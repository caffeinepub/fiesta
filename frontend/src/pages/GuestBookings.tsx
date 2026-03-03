import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBookingsByGuest } from '../hooks/useQueries';
import GuestBookingList from '../components/booking/GuestBookingList';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck } from 'lucide-react';

function GuestBookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GuestBookings() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: bookings, isLoading: bookingsLoading } = useGetBookingsByGuest();

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: '/' });
    }
  }, [identity, isInitializing, navigate]);

  // While auth is initializing, show nothing to avoid flash
  if (isInitializing) {
    return null;
  }

  // Not authenticated — redirect handled by useEffect, show nothing
  if (!identity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-gold-100">
          <CalendarCheck className="h-6 w-6 text-gold-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-display">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track the status of your booking requests
          </p>
        </div>
      </div>

      {bookingsLoading ? (
        <GuestBookingsSkeleton />
      ) : (
        <GuestBookingList bookings={bookings || []} />
      )}
    </div>
  );
}
