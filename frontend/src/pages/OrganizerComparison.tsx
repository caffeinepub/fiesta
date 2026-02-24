import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllOrganizers } from '../hooks/useQueries';
import OrganizerComparisonTable from '../components/organizer/OrganizerComparisonTable';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function OrganizerComparison() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const search = useSearch({ strict: false }) as { ids?: string[] };
  const { data: allOrganizers, isLoading } = useGetAllOrganizers();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  const selectedIds = search.ids || [];
  const selectedOrganizers = allOrganizers?.filter((org) =>
    selectedIds.includes(org.userId.toString())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/guest/organizers' })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizers
        </Button>
        <h1 className="text-4xl font-bold text-navy mb-2">Compare Organizers</h1>
        <p className="text-gray-600">Review and compare organizer details side-by-side, then book directly from this page</p>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading comparison...</p>
      ) : selectedOrganizers.length > 0 ? (
        <OrganizerComparisonTable organizers={selectedOrganizers} />
      ) : (
        <p className="text-gray-500">No organizers selected for comparison.</p>
      )}
    </div>
  );
}
