# Trello Clone

A full-stack Kanban board application inspired by [Trello](https://trello.com). The project includes a REST API backend and a React frontend that closely mirrors Trello’s layout, colors, and interaction patterns.

---

## Tech Stack

### Backend


| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Runtime      | Node.js                                          |
| Language     | TypeScript (strict mode)                         |
| Framework    | Express 5                                        |
| ORM          | Prisma 7                                         |
| Database     | PostgreSQL                                       |
| Auth         | JWT (access + refresh tokens, HTTP-only cookies) |
| Validation   | Zod                                              |
| File storage | Supabase Storage (file attachments only)         |


### Frontend


| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Framework     | React 19                     |
| Build tool    | Vite 8                       |
| Language      | TypeScript                   |
| Routing       | TanStack Router              |
| Data fetching | TanStack Query               |
| State         | Zustand                      |
| Drag & drop   | dnd-kit                      |
| Styling       | Tailwind CSS 4               |
| UI components | shadcn/ui, Radix UI, Base UI |
| Forms         | React Hook Form + Zod        |
| HTTP client   | Axios                        |


---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18 or later (20+ recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** 14+ running locally, **or** a hosted Postgres instance (e.g. Supabase, Neon, Render)

Optional (required only for **file attachment uploads**):

- A **Supabase** project with a Storage bucket named `attachments` ( update the bucket name in `.env`)

---

## Project Structure

```
trello-clone/
├── backend/          # Express API, Prisma schema, migrations, seed
├── frontend/         # React SPA (Vite)
├── docs/             # API reference, schema design, implementation guides
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd trello-clone
```

### 2. Set up the database

Create a PostgreSQL database for the app:

```sql
CREATE DATABASE trello_clone;
```

Or use your cloud provider’s dashboard to create a database and copy the connection string.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trello_clone?schema=public"
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN='["http://localhost:5173"]'

# Optional — only needed for file attachment uploads
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="card-attachments"
```

> **Note:** Link attachments work without Supabase. File uploads (images, PDFs, etc.) require valid Supabase Storage credentials.

### 4. Install backend dependencies and prepare the database

```bash
cd backend
npm install
npm run db:migrate    # Apply Prisma migrations
npm run db:seed       # Seed sample users, workspace, board, lists, and cards
```

### 5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

The frontend connects to the API at `http://localhost:5000/api/v1` by default (configured in `frontend/src/lib/constants.ts`).

---

## How to Run

Open **two terminals** — one for the backend and one for the frontend.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

The API starts at **[http://localhost:5000](http://localhost:5000)**.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

The app opens at **[http://localhost:5173](http://localhost:5173)**.

### Production build (optional)

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## Sample Login Credentials

After running `npm run db:seed`, use any of these accounts. All share the same password.


| Name            | Email                     | Password      |
| --------------- | ------------------------- | ------------- |
| Swaroop (owner) | `swaroopch1234@gmail.com` | `password123` |
| John            | `john@example.com`        | `password123` |
| Alice           | `alice@example.com`       | `password123` |


The seed script creates:

- A **Personal** workspace with all three users
- A starred board titled **Personal Project** with lists: Todo, In Progress, Review, Done
- Sample cards, labels, checklists, comments, and activity entries

Log in as **Swaroop** to access the pre-seeded starred board immediately.

---

## Implemented Features

### Authentication

- Login / logout
- JWT access + refresh token flow with HTTP-only cookies
- Protected routes on frontend and backend

### Lists & Cards

- Create, rename, delete, copy, and move lists
- Drag-and-drop reordering for lists and cards (within and across lists)
- Create, edit, archive, restore, and delete cards
- Card search and filtering (by label, member, due date)
- Open card modal with full detail view

### Card Details

- Title and description editing
- Labels (create, edit, assign, remove)
- Members (assign / remove board members to cards)
- Due dates and start dates with status badges
- Checklists with items (add, toggle, delete)
- Comments (create, edit, delete)
- Attachments — link attachments; file uploads when Supabase is configured
- Activity feed (board-level and card-level)

### Board Menu

- View board activity
- Browse and restore archived cards

---

## UI-Only Elements (Visual Clone)

Several parts of the UI were added to **closely match Trello’s look and feel** but are **not wired to backend functionality**. They are intentionally present as visual placeholders.


| Location                     | Element                                           | Status                                   |
| ---------------------------- | ------------------------------------------------- | ---------------------------------------- |
| **App header**               | Global search bar                                 | Decorative — does not search             |
| **Home sidebar**             | Templates, Members, Settings, Billing links       | Anchor links / no pages                  |
| **Home page**                | “Most popular templates” section & template cards | Static mock data                         |
| **Home page**                | “Browse the full template gallery” link           | No action                                |
| **Home page**                | Jira section & “Try it free” button               | Promotional UI clone                     |
| **Board header**             | Board title inline edit                           | Local state only — not saved to API      |
| **Board header**             | Views dropdown (kanban columns icon)              | No view switching                        |
| **Board header**             | Automation (⚡) button                             | No automation rules                      |
| **Board header**             | Share button                                      | No sharing flow                          |
| **Board header**             | Member avatars                                    | Display only (no invite UI)              |
| **Card modal**               | Cover image button                                | No cover upload/selection                |
| **Card modal**               | Watch (eye) button                                | No watch/subscribe feature               |
| **Card modal → Add to card** | Location                                          | Menu item shown; no map/location feature |
| **Card modal → Add to card** | Custom Fields                                     | Menu item shown; no custom field system  |


If you click these controls, they may appear interactive (hover states, popovers) but will not persist data or call the API.

---

## Assumptions & Design Decisions

1. **Single-user focus with multi-user seed data** — The app supports multiple users, workspaces, and board members, but the primary demo flow assumes logging in as the seeded owner.
2. **Cookie-based auth** — The frontend relies on HTTP-only cookies set by the backend. Both apps must run on the configured origins (`localhost:5173` → `localhost:5000`) for auth to work in development.
3. **No user registration UI** — Users are created via the seed script (or direct DB/API). Login is the only auth screen.
4. **One workspace shown on home** — The home page displays the first workspace returned by the API; full workspace switching UI is not implemented.
5. **Board backgrounds** — Boards use a solid background color from the API.
6. **File attachments require Supabase** — Without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, link attachments still work but file upload will fail with a server error.
7. **UI fidelity over feature parity** — Where Trello has power-ups, templates, Jira integration, sharing, and automations, this clone renders similar controls for visual accuracy without implementing those product features.
8. **API versioning** — All endpoints are prefixed with `/api/v1`.
9. **Soft archive** — Archived cards and lists are retained in the database and can be restored; hard delete is a separate action.

---

## Environment Variables Reference

### Backend (`backend/.env`)


| Variable                    | Required         | Description                                       |
| --------------------------- | ---------------- | ------------------------------------------------- |
| `DATABASE_URL`              | Yes              | PostgreSQL connection string                      |
| `PORT`                      | No               | API port (default: `5000`)                        |
| `NODE_ENV`                  | No               | `development` / `production` / `test`             |
| `JWT_ACCESS_SECRET`         | Yes              | Secret for signing access tokens                  |
| `JWT_REFRESH_SECRET`        | Yes              | Secret for signing refresh tokens                 |
| `CORS_ORIGIN`               | Yes              | JSON array of allowed frontend origins            |
| `SUPABASE_URL`              | For file uploads | Supabase project URL                              |
| `SUPABASE_SERVICE_ROLE_KEY` | For file uploads | Supabase service role key                         |
| `SUPABASE_STORAGE_BUCKET`   | No               | Storage bucket name (default: `card-attachments`) |


### Frontend

No `.env` file is required for local development. To point at a deployed API, update `API_BASE_URL` in `frontend/src/lib/constants.ts`.

---

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server with hot reload
npm run db:migrate   # Run pending migrations
npm run db:seed      # Reset and seed database
npm run db:generate  # Regenerate Prisma client
npm run build        # Compile TypeScript

# Frontend
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

---

## Troubleshooting


| Problem                            | Likely cause                                 | Fix                                                                               |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Login fails / 401 on every request | Backend not running or CORS mismatch         | Ensure backend is on port 5000 and `CORS_ORIGIN` includes `http://localhost:5173` |
| Database connection error          | Wrong `DATABASE_URL` or Postgres not running | Verify Postgres is up and the database exists                                     |
| Empty board after login            | Seed not run                                 | Run `npm run db:seed` in `backend/`                                               |
| File upload fails                  | Supabase not configured                      | Add Supabase env vars or use link attachments instead                             |
| Frontend can’t reach API           | Wrong `API_BASE_URL`                         | Check `frontend/src/lib/constants.ts`                                             |


---

