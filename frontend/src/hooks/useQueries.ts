import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
 */
export function useGetCallerPortfolioImages() {
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
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
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
 */
export function useGetEventPhotos() {
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
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
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
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      return actor.uploadEventPhoto(blob, file.type, file.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['organizerEventPhotos'] });
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
      queryClient.invalidateQueries({ queryKey: ['organizerEventPhotos'] });
    },
  });
}

// ─── Events ──────────────────────────────────────────────────────────────────

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

export function useGetEvent(eventId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Event>({
    queryKey: ['event', eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === undefined) throw new Error('No event ID');
      return actor.getEvent(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== undefined,
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
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(
        params.eventType,
        params.locationType,
        params.numberOfGuests,
        params.eventStyle,
        params.contact_number,
        params.date,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestEvents'] });
    },
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

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, organizerId }: { eventId: bigint; organizerId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(eventId, Principal.fromText(organizerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizerBookings'] });
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

export function useGetAllOrganizersAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile[]>({
    queryKey: ['allOrganizersAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrganizers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllEventsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ['allEventsAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBookingsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['allBookingsAdmin'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}
