# Specification

## Summary
**Goal:** Fix three frontend issues: real-time booking list updates on the GuestBookings page, inline booking requests on the OrganizerDashboard, and a visible "Book Now" button on OrganizerCard.

**Planned changes:**
- Invalidate or refetch the React Query bookings cache immediately after a successful booking mutation so the GuestBookings page updates in real-time without a manual refresh.
- Add an inline section to OrganizerDashboard that displays the organiser's incoming booking requests using OrganizerBookingList/OrganizerBookingCard components, without navigating to a separate page.
- Fix the colour contrast on the "Book Now" button in OrganizerCard so the button text is clearly visible, consistent with the navy/gold theme.

**User-visible outcome:** Guests see their new booking appear instantly after booking an organiser; organisers can view incoming booking requests directly within their dashboard; the "Book Now" button label is clearly legible on the Find Organisers page.
