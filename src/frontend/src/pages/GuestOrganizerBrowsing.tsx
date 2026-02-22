import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllOrganizers } from '../hooks/useQueries';
import OrganizerCard from '../components/organizer/OrganizerCard';
import { Button } from '../ui/button';
import { Principal } from '@dfinity/principal';
import type { OrganizerProfile } from '../backend';
import { useEffect } from 'react';

export default function GuestOrganizerBrowsing() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: organizers, isLoading } = useGetAllOrganizers();
  const [selectedOrganizers, setSelectedOrganizers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  const handleToggleSelection = (organizerId: string) => {
    setSelectedOrganizers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(organizerId)) {
        newSet.delete(organizerId);
      } else {
        newSet.add(organizerId);
      }
      return newSet;
    });
  };

  const handleCompare = () => {
    const selectedIds = Array.from(selectedOrganizers);
    navigate({ 
      to: '/guest/organizers/compare',
      search: { ids: selectedIds }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-navy mb-2">Find Organizers</h1>
          <p className="text-gray-600">Browse available event organizers and book directly or compare multiple options</p>
        </div>
        {selectedOrganizers.size > 0 && (
          <Button 
            onClick={handleCompare}
            className="bg-gold hover:bg-gold-dark text-navy font-semibold"
          >
            Compare Selected ({selectedOrganizers.size})
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading organizers...</p>
      ) : organizers && organizers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((organizer) => (
            <OrganizerCard
              key={organizer.userId.toString()}
              organizer={organizer}
              isSelected={selectedOrganizers.has(organizer.userId.toString())}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No organizers found.</p>
      )}
    </div>
  );
}
