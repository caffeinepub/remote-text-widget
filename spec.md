# Specification

## Summary
**Goal:** Transform the existing Doodle Room app into a multiplayer collaborative drawing and voice messaging experience using a room-based system.

**Planned changes:**
- Add backend room management: create a room (generates unique code) and join a room by code, storing participant list and canvas stroke state per room
- Add backend support for submitting and fetching drawing strokes per room so late joiners receive the full canvas state
- Add backend voice message storage per room (base64-encoded audio) with sender identifier and timestamp
- Replace the existing home page flow with a lobby offering "Create Room" and "Join Room" options
- Add a `/room/:code` route rendering a shared room page with: collaborative drawing canvas, color/stroke controls, voice message panel (record button + scrollable message history), participant count, and room code display
- Implement frontend polling for new strokes and voice messages at short intervals
- Update TanStack Router routes and App.tsx; remove old sender/recipient flow
- Maintain existing pastel/doodle visual theme

**User-visible outcome:** Users can create or join a named room via a code, collaboratively draw on a shared canvas in real time, and send/receive short voice messages — all visible to every participant in the room.
