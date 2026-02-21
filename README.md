# MediTrack

Mini-EMR and Patient Portal (Next.js, Prisma, PostgreSQL). Built for the Zealthy Full Stack Engineering Exercise.

## Features

- **Patient Portal** (`/`): Login with email/password. Dashboard shows next 7 days appointments and refills; drill down to full appointments (3 months) and all prescriptions.
- **Admin mini-EMR** (`/admin`): Patient table with at-a-glance data; patient detail with CRUD for appointments and prescriptions; new patient form (including password). No auth required for admin.

## Tech stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Prisma with PostgreSQL (e.g. [Supabase](https://supabase.com))
- Session: JWT in httpOnly cookie (bcrypt for passwords)

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd MediTrack
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string (e.g. from Supabase: Project Settings → Database → Connection string).
   - `JWT_SECRET` – Any long random string for signing session tokens.

3. **Database**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

   This creates tables and seeds from `data.json` (sample user: `Ross123@gmail.com` with password `Ross123`).

4. **Run locally**

   ```bash
   npm run dev
   ```

   - Patient portal: [http://localhost:3000](http://localhost:3000) (login then dashboard).
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

## Deploy on Vercel

1. **Database**  
   Create a Postgres database (e.g. Supabase), get the connection string.

2. **Vercel project**  
   Import the repo in [Vercel](https://vercel.com). Set environment variables:
   - `DATABASE_URL` – your Postgres URL.
   - `JWT_SECRET` – a long random string (e.g. `openssl rand -base64 32`).

3. **Build**  
   Vercel runs `prisma generate` via `postinstall` and `next build`. No extra build step needed.

4. **Seed production DB (one time)**  
   After first deploy, run the seed against the production DB:
   - Set `DATABASE_URL` in your local `.env` to the production URL, then run:
     ```bash
     npx prisma db push
     npm run db:seed
     ```

5. **Verify**  
   Open the deployed URL: login at `/` with `Ross123@gmail.com` / `Ross123`, and open `/admin` for the patient table.

## Project structure

- `app/` – App Router: `/` (login), `/portal/*` (patient), `/admin/*` (admin).
- `app/api/` – API routes: auth, patients, appointments, prescriptions, reference (medications/dosages).
- `lib/` – `db.ts` (Prisma), `auth.ts` (JWT session), `cn.ts` (Tailwind).
- `prisma/` – Schema and seed (reads `data.json`).

## Seed data

Seed users and reference data come from `data.json` (from the [exercise gist](https://gist.github.com/sbraford/73f63d75bb995b6597754c1707e40cc2)). Passwords are hashed with bcrypt before storage.
