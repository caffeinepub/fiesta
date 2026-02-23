# Specification

## Summary
**Goal:** Restore missing navigation menu items in the Header component that disappeared after Version 20 deployment.

**Planned changes:**
- Fix the Header component to display all navigation links ('My Events', 'Find Organizers', 'My Bookings', 'Organizer Dashboard') for authenticated users
- Verify conditional rendering logic correctly shows menu items based on authentication state
- Ensure mobile hamburger menu displays all navigation options
- Confirm no CSS rules are unintentionally hiding navigation items

**User-visible outcome:** Authenticated users will see the complete navigation menu with all expected links (My Events, Find Organizers, My Bookings, Organizer Dashboard) alongside the logout button, restoring the navigation experience from before Version 20.
