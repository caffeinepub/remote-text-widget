# Specification

## Summary
**Goal:** Add freehand drawing/sketching capability to the TextWidget app, allowing senders to sketch and send drawings to paired recipient devices.

**Planned changes:**
- Add a "Text" / "Draw" mode toggle on the Sender page
- In Draw mode, display a freehand canvas supporting mouse and touch input with a clear button and basic color/stroke size controls
- Encode the drawing as a base64 data URL and send it via the existing send button
- On the Recipient/Widget page, detect whether the incoming message is a drawing (data URL) or plain text and render accordingly (image fills the display area for drawings, text renders as before)
- Extend backend message storage to support larger payloads (base64-encoded image strings) without truncation in both sendMessage and pollMessage

**User-visible outcome:** Senders can switch to a draw mode, sketch freehand, and send the drawing to the paired recipient widget, which displays it as a full-screen image alongside the existing text message functionality.
