# NORTHFRAME control panel

This project uses Next.js Route Handlers, MongoDB Atlas and direct signed Cloudinary uploads. It does not require a separate NestJS server.

## Connect accounts

1. Create an Atlas cluster and database user with read/write access to the `northframe` database. Add your local/deployment outbound IPs in Atlas Network Access. Copy the connection string into `MONGODB_URI`; percent-encode special characters in the database password.
2. Create a Cloudinary product environment and copy its cloud name, API key and API secret into the server environment. Both image and video uploads are supported; the account plan determines upload, storage and bandwidth quotas. The API secret stays on the server. For signed upload API calls, allow SHA-256 signatures in Cloudinary if your account restricts signature algorithms.
3. Copy `.env.example` to `.env.local`. Set `ADMIN_EMAIL`, generate `ADMIN_PASSWORD_HASH` with `node scripts/create-admin-password.mjs`, and generate a random 32-byte session secret using the command in the example. Never commit real credentials.
4. Add the same server environment variables to Vercel and redeploy. Keep existing SMTP variables if you want email notifications alongside the enquiry inbox.

## Run and use

```sh
npm ci
npm run build
npm start
```

Open `/admin`, sign in, and edit works. On the first save, the bundled portfolio becomes a MongoDB content document. Choose exactly three published projects in featured slots 1, 2 and 3. A video can be attached to any work, including featured work 3. Upload a cover/poster image even for video projects. Drafts do not appear on public pages. Reassign a featured slot before deleting or unpublishing its work. The save button commits all edits together. Work list order follows the sidebar order; new work is appended. Saving a stale editor returns a conflict: reload and reapply edits.

The homepage, work list and detail pages read published content on each request. The public site keeps its bundled portfolio when Atlas is unconfigured or unreachable; the control panel returns an unavailable message and never reports a failed write as saved. No demo password is enabled. Login attempts are limited to 10 per account per 10-minute window across all server instances. Session cookies expire after 8 hours. Sign out clears the current browser cookie; rotate the session secret to invalidate all sessions.

Contact submissions are stored in Atlas before optional email delivery. The inbox lists the newest 100 enquiries, with New / Contacted / Closed status. Existing inquiries from before this integration are not imported. No live email is sent by the automated tests.

## Verify with your accounts

- Sign in and create a draft with a unique slug, poster and video. Save and reload the panel; the draft must persist and its public URL must return 404.
- Publish it and assign featured slot 3. Save; confirm the third homepage card, work listing and detail page show the project. Scroll the video card off screen: playback pauses. Tap it: the existing card transition opens its detail page.
- Edit the title and verify the public page after refresh. Reassign the featured slot, delete the work, save and confirm its URL returns 404.
- Open two editor tabs; save one, then save the older tab. The older save must return a conflict.
- Submit a real contact enquiry yourself, then view it in the inbox and change its status. Confirm your email notification separately if SMTP is configured.
- Sign out, then request `/api/admin/works` directly. It must reject the request. A cross-origin write must also be rejected.

Database writes and Cloudinary uploads require actual account credentials. Build and local validation do not establish that either external account is correctly configured. MongoDB Atlas and Cloudinary free tiers have quotas; they are not unlimited hosting.
