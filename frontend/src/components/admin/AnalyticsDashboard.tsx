import { useGetAllOrganizers, useGetAllEvents } from '../../hooks/useQueries';
import AnalyticsCard from './AnalyticsCard';
import { Users, Building2, Calendar, TrendingUp, Star } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { data: organizers, isLoading: organizersLoading } = useGetAllOrganizers();
  const { data: events, isLoading: eventsLoading } = useGetAllEvents();

  if (organizersLoading || eventsLoading) {
    return <p className="text-gray-500">Loading analytics...</p>;
  }

  const totalOrganizers = organizers?.length || 0;
  const totalEvents = events?.length || 0;

  // Calculate most popular event type
  const eventTypeCounts: Record<string, number> = {};
  events?.forEach((event) => {
    const type = event.eventType;
    eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
  });
  const mostPopularType = Object.entries(eventTypeCounts).sort((a, b) => b[1] - a[1])[0];

  // Find highest rated organizer
  const highestRatedOrganizer = organizers?.reduce((prev, current) => {
    return Number(current.totalReviews) > Number(prev.totalReviews) ? current : prev;
  }, organizers[0]);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnalyticsCard
        icon={<Building2 className="h-8 w-8 text-gold" />}
        label="Total Organizers"
        value={totalOrganizers.toString()}
      />
      <AnalyticsCard
        icon={<Calendar className="h-8 w-8 text-gold" />}
        label="Total Events"
        value={totalEvents.toString()}
      />
      <AnalyticsCard
        icon={<TrendingUp className="h-8 w-8 text-gold" />}
        label="Most Popular Event Type"
        value={mostPopularType ? `${mostPopularType[0]} (${mostPopularType[1]})` : 'N/A'}
      />
      <AnalyticsCard
        icon={<Star className="h-8 w-8 text-gold" />}
        label="Highest Rated Organizer"
        value={highestRatedOrganizer?.companyName || 'N/A'}
        description={highestRatedOrganizer ? `${highestRatedOrganizer.totalReviews.toString()} reviews` : ''}
      />
    </div>
  );
}
