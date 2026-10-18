# Service-section background videos

Put these exact MP4 files in this folder:

- `branding.mp4` — Brand Identity (service 01)
- `digital-marketing.mp4` — Digital Marketing (service 03)
- `technology.mp4` — Web Design & Digital Experiences (service 04)

The home page reads them from `/videos/services/<filename>.mp4`.
Only the active service-stage video plays while its scroll section is visible.
All other videos are paused. Leaving the section or switching browser tabs
pauses playback. The existing WebP service image is shown until the video
starts playing, and is retained if the MP4 cannot be loaded.

For reliable silent background playback across browsers, use a browser-compatible
H.264-encoded MP4, keep files compressed, and include no essential audio.
Playback is muted, inline, and looping. Visitors with reduced-motion enabled
see still images instead of autoplaying video.

These are instructions only. This repository does not yet include the three
MP4 binaries; add the actual files before expecting video playback.
Service detail pages continue to use the image assets.
