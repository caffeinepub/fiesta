import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetGuestEvents } from '../hooks/useQueries';
import CreateEventForm from '../components/events/CreateEventForm';
import EventList from '../components/events/EventList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useEffect } from 'react';

export default function GuestEventManagement() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();
  const { data: events, isLoading } = useGetGuestEvents(principalId);

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
      <h1 className="text-4xl font-bold text-navy mb-8">My Events</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl text-navy">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateEventForm />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl text-navy">Your Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Loading events...</p>
            ) : (
              <EventList events={events || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
