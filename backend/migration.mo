import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type OldPortfolioImage = { filename : Text; uploaded_at : Time.Time };
  type OldOrganizerProfile = {
    companyName : Text;
    contactNumber : Text;
    experienceYears : Nat;
    pricingRange : Text;
    totalReviews : Nat;
    availabilityStatus : { #available; #busy };
    description : Text;
    userId : Principal;
    createdAt : Time.Time;
    portfolio_images : [OldPortfolioImage];
  };

  type OldActor = {
    eventIdCounter : Nat;
    bookingIdCounter : Nat;
    photoIdCounter : Nat;
    organizers : Map.Map<Principal, OldOrganizerProfile>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
