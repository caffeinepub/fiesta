import type { Booking } from '../../backend';
import { useGetEvent } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Building2, Phone, MapPin, Users, Sparkles, CalendarDays } from 'lucide-react';

interface GuestBookingListProps {
  bookings: Booking[];
}

function GuestBookingCard({ booking }: { booking: Booking }) {
  const { data: event, isLoading: eventLoading } = useGetEvent(booking.eventId);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatEventDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            {booking.organizerName}
          </CardTitle>
          <Badge variant={getStatusVariant(booking.bookingStatus)}>
            {booking.bookingStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Requested: {new Date(Number(booking.bookingDate) / 1000000).toLocaleDateString()}</span>
        </div>

        {eventLoading ? (
          <div className="text-sm text-gray-500">Loading event details...</div>
        ) : event ? (
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-navy text-sm mb-2">Event Details</h4>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="h-4 w-4 text-gold" />
              <span className="capitalize font-medium">{event.eventType} Event</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-navy font-medium">
              <CalendarDays className="h-4 w-4" />
              <span>{formatEventDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="capitalize">{event.locationType}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{event.numberOfGuests.toString()} guests</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4" />
              <span className="capitalize">{event.eventStyle} style</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span className="font-medium">Your Contact: {event.contact_number}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-500">Unable to load event details</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GuestBookingList({ bookings }: GuestBookingListProps) {
  if (bookings.length === 0) {
    return <p className="text-gray-500">No bookings yet. Request a booking from an organizer!</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <GuestBookingCard key={booking.id.toString()} booking={booking} />
      ))}
    </div>
  );
}
