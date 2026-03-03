import { useState } from 'react';
import type { Event } from '../../backend';
import { BookingStatus } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Sparkles, Phone, CalendarDays, Lock, Pencil, Trash2 } from 'lucide-react';
import { useGetEventBookings } from '../../hooks/useQueries';
import EditEventModal from './EditEventModal';
import DeleteEventConfirmDialog from './DeleteEventConfirmDialog';

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: bookings, isLoading: bookingsLoading } = useGetEventBookings(event.id);

  const isLocked = bookings?.some((b) => b.bookingStatus === BookingStatus.approved) ?? false;

  const formatEventDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg capitalize flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              {event.eventType} Event
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              {bookingsLoading ? (
                <Skeleton className="h-6 w-16 rounded-full" />
              ) : isLocked ? (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300"
                >
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-navy-700 hover:text-navy-900 hover:bg-navy-50"
                    onClick={() => setEditOpen(true)}
                    title="Edit event"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteOpen(true)}
                    title="Delete event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-navy">
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
            <span className="font-medium">Contact: {event.contact_number}</span>
          </div>
          {event.description && (
            <p className="text-sm text-gray-600 mt-1 italic">{event.description}</p>
          )}
          {isLocked && (
            <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1">
              This event is locked because a booking has been accepted.
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Created: {new Date(Number(event.createdAt) / 1_000_000).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <EditEventModal
        event={event}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteEventConfirmDialog
        eventId={event.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

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
        <EventCard key={event.id.toString()} event={event} />
      ))}
    </div>
  );
}
