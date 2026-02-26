# Specification

## Summary
**Goal:** Separate portfolio images and event photos into completely distinct data sections, and fix the Find Organisers page so customers can view organisers' event photos correctly.

**Planned changes:**
- Ensure backend queries and mutations for portfolio images (`OrganizerProfile.portfolio_images`) and event photos (`EventPhoto` records) are fully isolated — no cross-contamination between the two
- Fix the `OrganizerCard` / `EventPhotoLightbox` on the Find Organisers page so the "View" button loads only that organiser's event photos (not portfolio images), with an empty state if none exist
- In the Organiser Dashboard, separate the "Events Photos" upload section (`EventPhotoUpload`) from the "Portfolio Images" upload section (`PortfolioUpload`) with clear labels, each reading/writing only their respective data
- In `OrganizerProfileView`, ensure the portfolio gallery renders only `portfolio_images` and never displays event photos

**User-visible outcome:** Organisers can upload and manage event photos independently from portfolio images in their dashboard. Customers browsing the Find Organisers page can click "View" on an organiser card to see only that organiser's event photos, while the organiser profile view correctly shows only portfolio images.
