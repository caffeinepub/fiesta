import type { Booking } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Building2, Phone } from 'lucide-react';

interface GuestBookingListProps {
  bookings: Booking[];
}

export default function GuestBookingList({ bookings }: GuestBookingListProps) {
  if (bookings.length === 0) {
    return <p className="text-gray-500">No bookings yet. Request a booking from an organizer!</p>;
  }

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

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id.toString()} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{booking.organizerName}</CardTitle>
              <Badge variant={getStatusVariant(booking.bookingStatus)}>
                {booking.bookingStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span className="font-semibold">Contact organizer for details</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Requested: {new Date(Number(booking.bookingDate) / 1000000).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
