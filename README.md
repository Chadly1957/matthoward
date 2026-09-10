# Big H Recreations LLC

Hassle-free floating and camping on the Meramec River, Missouri. A booking platform for float
trips and riverside camping, built with Next.js (App Router) and Prisma/Postgres, modeled on the
FareHarbor booking flow.

## What's included

- **Public site** — home page, trip/package listing, camping listing, and a per-trip booking flow
  (pick a date, party size, add-ons, contact info) that ends in a confirmation page with a
  confirmation code.
- **Admin dashboard** (`/admin`) — a single admin login protects:
  - **Trips** — create/edit/delete bookable trips (float, camping, or combo packages), manage
    their departure dates & capacity, and attach add-ons to each trip.
  - **Add-ons** — a global library of add-ons (e.g. shuttle upgrades, tube rentals, firewood),
    priced per-person or per-booking.
  - **Bookings** — view every reservation and update its status (pending/confirmed/completed/
    cancelled).
- Booking capacity is enforced server-side in a database transaction, so two customers can't
  overbook the same departure.

## Tech stack

- Next.js 16 (App Router, Server Actions)
- Prisma ORM + PostgreSQL
- Tailwind CSS v4
- A lightweight signed-cookie admin session (no third-party auth needed for a single admin user)

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in a Postgres connection string, admin credentials, and
   a random `SESSION_SECRET`.
3. Run migrations and seed sample trips:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the
   admin dashboard (login with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` you set).

## Deploying to Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Provision a Postgres database (Vercel Postgres, [Neon](https://neon.tech), or Supabase all
   work) and copy its connection string.
3. In the Vercel project's **Environment Variables**, set:
   - `DATABASE_URL` — your Postgres connection string
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin login credentials
   - `SESSION_SECRET` — a long random string (e.g. `openssl rand -hex 32`)
4. Vercel will run `npm install` (which runs `prisma generate` via `postinstall`), then
   `npm run build`, which runs `prisma migrate deploy` before `next build` — so every deploy
   automatically applies any pending database migrations. No manual database access needed.
5. Visit `/admin` on your deployed URL and log in with the admin credentials you configured. To
   add a few example trips, run `npm run db:seed` locally with `DATABASE_URL` pointed at
   production, or just add trips by hand from the admin dashboard.

## Branding

The site logo is loaded from `public/big_h_web_logo.png`. To update it, replace that file with a
new PNG of the same name and redeploy — no code changes needed.

## Project structure

- `prisma/schema.prisma` — data model (Trip, Departure, AddOn, Booking)
- `src/app` — pages (public site + `/admin` dashboard) and server actions
- `src/lib/actions` — server actions for booking creation and admin CRUD
- `src/lib/session.ts` — signed-cookie admin session helper
- `src/middleware.ts` — protects `/admin/*` routes, redirecting to `/admin/login` when signed out

## Adding a payment processor

Bookings are currently created as "Pending" with no online payment — the admin confirms
availability and collects payment separately (by phone, on arrival, etc.), matching how many
small outfitters operate. To take deposits or full payment online, integrate Stripe Checkout (or
similar) in `src/lib/actions/booking.ts` before marking a booking `CONFIRMED`.
