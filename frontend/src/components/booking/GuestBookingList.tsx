import type { Booking } from '../../backend';
import { useGetEvent } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Building2,
  Phone,
  MapPin,
  Users,
  Sparkles,
  CalendarDays,
  CalendarX,
  Search,
} from 'lucide-react';

interface GuestBookingListProps {
  bookings: Booking[];
}

type StatusConfig = {
  label: string;
  className: string;
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'approved':
      return {
        label: 'Accepted',
        className:
          'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className:
          'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
      };
    case 'completed':
      return {
        label: 'Completed',
        className:
          'bg-navy-100 text-navy-800 border-navy-200 hover:bg-navy-100',
      };
    default:
      // requested
      return {
        label: 'Requested',
        className:
          'bg-gold-100 text-gold-800 border-gold-200 hover:bg-gold-100',
      };
  }
}

function formatEventDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBookingDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function EventDetailsSkeleton() {
  return (
    <div className="space-y-2 bg-muted/50 p-4 rounded-lg border border-border">
      <Skeleton className="h-4 w-32 mb-3" />
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

function GuestBookingCard({ booking }: { booking: Booking }) {
  const { data: event, isLoading: eventLoading, isError: eventError } = useGetEvent(booking.eventId);
  const statusConfig = getStatusConfig(booking.bookingStatus as string);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg flex items-center gap-2 text-navy-900">
            <Building2 className="h-5 w-5 text-gold-600 shrink-0" />
            <span>{booking.organizerName}</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${statusConfig.className}`}
          >
            {statusConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Requested on {formatBookingDate(booking.bookingDate)}</span>
        </div>
      </CardHeader>

      <CardContent>
        {eventLoading ? (
          <EventDetailsSkeleton />
        ) : eventError || !event ? (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <CalendarX className="h-4 w-4 shrink-0" />
            <span>Unable to load event details for this booking.</span>
          </div>
        ) : (
          <div className="space-y-2.5 bg-muted/40 p-4 rounded-lg border border-border/60">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Event Details
            </p>

            <div className="flex items-center gap-2 text-sm text-foreground">
              <Sparkles className="h-4 w-4 text-gold-600 shrink-0" />
              <span className="font-medium">{capitalize(event.eventType)} Event</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-navy-800 font-medium">
              <CalendarDays className="h-4 w-4 text-navy-600 shrink-0" />
              <span>{formatEventDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{capitalize(event.locationType)} venue</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>{event.numberOfGuests.toString()} guests</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{capitalize(event.eventStyle)} style</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>Contact: {event.contact_number}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GuestBookingList({ bookings }: GuestBookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-full bg-gold-50 mb-4">
          <Search className="h-8 w-8 text-gold-500" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No bookings yet</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          You haven't made any booking requests yet. Browse organizers to find the perfect match
          for your event and get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <GuestBookingCard key={booking.id.toString()} booking={booking} />
      ))}
    </div>
  );
}
