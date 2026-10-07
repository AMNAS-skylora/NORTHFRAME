# Mobile motion verification

Use Node 22. The home page respects the phone's `prefers-reduced-motion` setting. With Reduce Motion enabled, several entrances are intentionally static; service panels use opacity transitions. The 3D hero is intentionally desktop-only. Neither of these is a failed mobile reveal.

## Repeatable browser checks

```sh
npm ci
npx playwright install --with-deps webkit
npm run build
npm run test:mobile-motion
```

The script starts a production server on port 3105. Set `MOTION_TEST_ORIGIN` to use an already-running server. `WEBKIT_EXECUTABLE_PATH` optionally selects a locally installed WebKit runner; normally leave it unset.

Tests cover mobile WebKit at 375, 390 and 430px, normal/reduced motion, absent IntersectionObserver support, and an observer which never delivers callbacks. Offscreen content must stay ready for its entrance, then reveal after scrolling. The service showcase must reach its final panel, reverse, and retain native sticky positioning. JavaScript errors fail the test.

These are WebKit engine tests, not physical iOS Safari certification. The callback-failure case is deliberately injected: it demonstrates resilience but does not establish why a particular phone failed.

## Physical phone checks

1. Open the deployment for the new PR commit. Confirm that this is the new NORTHFRAME project, not an older `n-*` deployment.
2. Record model, OS/browser version and whether Reduce Motion is on. For normal animation verification, use an explicit no-reduction device setting; separately verify reduced motion remains usable.
3. On a cold load, watch the logo intro finish and release page scrolling. Scroll through Introduction, What We Do, Expertise, Work, Vision, USPs, Founder and Contact. Text must not remain invisible when in view.
4. Repeat with quick down/up swipes, portrait/landscape rotation, browser toolbar expansion, switching apps and returning, and service-page navigation followed by Back.
5. Repeat on Android Chrome. On desktop, compare the existing stepped service transitions and text reveals; their desktop trigger paths/timings are preserved by this change.

If only the real phone fails, capture a short screen recording and the Safari Web Inspector/Chrome remote console error. A successful build alone does not prove device animation correctness.

## Local device setup

Use a computer on the same Wi-Fi as the phone:

```sh
npm ci
npm run build
npm run start -- --hostname 0.0.0.0 --port 3000
```

Find its LAN address with `ipconfig` (Windows), `ipconfig getifaddr en0` (macOS Wi-Fi), or `hostname -I` (Linux). Open `http://<LAN-IP>:3000` on the phone. Allow port 3000 through the computer firewall if needed.

| Browser | Steps | Expected result |
| --- | --- | --- |
| iPhone Safari | Settings → Accessibility → Motion → Reduce Motion off; cold-load, then scroll each section slowly and quickly | Intro releases scrolling within 4 seconds; entrances reveal when reached; text never stays invisible |
| iPhone Safari | Rotate in What We Do; expand/collapse toolbar; switch apps and return; navigate away and Back | Layout adapts; services remain sticky during their scroll range; no stuck intro overlay |
| Android Chrome | Disable animation reduction for the normal-motion run; repeat cold load, fast swipes, rotation and Back | Visible content and service progression; no blank sections or duplicate reveals |
| Both phones | Enable motion reduction and repeat | Content stays visible and usable; reduced/static entrances are intentional |
| Desktop Chrome/Safari | Open localhost:3000 at 1440×900; scroll services forward/back; resize to 390px and back | Desktop pinning/transitions and text reveals work; no duplicate pin spacing or hidden content after resizing |

For failing iPhone runs, use a Mac's Safari → Develop → [iPhone] → page to collect console errors. For Android, connect USB with debugging enabled and inspect through desktop Chrome `chrome://inspect/#devices`. Record the commit/deployment URL alongside the error.
