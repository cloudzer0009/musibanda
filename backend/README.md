# Musibanda API

Express, TypeScript, and PostgreSQL API for account authentication and administrator views.

## Local setup

Requirements: Node.js 20+, PostgreSQL, and `psql`.

1. Create a PostgreSQL database named `musibanda`.
2. From `backend/`, run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to the local database connection string. Keep `.env` private; it is ignored by Git. Set `DATABASE_URL` in your shell as well when running `psql` (`psql` does not load `.env` files).
4. Apply the initial schema from the repository root:

   ```sh
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/migrations/001_initial_schema.sql
   ```

   In PowerShell, set `$env:DATABASE_URL` in the current terminal, then use `psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f backend/migrations/001_initial_schema.sql`.

5. Start the API with `npm run dev`. The health check at `/api/health` verifies the PostgreSQL connection.

Set `FRONTEND_ORIGIN` to the exact browser origin allowed to call the API. For local Vite development, use `http://localhost:5173`.

## Initial administrator

Create the first administrator only after applying the schema. Supply the values in your local shell environment; do not put real passwords in source control or frontend variables.

PowerShell:

```powershell
$env:ADMIN_NAME = "Musibanda Administrator"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PHONE = "+639171234567"
$env:ADMIN_PASSWORD = Read-Host "Administrator password"
npm run admin:create
```

The command requires at least 12 characters with uppercase, lowercase, and numeric characters, hashes the password with bcrypt, and inserts an administrator account. It does not contain a default password.

## API routes

- `POST /api/auth/register` — create a customer or musician account; public registration cannot grant administrator role.
- `POST /api/auth/login` — authenticate and issue an HTTP-only session cookie.
- `GET /api/auth/me` — return the current authenticated account.
- `POST /api/auth/logout` — revoke the current session.
- `/api/admin/*` — administrator-only dashboard, users, musicians, bookings, payments, and notification routes.

Sessions are random opaque tokens stored as SHA-256 hashes in PostgreSQL. Cookies are HTTP-only, `SameSite=Lax`, and secure in production. Repeated sign-in attempts are limited; registration, session checks, and logout are not counted. Invalid credentials and a temporarily limited sign-in both use the same generic message. Requests use parameterized SQL and backend validation.

## Tests and build

```sh
npm test
npm run build
```

The unit tests cover registration role/password validation and administrator authorization. Registration, login, logout, and database connection checks require a configured PostgreSQL database; the API health endpoint and local UI can be used to exercise those flows. Admin pages show live query results, not placeholder statistics. Payment verification is intentionally read-only until a verification workflow is defined.

## Railway

Configure `DATABASE_URL`, `FRONTEND_ORIGIN`, and `NODE_ENV=production` in backend service variables. Deploy the backend with `npm run build` and `npm start`; apply the schema once using the Railway database connection before creating the first administrator. Configure frontend `VITE_API_URL` at build time with the deployed API base URL ending in `/api`.
