import { useState, useEffect } from 'react';
import { useUpdateEvent } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EventType, LocationType, EventStyle } from '../../backend';
import type { Event } from '../../backend';
import { Loader2 } from 'lucide-react';

interface EditEventModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEventModal({ event, open, onOpenChange }: EditEventModalProps) {
  const [eventType, setEventType] = useState<EventType>(EventType.wedding);
  const [locationType, setLocationType] = useState<LocationType>(LocationType.home);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [eventStyle, setEventStyle] = useState<EventStyle>(EventStyle.family);
  const [contactNumber, setContactNumber] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const updateEvent = useUpdateEvent();

  // Pre-fill form when event changes
  useEffect(() => {
    if (event) {
      setEventType(event.eventType as EventType);
      setLocationType(event.locationType as LocationType);
      setNumberOfGuests(event.numberOfGuests.toString());
      setEventStyle(event.eventStyle as EventStyle);
      setContactNumber(event.contact_number);
      setDescription(event.description || '');
      setError('');

      // Convert nanosecond timestamp to YYYY-MM-DD
      const dateMs = Number(event.date) / 1_000_000;
      const d = new Date(dateMs);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setEventDate(`${year}-${month}-${day}`);
    }
  }, [event]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!event) return;
    setError('');

    const guests = parseInt(numberOfGuests);
    if (isNaN(guests) || guests <= 0) {
      setError('Please enter a valid number of guests');
      return;
    }

    if (!contactNumber.trim()) {
      setError('Please enter your contact number');
      return;
    }

    if (!eventDate) {
      setError('Please select an event date');
      return;
    }

    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Cannot set event date in the past. Please select today or a future date.');
      return;
    }

    try {
      const dateTimestamp = BigInt(selectedDate.getTime() * 1_000_000);

      await updateEvent.mutateAsync({
        eventId: event.id,
        eventType,
        locationType,
        numberOfGuests: BigInt(guests),
        eventStyle,
        contact_number: contactNumber,
        date: dateTimestamp,
        description,
        image: null,
      });

      onOpenChange(false);
    } catch (err: any) {
      const msg: string = err?.message ?? 'Failed to update event';
      if (msg.includes('accepted bookings')) {
        setError('This event cannot be edited because a booking has been accepted.');
      } else if (msg.includes('Only the event owner')) {
        setError('You are not authorized to edit this event.');
      } else {
        setError(msg);
      }
    }
  };

  const isDisabled = updateEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy text-xl">Edit Event</DialogTitle>
          <DialogDescription>
            Update your event details below. Changes are only allowed while no booking has been accepted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-eventType">Event Type</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
              <SelectTrigger id="edit-eventType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventType.wedding}>Wedding</SelectItem>
                <SelectItem value={EventType.birthday}>Birthday</SelectItem>
                <SelectItem value={EventType.anniversary}>Anniversary</SelectItem>
                <SelectItem value={EventType.corporate}>Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-eventDate">Event Date</Label>
            <Input
              id="edit-eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              min={getTodayDate()}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-locationType">Location Type</Label>
            <Select value={locationType} onValueChange={(v) => setLocationType(v as LocationType)}>
              <SelectTrigger id="edit-locationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LocationType.home}>Home</SelectItem>
                <SelectItem value={LocationType.destination}>Destination</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-numberOfGuests">Number of Guests</Label>
            <Input
              id="edit-numberOfGuests"
              type="number"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
              placeholder="Enter number of guests"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-eventStyle">Event Style</Label>
            <Select value={eventStyle} onValueChange={(v) => setEventStyle(v as EventStyle)}>
              <SelectTrigger id="edit-eventStyle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventStyle.family}>Family</SelectItem>
                <SelectItem value={EventStyle.couple}>Couple</SelectItem>
                <SelectItem value={EventStyle.friends}>Friends</SelectItem>
                <SelectItem value={EventStyle.corporate}>Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contactNumber">Contact Number</Label>
            <Input
              id="edit-contactNumber"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event (optional)"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDisabled}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="bg-navy-900 text-white hover:bg-navy-800"
          >
            {isDisabled ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
