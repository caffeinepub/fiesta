# Specification

## Summary
**Goal:** Fix image display issues where portfolio and event photos show "Image Not Found" or "No Image" placeholders instead of the actual uploaded images.

**Planned changes:**
- Fix the image conversion logic in `PortfolioGallery` and `OrganizerCard` components to correctly convert backend Uint8Array/blob data into a valid base64 data URL or object URL.
- Fix the same image conversion issue in `EventPhotoGallery` so event photos display correctly in the grid and lightbox.
- Create a single shared utility function for Uint8Array/blob-to-URL conversion and replace any independent conversion logic in `PortfolioGallery`, `PortfolioUpload`, `EventPhotoGallery`, `EventPhotoUpload`, and `OrganizerCard` with calls to this shared helper.

**User-visible outcome:** Uploaded portfolio images and event photos display correctly in their respective grids and lightbox dialogs instead of showing "Image Not Found" or "No Image" placeholders.
