# Specification

## Summary
**Goal:** Enable organizers to delete portfolio images they have previously uploaded.

**Planned changes:**
- Add backend function to delete portfolio images from an organizer's portfolio
- Create React Query mutation hook for deleting portfolio images
- Update PortfolioUpload component to display delete buttons on existing image thumbnails
- Remove deleted image files from the static assets directory after successful deletion

**User-visible outcome:** Organizers can view their uploaded portfolio images with a delete button on each thumbnail, click to confirm deletion, and remove unwanted images from their portfolio.
