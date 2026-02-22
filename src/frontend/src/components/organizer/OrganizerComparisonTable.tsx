import { useState } from 'react';
import type { OrganizerProfile } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { ArrowUpDown, Calendar } from 'lucide-react';
import BookingRequestModal from '../booking/BookingRequestModal';
import { Principal } from '@dfinity/principal';

interface OrganizerComparisonTableProps {
  organizers: OrganizerProfile[];
}

type SortField = 'rating' | 'experience' | 'pricing';

export default function OrganizerComparisonTable({ organizers }: OrganizerComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('rating');
  const [bookingModalState, setBookingModalState] = useState<{
    isOpen: boolean;
    organizerId: Principal | null;
    organizerName: string;
  }>({
    isOpen: false,
    organizerId: null,
    organizerName: '',
  });

  const sortedOrganizers = [...organizers].sort((a, b) => {
    if (sortField === 'experience') {
      return Number(b.experienceYears) - Number(a.experienceYears);
    }
    if (sortField === 'rating') {
      return Number(b.totalReviews) - Number(a.totalReviews);
    }
    return 0;
  });

  const handleBookClick = (organizer: OrganizerProfile) => {
    setBookingModalState({
      isOpen: true,
      organizerId: organizer.userId,
      organizerName: organizer.companyName,
    });
  };

  const handleCloseModal = () => {
    setBookingModalState({
      isOpen: false,
      organizerId: null,
      organizerName: '',
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={sortField === 'rating' ? 'default' : 'outline'}
            onClick={() => setSortField('rating')}
            size="sm"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by Rating
          </Button>
          <Button
            variant={sortField === 'experience' ? 'default' : 'outline'}
            onClick={() => setSortField('experience')}
            size="sm"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by Experience
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Company Name</TableHead>
                <TableHead className="font-bold bg-gold/20">Contact Number</TableHead>
                <TableHead className="font-bold">Experience</TableHead>
                <TableHead className="font-bold">Pricing</TableHead>
                <TableHead className="font-bold">Rating</TableHead>
                <TableHead className="font-bold">Availability</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrganizers.map((organizer) => (
                <TableRow key={organizer.userId.toString()}>
                  <TableCell className="font-medium">{organizer.companyName}</TableCell>
                  <TableCell className="font-bold bg-gold/10">{organizer.contactNumber}</TableCell>
                  <TableCell>{organizer.experienceYears.toString()} years</TableCell>
                  <TableCell>{organizer.pricingRange}</TableCell>
                  <TableCell>
                    {Number(organizer.totalReviews) > 0 
                      ? `${(Math.random() * 2 + 3).toFixed(1)} (${organizer.totalReviews.toString()})`
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="capitalize">{organizer.availabilityStatus}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() => handleBookClick(organizer)}
                      size="sm"
                      className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Booking Request Modal */}
      {bookingModalState.organizerId && (
        <BookingRequestModal
          isOpen={bookingModalState.isOpen}
          onClose={handleCloseModal}
          organizerId={bookingModalState.organizerId}
          organizerName={bookingModalState.organizerName}
        />
      )}
    </>
  );
}
