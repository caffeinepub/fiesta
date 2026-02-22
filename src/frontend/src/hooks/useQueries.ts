import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { 
  Event, 
  OrganizerProfile as Organizer, 
  Booking, 
  Review, 
  EventType, 
  LocationType, 
  EventStyle, 
  BookingStatus,
  UserProfile,
  UserRole,
  Variant_busy_available,
  PortfolioImage
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Event Queries
export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      eventType: EventType;
      locationType: LocationType;
      numberOfGuests: bigint;
      eventStyle: EventStyle;
      contact_number: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(
        params.eventType,
        params.locationType,
        params.numberOfGuests,
        params.eventStyle,
        params.contact_number,
        params.date
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestEvents'] });
      queryClient.invalidateQueries({ queryKey: ['allEvents'] });
    },
  });
}

export function useGetGuestEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Event[]>({
    queryKey: ['guestEvents', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getGuestEvents(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetEvent(eventId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event | null>({
    queryKey: ['event', eventId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getEvent(eventId);
      } catch (error) {
        console.error('Error fetching event:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['allEvents'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllEvents();
      } catch (error) {
        console.error('Error fetching all events:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

// Organizer Queries
export function useSaveOrganizerProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contactNumber: string;
      companyName: string;
      experienceYears: bigint;
      pricingRange: string;
      description: string;
      availabilityStatus: Variant_busy_available;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');
      
      const profileData: Organizer = {
        companyName: params.companyName,
        contactNumber: params.contactNumber,
        experienceYears: params.experienceYears,
        pricingRange: params.pricingRange,
        description: params.description,
        availabilityStatus: params.availabilityStatus,
        totalReviews: BigInt(0),
        userId: identity.getPrincipal(),
        createdAt: BigInt(Date.now() * 1000000),
        portfolio_images: [],
      };
      
      return actor.saveOrganizerProfile(profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

export function useGetOrganizer(organizerId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Organizer | null>({
    queryKey: ['organizer', organizerId?.toString()],
    queryFn: async () => {
      if (!actor || !organizerId) return null;
      try {
        return await actor.getOrganizer(organizerId);
      } catch (error) {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!organizerId,
  });
}

export function useGetAllOrganizers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Organizer[]>({
    queryKey: ['allOrganizers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrganizers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFilterOrganizers(filters: {
  eventType: EventType;
  locationType: LocationType;
  numberOfGuests: bigint;
  eventStyle: EventStyle;
} | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Organizer[]>({
    queryKey: ['filteredOrganizers', filters ? {
      eventType: filters.eventType,
      locationType: filters.locationType,
      numberOfGuests: filters.numberOfGuests.toString(),
      eventStyle: filters.eventStyle,
    } : null],
    queryFn: async () => {
      if (!actor || !filters) return [];
      return actor.filterOrganizers(
        filters.eventType,
        filters.locationType,
        filters.numberOfGuests,
        filters.eventStyle
      );
    },
    enabled: !!actor && !actorFetching && !!filters,
  });
}

// Portfolio Image Queries
export function useAddPortfolioImage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');

      // Generate filename: organizerId_timestamp_random.ext
      const extension = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `${identity.getPrincipal().toString()}_${timestamp}_${random}.${extension}`;

      // Convert file to bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob and upload
      const blob = ExternalBlob.fromBytes(bytes);
      
      // Upload the blob to storage
      await blob.getBytes();

      // Call backend to register the image metadata
      await actor.addPortfolioImage(filename);

      // Store the blob URL in sessionStorage for immediate display
      const blobUrl = URL.createObjectURL(file);
      sessionStorage.setItem(`portfolio_${filename}`, blobUrl);

      return filename;
    },
    onSuccess: (_, file) => {
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioImages'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

export function useDeletePortfolioImage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');

      const result = await actor.deletePortfolioImage(filename);
      
      if (!result) {
        throw new Error('Failed to delete image. Image may not exist or you may not have permission.');
      }

      return filename;
    },
    onSuccess: (filename) => {
      // Clean up sessionStorage cache
      sessionStorage.removeItem(`portfolio_${filename}`);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioImages'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

export function useGetOrganizerPortfolioImages(organizerId: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PortfolioImage[]>({
    queryKey: ['portfolioImages', organizerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrganizerPortfolioImages(organizerId);
      } catch (error) {
        console.error('Error fetching portfolio images:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

// Booking Queries
export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { eventId: bigint; organizerId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(params.eventId, params.organizerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
    },
  });
}

export function useRequestBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { eventId: bigint; organizerId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestBooking(params.eventId, params.organizerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
    },
  });
}

export function useGetGuestBookings() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Booking[]>({
    queryKey: ['guestBookings', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getGuestBookings(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetOrganizerBookings() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Booking[]>({
    queryKey: ['organizerBookings', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getOrganizerBookings(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(params.bookingId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
    },
  });
}

// Review Queries
export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      organizerId: Principal;
      rating: bigint;
      comment: string;
      eventId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitReview(
        params.organizerId,
        params.rating,
        params.comment,
        params.eventId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerReviews'] });
    },
  });
}

export function useGetOrganizerReviews(organizerId: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['organizerReviews', organizerId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrganizerReviews(organizerId);
    },
    enabled: !!actor && !actorFetching,
  });
}
