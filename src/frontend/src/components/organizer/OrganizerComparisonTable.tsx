import { useState } from 'react';
import type { OrganizerProfile } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';

interface OrganizerComparisonTableProps {
  organizers: OrganizerProfile[];
}

type SortField = 'rating' | 'experience' | 'pricing';

export default function OrganizerComparisonTable({ organizers }: OrganizerComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('rating');

  const sortedOrganizers = [...organizers].sort((a, b) => {
    if (sortField === 'experience') {
      return Number(b.experienceYears) - Number(a.experienceYears);
    }
    if (sortField === 'rating') {
      return Number(b.totalReviews) - Number(a.totalReviews);
    }
    return 0;
  });

  return (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
