import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OrganizerBookingList from '../components/booking/OrganizerBookingList';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function OrganizerBookingManagement() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const organizerId = identity?.getPrincipal().toString();

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
      <Button
        variant="outline"
        onClick={() => navigate({ to: '/organizer/dashboard' })}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-4xl font-bold text-navy mb-8">Booking Requests</h1>

      <OrganizerBookingList organizerId={organizerId} pageSize={10} />
    </div>
  );
}
