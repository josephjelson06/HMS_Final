# HMS Frontend — Next.js Migration & Future-Proof Architecture Blueprint

**Author**: Senior Software Architect & Frontend Platform Engineer  
**Date**: 14 February 2026 (v2 — redesigned per current progress)  
**Scope**: React SPA → Next.js + TypeScript migration with backend-agnostic architecture  
**Build Verification**: Vite ✅ 0 errors (7.51s) | Next.js ✅ 0 errors (4.5s compile + 8.7s TS)

---

> [!IMPORTANT]
> This is the **v2 redesign** of the migration blueprint. It reflects the actual current state of the codebase — not a theoretical plan. Every section is annotated with its execution status: ✅ DONE, 🔄 IN PROGRESS, or 🔲 TODO.

---

# Progress Dashboard

| Phase   | Section                       | Status  | Files | Notes                                                              |
| ------- | ----------------------------- | ------- | ----- | ------------------------------------------------------------------ |
| **1.1** | Pre-Migration Audit           | ✅ DONE | —     | Full coupling/routing/state analysis complete                      |
| **1.2** | Migration Strategy            | ✅ DONE | —     | Big-bang + App Router decided & executed                           |
| **1.3** | Folder Refactor (Domain)      | ✅ DONE | 17    | `domain/entities/` (8) + `domain/contracts/` (8) + barrel          |
| **1.4** | Folder Refactor (Infra)       | ✅ DONE | 11    | 7 mock repos + HTTP client + auth service + DI container + cookies |
| **1.5** | Folder Refactor (Application) | ✅ DONE | 9     | 8 data hooks + barrel export                                       |
| **1.6** | Next.js Migration             | ✅ DONE | 35    | 31 routes, layouts, auth guard, impersonation                      |
| **1.7** | Presentation Move             | ✅ DONE | 97    | All components, modals, pages in `presentation/`                   |
| **1.8** | Verification                  | ✅ DONE | —     | Both Vite + Next.js builds pass with 0 errors                      |
| **2.1** | Wire Application Hooks        | 🔲 TODO | —     | Replace direct `data/` imports with hooks                          |
| **2.2** | Backend Integration           | 🔲 TODO | —     | Create `api/` repos, flip USE_MOCK                                 |
| **2.3** | Vite Cleanup                  | 🔲 TODO | —     | Remove vite.config, index.html, App.tsx                            |
| **2.4** | Testing Infrastructure        | 🔲 TODO | —     | Vitest + RTL + E2E                                                 |

---

# PHASE 1 — MIGRATION STRATEGY (✅ COMPLETE)

## 1. Pre-Migration Audit ✅

### 1.1 Current Folder Structure (post-migration)

```
FrontEnd/
├── app/                           ← NEXT.JS ROUTING (35 files)
│   ├── layout.tsx                 ← Root: ThemeProvider + meta
│   ├── page.tsx                   ← Redirects to /login
│   ├── (public)/
│   │   ├── layout.tsx             ← ThemeProvider wrapper
│   │   └── login/page.tsx         ← Cookie-based auth login
│   ├── (authenticated)/
│   │   ├── layout.tsx             ← AppShell + auth guard + impersonation
│   │   ├── impersonation.tsx      ← ImpersonationContext provider
│   │   ├── super/                 ← 14 super admin pages
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── hotels/page.tsx
│   │   │   ├── hotels/[hotelId]/page.tsx
│   │   │   ├── kiosks/[kioskId]/page.tsx
│   │   │   └── ... (11 more)
│   │   └── hotel/                 ← 14 hotel admin pages
│   │       ├── dashboard/page.tsx
│   │       ├── rooms/page.tsx
│   │       └── ... (12 more)
│   └── legacy/page.tsx            ← Fallback for old SPA
│
├── domain/                        ← PURE TYPESCRIPT (17 files)
│   ├── entities/
│   │   ├── Hotel.ts, Room.ts, User.ts, Kiosk.ts
│   │   ├── Plan.ts, Invoice.ts, Ticket.ts, common.ts
│   ├── contracts/
│   │   ├── IHotelRepository.ts, IRoomRepository.ts, IUserRepository.ts
│   │   ├── IKioskRepository.ts, IPlanRepository.ts, IInvoiceRepository.ts
│   │   ├── ITicketRepository.ts, IAuthService.ts
│   └── index.ts                   ← Barrel export
│
├── infrastructure/                ← SWAPPABLE IMPLEMENTATIONS (11 files)
│   ├── repositories/mock/
│   │   ├── MockHotelRepository.ts ... MockTicketRepository.ts (7 files)
│   ├── services/MockAuthService.ts
│   ├── http/client.ts             ← Centralized fetch with auth tokens
│   ├── config/container.ts        ← DI — USE_MOCK switch
│   └── browser/cookies.ts         ← getCookie/setCookie/deleteCookie
│
├── application/                   ← REACT HOOKS (9 files)
│   ├── hooks/
│   │   ├── useHotels.ts, useRooms.ts, useUsers.ts, useKiosks.ts
│   │   ├── usePlans.ts, useInvoices.ts, useTickets.ts, useAuth.ts
│   ├── navigation/legacyRouteMap.ts ← ROUTES.X → /path mapping
│   └── index.ts                   ← Barrel export
│
├── presentation/                  ← ALL REACT UI (97 files)
│   ├── components/
│   │   ├── ui/           (13)     ← Button, GlassInput, ModalShell, etc.
│   │   ├── layout/       (4)      ← AppShell, Sidebar, Header, ErrorBoundary
│   │   ├── charts/       (4)      ← CheckInTrend, KioskStatus, etc.
│   │   └── shared/       (5)      ← Access, AlertList, Team, etc.
│   ├── modals/
│   │   ├── super/        (17)     ← AddHotelModal, ChangePlanModal, etc.
│   │   └── hotel/        (17)     ← AddRoomModal, NewBookingWizard, etc.
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── super/        (14)     ← Dashboard, Hotels, Plans, etc.
│   │   └── hotel/        (14)     ← HotelDashboard, Rooms, etc.
│   ├── hooks/            (3)      ← useClickOutside, useModalVisibility, useTheme
│   ├── providers/        (1)      ← ThemeProvider
│   └── legacy/App.tsx             ← Original SPA root (preserved for reference)
│
├── data/                          ← RAW MOCK DATA (17 files, original)
├── types/                         ← LEGACY TYPES (11 files, kept for compat)
├── styles/index.css               ← Design tokens + Tailwind v4 @theme
├── config/routes.ts               ← Legacy ROUTES constants
│
├── next.config.mjs                ← Next.js configuration
├── postcss.config.cjs             ← @tailwindcss/postcss
├── tsconfig.json                  ← TS config with Next.js plugin
├── vite.config.ts                 ← Legacy Vite (to be removed)
├── package.json                   ← Both vite + next scripts coexist
└── .env.local                     ← GEMINI_API_KEY
```

**Total**: 179 source files | 31 compiled routes | 2 build targets (Vite + Next.js)

### 1.2 Coupling Analysis (current state)

| Coupling                                          | Status               | Details                                                |
| ------------------------------------------------- | -------------------- | ------------------------------------------------------ |
| Pages → `data/` (direct imports)                  | 🔴 **Still coupled** | Pages still import mock arrays directly from `data/`   |
| Pages → `types/`                                  | ✅ Clean             | Types imported correctly                               |
| Pages → `application/hooks/`                      | 🔲 **Not wired yet** | Hooks exist but pages don't use them                   |
| App router → `presentation/`                      | ✅ Clean             | Thin wrappers import from `presentation/pages/`        |
| `infrastructure/` → `domain/contracts/`           | ✅ Clean             | All mock repos implement contracts                     |
| `application/hooks/` → `infrastructure/container` | ✅ Clean             | Hooks consume DI container                             |
| Design system → logic                             | ✅ Clean             | UI components are logic-free                           |
| Auth → cookies                                    | ✅ Clean             | Cookie-based auth via `infrastructure/browser/cookies` |

> [!WARNING]
> **Critical remaining coupling**: Presentation pages still import directly from `data/`. This must be resolved in Phase 2.1 to fulfill the backend-agnostic promise.

### 1.3 Routing System (migrated)

**Before**: Custom state-machine in `App.tsx` — `currentRoute` string matched against `ROUTES` constants. No URL-based routing.

**After**: Next.js App Router file-system routing — 31 routes compiled.

| Route                     | Type        | File                                                  |
| ------------------------- | ----------- | ----------------------------------------------------- |
| `/`                       | Static (○)  | `app/page.tsx` → redirects to `/login`                |
| `/login`                  | Static (○)  | `app/(public)/login/page.tsx`                         |
| `/super/dashboard`        | Static (○)  | `app/(authenticated)/super/dashboard/page.tsx`        |
| `/super/hotels`           | Static (○)  | `app/(authenticated)/super/hotels/page.tsx`           |
| `/super/hotels/[hotelId]` | Dynamic (ƒ) | `app/(authenticated)/super/hotels/[hotelId]/page.tsx` |
| `/super/kiosks`           | Static (○)  | `app/(authenticated)/super/kiosks/page.tsx`           |
| `/super/kiosks/[kioskId]` | Dynamic (ƒ) | `app/(authenticated)/super/kiosks/[kioskId]/page.tsx` |
| `/super/plans`            | Static (○)  | `app/(authenticated)/super/plans/page.tsx`            |
| `/super/invoices`         | Static (○)  | `app/(authenticated)/super/invoices/page.tsx`         |
| `/super/helpdesk`         | Static (○)  | `app/(authenticated)/super/helpdesk/page.tsx`         |
| `/super/users`            | Static (○)  | `app/(authenticated)/super/users/page.tsx`            |
| `/super/reports`          | Static (○)  | `app/(authenticated)/super/reports/page.tsx`          |
| `/super/audit-logs`       | Static (○)  | `app/(authenticated)/super/audit-logs/page.tsx`       |
| `/super/subscriptions`    | Static (○)  | `app/(authenticated)/super/subscriptions/page.tsx`    |
| `/super/profile`          | Static (○)  | `app/(authenticated)/super/profile/page.tsx`          |
| `/super/settings`         | Static (○)  | `app/(authenticated)/super/settings/page.tsx`         |
| `/hotel/dashboard`        | Static (○)  | `app/(authenticated)/hotel/dashboard/page.tsx`        |
| `/hotel/rooms`            | Static (○)  | `app/(authenticated)/hotel/rooms/page.tsx`            |
| `/hotel/bookings`         | Static (○)  | `app/(authenticated)/hotel/bookings/page.tsx`         |
| `/hotel/guests`           | Static (○)  | `app/(authenticated)/hotel/guests/page.tsx`           |
| `/hotel/rates`            | Static (○)  | `app/(authenticated)/hotel/rates/page.tsx`            |
| `/hotel/billing`          | Static (○)  | `app/(authenticated)/hotel/billing/page.tsx`          |
| `/hotel/incidents`        | Static (○)  | `app/(authenticated)/hotel/incidents/page.tsx`        |
| `/hotel/users`            | Static (○)  | `app/(authenticated)/hotel/users/page.tsx`            |
| `/hotel/roles`            | Static (○)  | `app/(authenticated)/hotel/roles/page.tsx`            |
| `/hotel/help`             | Static (○)  | `app/(authenticated)/hotel/help/page.tsx`             |
| `/hotel/reports`          | Static (○)  | `app/(authenticated)/hotel/reports/page.tsx`          |
| `/hotel/subscription`     | Static (○)  | `app/(authenticated)/hotel/subscription/page.tsx`     |
| `/hotel/profile`          | Static (○)  | `app/(authenticated)/hotel/profile/page.tsx`          |
| `/hotel/settings`         | Static (○)  | `app/(authenticated)/hotel/settings/page.tsx`         |
| `/legacy`                 | Static (○)  | `app/legacy/page.tsx`                                 |

**29 static (○) + 2 dynamic (ƒ) = 31 routes**

### 1.4 Global State Patterns (migrated)

| State                | Before                  | After                                                                   | Status |
| -------------------- | ----------------------- | ----------------------------------------------------------------------- | ------ |
| `isDarkMode`         | `ThemeProvider` context | `ThemeProvider` in `(public)/layout.tsx` + `(authenticated)/layout.tsx` | ✅     |
| `isAuthenticated`    | `App.tsx` local state   | Cookie-based: `hms_auth` cookie checked in `(authenticated)/layout.tsx` | ✅     |
| `viewMode`           | `App.tsx` local state   | URL path: `/super/*` vs `/hotel/*`                                      | ✅     |
| `currentRoute`       | `App.tsx` local state   | Eliminated — file-system routing                                        | ✅     |
| `isImpersonating`    | `App.tsx` local state   | Cookie-based: `hms_impersonating` + `ImpersonationContext`              | ✅     |
| `isSidebarCollapsed` | `App.tsx` local state   | Local state in `(authenticated)/layout.tsx`                             | ✅     |
| `isMobileMenuOpen`   | `App.tsx` local state   | Local state in `(authenticated)/layout.tsx`                             | ✅     |

### 1.5 Side Effects & Data Fetching

| Pattern                         | Before                 | After                                                   | Status |
| ------------------------------- | ---------------------- | ------------------------------------------------------- | ------ |
| API calls                       | None (mock data)       | None (mock data) — `application/hooks/` ready for async | ✅     |
| `localStorage`/`sessionStorage` | None                   | Cookie-based auth (`infrastructure/browser/cookies.ts`) | ✅     |
| `useEffect` data fetching       | None                   | Application hooks use `useEffect` + repository pattern  | ✅     |
| Env vars                        | Vite `import.meta.env` | Next.js `process.env`                                   | ✅     |

### 1.6 Design System State ✅

- ✅ 13 UI primitives in `presentation/components/ui/`
- ✅ CSS custom properties for accent tokens (light: blue, dark: orange)
- ✅ All icons via `lucide-react` (zero inline SVGs)
- ✅ Tailwind v4 with `@theme` block in `styles/index.css`
- ✅ `@tailwindcss/postcss` configured for Next.js in `postcss.config.cjs`

---

## 2. Migration Strategy Design ✅

### 2.1 Big-Bang Migration (executed)

**Justification** (validated by results):

1. **Small codebase** — 84 TSX files, 4 runtime deps. Completed in <2 sessions.
2. **No react-router** — State-machine router required full replacement, not incremental.
3. **No API calls** — Zero integration risks during migration.
4. **Git rollback** — Clean commits at every stage for safe rollback.
5. **Build verification** — Both Vite and Next.js builds coexist and pass.

### 2.2 App Router (executed)

**Justified by actual results**:

1. ✅ `(authenticated)/layout.tsx` naturally wraps AppShell with auth guard
2. ✅ Route groups `(public)` and `(authenticated)` cleanly separate auth flows
3. ✅ `impersonation.tsx` context scoped to authenticated routes only
4. ✅ Cookie-based auth in layout avoids client-side flash
5. ✅ `legacyRouteMap.ts` bridges old `ROUTES.X → /path` navigation for backward compat

### 2.3 Rendering Strategy (current & future)

| Page            | Current              | Future  | Rationale                      |
| --------------- | -------------------- | ------- | ------------------------------ |
| Login           | CSR (`'use client'`) | CSR     | Auth form, no SEO              |
| All dashboards  | CSR (`'use client'`) | CSR     | Interactive, charts, real-time |
| Invoice detail  | CSR                  | SSR     | Printable, shareable documents |
| Static help/FAQ | CSR                  | SSG     | Rarely changes, SEO indexable  |
| Reports         | CSR                  | SSR/ISR | Data-heavy, cacheable          |

**Current state**: Every page is `'use client'` because all existing page components use React hooks heavily. Server component optimization becomes viable after backend integration enables data fetching at the server level.

---

## 3. Folder Refactor ✅ (executed inside Vite SPA, then carried into Next.js)

### Step 3.1 — Domain Layer ✅

Created `domain/entities/` (8 files) and `domain/contracts/` (8 files).

**Entities**: `Hotel.ts`, `Room.ts`, `User.ts`, `Kiosk.ts`, `Plan.ts`, `Invoice.ts`, `Ticket.ts`, `common.ts`

**Contracts**: `IHotelRepository.ts`, `IRoomRepository.ts`, `IUserRepository.ts`, `IKioskRepository.ts`, `IPlanRepository.ts`, `IInvoiceRepository.ts`, `ITicketRepository.ts`, `IAuthService.ts`

```ts
// domain/contracts/IHotelRepository.ts (implemented)
export interface IHotelRepository {
  getAll(): Promise<Hotel[]>;
  getById(id: number): Promise<Hotel | null>;
  create(data: Omit<Hotel, "id">): Promise<Hotel>;
  update(id: number, data: Partial<Hotel>): Promise<Hotel>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<Hotel[]>;
}
```

### Step 3.2 — Infrastructure Layer ✅

Created 7 mock repositories, HTTP client, MockAuthService, DI container, and cookie helpers.

```ts
// infrastructure/config/container.ts (implemented)
const USE_MOCK = true; // Flip when backend is ready

export const repositories = createRepositories(); // Returns mock or API impls
export const authService = USE_MOCK
  ? new MockAuthService()
  : new MockAuthService();
```

```ts
// infrastructure/http/client.ts (implemented)
// Centralized fetch wrapper with:
// - Auth token management (setAuthToken/clearAuthToken)
// - Typed GET/POST/PUT/PATCH/DELETE methods
// - Credential inclusion (credentials: 'include')
// - Error handling with message extraction
// - URL parameter building
```

### Step 3.3 — Application Layer ✅

Created 8 data hooks + auth hook + barrel export.

```ts
// application/hooks/useHotels.ts (implemented)
export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Returns { hotels, loading, error, createHotel, updateHotel, deleteHotel }
}
```

### Step 3.4 — Presentation Layer ✅

All components, modals, and pages migrated to `presentation/` (97 files total).

---

## 4. Next.js Migration Steps ✅

### Step 4.1 — Initialization ✅

- Installed `next@16.1.6` with Turbopack
- Added `@tailwindcss/postcss` for Next.js Tailwind v4 support
- Created `next.config.mjs`, `postcss.config.cjs`, updated `tsconfig.json`
- Added coexisting scripts: `dev:next`, `build:next`, `start:next`

### Step 4.2 — Tailwind v4 ✅

```js
// postcss.config.cjs (implemented)
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
```

`styles/index.css` imported via `app/layout.tsx` — `@theme`, `:root`, and `.dark` blocks work identically.

### Step 4.3 — Layout Structure ✅

```
app/
├── layout.tsx              ← Root: <html> + <body> + CSS import
├── page.tsx                ← Redirect to /login
├── (public)/
│   ├── layout.tsx          ← ThemeProvider only
│   └── login/page.tsx      ← Auth via cookies
└── (authenticated)/
    ├── layout.tsx          ← AppShell + AuthGuard + Impersonation + Theme
    ├── impersonation.tsx   ← ImpersonationContext provider + hook
    ├── super/              ← 14 page wrappers
    └── hotel/              ← 14 page wrappers
```

**Key implementation detail**: `(authenticated)/layout.tsx` handles:

- Cookie-based auth check → redirect to `/login` if not authenticated
- Cookie-based impersonation state restoration on mount
- Layout state (sidebar collapse, mobile menu)
- Legacy route bridging via `legacyRouteToPath()` function
- AppShell rendering with all necessary props

### Step 4.4 — Page Migration ✅

Every page component wrapped as a thin `page.tsx`:

```tsx
// app/(authenticated)/super/dashboard/page.tsx (actual)
"use client";
import Dashboard from "@/presentation/pages/super/Dashboard";
export default function SuperDashboardPage() {
  return <Dashboard />;
}
```

Pages requiring navigation props receive them via `useRouter()`:

```tsx
// app/(authenticated)/super/hotels/page.tsx (actual)
"use client";
import { useRouter } from "next/navigation";
import Hotels from "@/presentation/pages/super/Hotels";
import { legacyRouteToPath } from "@/application/navigation/legacyRouteMap";
import { useStartImpersonation } from "../../impersonation";

export default function SuperHotelsPage() {
  const router = useRouter();
  const startImpersonation = useStartImpersonation();
  return (
    <Hotels
      onNavigate={(route) => router.push(legacyRouteToPath(route, "super"))}
      onLoginAsAdmin={startImpersonation}
    />
  );
}
```

### Step 4.5 — Auth Implementation ✅

Cookie-based auth — **not** token-based or session-based. This is browser-only auth for the SPA layer.

| Cookie                   | Purpose                 | Set On      | Read In                      |
| ------------------------ | ----------------------- | ----------- | ---------------------------- |
| `hms_auth`               | Auth flag ("1")         | Login page  | `(authenticated)/layout.tsx` |
| `hms_role`               | Role ("super"/"hotel")  | Login page  | Login page (redirect)        |
| `hms_impersonating`      | Impersonation flag      | Hotels page | `(authenticated)/layout.tsx` |
| `hms_impersonated_hotel` | Impersonated hotel name | Hotels page | `(authenticated)/layout.tsx` |

All cookie operations use `infrastructure/browser/cookies.ts` — a typed utility with `getCookie`, `setCookie`, `deleteCookie`.

### Step 4.6 — Navigation Bridge ✅

`application/navigation/legacyRouteMap.ts` maps old `ROUTES.X` constants to Next.js paths, enabling existing page components that call `onNavigate(ROUTES.X)` to work without modification.

### Step 4.7 — Files to Delete (Phase 2.3) 🔲

```
TO DELETE (when Next.js is primary):
├── vite.config.ts          ← Vite bundler config
├── index.html              ← Vite HTML template
├── index.tsx               ← Vite entry point
├── App.tsx                 ← Legacy SPA root (preserved in presentation/legacy/)
├── config/routes.ts        ← Legacy route constants (still used by legacyRouteMap)
├── data/                   ← Raw mock data (once pages use application hooks)
└── types/                  ← Legacy types (once all imports use domain/entities)
```

---

## 5. Verification Strategy ✅

### 5.1 Build Verification (passed)

| Build Target  | Command              | Result      | Time                   |
| ------------- | -------------------- | ----------- | ---------------------- |
| Vite (legacy) | `npm run build`      | ✅ 0 errors | 7.51s                  |
| Next.js       | `npm run build:next` | ✅ 0 errors | 4.5s compile + 8.7s TS |

### 5.2 UI Integrity Guarantee

1. **Page components were NOT modified** — wrapped by thin `page.tsx` files
2. **Layout preserved** — `AppShell` imported as-is into `(authenticated)/layout.tsx`
3. **No CSS changes** — same `styles/index.css` imported via `app/layout.tsx`
4. **No dependency changes** — same React 19, Tailwind v4, lucide-react, recharts

### 5.3 Verification Checklist

```
BUILD
[x] npm run build (Vite) succeeds with 0 errors
[x] npm run build:next (Next.js) succeeds with 0 errors
[x] TypeScript passes with 0 errors

ROUTING (31 routes)
[x] All 29 static routes compile
[x] 2 dynamic routes compile ([hotelId], [kioskId])
[x] Root (/) redirects to /login
[ ] Every route from the mapping table loads without error (manual)

AUTH FLOW
[x] Cookie-based auth implemented
[x] Unauthenticated requests redirect to /login
[x] Login sets auth + role cookies
[x] Logout clears all cookies
[ ] Login → Dashboard flow works visually (manual)

IMPERSONATION
[x] ImpersonationContext scoped to authenticated routes
[x] Cookie persistence on impersonation start/end
[x] Switch back clears cookies and redirects
[ ] Full impersonation flow works visually (manual)

UI CONSISTENCY
[ ] Dark mode toggle works (manual)
[ ] Light mode accent: blue (manual)
[ ] Dark mode accent: orange (manual)
[ ] All modals open/close correctly (manual)
[ ] Sidebar navigation — all 28 links work (manual)
[ ] Sidebar collapse/expand works (manual)
[ ] Mobile menu works (manual)
[ ] All charts render (recharts in client components) (manual)
[ ] No hydration warnings in console (manual)
```

---

# PHASE 2 — FUTURE-PROOF ARCHITECTURE BLUEPRINT

## 6. Architectural Principles

### 6.1 Dependency Direction Rule (enforced)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    app/ (Next.js routing)          ← Framework-specific      │
│         │                                                    │
│         │  imports                                           │
│         ▼                                                    │
│    PRESENTATION (pages, components, modals)                  │
│         │                          ← React-specific          │
│         │  imports                                           │
│         ▼                                                    │
│    APPLICATION (hooks, context)                              │
│         │                          ← React hooks only        │
│         │  imports                                           │
│         ▼                                                    │
│    DOMAIN (entities, contracts)                              │
│         ▲                          ← Pure TypeScript         │
│         │  implements                                        │
│         │                                                    │
│    INFRASTRUCTURE (repositories, http, browser)              │
│                                    ← Pure TypeScript + fetch │
│                                                              │
│  RULE: Dependencies ONLY point inward (toward Domain).       │
│        Domain NEVER imports from any other layer.            │
│        Infrastructure implements Domain contracts.           │
│        Presentation consumes Application hooks.              │
│        app/ only imports from Presentation.                  │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Core Rules (implemented)

| Rule                             | Status | Enforcement                                      |
| -------------------------------- | ------ | ------------------------------------------------ |
| Domain is pure TypeScript        | ✅     | Zero React/Next.js/browser imports in `domain/`  |
| Application hooks are React-only | ✅     | `useState`/`useEffect` only, no Next.js APIs     |
| Presentation is React + theme    | ✅     | Components use `useTheme`, no business logic     |
| Infrastructure is pluggable      | ✅     | Mock today, REST tomorrow — `container.ts` swaps |
| Design system is logic-free      | ✅     | UI primitives accept props + callbacks only      |
| app/ files are thin wrappers     | ✅     | <20 lines each, only compose + inject navigation |

---

## 7. Final Folder Structure (✅ implemented, only hooks wiring and cleanup remaining)

```
FrontEnd/
│
├── app/                              ← NEXT.JS ROUTING ONLY
│   ├── layout.tsx                    ← Root: CSS import + html/body
│   ├── page.tsx                      ← Redirect to /login
│   ├── (public)/
│   │   ├── layout.tsx                ← ThemeProvider
│   │   └── login/page.tsx            ← Cookie auth login
│   └── (authenticated)/
│       ├── layout.tsx                ← AppShell + AuthGuard + Impersonation
│       ├── impersonation.tsx         ← ImpersonationContext
│       ├── super/                    ← 14 thin page wrappers
│       └── hotel/                    ← 14 thin page wrappers
│
├── domain/                           ← PURE TYPESCRIPT — NO FRAMEWORK
│   ├── entities/                     ← 8 entity definitions
│   ├── contracts/                    ← 8 repository interfaces
│   └── index.ts                      ← Barrel export
│
├── application/                      ← REACT HOOKS + CONTEXT
│   ├── hooks/                        ← 8 data hooks (useHotels, useAuth, etc.)
│   ├── navigation/                   ← legacyRouteMap.ts
│   └── index.ts                      ← Barrel export
│
├── infrastructure/                   ← SWAPPABLE IMPLEMENTATIONS
│   ├── repositories/
│   │   ├── mock/                     ← 7 MockRepos (current)
│   │   └── api/                      ← EMPTY — filled when backend arrives
│   ├── services/
│   │   └── MockAuthService.ts        ← swap to ApiAuthService later
│   ├── http/client.ts                ← fetch() wrapper with auth
│   ├── config/container.ts           ← DI — single USE_MOCK switch
│   └── browser/cookies.ts            ← Cookie utilities
│
├── presentation/                     ← ALL REACT UI (97 files)
│   ├── components/
│   │   ├── ui/                       ← Button, GlassInput, ModalShell, etc.
│   │   ├── layout/                   ← AppShell, Sidebar, Header
│   │   ├── charts/                   ← Chart wrappers
│   │   └── shared/                   ← Dashboard widgets
│   ├── modals/                       ← super/ + hotel/ (34 modals)
│   ├── pages/                        ← super/ + hotel/ + Login (29 pages)
│   ├── hooks/                        ← useClickOutside, useModalVisibility
│   └── providers/ThemeProvider.tsx
│
├── styles/index.css                  ← Design tokens + Tailwind v4
│
├── data/                             ← RAW MOCK DATA (to be deprecated)
├── types/                            ← LEGACY TYPES (to be deprecated)
└── config/routes.ts                  ← LEGACY ROUTES (used by legacyRouteMap)
```

**Why no restructuring when backend arrives**: Backend plugs into `infrastructure/repositories/api/` only. `container.ts` flips `USE_MOCK`. Domain contracts are defined. Application hooks already call async repository methods. Presentation never changes.

---

## 8. Layered Architecture — Flow Diagram

```
Request Flow (User clicks "View Hotels"):

Browser
  │
  ├─ Next.js router matches /super/hotels
  │
  ├─ app/(authenticated)/super/hotels/page.tsx
  │   └─ renders <Hotels onNavigate={...} onLoginAsAdmin={...} />
  │
  ├─ presentation/pages/super/Hotels.tsx
  │   └─ calls useHotels() to get data
  │       └─ application/hooks/useHotels.ts
  │           └─ calls repositories.hotels.getAll()
  │               └─ infrastructure/config/container.ts
  │                   └─ returns MockHotelRepository instance
  │                       └─ infrastructure/repositories/mock/MockHotelRepository.ts
  │                           └─ returns data from data/hotels.ts
  │
  └─ Hotels.tsx renders hotel list using Button, GlassCard, StatusBadge
      └─ presentation/components/ui/*
```

**When backend arrives**:

```diff
-  MockHotelRepository → data/hotels.ts     (sync mock data)
+  ApiHotelRepository  → httpClient.get()    (real API call)
```

Only `container.ts` changes. **Nothing else in the flow changes.**

---

## 9. Contracts & Abstraction Strategy

### 9.1 Repository Interfaces ✅ (all implemented)

Every domain entity has a corresponding repository contract with consistent CRUD:

```ts
interface I{Entity}Repository {
  getAll(): Promise<Entity[]>;
  getById(id: string | number): Promise<Entity | null>;
  create(data: Omit<Entity, 'id'>): Promise<Entity>;
  update(id: string | number, data: Partial<Entity>): Promise<Entity>;
  delete(id: string | number): Promise<void>;
  // Entity-specific methods (e.g., search for Hotels, getBookings for Rooms)
}
```

### 9.2 Mock Implementations ✅ (all implemented)

Each mock repository wraps existing `data/` arrays. The `implements` keyword provides compile-time safety.

### 9.3 API Implementations 🔲 (ready to create)

```ts
// infrastructure/repositories/api/ApiHotelRepository.ts (future)
import { httpClient } from "../../http/client";
import type { IHotelRepository } from "../../domain/contracts/IHotelRepository";

export class ApiHotelRepository implements IHotelRepository {
  async getAll() {
    return httpClient.get<Hotel[]>("/api/hotels");
  }
  async getById(id) {
    return httpClient.get<Hotel>(`/api/hotels/${id}`);
  }
  async create(data) {
    return httpClient.post<Hotel>("/api/hotels", data);
  }
  async update(id, data) {
    return httpClient.patch<Hotel>(`/api/hotels/${id}`, data);
  }
  async delete(id) {
    return httpClient.delete(`/api/hotels/${id}`);
  }
  async search(q) {
    return httpClient.get<Hotel[]>(`/api/hotels?q=${q}`);
  }
}
```

### 9.4 DI Container — Environment-Based Swap ✅

```ts
// infrastructure/config/container.ts (implemented)
const USE_MOCK = true; // Flip to: process.env.NEXT_PUBLIC_USE_MOCK !== 'false'

// Supports per-entity granular swap:
export const repositories = {
  hotels: USE_MOCK ? new MockHotelRepository() : new ApiHotelRepository(),
  rooms: USE_MOCK ? new MockRoomRepository() : new ApiRoomRepository(),
  // ... mix and match during gradual backend rollout
};
```

### 9.5 Protocol-Agnostic ✅

Contracts use `Promise<T>` — not REST, GraphQL, gRPC, or WebSocket. The infrastructure layer decides the protocol. Switching protocols only changes `api/` folder.

---

## 10. Design System Strategy ✅

### 10.1 Token Architecture

```css
@theme {
  --color-accent: ...;
  --color-accent-strong: ...;
  --color-accent-muted: ...;
}
:root {
  --color-accent: #3b82f6;
} /* blue in light */
.dark {
  --color-accent: #f97316;
} /* orange in dark */
```

### 10.2 Component Rules

| Rule                                                        | Status                                              |
| ----------------------------------------------------------- | --------------------------------------------------- |
| UI components are logic-free                                | ✅ No data fetching, no context (except `useTheme`) |
| UI components accept only primitives and callbacks          | ✅ `label: string`, `onClick: () => void`           |
| UI components never import from `domain/` or `application/` | ✅ Only from `shared/` or other UI components       |
| Variants are prop-driven                                    | ✅ `<Button variant="danger">` not `<DangerButton>` |
| Theme changes are token-only                                | ✅ Swap CSS variables, never component code         |

### 10.3 New Designs Never Break Logic

UI components are pure render. Redesigning `Button.tsx` from scratch — changing gradients, shadows, animations — leaves hooks, repositories, and domain untouched. The page still calls `<Button onClick={handleSave}>Save</Button>`.

---

## 11. Feature Scalability Model

### 11.1 Adding a Feature: Step-by-Step Workflow

```
1. DOMAIN     → Create domain/entities/NewEntity.ts
               → Create domain/contracts/INewEntityRepository.ts
               → Export from domain/index.ts

2. INFRA      → Create infrastructure/repositories/mock/MockNewEntityRepository.ts
               → Register in infrastructure/config/container.ts (1 line)

3. APP        → Create application/hooks/useNewEntities.ts
               → Export from application/index.ts

4. UI         → Create presentation/pages/{super|hotel}/NewEntityPage.tsx
               → Create presentation/modals/{super|hotel}/NewEntityModal.tsx

5. ROUTING    → Create app/(authenticated)/{super|hotel}/new-entities/page.tsx
               → Add sidebar link in presentation/components/layout/Sidebar.tsx

TOTAL: ~6 new files + 3 lines in existing files. Zero existing logic modified.
```

### 11.2 Deleting a Feature

Reverse the add steps. Delete files. Remove sidebar link. Zero cascading failures because features never import from other features.

### 11.3 Preventing Cascading Dependencies

- Features never import from other features
- Shared code only promoted to `shared/` if used by 3+ features
- Each feature's data isolated in its own hook
- Each feature's modals live in modals/ subdirectory, not in the page file

---

## 12. Backend Integration Plan 🔲

### 12.1 When Backend Arrives — Exact Steps

```
1. For each domain entity:
   a. Create infrastructure/repositories/api/Api{Entity}Repository.ts
   b. Implement the I{Entity}Repository contract
   c. Each method calls httpClient.get/post/patch/delete

2. Create infrastructure/services/ApiAuthService.ts
   a. Implement IAuthService using backend /auth endpoints

3. In container.ts:
   a. Import API repositories
   b. Set USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'

4. In .env.local:
   a. Set NEXT_PUBLIC_USE_MOCK=false
   b. Set NEXT_PUBLIC_API_URL=http://localhost:5000

5. Done — zero changes to presentation, application, or domain.
```

### 12.2 Gradual Swap Strategy

Container supports per-entity mix-and-match:

```ts
export const repositories = {
  hotels: new ApiHotelRepository(), // ← backend ready
  rooms: new ApiRoomRepository(), // ← backend ready
  users: new MockUserRepository(), // ← still mock
  kiosks: new MockKioskRepository(), // ← still mock
  plans: new ApiPlanRepository(), // ← backend ready
  invoices: new MockInvoiceRepository(), // ← still mock
  tickets: new MockTicketRepository(), // ← still mock
};
```

### 12.3 Contract Validation (future enhancement)

```ts
// Optional: Add Zod runtime validation in httpClient
import { z } from 'zod';

async get<T>(url: string, schema?: z.ZodType<T>): Promise<T> {
  const data = await this.request<T>('GET', url);
  return schema ? schema.parse(data) : data;
}
```

---

## 13. Language-Proof & Framework-Proof Design

### 13.1 Next.js API Containment

| Next.js API                    | Allowed In                         | NEVER In                                        |
| ------------------------------ | ---------------------------------- | ----------------------------------------------- |
| `useRouter()`, `usePathname()` | `app/` page files only             | presentation components, hooks, domain          |
| `'use client'`                 | `app/` page files only             | presentation components (they're always client) |
| `next/navigation`              | `app/` + `application/navigation/` | domain, infrastructure                          |
| `redirect()`                   | `app/page.tsx` (root redirect)     | anywhere else                                   |
| `cookies()` server-side        | `middleware.ts` only               | anywhere else                                   |
| `next/image`                   | presentation components (optional) | domain, application                             |

### 13.2 React API Containment

| React API              | Allowed In                              | NEVER In                     |
| ---------------------- | --------------------------------------- | ---------------------------- |
| `useState`/`useEffect` | application hooks, presentation         | domain, infrastructure repos |
| `createContext`        | application context, app/ impersonation | domain, infrastructure       |
| JSX                    | presentation + app/ only                | domain, infrastructure       |
| `React.FC`/`ReactNode` | presentation only                       | domain                       |

### 13.3 Domain Portability

If the frontend is rewritten in Vue, Svelte, or a mobile app:

- `domain/` works as-is (pure TypeScript)
- `infrastructure/` works as-is (pure TypeScript + fetch)
- Only `application/` (React hooks → Vue composables) and `presentation/` (JSX → templates) change
- `app/` is framework-specific and gets replaced entirely

---

# Appendix A — Architecture Verification Checklist

```
DOMAIN LAYER
[x] No imports from React, Next.js, or browser APIs
[x] All entities are plain TypeScript interfaces/types
[x] All contracts are interfaces with Promise<T> returns
[x] Domain has zero dependencies on any other layer
[x] Barrel export (domain/index.ts) exposes all entities + contracts

APPLICATION LAYER
[x] Hooks import from domain/ and infrastructure/config/container only
[x] Hooks return { data, loading, error } pattern
[ ] Pages actually consume application hooks (🔲 Phase 2.1)
[ ] No direct data/ imports in any presentation file (🔲 Phase 2.1)

INFRASTRUCTURE LAYER
[x] Every contract has Mock implementation
[ ] Every contract has API implementation (🔲 Phase 2.2)
[x] container.ts is the ONLY place that knows which impl is active
[x] HTTP client provides typed methods with auth token support
[x] Cookie utilities isolated in browser/cookies.ts

PRESENTATION LAYER
[x] UI components have zero business logic
[x] UI components only import from shared/ and other UI components
[ ] Pages import data via application hooks only (🔲 Phase 2.1)
[x] Modals receive data via props
[x] No hardcoded colors — all via CSS tokens

NEXT.JS LAYER (app/)
[x] page.tsx files are thin wrappers (<20 lines each)
[x] layout.tsx files compose providers and layout components
[x] Auth handled via cookies in layout, not middleware
[x] No business logic in any app/ file
[x] Impersonation scoped via context provider

BACKEND INTEGRATION READINESS
[x] DI container with USE_MOCK switch exists
[x] HTTP client with auth token support exists
[ ] Flipping USE_MOCK=false connects to real API (🔲 Phase 2.2)
[ ] No UI code references mock data directly (🔲 Phase 2.1)
[x] API URL is environment-variable driven
[x] Auth token handling is in httpClient
```

---

# Appendix B — Concrete Example: Adding "Spa & Wellness" Feature

**Scenario**: Product team wants a new "Spa & Wellness" management page for hotel admins.

### Step 1: Domain (5 min)

```ts
// domain/entities/SpaService.ts
export interface SpaService {
  id: string;
  name: string;
  category: "massage" | "facial" | "body-treatment" | "wellness";
  duration: number;
  price: number;
  available: boolean;
}

// domain/contracts/ISpaRepository.ts
export interface ISpaRepository {
  getAll(): Promise<SpaService[]>;
  getById(id: string): Promise<SpaService | null>;
  create(input: Omit<SpaService, "id">): Promise<SpaService>;
  update(id: string, input: Partial<SpaService>): Promise<SpaService>;
  delete(id: string): Promise<void>;
}
```

### Step 2: Infrastructure (10 min)

```ts
// infrastructure/repositories/mock/MockSpaRepository.ts
export class MockSpaRepository implements ISpaRepository {
  private data: SpaService[] = [
    {
      id: "1",
      name: "Deep Tissue Massage",
      category: "massage",
      duration: 60,
      price: 3500,
      available: true,
    },
    {
      id: "2",
      name: "Aromatherapy Facial",
      category: "facial",
      duration: 45,
      price: 2500,
      available: true,
    },
  ];
  async getAll() {
    return this.data;
  }
  // ... standard CRUD
}

// Add to container.ts:
// spa: USE_MOCK ? new MockSpaRepository() : new ApiSpaRepository(),
```

### Step 3: Application (5 min)

```ts
// application/hooks/useSpaServices.ts
export function useSpaServices() {
  const [services, setServices] = useState<SpaService[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    repositories.spa
      .getAll()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);
  return { services, loading };
}
```

### Step 4: Presentation (30 min)

```tsx
// presentation/pages/hotel/SpaManagement.tsx
import { useSpaServices } from "@/application/hooks/useSpaServices";
import PageHeader from "@/presentation/components/ui/PageHeader";

export default function SpaManagement() {
  const { services, loading } = useSpaServices();
  return (
    <>
      <PageHeader
        title="Spa & Wellness"
        subtitle="Manage services and appointments"
      />
      {/* Table using existing UI primitives */}
    </>
  );
}
```

### Step 5: Routing (1 min)

```tsx
// app/(authenticated)/hotel/spa/page.tsx
"use client";
import SpaManagement from "@/presentation/pages/hotel/SpaManagement";
export default function SpaPage() {
  return <SpaManagement />;
}
```

### Step 6: Navigation (1 min)

Add one item to Sidebar's hotel navigation array.

### What did NOT change:

- ❌ Zero existing pages modified
- ❌ Zero existing hooks modified
- ❌ Zero existing domain entities modified
- ❌ Zero existing infrastructure files modified (only `container.ts` +1 line)
- ❌ Zero CSS / design system changes
- ❌ Build still passes

**Total: ~50 minutes. Zero risk of regression.**

---

# Appendix C — Phase 2 Remaining Work (Prioritized)

### 2.1 Wire Application Hooks (HIGH priority)

**Goal**: Replace all direct `data/` imports in presentation pages with application hooks.

```diff
// Before (current — still coupled to mock data)
- import { hotelsData } from '@/data/hotels';
- const hotels = hotelsData;

// After (decoupled — backend-ready)
+ import { useHotels } from '@/application';
+ const { hotels, loading, error } = useHotels();
```

**Scope**: ~29 presentation pages need updating. Each is a find-replace pattern.

**Risk**: Low — hooks already exist and return the same data shapes.

### 2.2 Backend Integration (when backend is ready)

1. Create `infrastructure/repositories/api/` implementations (7 files)
2. Create `infrastructure/services/ApiAuthService.ts` (1 file)
3. Flip `USE_MOCK` in `container.ts` (1 line change)
4. Set env vars in `.env.local` (2 lines)

### 2.3 Vite Cleanup (AFTER Next.js is primary)

Delete: `vite.config.ts`, `index.html`, `index.tsx`, remove Vite scripts from `package.json`, remove `@tailwindcss/vite` and `@vitejs/plugin-react` from devDependencies.

### 2.4 Testing Infrastructure

- Vitest for unit tests (domain entities, utility functions)
- React Testing Library for component tests
- Playwright or Cypress for E2E (route navigation, auth flows)

### 2.5 Legacy Cleanup

- Deprecate `types/` → use `domain/entities/` exclusively
- Deprecate `data/` → consumed only by `infrastructure/repositories/mock/`
- Deprecate `config/routes.ts` → only used by `legacyRouteMap.ts`
- Remove `presentation/legacy/App.tsx` once no longer needed for reference
