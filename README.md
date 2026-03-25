# Ikwetha Platform

Ikwetha is a full-stack platform starter for Lilitha Ntsundwani's personal brand and future creator expansion. It combines:

- A premium public brand website
- A content publishing surface
- Book and merchandise commerce
- Event ticketing with youth and senior quota enforcement
- An internal admin dashboard for operations and ticket validation

## Stack

- Next.js 16 App Router with TypeScript
- Tailwind CSS 4
- Framer Motion
- Zustand and TanStack React Query
- React Hook Form and Zod
- Supabase Auth, Postgres, Storage, and Edge Functions
- Paystack-first payment integration
- Vercel deployment target

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your project secrets:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Run quality checks:

```bash
npm run lint
npm run typecheck
npm run test
```

## Environment variables

Required app variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_TICKET_QR_BUCKET` optional if you later move QR images from inline data URLs into Storage
- `SUPABASE_ADMIN_ASSETS_BUCKET` optional, defaults to `platform-assets` for admin event, merch, content, and brand media uploads

## Content, brands, and hero setup

Before using the admin content workspace, homepage brand slider, or homepage hero editor, apply the related migrations in your Supabase project.

If you use the Supabase dashboard:

1. Open the SQL Editor for your project.
2. Paste the contents of `supabase/migrations/20260321_add_content_and_brands.sql`.
3. Paste the contents of `supabase/migrations/20260321_add_homepage_hero.sql`.
4. Run both scripts once.

If you use the Supabase CLI in your own environment:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Notes:

- This repository does not include a local `supabase/config.toml`, so CLI commands require you to link the workspace to your Supabase project first.
- The admin asset upload route can create the `SUPABASE_ADMIN_ASSETS_BUCKET` bucket automatically on first upload when the service role key is configured.
- Uploaded content supports images and videos. Uploaded brand entries support logo files and optional website URLs.
- Homepage hero media also uses the shared admin assets bucket and can be image or video.

## What changed in this pass

- Public pages now read through a repository layer that uses Supabase when configured and falls back to preview data otherwise.
- Admin routes are now protected when Supabase Auth and profile roles are active.
- Store and ticket forms now initialize real checkout sessions through backend routes.
- Payment verification and webhook handling now finalize orders, generate QR codes for tickets, and trigger transactional emails.
- Admin routes now have a dedicated operations shell with event and merch creation, editing, deletion, and image upload support.
- Admin routes now include a content workspace for image/video uploads and a brand workspace that powers the public homepage collaboration slider.
- Admin routes now include a homepage hero editor for managing the public hero headline, CTAs, metrics, and uploaded media.

## Customer authentication

- Public customers sign up and sign in with Supabase email/password auth from `/login`.
- New customer accounts must verify their email before first sign-in.
- New authenticated users are synced into the `profiles` table with the default `customer` role.
- Store checkout and ticket checkout now require a signed-in user and attach `orders.user_id` to that account.
- Customers can review saved orders and tickets from `/account`.

## Data model

The initial schema lives in `supabase/migrations/20260320_initial_platform.sql` and includes normalized tables for:

- profiles
- items
- orders
- order_items
- events
- tickets
- ticket_orders
- forms
- form_responses
- content

It also includes RPC functions for ticket reservation and scan validation to help prevent overselling and duplicate entry under concurrency.

## API flow summary

### Book or merch checkout

1. Customer adds items to cart.
2. Frontend calls `POST /api/paystack/initialize`.
3. Backend creates a Paystack transaction reference.
4. Paystack redirects the user back after payment.
5. Webhook or post-payment verification finalizes the order and sends email confirmation.

### Event ticket flow

1. Customer authenticates.
2. Customer submits DOB and event form.
3. Backend classifies youth or senior.
4. A transaction checks quota before ticket allocation.
5. On success, the platform stores the ticket, generates a reference and QR code, and emails the attendee.

### Ticket validation flow

1. Admin scans a QR code or enters a ticket reference.
2. Backend verifies the ticket and event context.
3. A valid unused ticket is marked as used.
4. Duplicate scans are rejected.

### Admin authentication flow

1. Admin signs in with email and password from `/login`.
2. If the admin account was newly created, Supabase email verification should be completed first.
3. Admin routes check the `profiles.role` value on the server.
4. Non-admin users are redirected away from `/admin`.

### Customer authentication flow

1. Customer creates an account with full name, email, and password from `/login`.
2. Supabase sends an email verification link that returns through `/auth/callback`.
3. After verification, the customer signs in with email and password.
4. The authenticated user is synced into `profiles` with the `customer` role.

## Deployment notes

- Frontend deploys to Vercel.
- Supabase hosts database, auth, storage, and edge functions.
- Paystack webhook should point to `/api/paystack/webhook` or a Supabase edge function endpoint.
- Resend can be used for transactional mail delivery.
- Run the `20260321_add_catalog_images.sql` migration and ensure the admin assets bucket exists or let the admin upload route create it on first upload.
- Run the `20260321_add_content_and_brands.sql` migration before using admin content uploads or the public brand slider.
- Run the `20260321_add_homepage_hero.sql` migration before using the admin homepage hero editor.

## Current implementation scope

This codebase includes the public site, admin dashboard shells, sample API routes, reusable domain logic, test coverage for the age and quota rules, and a Supabase schema ready for project-specific configuration.
