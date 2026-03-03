import { useState } from 'react';
import { useCreateEvent } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventType, LocationType, EventStyle } from '../../backend';
import { useActor } from '../../hooks/useActor';

export default function CreateEventForm() {
  const [eventType, setEventType] = useState<EventType>(EventType.wedding);
  const [locationType, setLocationType] = useState<LocationType>(LocationType.home);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [eventStyle, setEventStyle] = useState<EventStyle>(EventStyle.family);
  const [contactNumber, setContactNumber] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { actor, isFetching: actorLoading } = useActor();
  const createEvent = useCreateEvent();

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!actor) {
      setError('Not connected to backend. Please wait and try again.');
      return;
    }

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

    // Validate that the date is not in the past
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Cannot create events in the past. Please select today or a future date.');
      return;
    }

    try {
      // Convert date to timestamp (nanoseconds)
      const dateTimestamp = BigInt(selectedDate.getTime() * 1000000);

      await createEvent.mutateAsync({
        eventType,
        locationType,
        numberOfGuests: BigInt(guests),
        eventStyle,
        contact_number: contactNumber,
        date: dateTimestamp,
        description,
        image: null,
      });

      // Reset form
      setNumberOfGuests('');
      setContactNumber('');
      setEventDate('');
      setDescription('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    }
  };

  const isDisabled = createEvent.isPending || actorLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventType">Event Type</Label>
        <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
          <SelectTrigger id="eventType">
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
        <Label htmlFor="eventDate">Event Date</Label>
        <Input
          id="eventDate"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          min={getTodayDate()}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationType">Location Type</Label>
        <Select value={locationType} onValueChange={(value) => setLocationType(value as LocationType)}>
          <SelectTrigger id="locationType">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventStyle">Event Style</Label>
        <Select value={eventStyle} onValueChange={(value) => setEventStyle(value as EventStyle)}>
          <SelectTrigger id="eventStyle">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event..."
          rows={3}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
          ✓ Event created successfully!
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={isDisabled}
        onClick={handleSubmit as any}
      >
        {createEvent.isPending ? 'Creating...' : actorLoading ? 'Connecting...' : 'Create Event'}
      </Button>
    </form>
  );
}
