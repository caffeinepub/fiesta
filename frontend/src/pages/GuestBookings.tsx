import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetGuestBookings } from '../hooks/useQueries';
import GuestBookingList from '../components/booking/GuestBookingList';
import { useEffect } from 'react';

export default function GuestBookings() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: bookings, isLoading } = useGetGuestBookings();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-navy mb-8">My Bookings</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading bookings...</p>
      ) : (
        <GuestBookingList bookings={bookings || []} />
      )}
    </div>
  );
}
