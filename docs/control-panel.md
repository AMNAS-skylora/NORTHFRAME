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

Contact submissions are stored in Atlas before notification is attempted. The inbox lists the newest 100 enquiries, with New / Contacted / Closed status **and a separate email alert status** (Pending, Sent, Failed, or Unverified for records saved before notification tracking). The public form confirms an enquiry was saved even if email delivery fails, but does not claim the email was sent. Failed email delivery can be retried by an authenticated admin with the **Send email alert** button; no old leads are automatically emailed. No live email is sent by the automated tests.

## Contact form email setup

**Recommended for a hosted deployment: Resend's HTTPS API.** The project sends transactional email from a server-side Next.js route with no extra Node package. Set the following secrets in your host's production and preview environments (or `.env.local` for local testing):

```dotenv
MONGODB_URI=mongodb+srv://...
MONGODB_DB=northframe
CONTACT_TO_EMAIL=your-inbox@example.com
RESEND_API_KEY=re_your_private_key
CONTACT_FROM_EMAIL=notifications@your-verified-domain.com
```

1. Add your sender domain in your Resend dashboard, complete its DNS verification, and obtain an API key with permission to send email.
2. Set `CONTACT_FROM_EMAIL` to an email address on **that verified domain**, and set `CONTACT_TO_EMAIL` to the inbox that should receive the customer's enquiry. Do **not** use a Gmail address as a Resend sender unless you control and can verify that domain.
3. Add these values to Vercel **Project → Settings → Environment Variables** and redeploy the project. Never prefix server secrets with `NEXT_PUBLIC_` or commit them. SMTP variables are ignored if `RESEND_API_KEY` is configured.
4. Submit one test enquiry from the real site. Verify it in `/admin → Enquiries` and check **Email alert: Sent**; then verify inbox/spam folder and provider logs. **Sent means the mail provider accepted it, not that final inbox delivery is guaranteed.**
5. If the status is Failed, check the Vercel function logs and the sending provider dashboard, repair the configuration, and use the admin **Send email alert** button. Older enquiries without status can also be sent manually.

**Alternative: Gmail SMTP.** Leave `RESEND_API_KEY` empty and configure `SMTP_USER`, `SMTP_APP_PASSWORD`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, and `SMTP_SECURE=true`. Gmail requires a suitable Google App Password and account eligibility; do not use your normal Gmail login password. `CONTACT_TO_EMAIL` can differ from `SMTP_USER`. SMTP transport currently supports implicit TLS on port 465 only. A serverless host may have provider/network restrictions, so the HTTPS option is generally more reliable.

If neither provider is configured but MongoDB is working, the enquiry is **still saved** with Failed email status and is visible to the admin; the customer does not need to submit twice. If MongoDB and email are both unavailable, the endpoint returns an error.

## Verify with your accounts

- Sign in and create a draft with a unique slug, poster and video. Save and reload the panel; the draft must persist and its public URL must return 404.
- Publish it and assign featured slot 3. Save; confirm the third homepage card, work listing and detail page show the project. Scroll the video card off screen: playback pauses. Tap it: the existing card transition opens its detail page.
- Edit the title and verify the public page after refresh. Reassign the featured slot, delete the work, save and confirm its URL returns 404.
- Open two editor tabs; save one, then save the older tab. The older save must return a conflict.
- Submit a real contact enquiry yourself, then view it in the inbox and change its status. Confirm your email notification separately if SMTP is configured.
- Sign out, then request `/api/admin/works` directly. It must reject the request. A cross-origin write must also be rejected.

Database writes and Cloudinary uploads require actual account credentials. Build and local validation do not establish that either external account is correctly configured. MongoDB Atlas and Cloudinary free tiers have quotas; they are not unlimited hosting.
