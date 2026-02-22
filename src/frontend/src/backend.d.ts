import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Review {
    id: bigint;
    eventId: bigint;
    userId: Principal;
    createdAt: Time;
    organizerId: Principal;
    comment: string;
    rating: bigint;
}
export interface PortfolioImage {
    filename: string;
    uploaded_at: Time;
}
export type Time = bigint;
export interface Event {
    id: bigint;
    eventStyle: EventStyle;
    owner: Principal;
    date: Time;
    createdAt: Time;
    contact_number: string;
    locationType: LocationType;
    numberOfGuests: bigint;
    eventType: EventType;
}
export interface OrganizerProfile {
    userId: Principal;
    createdAt: Time;
    description: string;
    experienceYears: bigint;
    pricingRange: string;
    companyName: string;
    contactNumber: string;
    totalReviews: bigint;
    availabilityStatus: Variant_busy_available;
    portfolio_images: Array<PortfolioImage>;
}
export interface Booking {
    id: bigint;
    eventId: bigint;
    organizerName: string;
    organizerId: Principal;
    bookingStatus: BookingStatus;
    bookingDate: Time;
    guestId: Principal;
}
export interface UserProfile {
    createdAt: Time;
    role: UserRole;
    fullName: string;
    email: string;
}
export enum BookingStatus {
    requested = "requested",
    completed = "completed",
    approved = "approved",
    rejected = "rejected"
}
export enum EventStyle {
    couple = "couple",
    friends = "friends",
    corporate = "corporate",
    family = "family"
}
export enum EventType {
    anniversary = "anniversary",
    wedding = "wedding",
    birthday = "birthday",
    corporate = "corporate"
}
export enum LocationType {
    destination = "destination",
    home = "home"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_busy_available {
    busy = "busy",
    available = "available"
}
export interface backendInterface {
    addPortfolioImage(filename: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(eventId: bigint, organizerId: Principal): Promise<bigint>;
    createEvent(eventType: EventType, locationType: LocationType, numberOfGuests: bigint, eventStyle: EventStyle, contact_number: string, date: Time): Promise<bigint>;
    deletePortfolioImage(filename: string): Promise<boolean>;
    filterOrganizers(eventType: EventType, locationType: LocationType, numberOfGuests: bigint, eventStyle: EventStyle): Promise<Array<OrganizerProfile>>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllOrganizers(): Promise<Array<OrganizerProfile>>;
    getAllReviews(): Promise<Array<Review>>;
    getBooking(bookingId: bigint): Promise<Booking>;
    getBookingsByStatus(status: BookingStatus): Promise<Array<Booking>>;
    getBookingsForEvent(eventId: bigint): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(eventId: bigint): Promise<Event>;
    getEventBookings(eventId: bigint): Promise<Array<Booking>>;
    getEventPortfolioImages(eventId: bigint): Promise<Array<PortfolioImage>>;
    getEventReviews(eventId: bigint): Promise<Array<Review>>;
    getFreeOrganizers(startTime: bigint, endTime: bigint): Promise<Array<OrganizerProfile>>;
    getGuestBookings(guestId: Principal): Promise<Array<Booking>>;
    getGuestEvents(guestId: Principal): Promise<Array<Event>>;
    getOrganizer(organizerId: Principal): Promise<OrganizerProfile>;
    getOrganizerBookings(organizerId: Principal): Promise<Array<Booking>>;
    getOrganizerPortfolioImages(organizerId: Principal): Promise<Array<PortfolioImage>>;
    getOrganizerReviews(organizerId: Principal): Promise<Array<Review>>;
    getReview(reviewId: bigint): Promise<Review>;
    getReviewsForEvent(eventId: bigint): Promise<Array<Review>>;
    getReviewsForOrganizer(organizerId: Principal): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    registerGuest(email: string, fullName: string): Promise<void>;
    requestBooking(eventId: bigint, organizerId: Principal): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveOrganizerProfile(profileData: OrganizerProfile): Promise<void>;
    submitReview(organizerId: Principal, rating: bigint, comment: string, eventId: bigint): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
}
