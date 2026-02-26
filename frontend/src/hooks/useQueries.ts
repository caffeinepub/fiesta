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
      queryClient.invalidateQueries({ queryKey: ['portfolioImages', variables.organizerId] });
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
      queryClient.invalidateQueries({ queryKey: ['portfolioImages', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['organizer', variables.organizerId] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

// ─── Event Photos ─────────────────────────────────────────────────────────────

export function useGetEventPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<EventPhoto[]>({
    queryKey: ['eventPhotos'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getEventPhotos();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Fetches event photos for a specific organizer.
 * NOTE: The backend only exposes getEventPhotos() for the caller's own photos.
 * For the public-facing lightbox, this hook attempts the call but gracefully
 * returns an empty array if the caller is not the organizer (no public endpoint).
 */
export function useGetOrganizerEventPhotos(organizerId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<EventPhoto[]>({
    queryKey: ['organizerEventPhotos', organizerId],
    queryFn: async () => {
      if (!actor || !organizerId) return [];
      // If the caller IS the organizer, fetch their own photos
      const callerPrincipal = identity?.getPrincipal().toString();
      if (callerPrincipal === organizerId) {
        try {
          return await actor.getEventPhotos();
        } catch {
          return [];
        }
      }
      // For other callers (guests browsing), the backend has no public endpoint.
      // Return empty array — this is a known backend limitation.
      return [];
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

export function useGetAllEvents() {
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

export function useGetAllBookings() {
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

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ['allReviews'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterOrganizers() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      eventType: EventType;
      locationType: LocationType;
      numberOfGuests: bigint;
      eventStyle: EventStyle;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.filterOrganizers(
        params.eventType,
        params.locationType,
        params.numberOfGuests,
        params.eventStyle,
      );
    },
  });
}
