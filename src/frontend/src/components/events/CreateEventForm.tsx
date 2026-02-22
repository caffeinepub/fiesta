import { useState } from 'react';
import { useCreateEvent } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EventType, LocationType, EventStyle } from '../../backend';

export default function CreateEventForm() {
  const [eventType, setEventType] = useState<EventType>(EventType.wedding);
  const [locationType, setLocationType] = useState<LocationType>(LocationType.home);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [eventStyle, setEventStyle] = useState<EventStyle>(EventStyle.family);
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');

  const createEvent = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      await createEvent.mutateAsync({
        eventType,
        locationType,
        numberOfGuests: BigInt(guests),
        eventStyle,
        contact_number: contactNumber,
      });
      setNumberOfGuests('');
      setContactNumber('');
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventType">Event Type</Label>
        <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
          <SelectTrigger>
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
        <Label htmlFor="locationType">Location Type</Label>
        <Select value={locationType} onValueChange={(value) => setLocationType(value as LocationType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LocationType.home}>Home</SelectItem>
            <SelectItem value={LocationType.destination}>Destination</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfGuests">Number of Guests</Label>
        <Input
          id="numberOfGuests"
          type="number"
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(e.target.value)}
          placeholder="Enter number of guests"
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventStyle">Event Style</Label>
        <Select value={eventStyle} onValueChange={(value) => setEventStyle(value as EventStyle)}>
          <SelectTrigger>
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
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="Enter your contact number"
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={createEvent.isPending}>
        {createEvent.isPending ? 'Creating...' : 'Create Event'}
      </Button>
    </form>
  );
}
