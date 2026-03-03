import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  UserProfile,
  OrganizerProfile,
  Event,
  Booking,
  BookingStatus,
  Review,
  EventPhoto,
  PortfolioImage,
  PaginatedBookings,
} from '../backend';
import { EventType, LocationType, EventStyle } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

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

// ─── User Role ───────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Organizer Profile ───────────────────────────────────────────────────────

/**
 * Fetches the caller's own organizer profile.
 * Returns null if no profile exists yet (does NOT trap).
 * Use this in the Organizer Dashboard.
 */
export function useGetOrganizerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<OrganizerProfile | null>({
    queryKey: ['organizerProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrganizerProfile();
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

export function useGetOrganizer(organizerId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile>({
    queryKey: ['organizer', organizerId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!organizerId) throw new Error('No organizer ID');
      return actor.getOrganizer(Principal.fromText(organizerId));
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

export function useGetAllOrganizers() {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile[]>({
    queryKey: ['allOrganizers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrganizers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveOrganizerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: OrganizerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveOrganizerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

// ─── Portfolio Images ─────────────────────────────────────────────────────────

export function useGetOrganizerPortfolioImages(organizerId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PortfolioImage[]>({
    queryKey: ['portfolioImages', organizerId],
    queryFn: async () => {
      if (!actor || !organizerId) return [];
      return actor.getOrganizerPortfolioImages(Principal.fromText(organizerId));
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

/**
 * Fetches portfolio images for the caller organizer from the dashboard endpoint.
 * Returns empty array if no organizer profile exists.
 * Only fetches when `enabled` prop is true (deferred loading).
 */
export function useGetCallerPortfolioImages(enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<PortfolioImage[]>({
    queryKey: ['callerPortfolioImages'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPortfolioImages();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: false,
  });
  return {
    ...query,
    isLoading: (actorFetching || query.isLoading) && enabled,
    isFetched: !!actor && query.isFetched,
  };
}

export function useAddPortfolioImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, organizerId }: { file: File; organizerId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes);
      const photoId = await actor.uploadEventPhoto(blob, file.type, file.name);
      const url = blob.getDirectURL();
      await actor.addPortfolioImage(url);
      return photoId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['callerPortfolioImages'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioImages', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['organizerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['organizer', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

export function useDeletePortfolioImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ filename, organizerId }: { filename: string; organizerId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePortfolioImage(filename);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['callerPortfolioImages'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioImages', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['organizerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['organizer', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

// ─── Event Photos ─────────────────────────────────────────────────────────────

/**
 * Fetches event photos for the caller organizer from the dashboard endpoint.
 * Returns empty array if no organizer profile exists (catches trap).
 * Only fetches when `enabled` prop is true (deferred loading).
 */
export function useGetEventPhotos(enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<EventPhoto[]>({
    queryKey: ['eventPhotos'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getEventPhotos();
      } catch {
        // Backend traps if no organizer profile exists; return empty array gracefully
        return [];
      }
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: false,
  });
  return {
    ...query,
    isLoading: (actorFetching || query.isLoading) && enabled,
    isFetched: !!actor && query.isFetched,
  };
}

/**
 * Fetches event photos for a specific organizer using the public endpoint.
 * Uses getPublicEventPhotos(organizerId) which is accessible by all authenticated users,
 * so any user can view any organizer's event photos on the Find Organisers page.
 */
export function useGetOrganizerEventPhotos(organizerId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<EventPhoto[]>({
    queryKey: ['organizerEventPhotos', organizerId],
    queryFn: async () => {
      if (!actor || !organizerId) return [];
      try {
        return await actor.getPublicEventPhotos(Principal.fromText(organizerId));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!organizerId,
    retry: false,
  });
}

export function useUploadEventPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      organizerId: string;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) blob = blob.withUploadProgress(onProgress);
      return actor.uploadEventPhoto(blob, file.type, file.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventPhotos'] });
    },
  });
}

export function useDeleteEventPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteEventPhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventPhotos'] });
    },
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useGetGuestEvents(guestId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ['guestEvents', guestId],
    queryFn: async () => {
      if (!actor || !guestId) return [];
      return actor.getGuestEvents(Principal.fromText(guestId));
    },
    enabled: !!actor && !isFetching && !!guestId,
  });
}

export function useGetAllEventsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ['allEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEvent(eventId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Event>({
    queryKey: ['event', eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === undefined) throw new Error('Actor or eventId not available');
      return actor.getEvent(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== undefined,
    retry: false,
  });
}

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
      description: string;
      image?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(
        params.eventType,
        params.locationType,
        params.numberOfGuests,
        params.eventStyle,
        params.contact_number,
        params.date,
        params.description,
        params.image ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestEvents'] });
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      eventId: bigint;
      eventType: EventType;
      locationType: LocationType;
      numberOfGuests: bigint;
      eventStyle: EventStyle;
      contact_number: string;
      date: bigint;
      description: string;
      image?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateEvent(
        params.eventId,
        params.eventType,
        params.locationType,
        params.numberOfGuests,
        params.eventStyle,
        params.contact_number,
        params.date,
        params.description,
        params.image ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestEvents'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestEvents'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['eventBookings'] });
    },
  });
}

/**
 * Fetches bookings for a specific event to determine lock status.
 * Used to check if any booking has status 'approved' which locks the event.
 */
export function useGetEventBookings(eventId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['eventBookings', eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === undefined) return [];
      try {
        return await actor.getEventBookings(eventId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && eventId !== undefined,
    retry: false,
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export function useGetGuestBookings(guestId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['guestBookings', guestId],
    queryFn: async () => {
      if (!actor || !guestId) return [];
      return actor.getGuestBookings(Principal.fromText(guestId));
    },
    enabled: !!actor && !isFetching && !!guestId,
  });
}

/**
 * Fetches all bookings for the currently authenticated caller (customer).
 * Uses getBookingsByGuest() which automatically uses the caller's principal.
 * No parameters needed — identity is resolved server-side.
 */
export function useGetBookingsByGuest() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Booking[]>({
    queryKey: ['bookingsByGuest', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookingsByGuest();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetOrganizerBookings(organizerId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['organizerBookings', organizerId],
    queryFn: async () => {
      if (!actor || !organizerId) return [];
      return actor.getOrganizerBookings(Principal.fromText(organizerId));
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

/**
 * Fetches paginated bookings for an organizer.
 * pageNumber is 0-indexed. Uses placeholderData to keep previous page visible while loading.
 */
export function useGetOrganizerBookingsPaginated(
  organizerId?: string,
  pageNumber = 0,
  pageSize = 5,
) {
  const { actor, isFetching } = useActor();
  return useQuery<PaginatedBookings>({
    queryKey: ['organizerBookingsPaginated', organizerId, pageNumber, pageSize],
    queryFn: async () => {
      if (!actor || !organizerId) return { bookings: [], totalCount: BigInt(0) };
      return actor.getOrganizerBookingsPaginated(
        Principal.fromText(organizerId),
        BigInt(pageNumber),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching && !!organizerId,
    placeholderData: keepPreviousData,
  });
}

export function useRequestBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      organizerId,
    }: {
      eventId: bigint;
      organizerId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestBooking(eventId, Principal.fromText(organizerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingsByGuest'] });
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['organizerBookingsPaginated'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: bigint;
      status: BookingStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['organizerBookingsPaginated'] });
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingsByGuest'] });
      queryClient.invalidateQueries({ queryKey: ['eventBookings'] });
    },
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function useGetOrganizerReviews(organizerId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ['organizerReviews', organizerId],
    queryFn: async () => {
      if (!actor || !organizerId) return [];
      return actor.getOrganizerReviews(Principal.fromText(organizerId));
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      organizerId: string;
      rating: bigint;
      comment: string;
      eventId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitReview(
        Principal.fromText(params.organizerId),
        params.rating,
        params.comment,
        params.eventId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerReviews'] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useGetAllBookingsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrganizersAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile[]>({
    queryKey: ['allOrganizers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrganizers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterOrganizers(params?: {
  eventType: EventType;
  locationType: LocationType;
  numberOfGuests: bigint;
  eventStyle: EventStyle;
}) {
  const { actor, isFetching } = useActor();
  // Serialize params to avoid BigInt in query key
  const queryKeyParams = params
    ? {
        eventType: params.eventType,
        locationType: params.locationType,
        numberOfGuests: params.numberOfGuests.toString(),
        eventStyle: params.eventStyle,
      }
    : null;

  return useQuery<OrganizerProfile[]>({
    queryKey: ['filteredOrganizers', queryKeyParams],
    queryFn: async () => {
      if (!actor || !params) return [];
      return actor.filterOrganizers(
        params.eventType,
        params.locationType,
        params.numberOfGuests,
        params.eventStyle,
      );
    },
    enabled: !!actor && !isFetching && !!params,
  });
}
