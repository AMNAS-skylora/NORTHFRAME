# NORTHFRAME service media

The public service-stage MP4 files live in this directory:

| Service | Video | Optional poster |
| --- | --- | --- |
| Brand Identity | `branding.mp4` | `branding.webp` |
| Digital Marketing | `digital-marketing.mp4` | `digital-marketing.webp` |
| Web Design & Digital Experiences | `technology.mp4` | `technology.webp` |

Next.js serves these files at URLs like `/images/services/branding.mp4`.
The website uses the matching WebP as an image background while the video
loads. If the poster is unavailable, a dark gradient prevents the broken
image icon, and the MP4 still plays once loaded.

The service scroll story plays only its active video's muted, looping
background, pauses it on section exit or tab hide, and switches videos
when the next service is revealed. Users who prefer reduced motion see
still backgrounds instead of autoplay.

The MP4s are already committed. The three optional WebP posters were not
present on the checked `main` branch at the time this documentation was
written. Add and commit the local poster files if you want reliable image
fallbacks across deployments and on individual service detail pages.

Recommended: H.264 encoded MP4s, muted background playback, compressed
resolution appropriate for mobile and desktop.
