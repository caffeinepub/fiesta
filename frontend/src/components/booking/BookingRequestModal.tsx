import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useGetGuestEvents, useCreateBooking } from '../../hooks/useQueries';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizerId: Principal;
  organizerName: string;
}

export default function BookingRequestModal({
  isOpen,
  onClose,
  organizerId,
  organizerName,
}: BookingRequestModalProps) {
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const { data: events = [], isLoading: eventsLoading } = useGetGuestEvents();
  const createBookingMutation = useCreateBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) {
      return;
    }

    try {
      await createBookingMutation.mutateAsync({
        eventId: BigInt(selectedEventId),
        organizerId,
      });
      
      setSuccessMessage('Booking request sent successfully!');
      
      // Close modal and navigate after a short delay
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
        setSelectedEventId('');
        navigate({ to: '/guest/bookings' });
      }, 1500);
    } catch (error: any) {
      console.error('Booking error:', error);
    }
  };

  const handleClose = () => {
    if (!createBookingMutation.isPending) {
      setSuccessMessage('');
      setSelectedEventId('');
      createBookingMutation.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-navy">Book {organizerName}</DialogTitle>
          <DialogDescription>
            Select an event to request a booking with this organizer.
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {eventsLoading ? (
              <p className="text-gray-500 text-center py-4">Loading your events...</p>
            ) : events.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have any events yet. Please create an event first before booking an organizer.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="event" className="text-navy font-semibold">
                  Select Event
                </Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger id="event" className="w-full">
                    <SelectValue placeholder="Choose an event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id.toString()} value={event.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gold" />
                          <span className="capitalize">
                            {event.eventType} - {event.locationType} ({event.numberOfGuests.toString()} guests)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {createBookingMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createBookingMutation.error?.message || 'Failed to create booking. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createBookingMutation.isPending}
              >
                Cancel
              </Button>
              {events.length === 0 ? (
                <Button
                  type="button"
                  onClick={() => {
                    handleClose();
                    navigate({ to: '/guest/events' });
                  }}
                  className="bg-navy hover:bg-navy/90"
                >
                  Create Event
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!selectedEventId || createBookingMutation.isPending}
                  className="bg-navy hover:bg-navy/90"
                >
                  {createBookingMutation.isPending ? 'Sending Request...' : 'Send Booking Request'}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
