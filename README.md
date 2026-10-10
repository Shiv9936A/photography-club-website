# Photography Club Website (NITK)

## Getting Started

### Clone the repository

```bash
git clone <repo-url>
cd <repo-name>
```

### Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..

# Auth Server
cd node-server
npm install
cd ..
```

### Configure environment variables

- Root `.env`

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

- `node-server/.env`

```env
PORT=5000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
JWT_SECRET=your-jwt-secret
```

- `backend/.env`
  - Copy `backend/.env.example`
  - Fill the required values.

## Running locally

Open three terminals:

### Terminal 1 - Strapi CMS

```bash
cd backend
npm run dev
```

### Terminal 2 - Auth Server

```bash
cd node-server
npm run dev
```

### Terminal 3 - Frontend

```bash
npm run dev
```

### URLs

- Frontend: http://localhost:5173
- Strapi Admin: http://localhost:1337/admin
- Auth Test: http://localhost:5173/auth-test

---

## Detailed Documentation

The sections below provide additional information about the project, including its structure, environment configuration, authentication flow.

---

## Project Structure

```text
photo_features/
├── src/
├── public/
├── backend/
├── node-server/
├── .env
└── package.json
```

---

## Services

| Service     | Port | Purpose                           |
| ----------- | ---- | --------------------------------- |
| Frontend    | 5173 | React UI (Vite dev server)        |
| Strapi      | 1337 | Content API & Admin Panel         |
| Auth Server | 5000 | Google OAuth & JWT authentication |

## Prerequisites

- Node.js 20+
- npm

## Environment setup

Each part of the repo has its own `.env` file (gitignored). Dummy values
are pre-filled for local dev --- replace secrets and the Google client
ID before deploying.

### Root (frontend)

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### `node-server/`

```env
PORT=5000
GOOGLE_CLIENT_ID=your-google-oauth-client-id   # must match frontend client ID
JWT_SECRET=your-jwt-secret
```

### `backend/` (Strapi)

See `backend/.env.example`.

For Postgres, set `DATABASE_CLIENT=postgres` and uncomment the Postgres
vars in `backend/.env`.

### Google OAuth

1.  Create an OAuth 2.0 client in [Google Cloud
    Console](https://console.cloud.google.com/).
2.  Add authorized JavaScript origins: `http://localhost:5173`
3.  Copy the client ID into both root `.env` (`VITE_GOOGLE_CLIENT_ID`)
    and `node-server/.env` (`GOOGLE_CLIENT_ID`).

## Scripts (frontend)

Command Description

---

`npm run dev` Start Vite dev server
`npm run build` Production build

## Auth flow

1.  User clicks Google Sign-In on the frontend (`@react-oauth/google`).
2.  Frontend sends the Google ID token to
    `POST http://localhost:5000/api/auth/google`.
3.  Auth server verifies the token, checks `@nitk.edu.in` email, and
    returns a JWT.
4.  Protected routes use `Authorization: Bearer <token>` with
    `GET /api/auth/me`.

## Notes

- Strapi uploads live in `backend/public/uploads/`.
- Replace all dummy secrets in `.env` files before any deployment.
