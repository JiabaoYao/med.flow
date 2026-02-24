# AGENTS.md

## Cursor Cloud specific instructions

### Overview

MediTrack is a single Next.js 15 (App Router) full-stack application with Prisma ORM and PostgreSQL. There is no monorepo; one `package.json` covers everything.

### Prerequisites

PostgreSQL must be running locally. The VM snapshot has it installed; start it with:

```bash
sudo pg_ctlcluster 16 main start
```

A `.env` file is required at the repo root with `DATABASE_URL` and `JWT_SECRET`. See `.env.example` for the template. The development values used in the VM:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meditrack"
JWT_SECRET="dev-secret-key-at-least-32-characters-long-for-jwt-signing"
```

If the `meditrack` database does not exist yet:

```bash
sudo -u postgres psql -c "CREATE DATABASE meditrack;"
```

After creating the database (or after schema changes), push the schema and seed:

```bash
npx prisma db push
npm run db:seed
```

### Running the app

- **Dev server:** `npm run dev` (port 3000, uses Turbopack)
- **Patient portal:** http://localhost:3000 (login required)
- **Admin panel:** http://localhost:3000/admin (no auth)

### Seed credentials

The seed data in `data.json` provides two test users (note: the README mentions `Ross123@gmail.com` but the actual seed data uses different credentials):

| Email | Password |
|---|---|
| `mark@some-email-provider.net` | `Password123!` |
| `lisa@some-email-provider.net` | `Password123!` |

### Commands reference

See `package.json` scripts. Key commands:

- `npm run lint` — ESLint via Next.js
- `npm run build` — Prisma generate + Next.js production build
- `npm run dev` — Development server (Turbopack)
- `npm run db:push` — Push Prisma schema to DB
- `npm run db:seed` — Seed DB from `data.json`

### Gotchas

- The `postinstall` script runs `prisma generate` automatically on `npm install`, so Prisma Client is always regenerated when dependencies change.
- There are no automated tests in this repo (no test framework configured).
- Lint produces warnings about `<img>` vs `next/image` in `PortalHeader.tsx` — these are pre-existing and not errors.
