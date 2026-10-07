# Deployment runtime

The project targets Node.js **24.x LTS**, which Vercel supports for builds and functions. `package.json` and the lockfile use the same engine requirement; `.nvmrc` and `.node-version` select major 24 for local/version-manager builds. On Vercel, `engines.node` overrides the project's dashboard selection for new deployments. Existing deployments are not rebuilt by changing a version setting alone.

Build logs print `node --version` before Next.js starts. Use that line to confirm that a new deployment used v24.x. Keep Vercel Settings → Build and Deployment → Node.js Version at 24.x too for consistency. Other hosting providers must support Node 24 and honor the version files or have their build/runtime setting selected explicitly.

With nvm on macOS/Linux:

```sh
nvm install 24
nvm use 24
node --version
npm ci
npm run build
```

On Windows with nvm-windows, install an available Node 24 LTS patch and use that full version (`nvm install <24.x.y>` then `nvm use <24.x.y>`). Confirm `node --version` starts with v24 before running npm ci/build.

Mobile animation runs in the browser. A Node version alignment fixes runtime/build consistency; it does not by itself fix Safari animation behavior.

The hero entrance now starts automatically after the existing intro handoff and 0.16-second timeline delay. It no longer waits for a mobile-only double requestAnimationFrame callback or calls ScrollTrigger.refresh before starting. Desktop timings and service scroll pin/scrub values are preserved. Hero service names are visible in server HTML when JavaScript is unavailable.

```sh
npx playwright install --with-deps chromium
npm run build
npm run test:intro-recovery
```

The hero test samples the text during its movement and checks that all five service names end at opacity 1 with no remaining Y translation. Normal mobile runs cover 375, 390 and 430px; it also covers unavailable JavaScript and stalled intro image decode. Real phone verification is documented in mobile-motion-verification.md.

References:
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://nodejs.org/en/download
