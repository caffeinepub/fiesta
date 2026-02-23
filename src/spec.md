# Specification

## Summary
**Goal:** Add persistent event photo storage and management capabilities for organizers, allowing them to upload, view, and delete event photos that persist across sessions.

**Planned changes:**
- Add stable storage for event photos in the backend with organizer ownership tracking
- Implement backend methods for uploading, retrieving, and deleting event photos with proper authorization
- Add event photo upload interface to the OrganizerDashboard with file input and progress indicator
- Create an event photo gallery component displaying photos in a grid layout with full-size lightbox view
- Add delete functionality with confirmation dialog for each photo
- Create React Query hooks for event photo operations with proper cache management

**User-visible outcome:** Organizers can upload event photos from their dashboard, view them in a persistent gallery that survives browser sessions and tab closures, and delete photos with a confirmation dialog. All photos are stored permanently until explicitly deleted by the organizer.
