import type { Booking } from '../../backend';
import { useUpdateBookingStatus, useGetEvent } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle, XCircle, Phone, MapPin, Users, Sparkles, CalendarDays } from 'lucide-react';
import { BookingStatus } from '../../backend';

interface OrganizerBookingCardProps {
  booking: Booking;
}

export default function OrganizerBookingCard({ booking }: OrganizerBookingCardProps) {
  const updateStatus = useUpdateBookingStatus();
  const { data: event, isLoading: eventLoading } = useGetEvent(booking.eventId);

  const handleApprove = async () => {
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: BookingStatus.approved,
      });
    } catch (err) {
      console.error('Failed to approve booking:', err);
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: BookingStatus.rejected,
      });
    } catch (err) {
      console.error('Failed to reject booking:', err);
    }
  };

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
          <CardTitle className="text-lg">Booking Request #{booking.id.toString()}</CardTitle>
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

            <div className="flex items-center gap-2 text-sm bg-gold/10 p-3 rounded-md border border-gold/20 -mx-1">
              <Phone className="h-4 w-4 text-gold" />
              <span className="font-semibold text-navy">Guest Contact: {event.contact_number}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-500">Unable to load event details</div>
        )}

        {booking.bookingStatus === 'requested' && (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={updateStatus.isPending}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={updateStatus.isPending}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
