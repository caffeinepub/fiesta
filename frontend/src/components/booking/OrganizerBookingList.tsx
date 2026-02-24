import type { Booking } from '../../backend';
import OrganizerBookingCard from './OrganizerBookingCard';

interface OrganizerBookingListProps {
  bookings: Booking[];
}

export default function OrganizerBookingList({ bookings }: OrganizerBookingListProps) {
  if (bookings.length === 0) {
    return <p className="text-gray-500">No booking requests yet.</p>;
  }

  const requestedBookings = bookings.filter((b) => b.bookingStatus === 'requested');
  const otherBookings = bookings.filter((b) => b.bookingStatus !== 'requested');

  return (
    <div className="space-y-8">
      {requestedBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-navy mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {requestedBookings.map((booking) => (
              <OrganizerBookingCard key={booking.id.toString()} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {otherBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-navy mb-4">Past Bookings</h2>
          <div className="space-y-4">
            {otherBookings.map((booking) => (
              <OrganizerBookingCard key={booking.id.toString()} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
