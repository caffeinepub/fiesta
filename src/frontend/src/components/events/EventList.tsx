import type { Event } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, MapPin, Users, Sparkles, Phone } from 'lucide-react';

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return <p className="text-gray-500">No events yet. Create your first event!</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id.toString()} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg capitalize flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              {event.eventType} Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
              <span className="font-medium">Your Contact Number: {event.contact_number}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(Number(event.createdAt) / 1000000).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
