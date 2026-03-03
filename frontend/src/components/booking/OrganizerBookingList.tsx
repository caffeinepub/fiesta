import React, { useState } from 'react';
import { useGetOrganizerBookingsPaginated } from '../../hooks/useQueries';
import OrganizerBookingCard from './OrganizerBookingCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface OrganizerBookingListProps {
  organizerId?: string;
  pageSize?: number;
}

const PAGE_SIZE = 5;

export default function OrganizerBookingList({
  organizerId,
  pageSize = PAGE_SIZE,
}: OrganizerBookingListProps) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useGetOrganizerBookingsPaginated(
    organizerId,
    page,
    pageSize,
  );

  const bookings = data?.bookings ?? [];
  const totalCount = Number(data?.totalCount ?? 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6 text-navy-600" />
      </div>
    );
  }

  if (totalCount === 0) {
    return <p className="text-muted-foreground text-sm py-4">No booking requests yet.</p>;
  }

  const requestedBookings = bookings.filter((b) => b.bookingStatus === 'requested');
  const otherBookings = bookings.filter((b) => b.bookingStatus !== 'requested');

  return (
    <div className="space-y-6">
      {/* Subtle fetching indicator while paginating */}
      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="animate-spin h-3 w-3" />
          <span>Loading…</span>
        </div>
      )}

      {requestedBookings.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-navy-800 mb-3">Pending Requests</h3>
          <div className="space-y-3">
            {requestedBookings.map((booking) => (
              <OrganizerBookingCard key={booking.id.toString()} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {otherBookings.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-navy-800 mb-3">Past Bookings</h3>
          <div className="space-y-3">
            {otherBookings.map((booking) => (
              <OrganizerBookingCard key={booking.id.toString()} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-navy-100">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-navy-200 text-navy-700 hover:bg-navy-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-navy-200 text-navy-700 hover:bg-navy-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isFetching}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
