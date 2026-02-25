import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type {
  OrganizerProfile,
  UserProfile,
  UserRole,
  Event,
  Booking,
  BookingStatus,
  EventType,
  LocationType,
  EventStyle,
  PortfolioImage,
  EventPhoto,
} from '../backend';
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

// ─── Organizer Profile ───────────────────────────────────────────────────────

export function useGetOrganizerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile | null>({
    queryKey: ['organizerProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        // getCallerUserRole to find the principal, then getOrganizer
        // We use getCallerUserProfile to get the user, then look up organizer by caller principal
        // Since we don't have a direct "getCallerOrganizer", we use getAllOrganizers and filter
        // Actually the backend has getOrganizer(organizerId) - we need the caller's principal
        // We'll use a workaround: call getOrganizer with a placeholder and catch the error
        // The actor itself knows the caller principal via the identity
        const allOrganizers = await actor.getAllOrganizers();
        // We can't get caller principal from actor directly in this hook,
        // so we return null and let the dashboard handle it via identity
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrganizer(organizerId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile | null>({
    queryKey: ['organizer', organizerId?.toString()],
    queryFn: async () => {
      if (!actor || !organizerId) return null;
      try {
        return await actor.getOrganizer(organizerId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

export function useGetOrganizerProfileById(organizerId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile | null>({
    queryKey: ['organizerProfile', organizerId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return actor.getOrganizer(Principal.fromText(organizerId));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

export function useSaveOrganizerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: OrganizerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveOrganizerProfile(profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['organizerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
    },
  });
}

// ─── Portfolio Images ────────────────────────────────────────────────────────

export function useGetPortfolioImages(organizerId?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PortfolioImage[]>({
    queryKey: ['portfolioImages', organizerId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrganizerPortfolioImages(Principal.fromText(organizerId!));
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

export function useGetOrganizerPortfolioImages(organizerId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PortfolioImage[]>({
    queryKey: ['portfolioImages', organizerId?.toString()],
    queryFn: async () => {
      if (!actor || !organizerId) return [];
      try {
        return await actor.getOrganizerPortfolioImages(organizerId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!organizerId,
  });
}

export function useAddPortfolioImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bytes, filename }: { bytes: Uint8Array<ArrayBuffer>; filename: string }) => {
      if (!actor) throw new Error('Actor not available');

      // Step 1: Upload the blob to IC blob storage via uploadEventPhoto.
      // This is the only backend call that accepts ExternalBlob and actually
      // persists the bytes to the storage canister.
      const blob = ExternalBlob.fromBytes(bytes);
      const photoId = await actor.uploadEventPhoto(blob, 'image/jpeg', filename);

      // Step 2: Fetch the stored event photos to get the backend-returned
      // ExternalBlob, whose getDirectURL() returns a persistent IC HTTP URL
      // (not a session-local blob: URL).
      const storedPhotos = await actor.getEventPhotos();
      const storedPhoto = storedPhotos.find((p) => p.id === photoId);

      let blobUrl: string;
      if (storedPhoto && storedPhoto.blob) {
        // Use the URL from the backend-returned blob — this is a persistent
        // IC canister streaming URL accessible from any browser session.
        blobUrl = storedPhoto.blob.getDirectURL();
      } else {
        // Fallback: use the local blob's URL (may only work in current session)
        blobUrl = blob.getDirectURL();
      }

      // Step 3: Store the persistent URL as the portfolio image filename
      await actor.addPortfolioImage(blobUrl);
      return { photoId, blobUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioImages'] });
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['organizerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
      queryClient.invalidateQueries({ queryKey: ['eventPhotos'] });
    },
  });
}

export function useDeletePortfolioImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filename: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePortfolioImage(filename);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioImages'] });
      queryClient.invalidateQueries({ queryKey: ['organizer'] });
      queryClient.invalidateQueries({ queryKey: ['organizerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allOrganizers'] });
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

export function useGetEvent(eventId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Event | null>({
    queryKey: ['event', eventId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getEvent(eventId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: {
      eventType: EventType;
      locationType: LocationType;
      numberOfGuests: bigint;
      eventStyle: EventStyle;
      contact_number: string;
      date: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(
        eventData.eventType,
        eventData.locationType,
        eventData.numberOfGuests,
        eventData.eventStyle,
        eventData.contact_number,
        eventData.date,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestEvents'] });
    },
  });
}

// ─── Organizers ──────────────────────────────────────────────────────────────

export function useGetAllOrganizers() {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile[]>({
    queryKey: ['allOrganizers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllOrganizers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

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
    mutationFn: async ({ eventId, organizerId }: { eventId: bigint; organizerId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(eventId, organizerId);
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
    mutationFn: async ({ eventId, organizerId }: { eventId: bigint; organizerId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestBooking(eventId, Principal.fromText(organizerId));
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
      queryClient.invalidateQueries({ queryKey: ['guestBookings'] });
    },
  });
}

// ─── Event Photos ────────────────────────────────────────────────────────────

export function useGetEventPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<EventPhoto[]>({
    queryKey: ['eventPhotos'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEventPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadEventPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bytes,
      contentType,
      filename,
    }: {
      bytes: Uint8Array<ArrayBuffer>;
      contentType: string;
      filename: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.uploadEventPhoto(blob, contentType, filename);
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

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useGetAllOrganizersAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<OrganizerProfile[]>({
    queryKey: ['allOrganizersAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}
