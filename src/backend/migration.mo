import Map "mo:core/Map";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";

module {
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, {
      fullName : Text;
      email : Text;
      role : AccessControl.UserRole;
      createdAt : Time.Time;
    }>;
    guests : Map.Map<Principal, {
      fullName : Text;
      email : Text;
      createdAt : Time.Time;
    }>;
    events : Map.Map<Nat, {
      id : Nat;
      eventType : { #wedding; #birthday; #anniversary; #corporate };
      locationType : { #home; #destination };
      numberOfGuests : Nat;
      eventStyle : { #family; #couple; #friends; #corporate };
      contact_number : Text;
      owner : Principal;
      createdAt : Time.Time;
      date : Time.Time;
    }>;
    organizers : Map.Map<Principal, {
      companyName : Text;
      contactNumber : Text;
      experienceYears : Nat;
      pricingRange : Text;
      totalReviews : Nat;
      availabilityStatus : { #available; #busy };
      description : Text;
      userId : Principal;
      createdAt : Time.Time;
      portfolio_images : [{
        filename : Text;
        uploaded_at : Time.Time;
      }];
    }>;
    bookings : Map.Map<Nat, {
      id : Nat;
      eventId : Nat;
      organizerId : Principal;
      organizerName : Text;
      bookingStatus : { #requested; #approved; #rejected; #completed };
      bookingDate : Time.Time;
      guestId : Principal;
    }>;
    reviews : Map.Map<Nat, {
      id : Nat;
      rating : Nat;
      comment : Text;
      eventId : Nat;
      organizerId : Principal;
      userId : Principal;
      createdAt : Time.Time;
    }>;
    eventIdCounter : Nat;
    bookingIdCounter : Nat;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, {
      fullName : Text;
      email : Text;
      role : AccessControl.UserRole;
      createdAt : Time.Time;
    }>;
    guests : Map.Map<Principal, {
      fullName : Text;
      email : Text;
      createdAt : Time.Time;
    }>;
    events : Map.Map<Nat, {
      id : Nat;
      eventType : { #wedding; #birthday; #anniversary; #corporate };
      locationType : { #home; #destination };
      numberOfGuests : Nat;
      eventStyle : { #family; #couple; #friends; #corporate };
      contact_number : Text;
      owner : Principal;
      createdAt : Time.Time;
      date : Time.Time;
    }>;
    organizers : Map.Map<Principal, {
      companyName : Text;
      contactNumber : Text;
      experienceYears : Nat;
      pricingRange : Text;
      totalReviews : Nat;
      availabilityStatus : { #available; #busy };
      description : Text;
      userId : Principal;
      createdAt : Time.Time;
      portfolio_images : [{
        filename : Text;
        uploaded_at : Time.Time;
      }];
    }>;
    bookings : Map.Map<Nat, {
      id : Nat;
      eventId : Nat;
      organizerId : Principal;
      organizerName : Text;
      bookingStatus : { #requested; #approved; #rejected; #completed };
      bookingDate : Time.Time;
      guestId : Principal;
    }>;
    reviews : Map.Map<Nat, {
      id : Nat;
      rating : Nat;
      comment : Text;
      eventId : Nat;
      organizerId : Principal;
      userId : Principal;
      createdAt : Time.Time;
    }>;
    eventPhotos : Map.Map<Nat, {
      id : Nat;
      owner : Principal;
      blob : Storage.ExternalBlob;
      contentType : Text;
      filename : Text;
      uploadedAt : Time.Time;
    }>;
    eventIdCounter : Nat;
    bookingIdCounter : Nat;
    photoIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      eventPhotos = Map.empty<Nat, {
        id : Nat;
        owner : Principal;
        blob : Storage.ExternalBlob;
        contentType : Text;
        filename : Text;
        uploadedAt : Time.Time;
      }>();
      photoIdCounter = 0;
    };
  };
};
