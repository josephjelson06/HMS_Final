# HMS Foundation

> **A multi-tenant Hotel Management System (HMS) built as two coordinated admin panels — a Super Admin platform console (ATC Admin) and a per-hotel workspace (HMS Hotel).**

![Platform](https://img.shields.io/badge/platform-web-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI%20v2-green)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2016-black)
![Database](https://img.shields.io/badge/database-PostgreSQL%20(Neon)-blue)
![Container](https://img.shields.io/badge/container-Docker-2496ED)

---

## What is HMS Foundation?

HMS Foundation is a full-stack, multi-tenant SaaS platform for hotel property management. It is composed of two distinct panels served from a single Next.js app, authenticated through a shared JWT-based login:

| Panel | Brand Name | Who Uses It |
|---|---|---|
| **Super Admin Panel** | ATC Admin | Platform operators — manage all hotels, plans, subscriptions, and users |
| **Hotel Admin Panel** | HMS Hotel | Hotel managers & staff — manage rooms, guests, billing, FAQs, and support |

---

## Project Structure

```
HMS_Final/
├── BackEnd/                  # Python FastAPI backend
│   ├── app/
│   │   ├── core/             # Config, auth dependencies
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── routers/          # API route handlers
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic layer
│   │   ├── modules/          # RBAC middleware
│   │   ├── repositories/     # Data access layer
│   │   └── main.py           # FastAPI application entry point
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   ├── docker-compose.yaml
│   └── requirements.txt
│
├── FrontEnd/                 # Next.js 16 frontend (TypeScript)
│   ├── app/
│   │   ├── (authenticated)/
│   │   │   ├── hotel/        # All Hotel Admin pages
│   │   │   └── super/        # All Super Admin pages
│   │   └── (public)/         # Login page
│   ├── domain/               # Domain entities & contracts
│   ├── infrastructure/       # HTTP client, repositories, storage
│   ├── presentation/         # Reusable UI components, hooks, modals
│   └── styles/               # Global CSS
│
└── HMS_SS/                   # UI reference screenshots
    ├── SuperAdmin/
    └── HotelAdmin/
```

---

## Prerequisites

| Tool | Version | Required For |
|---|---|---|
| Docker Desktop | Latest | Running backend + database |
| Node.js | 18+ | Running frontend |
| npm | 9+ | Frontend package management |
| Git | Any | Cloning the repo |

> **Important:** The backend (FastAPI), database (PostgreSQL via Neon), and PgAdmin run exclusively inside Docker. Do **not** install Python packages in your global environment.

---

## Quick Start

### 1. Clone the repository

```powershell
git clone <repo-url>
cd HMS_Final
```

### 2. Start the Backend (Docker)

```powershell
cd BackEnd
docker compose up --build -d
```

This spins up the FastAPI container, which connects to the hosted Neon PostgreSQL database automatically via the `DATABASE_URL` environment variable in `docker-compose.yaml`.

- **API is now running at:** `http://localhost:8080`
- **Interactive API docs (Swagger):** `http://localhost:8080/docs`
- **ReDoc:** `http://localhost:8080/redoc`
- **Health check:** `http://localhost:8080/health`

### 3. Start the Frontend

Open a new PowerShell window:

```powershell
cd FrontEnd
npm install
npm run dev
```

- **Frontend is now running at:** `http://localhost:3000`

### 4. Log In

Navigate to `http://localhost:3000` in your browser.

| Role | Email | Notes |
|---|---|---|
| Super Admin | `admin@atc.com` | Routes to ATC Admin panel |
| Hotel Admin | `manager@hotel.com` | Routes to HMS Hotel panel |

> Contact the platform administrator for initial credentials.

---

## Environment Variables

The backend reads environment variables from `docker-compose.yaml`. For local development without Docker, create a `.env` file inside `BackEnd/`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_secret_key_at_least_32_chars
COOKIE_SECURE=False
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional — Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

The frontend reads from `.env.local` inside `FrontEnd/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Useful Commands

### Backend

```powershell
# Start backend (detached)
docker compose up -d

# View backend logs
docker compose logs -f

# Stop backend
docker compose down

# Rebuild after code changes
docker compose up --build -d

# Run Alembic migrations inside the container
docker exec -it hms_backend_alt_container alembic upgrade head
```

### Frontend

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm run start
```

---

## Key Technologies

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, TypeScript) |
| **UI Library** | React 19, Lucide React icons, Recharts |
| **Styling** | Tailwind CSS v4 |
| **Backend Framework** | FastAPI (Python 3.11) |
| **ORM** | SQLAlchemy 2.0 |
| **Database** | PostgreSQL (Hosted on Neon) |
| **Auth** | JWT via HTTP-only cookies + PyJWT / passlib |
| **Migrations** | Alembic |
| **Image Storage** | Cloudinary |
| **Containerisation** | Docker (python:3.11-slim) |

---

## Documentation

| Document | Description |
|---|---|
| [`HMS_SOP.md`](./HMS_SOP.md) | Standard Operating Procedures — full UI walkthrough for all 33 screens |
| [`Documentation.md`](./Documentation.md) | Technical documentation — architecture, API reference, data models |

---

## License

Internal project — not for public distribution.
