# Proyecto Integrador — Frontend

React 18 + Vite client for the capstone project. It talks to the Django API with
native `fetch` and uses Semantic UI React for the interface.

## Requirements

- Node.js 20+
- Django API running at `http://localhost:8000`

## Setup

```bash
npm install
```

Create `.env` from `.env.example` and point `VITE_API_URL` to the API:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Run

```bash
npm run dev
```

The dev server runs on `http://localhost:5173` (strict port).

## Build

```bash
npm run build
npm run preview
```

## Notes

- Authentication uses JWT access/refresh tokens stored in `localStorage`.
- Expired access tokens are refreshed automatically through
  `POST /auth/token/refresh/`.
- The dashboard pulls recent runs from the public Speedrun.com API.
