import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Initialize authorization system state and mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Persistent state
  var eventIdCounter = 0;
  var bookingIdCounter = 0;
  var photoIdCounter = 0;

  // Data Types
  public type UserProfile = {
    fullName : Text;
    email : Text;
    role : AccessControl.UserRole;
    createdAt : Time.Time;
  };

  public type Guest = {
    fullName : Text;
    email : Text;
    createdAt : Time.Time;
  };

  public type EventType = {
    #wedding;
    #birthday;
    #anniversary;
    #corporate;
  };

  public type LocationType = {
    #home;
    #destination;
  };

  public type EventStyle = {
    #family;
    #couple;
    #friends;
    #corporate;
  };

  public type Event = {
    id : Nat;
    eventType : EventType;
    locationType : LocationType;
    numberOfGuests : Nat;
    eventStyle : EventStyle;
    contact_number : Text;
    owner : Principal;
    createdAt : Time.Time;
    date : Time.Time;
  };

  public type PortfolioImage = {
    filename : Text;
    uploaded_at : Time.Time;
  };

  public type OrganizerProfile = {
    companyName : Text;
    contactNumber : Text;
    experienceYears : Nat;
    pricingRange : Text;
    totalReviews : Nat;
    availabilityStatus : {
      #available;
      #busy;
    };
    description : Text;
    userId : Principal;
    createdAt : Time.Time;
    portfolio_images : [PortfolioImage];
  };

  public type BookingStatus = {
    #requested;
    #approved;
    #rejected;
    #completed;
  };

  public type Booking = {
    id : Nat;
    eventId : Nat;
    organizerId : Principal;
    organizerName : Text;
    bookingStatus : BookingStatus;
    bookingDate : Time.Time;
    guestId : Principal;
  };

  public type Review = {
    id : Nat;
    rating : Nat;
    comment : Text;
    eventId : Nat;
    organizerId : Principal;
    userId : Principal;
    createdAt : Time.Time;
  };

  public type Analytics = {
    totalUserCount : ?Nat;
    totalOrganizerCount : ?Nat;
    totalEventCount : ?Nat;
  };

  public type EventPhoto = {
    id : Nat;
    owner : Principal;
    blob : Storage.ExternalBlob;
    contentType : Text;
    filename : Text;
    uploadedAt : Time.Time;
  };

  module OrganizerProfile {
    public func compare(a : OrganizerProfile, b : OrganizerProfile) : Order.Order {
      Text.compare(a.companyName, b.companyName);
    };
  };

  // Persistent Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let guests = Map.empty<Principal, Guest>();
  let events = Map.empty<Nat, Event>();
  let organizers = Map.empty<Principal, OrganizerProfile>();
  let bookings = Map.empty<Nat, Booking>();
  let reviews = Map.empty<Nat, Review>();
  let eventPhotos = Map.empty<Nat, EventPhoto>();

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  // Guest Registration - Any authenticated user can register as guest
  public shared ({ caller }) func registerGuest(email : Text, fullName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as guests");
    };
    let guest : Guest = {
      email;
      fullName;
      createdAt = Time.now();
    };
    guests.add(caller, guest);
  };

  // Save Organizer Profile (with portfolio_images initialization)
  public shared ({ caller }) func saveOrganizerProfile(profileData : OrganizerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create/update organizer profiles");
    };

    // Check contactNumber uniqueness for other users
    for (existing in organizers.values()) {
      if (
        existing.contactNumber == profileData.contactNumber and
        existing.userId != caller
      ) {
        Runtime.trap("Contact number already in use. Please use a unique number.");
      };
    };

    let newProfile : OrganizerProfile = {
      companyName = profileData.companyName;
      contactNumber = profileData.contactNumber;
      experienceYears = profileData.experienceYears;
      pricingRange = profileData.pricingRange;
      totalReviews = profileData.totalReviews;
      availabilityStatus = profileData.availabilityStatus;
      description = profileData.description;
      userId = caller;
      createdAt = Time.now();
      portfolio_images = [];
    };

    organizers.add(caller, newProfile);
  };

  // Get Organizer Profile for the caller (Organiser Dashboard)
  // Only the organizer themselves or an admin can view their own profile via this endpoint
  public query ({ caller }) func getOrganizerProfile() : async ?OrganizerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their organizer profile");
    };
    organizers.get(caller);
  };

  // Event Creation - Only authenticated users (guests) can create events
  public shared ({ caller }) func createEvent(
    eventType : EventType,
    locationType : LocationType,
    numberOfGuests : Nat,
    eventStyle : EventStyle,
    contact_number : Text,
    date : Time.Time,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create events");
    };

    if (date < Time.now()) {
      Runtime.trap("Cannot create events in the past");
    };

    let event : Event = {
      id = eventIdCounter;
      eventType;
      locationType;
      numberOfGuests;
      eventStyle;
      contact_number;
      owner = caller;
      createdAt = Time.now();
      date;
    };
    events.add(eventIdCounter, event);
    eventIdCounter += 1;
    event.id;
  };

  // Booking Request - Only event owners can request bookings
  public shared ({ caller }) func requestBooking(eventId : Nat, organizerId : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request bookings");
    };

    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found for ID " # eventId.toText());
      };
      case (?event) {
        event;
      };
    };

    // Verify caller owns the event
    if (event.owner != caller) {
      Runtime.trap("Unauthorized: Only the event owner can request bookings for this event");
    };

    let organizer = switch (organizers.get(organizerId)) {
      case (null) {
        Runtime.trap("Organizer not found");
      };
      case (?organizer) {
        organizer;
      };
    };

    let booking : Booking = {
      id = bookingIdCounter;
      eventId;
      organizerId;
      guestId = caller;
      organizerName = organizer.companyName;
      bookingStatus = #requested;
      bookingDate = Time.now();
    };
    bookings.add(bookingIdCounter, booking);
    bookingIdCounter += 1;
    booking.id;
  };

  // Update Booking Status - Only the organizer of the booking can update status
  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update booking status");
    };

    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found: " # bookingId.toText());
      };
      case (?booking) {
        if (caller != booking.organizerId) {
          Runtime.trap("Unauthorized: Only the organizer of this booking can update its status");
        };
        let updatedBooking = { booking with bookingStatus = status };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  // Submit Review - Only authenticated users who own the event can submit reviews
  public shared ({ caller }) func submitReview(
    organizerId : Principal,
    rating : Nat,
    comment : Text,
    eventId : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5. Given: " # rating.toText());
    };

    // Verify the event exists and caller owns it
    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found");
      };
      case (?event) {
        event;
      };
    };

    if (event.owner != caller) {
      Runtime.trap("Unauthorized: Only the event owner can submit reviews for this event");
    };

    let review : Review = {
      id = bookingIdCounter;
      rating;
      comment;
      eventId;
      organizerId;
      userId = caller;
      createdAt = Time.now();
    };
    reviews.add(bookingIdCounter, review);
    bookingIdCounter += 1;
  };

  // Add Portfolio Image for Organizer - Only the organizer can add to their own portfolio
  public shared ({ caller }) func addPortfolioImage(filename : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload portfolio images");
    };

    // Verify caller has an organizer profile
    let organizer = switch (organizers.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Only organizers can add portfolio images. Create an organizer profile first.");
      };
      case (?organizer) {
        organizer;
      };
    };

    let portfolioImage : PortfolioImage = {
      filename;
      uploaded_at = Time.now();
    };

    let updatedImages = organizer.portfolio_images.concat([portfolioImage]);
    let updatedOrganizer = { organizer with portfolio_images = updatedImages };
    organizers.add(caller, updatedOrganizer);
  };

  // Delete Portfolio Image - Only the organizer can delete from their own portfolio
  public shared ({ caller }) func deletePortfolioImage(filename : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete portfolio images");
    };

    let organizer = switch (organizers.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Only organizers can delete portfolio images. No organizer profile found.");
      };
      case (?profile) {
        profile;
      };
    };

    let filteredImages = organizer.portfolio_images.filter(
      func(image) {
        image.filename != filename;
      }
    );

    if (filteredImages.size() == organizer.portfolio_images.size()) {
      return false; // No images were deleted
    };

    let updatedOrganizer = { organizer with portfolio_images = filteredImages };
    organizers.add(caller, updatedOrganizer);
    true;
  };

  // Get Portfolio Images for Organizer - Public, anyone can view
  public query ({ caller }) func getOrganizerPortfolioImages(organizerId : Principal) : async [PortfolioImage] {
    switch (organizers.get(organizerId)) {
      case (null) {
        [];
      };
      case (?organizer) {
        organizer.portfolio_images;
      };
    };
  };

  // Get Portfolio Images for the caller organizer (Organiser Dashboard)
  // Only the organizer themselves can retrieve their own portfolio images via this endpoint
  public query ({ caller }) func getPortfolioImages() : async [PortfolioImage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their portfolio images");
    };
    switch (organizers.get(caller)) {
      case (null) {
        [];
      };
      case (?organizer) {
        organizer.portfolio_images;
      };
    };
  };

  // Get Portfolio Images for Event - Returns portfolio images from organizers who have bookings for this event
  // Fixed: properly handle the null case without returning a mismatched type
  public query ({ caller }) func getEventPortfolioImages(eventId : Nat) : async [PortfolioImage] {
    let event = switch (events.get(eventId)) {
      case (null) {
        return [];
      };
      case (?event) { event };
    };

    if (caller != event.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the event owner or admin can view portfolio images for this event");
    };

    // Collect portfolio images only from organizers who have bookings for this event
    let eventImagesList = List.empty<PortfolioImage>();
    for (booking in bookings.values()) {
      if (booking.eventId == eventId) {
        switch (organizers.get(booking.organizerId)) {
          case (null) { /* Skip if organizer not found */ };
          case (?organizer) {
            for (image in organizer.portfolio_images.values()) {
              eventImagesList.add(image);
            };
          };
        };
      };
    };
    eventImagesList.toArray();
  };

  // Get Organizer Bookings - Only the organizer themselves or admins can view
  public query ({ caller }) func getOrganizerBookings(organizerId : Principal) : async [Booking] {
    if (caller != organizerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings or be an admin");
    };

    let bookingList = List.empty<Booking>();
    for (booking in bookings.values()) {
      if (booking.organizerId == organizerId) {
        bookingList.add(booking);
      };
    };
    bookingList.toArray();
  };

  // Filter Organizers - Public query, anyone can filter organizers
  public query ({ caller }) func filterOrganizers(
    eventType : EventType,
    locationType : LocationType,
    numberOfGuests : Nat,
    eventStyle : EventStyle,
  ) : async [OrganizerProfile] {
    let filteredOrganizers = organizers.values().toArray();
    let sortedOrganizers = filteredOrganizers.sort();
    let filtered = sortedOrganizers.filter(
      func(organizer : OrganizerProfile) : Bool {
        switch (organizer.availabilityStatus) {
          case (#available) { true };
          case (#busy) { false };
        };
      }
    );
    filtered;
  };

  // Get Event Bookings - Only event owner or admin can view
  // Fixed: properly handle the null case without returning a mismatched type
  public query ({ caller }) func getEventBookings(eventId : Nat) : async [Booking] {
    let event = switch (events.get(eventId)) {
      case (null) {
        return [];
      };
      case (?event) {
        event;
      };
    };

    if (caller != event.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the event owner or admin can view event bookings");
    };

    let bookingList = List.empty<Booking>();
    for (booking in bookings.values()) {
      if (booking.eventId == eventId) {
        bookingList.add(booking);
      };
    };
    bookingList.toArray();
  };

  // Get Event - Only event owner or admin can view specific event details
  public query ({ caller }) func getEvent(eventId : Nat) : async Event {
    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found.");
      };
      case (?event) { event };
    };

    if (caller != event.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the event owner or admin can view this event");
    };

    event;
  };

  // Get All Events - Admin only
  public query ({ caller }) func getAllEvents() : async [Event] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all events");
    };
    events.values().toArray();
  };

  // Get Guest Events - Only the guest themselves or admin can view
  public query ({ caller }) func getGuestEvents(guestId : Principal) : async [Event] {
    if (caller != guestId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own events or be an admin");
    };

    let guestEvents = List.empty<Event>();
    for (event in events.values()) {
      if (event.owner == guestId) {
        guestEvents.add(event);
      };
    };
    guestEvents.toArray();
  };

  // Get Organizer - Public query, anyone can view organizer profiles
  public query ({ caller }) func getOrganizer(organizerId : Principal) : async OrganizerProfile {
    switch (organizers.get(organizerId)) {
      case (null) {
        Runtime.trap("Organizer not found.");
      };
      case (?organizer) { organizer };
    };
  };

  // Get All Organizers - Public query, anyone can browse organizers
  public query ({ caller }) func getAllOrganizers() : async [OrganizerProfile] {
    organizers.values().toArray();
  };

  // Get Booking - Only booking participants (guest or organizer) or admin can view
  public query ({ caller }) func getBooking(bookingId : Nat) : async Booking {
    let booking = switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found.");
      };
      case (?booking) { booking };
    };

    if (caller != booking.guestId and caller != booking.organizerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only booking participants or admin can view this booking");
    };

    booking;
  };

  // Get All Bookings - Admin only
  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  // Get Guest Bookings - Only the guest themselves or admin can view
  public query ({ caller }) func getGuestBookings(guestId : Principal) : async [Booking] {
    if (caller != guestId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings or be an admin");
    };

    let guestBookings = List.empty<Booking>();
    for (booking in bookings.values()) {
      if (booking.guestId == guestId) {
        guestBookings.add(booking);
      };
    };
    guestBookings.toArray();
  };

  // Get Reviews for Organizer - Public query, anyone can view organizer reviews
  public query ({ caller }) func getReviewsForOrganizer(organizerId : Principal) : async [Review] {
    let organizerReviews = List.empty<Review>();
    for (review in reviews.values()) {
      if (review.organizerId == organizerId) {
        organizerReviews.add(review);
      };
    };
    organizerReviews.toArray();
  };

  // Get Reviews for Event - Only event owner or admin can view
  public query ({ caller }) func getReviewsForEvent(eventId : Nat) : async [Review] {
    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found");
      };
      case (?event) {
        event;
      };
    };

    if (caller != event.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the event owner or admin can view event reviews");
    };

    let eventReviews = List.empty<Review>();
    for (review in reviews.values()) {
      if (review.eventId == eventId) {
        eventReviews.add(review);
      };
    };
    eventReviews.toArray();
  };

  // Get Review - Public query, anyone can view individual reviews
  public query ({ caller }) func getReview(reviewId : Nat) : async Review {
    switch (reviews.get(reviewId)) {
      case (null) {
        Runtime.trap("Review not found.");
      };
      case (?review) { review };
    };
  };

  // Get All Reviews - Admin only
  public query ({ caller }) func getAllReviews() : async [Review] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all reviews");
    };
    reviews.values().toArray();
  };

  // Get Event Reviews - Only event owner or admin can view
  public query ({ caller }) func getEventReviews(eventId : Nat) : async [Review] {
    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found");
      };
      case (?event) {
        event;
      };
    };

    if (caller != event.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the event owner or admin can view event reviews");
    };

    let eventReviews = List.empty<Review>();
    for (review in reviews.values()) {
      if (review.eventId == eventId) {
        eventReviews.add(review);
      };
    };
    eventReviews.toArray();
  };

  // Get Organizer Reviews - Public query, anyone can view organizer reviews
  public query ({ caller }) func getOrganizerReviews(organizerId : Principal) : async [Review] {
    let organizerReviews = List.empty<Review>();
    for (review in reviews.values()) {
      if (review.organizerId == organizerId) {
        organizerReviews.add(review);
      };
    };
    organizerReviews.toArray();
  };

  // Get Bookings for Event - Only event owner or admin can view
  public query ({ caller }) func getBookingsForEvent(eventId : Nat) : async [Booking] {
    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found");
      };
      case (?event) {
        event;
      };
    };

    if (caller != event.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the event owner or admin can view event bookings");
    };

    let eventBookings = List.empty<Booking>();
    for (booking in bookings.values()) {
      if (booking.eventId == eventId) {
        eventBookings.add(booking);
      };
    };
    eventBookings.toArray();
  };

  // Get Free Organizers - Public query, anyone can check organizer availability
  public query ({ caller }) func getFreeOrganizers(startTime : Int, endTime : Int) : async [OrganizerProfile] {
    let freeOrganizers = List.empty<OrganizerProfile>();
    let allOrganizers = organizers.values().toArray();
    let allBookings = bookings.values().toArray();

    for (organizer in allOrganizers.values()) {
      var isFree = true;
      for (booking in allBookings.values()) {
        if (
          booking.organizerId == organizer.userId and
          booking.bookingDate >= startTime and
          booking.bookingDate <= endTime
        ) {
          isFree := false;
        };
      };
      if (isFree) {
        freeOrganizers.add(organizer);
      };
    };
    freeOrganizers.toArray();
  };

  // Get Bookings by Status - Admin only
  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can filter bookings by status");
    };

    let bookingsWithStatus = List.empty<Booking>();
    for (booking in bookings.values()) {
      if (booking.bookingStatus == status) {
        bookingsWithStatus.add(booking);
      };
    };
    bookingsWithStatus.toArray();
  };

  // Create booking - Only event owners can create bookings for their events
  public shared ({ caller }) func createBooking(eventId : Nat, organizerId : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create bookings");
    };

    let event = switch (events.get(eventId)) {
      case (null) {
        Runtime.trap("Event not found");
      };
      case (?event) {
        event;
      };
    };

    // Verify caller owns the event
    if (event.owner != caller) {
      Runtime.trap("Unauthorized: Only the event owner can create bookings for this event");
    };

    let organizer = switch (organizers.get(organizerId)) {
      case (null) {
        Runtime.trap("Organizer not found");
      };
      case (?organizer) {
        organizer;
      };
    };

    let booking : Booking = {
      id = bookingIdCounter;
      eventId;
      organizerId;
      guestId = caller;
      organizerName = organizer.companyName;
      bookingStatus = #requested;
      bookingDate = Time.now();
    };
    bookings.add(bookingIdCounter, booking);
    bookingIdCounter += 1;
    booking.id;
  };

  // ------------------ New Functionality: Event Photo Storage ------------------

  // Upload Event Photo - Only the organizer can upload their own photos
  public shared ({ caller }) func uploadEventPhoto(image : Storage.ExternalBlob, contentType : Text, filename : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload event photos");
    };

    // Verify caller has an organizer profile
    switch (organizers.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Only organizers can upload event photos. Create an organizer profile first.");
      };
      case (?_) { /* Organizer profile exists, proceed */ };
    };

    let photoId = photoIdCounter;
    photoIdCounter += 1;

    let eventPhoto : EventPhoto = {
      id = photoId;
      owner = caller;
      blob = image;
      contentType;
      filename;
      uploadedAt = Time.now();
    };

    // Save Photo to Map
    eventPhotos.add(photoId, eventPhoto);

    photoId;
  };

  // Get Public Event Photos for Organizer - Anyone can retrieve an organizer's public photos
  public query ({ caller }) func getPublicEventPhotos(organizerId : Principal) : async [EventPhoto] {
    switch (organizers.get(organizerId)) {
      case (null) {
        Runtime.trap("Organizer profile not found.");
      };
      case (?_) {
        /* Only check for existence */
      };
    };

    let filteredPhotos = eventPhotos.values().toArray().filter(
      func(photo) {
        photo.owner == organizerId;
      }
    );

    filteredPhotos;
  };

  // Get Event Photos for the caller organizer (Organiser Dashboard)
  // Only the organizer themselves can retrieve their own photos via this endpoint
  public query ({ caller }) func getEventPhotos() : async [EventPhoto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view event photos");
    };

    // Verify caller has an organizer profile
    switch (organizers.get(caller)) {
      case (null) {
        Runtime.trap("Organizer profile not found.");
      };
      case (?_) { /* Organizer profile exists, proceed */ };
    };

    let filteredPhotos = eventPhotos.values().toArray().filter(
      func(photo) {
        photo.owner == caller;
      }
    );

    filteredPhotos;
  };

  // Delete Event Photo - Only the organizer can delete their own photos
  public shared ({ caller }) func deleteEventPhoto(photoId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete event photos");
    };

    switch (eventPhotos.get(photoId)) {
      case (null) {
        false;
      };
      case (?photo) {
        if (photo.owner != caller) {
          Runtime.trap("Unauthorized: Only the photo owner can delete");
        };
        eventPhotos.remove(photoId);
        true;
      };
    };
  };
};
