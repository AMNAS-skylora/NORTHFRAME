# Mobile motion verification

Use Node 24 LTS. Full animations always run, including when the browser requests reduced motion. There is no motion option, prompt or saved preference. The 3D hero remains desktop-only. Hero text starts immediately and sits above the brand intro animation, before the scroll-based Introduction section.

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

1. Open the latest main deployment. Confirm that this is the new NORTHFRAME project, not an older `n-*` deployment.
2. Record model, OS/browser version and whether Reduce Motion is on. Test with Reduce Motion both on and off; full animations should run in either case.
3. On a cold load, watch hero text animate while the logo intro is still running; then confirm it releases page scrolling. Scroll through Introduction, What We Do, Expertise, Work, Vision, USPs, Founder and Contact. Text must not remain invisible when in view.
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
| iPhone Safari | Cold-load with Reduce Motion ON and OFF, then scroll each section slowly and quickly | Intro releases scrolling within 4 seconds; entrances reveal when reached; text never stays invisible |
| iPhone Safari | Rotate in What We Do; expand/collapse toolbar; switch apps and return; navigate away and Back | Layout adapts; services remain sticky during their scroll range; no stuck intro overlay |
| Android Chrome | Repeat with animation reduction enabled and disabled: cold load, fast swipes, rotation and Back | Visible content and service progression; no blank sections or duplicate reveals |
| Both phones | Enable motion reduction and repeat | Full text entrances and stepped service wipes still animate; no enable button appears |
| Desktop Chrome/Safari | Open localhost:3000 at 1440×900; scroll services forward/back; resize to 390px and back | Desktop pinning/transitions and text reveals work; no duplicate pin spacing or hidden content after resizing |

For failing iPhone runs, use a Mac's Safari → Develop → [iPhone] → page to collect console errors. For Android, connect USB with debugging enabled and inspect through desktop Chrome `chrome://inspect/#devices`. Record the commit/deployment URL alongside the error.

## Intro stuck before hydration

`BrandIntro.tsx` used to render an opaque full-screen overlay in server HTML. Its 4-second timeout only ran after client hydration. Missing/blocked JavaScript could therefore leave the overlay forever. The overlay now starts hidden and non-interactive; GSAP activates it only when the client is ready. The hero logo is visible in server HTML too. A recovery timer is armed in the layout effect before scroll locking/GSAP setup. Normal intro timing is preserved.

```sh
npx playwright install --with-deps chromium
npm run build
npm run test:intro-recovery
```

The test uses a 390px touch viewport. With JavaScript disabled or Next script requests aborted, the overlay must be hidden, the hero logo visible, and scrolling usable. With an image decode promise that never resolves, the intro must start by the asset deadline and complete without leaving scroll locked. A normal run must also finish and reveal the hero. These intentionally injected failures do not prove a particular phone has blocked JavaScript.

The changes are deployed from main. Confirm the deployment commit in Vercel.

## Service stepped mask verification

Run `npm run test:service-steps` after installing Playwright Chromium and building. It tests 375/390/430px touch viewports plus reduced motion. At the middle of the first wipe, hit testing must find the old panel on the left and the next panel on the right, proving a visible stepped edge. All panels must stay at opacity 1. The mobile clip container must have no transform; child image zoom is retained. The stage must stay sticky, reach the final panel and reverse. The same stepped wipe also runs with reduced motion enabled.

On an actual phone, scroll slowly between every service with Reduce Motion both ON and OFF. The incoming image/text must share a staircase edge, not dissolve. Repeat upward, rotate and repeat. With Reduce Motion on, expect the same animated stepped panel transitions. Desktop polygons, pinning and timing are unchanged. Physical-device compositing still needs verification.

## Always-full animations and early hero text

Run `npm run test:motion-preference` after `npm run build` (install Chromium using `npx playwright install chromium` if needed).

The test covers 375/390px touch browsers requesting reduced motion, blocked localStorage, and a 1440px desktop. Hero text must move while the brand intro is still visible, with the foreground above the intro layer. No animation preference button should exist. Full animation mode must remain enabled after reload, regardless of the browser’s Reduce Motion setting.

On physical iPhone Safari and Android Chrome, confirm the same early hero text, forward/reverse service wipes, and subsequent section reveals. No saved setting or phone-setting change is required. Automated browser emulation is not physical phone certification.
