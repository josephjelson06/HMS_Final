# HMS Frontend — Next.js Migration & Future-Proof Architecture Blueprint

**Author**: Senior Software Architect  
**Date**: 13 February 2026  
**Scope**: React SPA → Next.js + TypeScript migration with backend-agnostic architecture

---

# PHASE 1 — MIGRATION STRATEGY

## 1. Pre-Migration Audit

### 1.1 Current Folder Structure

```
FrontEnd/
├── App.tsx                    ← SPA root, state-machine router
├── index.tsx                  ← ReactDOM entry
├── index.html                 ← Vite HTML template
├── vite.config.ts             ← Vite config (to be deleted)
├── tsconfig.json              ← TypeScript config
├── config/
│   └── routes.ts              ← Route string constants
├── providers/
│   └── ThemeProvider.tsx       ← Only context (theme toggle)
├── hooks/                     ← 4 custom hooks
│   ├── useTheme.ts            ← Re-exports ThemeProvider's hook
│   ├── useClickOutside.ts
│   └── useModalVisibility.ts
├── types/                     ← 11 type definition files
├── data/                      ← 17 mock data files (barrel-exported)
├── styles/
│   └── index.css              ← Design tokens + Tailwind v4 @theme
├── components/
│   ├── ui/                    ← 13 shared UI primitives
│   ├── layout/                ← AppShell, Sidebar, Header, ErrorBoundary
│   ├── charts/                ← 4 chart wrapper components
│   └── *.tsx                  ← 5 loose dashboard widgets
├── pages/
│   ├── Login.tsx
│   ├── super/                 ← 14 super admin pages
│   └── hotel/                 ← 14 hotel admin pages
└── modals/
    ├── super/                 ← 17 super admin modals
    └── hotel/                 ← 17 hotel admin modals
```

### 1.2 Coupling Analysis

| Layer                     | Couples To                                    | Severity  | Fix Required                       |
| ------------------------- | --------------------------------------------- | --------- | ---------------------------------- |
| **Pages** → `data/`       | Pages import mock arrays directly             | 🔴 High   | Abstract behind service layer      |
| **Pages** → `types/`      | Pages import domain types                     | ✅ Clean  | Keep, move types into domain       |
| **Modals** → `data/`      | Some modals import mock data                  | 🔴 High   | Abstract behind service layer      |
| **Components** → `hooks/` | UI uses `useTheme`                            | ✅ Clean  | Keep                               |
| **App.tsx** → everything  | Owns all routing + auth + impersonation state | 🟡 Medium | Decompose into contexts/middleware |

### 1.3 Routing System

**Pattern**: Custom state-machine in `App.tsx`

- `currentRoute` state string matched against `ROUTES` constants
- Conditional rendering: `{currentRoute === ROUTES.X && <Page />}`
- 28 routes total (14 super + 14 hotel)
- `viewMode` state (`'super' | 'hotel'`) gates route groups
- No react-router, no URL-based routing, no browser history
- Route changes via `setCurrentRoute()` callback passed as prop

**Migration impact**: Must convert each `ROUTES.X` → a Next.js page file. State-machine routing is **completely replaced** by file-system routing.

### 1.4 Global State Patterns

| State                | Location                | Scope  | Migration                                   |
| -------------------- | ----------------------- | ------ | ------------------------------------------- |
| `isDarkMode`         | `ThemeProvider` context | Global | Keep as context in `layout.tsx`             |
| `isAuthenticated`    | `App.tsx` local state   | Global | Move to auth context + middleware           |
| `viewMode`           | `App.tsx` local state   | Global | Becomes URL path (`/super/*` vs `/hotel/*`) |
| `currentRoute`       | `App.tsx` local state   | Global | Eliminated by file-system routing           |
| `isImpersonating`    | `App.tsx` local state   | Global | Move to auth/session context                |
| `isSidebarCollapsed` | `App.tsx` local state   | Layout | Move to layout context                      |
| `isMobileMenuOpen`   | `App.tsx` local state   | Layout | Move to layout context                      |

### 1.5 Side Effects & Data Fetching

- **Zero API calls** exist. All data is synchronous mock imports.
- **Zero `useEffect` data-fetching** patterns.
- `ThemeProvider` uses `useEffect` for `document.documentElement.classList` manipulation.
- No `localStorage`, `sessionStorage`, or `window.*` usage in components.
- One env var: `GEMINI_API_KEY` exposed via Vite define.

### 1.6 Design System State

- ✅ 6 UI primitives (`Button`, `GlassInput`, `ModalShell`, `PageHeader`, `StatusBadge`, `SectionLabel`)
- ✅ CSS custom properties for accent tokens (light: blue, dark: orange)
- ✅ All icons via `lucide-react`
- ✅ Tailwind v4 with `@theme` block
- ✅ No inline SVGs remaining

---

## 2. Migration Strategy Design

### 2.1 Big-Bang vs Incremental

**Decision: Big-Bang Migration**

**Justification**:

1. **Small codebase** — 84 TSX files, 4 runtime deps. Not enterprise-scale React app with 500+ components.
2. **No react-router** — No incremental route-by-route migration possible anyway. The state-machine router must be replaced entirely.
3. **No API calls** — Zero network dependencies means zero integration risks during migration.
4. **Already committed** — Clean git commit (`5f09a78`) provides a safe rollback point.
5. **Single developer** — No team coordination overhead for parallel work.

**Risk**: If it fails, `git reset --hard 5f09a78` restores everything instantly.

### 2.2 Pages Router vs App Router

**Decision: App Router (Next.js 14+)**

**Justification**:

1. **Layout support** — `layout.tsx` replaces `AppShell` naturally, with persistent sidebar/header across route changes.
2. **Route groups** — `(super)` and `(hotel)` route groups map perfectly to the `viewMode` concept.
3. **Middleware** — Auth gate + impersonation checks belong in `middleware.ts`, not in component tree.
4. **Server Components** — Future SSR/SSG for SEO-relevant pages (billing invoices, reports).
5. **Parallel routes** — Modal routing via parallel routes (`@modal`) is a natural fit for slide-in panels.
6. **Industry direction** — Pages Router is in maintenance mode.

### 2.3 Rendering Strategy

| Page                | Strategy             | Rationale                                   |
| ------------------- | -------------------- | ------------------------------------------- |
| Login               | CSR                  | Auth form, no SEO needed                    |
| All dashboard pages | CSR (`'use client'`) | Heavy interactivity, charts, real-time data |
| Invoice detail/PDF  | SSR (future)         | Printable, shareable documents              |
| Static help/FAQ     | SSG (future)         | Rarely changes, SEO indexable               |

**For now**: Every page is `'use client'` since all current pages use hooks heavily. Server component optimization is a Phase 2 concern after backend integration.

### 2.4 Risk Mitigation

| Risk               | Mitigation                                                                       |
| ------------------ | -------------------------------------------------------------------------------- |
| Routing breaks     | Map every `ROUTES.X` constant to a file path before code migration               |
| Layout flickers    | Test AppShell → layout.tsx conversion in isolation first                         |
| Tailwind v4 breaks | Next.js supports Tailwind v4 via `@tailwindcss/postcss`; verify before migrating |
| Theme flash        | Use `next-themes` or persist theme in cookie + `layout.tsx` class                |
| `recharts` SSR     | Mark all chart pages as `'use client'` (already planned)                         |

---

## 3. Folder Refactor BEFORE Migration

> [!IMPORTANT]
> These changes happen **inside the current Vite SPA** before touching Next.js.  
> Each step is a separate commit. SPA keeps working throughout.

### Step 3.1 — Introduce Domain Layer

Move types into a domain boundary. Types become the **contract** that never changes regardless of framework or backend.

```
src/domain/
├── entities/
│   ├── Hotel.ts          ← from types/hotel.ts
│   ├── Room.ts           ← from types/room.ts
│   ├── User.ts           ← from types/user.ts
│   ├── Kiosk.ts          ← from types/kiosk.ts
│   ├── Plan.ts           ← from types/plan.ts
│   ├── Invoice.ts        ← from types/invoice.ts
│   ├── Ticket.ts         ← from types/ticket.ts
│   └── common.ts         ← from types/common.ts
├── contracts/
│   ├── IHotelRepository.ts
│   ├── IRoomRepository.ts
│   ├── IUserRepository.ts
│   ├── IKioskRepository.ts
│   ├── IPlanRepository.ts
│   ├── IInvoiceRepository.ts
│   ├── ITicketRepository.ts
│   └── IAuthService.ts
└── index.ts              ← barrel export
```

**Contract example** (`IHotelRepository.ts`):

```ts
import { Hotel } from "../entities/Hotel";

export interface IHotelRepository {
  getAll(): Promise<Hotel[]>;
  getById(id: string): Promise<Hotel | null>;
  create(data: Omit<Hotel, "id">): Promise<Hotel>;
  update(id: string, data: Partial<Hotel>): Promise<Hotel>;
  delete(id: string): Promise<void>;
}
```

### Step 3.2 — Introduce Infrastructure Layer

Create adapter implementations — starting with mock, swappable to real API later.

```
src/infrastructure/
├── repositories/
│   ├── mock/
│   │   ├── MockHotelRepository.ts    ← implements IHotelRepository using data/hotels.ts
│   │   ├── MockRoomRepository.ts
│   │   ├── MockUserRepository.ts
│   │   └── ...
│   └── api/                          ← EMPTY NOW, filled when backend arrives
│       ├── ApiHotelRepository.ts     ← implements IHotelRepository using fetch()
│       └── ...
├── services/
│   └── MockAuthService.ts            ← implements IAuthService
└── config/
    └── container.ts                  ← dependency injection — picks mock vs api
```

**Container pattern** (`container.ts`):

```ts
import { IHotelRepository } from "@/domain/contracts/IHotelRepository";
import { MockHotelRepository } from "../repositories/mock/MockHotelRepository";
// import { ApiHotelRepository } from '../repositories/api/ApiHotelRepository';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const hotelRepository: IHotelRepository = USE_MOCK
  ? new MockHotelRepository()
  : new MockHotelRepository(); // ← swap to ApiHotelRepository when ready
```

### Step 3.3 — Introduce Application Layer (Use Cases / Hooks)

Create domain-aware hooks that components consume. Components never touch repositories directly.

```
src/application/
├── hooks/
│   ├── useHotels.ts       ← calls hotelRepository.getAll()
│   ├── useRooms.ts
│   ├── useUsers.ts
│   ├── useKiosks.ts
│   ├── usePlans.ts
│   ├── useInvoices.ts
│   ├── useTickets.ts
│   └── useAuth.ts
└── context/
    ├── AuthProvider.tsx    ← extracted from App.tsx
    ├── LayoutProvider.tsx  ← sidebar/mobile state
    └── ThemeProvider.tsx   ← moved from providers/
```

**Hook example** (`useHotels.ts`):

```ts
import { useState, useEffect } from "react";
import { Hotel } from "@/domain/entities/Hotel";
import { hotelRepository } from "@/infrastructure/config/container";

export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    hotelRepository
      .getAll()
      .then(setHotels)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { hotels, loading, error };
}
```

### Step 3.4 — Isolate Presentation Layer

```
src/presentation/
├── components/
│   ├── ui/               ← Button, GlassInput, ModalShell, etc. (already clean)
│   ├── layout/           ← AppShell, Sidebar, Header (already clean)
│   ├── charts/           ← chart wrappers (already clean)
│   └── shared/           ← Access, AlertList, Team, etc.
├── modals/
│   ├── super/            ← unchanged
│   └── hotel/            ← unchanged
└── pages/                ← move here temporarily, these become Next.js app/ pages
    ├── Login.tsx
    ├── super/
    └── hotel/
```

---

## 4. Incremental Migration Steps

### Step 4.1 — Initialize Next.js Project

```bash
npx -y create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

**Key decisions during init**:

- `--app` → App Router
- `--src-dir` → all code under `src/`
- `--import-alias "@/*"` → matches existing `@/` paths

### Step 4.2 — Port Tailwind v4 Configuration

Replace `@tailwindcss/vite` with `@tailwindcss/postcss`:

```js
// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Copy `styles/index.css` → `src/app/globals.css`. The `@theme`, `:root`, and `.dark` blocks work identically.

### Step 4.3 — Create Layout Structure

```
src/app/
├── layout.tsx              ← ThemeProvider + AuthProvider + LayoutProvider
├── globals.css             ← from styles/index.css
├── login/
│   └── page.tsx            ← Login page
├── (authenticated)/
│   ├── layout.tsx          ← AppShell (Sidebar + Header) + auth guard
│   ├── (super)/
│   │   ├── dashboard/page.tsx
│   │   ├── hotels/page.tsx
│   │   ├── hotels/[id]/page.tsx
│   │   ├── plans/page.tsx
│   │   ├── kiosks/page.tsx
│   │   ├── kiosks/[id]/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── users/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   ├── helpdesk/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   └── (hotel)/
│       ├── dashboard/page.tsx
│       ├── guests/page.tsx
│       ├── rooms/page.tsx
│       ├── bookings/page.tsx
│       ├── rates/page.tsx
│       ├── billing/page.tsx
│       ├── incidents/page.tsx
│       ├── users/page.tsx
│       ├── roles/page.tsx
│       ├── help/page.tsx
│       ├── reports/page.tsx
│       ├── profile/page.tsx
│       └── settings/page.tsx
```

### Route Mapping Table

| Old `ROUTES.X`      | New Next.js Path | File                             |
| ------------------- | ---------------- | -------------------------------- |
| `DASHBOARD`         | `/dashboard`     | `(super)/dashboard/page.tsx`     |
| `HOTELS`            | `/hotels`        | `(super)/hotels/page.tsx`        |
| `HOTEL_DETAILS`     | `/hotels/[id]`   | `(super)/hotels/[id]/page.tsx`   |
| `PLANS`             | `/plans`         | `(super)/plans/page.tsx`         |
| `KIOSK_FLEET`       | `/kiosks`        | `(super)/kiosks/page.tsx`        |
| `KIOSK_DETAIL`      | `/kiosks/[id]`   | `(super)/kiosks/[id]/page.tsx`   |
| `SUBSCRIPTIONS`     | `/subscriptions` | `(super)/subscriptions/page.tsx` |
| `INVOICES`          | `/invoices`      | `(super)/invoices/page.tsx`      |
| `REPORTS`           | `/reports`       | `(super)/reports/page.tsx`       |
| `USERS_MGMT`        | `/users`         | `(super)/users/page.tsx`         |
| `AUDIT_LOGS`        | `/audit-logs`    | `(super)/audit-logs/page.tsx`    |
| `HELPDESK`          | `/helpdesk`      | `(super)/helpdesk/page.tsx`      |
| `PROFILE`           | `/profile`       | `(super)/profile/page.tsx`       |
| `PLATFORM_SETTINGS` | `/settings`      | `(super)/settings/page.tsx`      |
| `HOTEL_DASHBOARD`   | `/dashboard`     | `(hotel)/dashboard/page.tsx`     |
| `GUEST_REGISTRY`    | `/guests`        | `(hotel)/guests/page.tsx`        |
| `ROOM_MGMT`         | `/rooms`         | `(hotel)/rooms/page.tsx`         |
| `BOOKING_ENGINE`    | `/bookings`      | `(hotel)/bookings/page.tsx`      |
| `RATE_INVENTORY`    | `/rates`         | `(hotel)/rates/page.tsx`         |
| `BILLING`           | `/billing`       | `(hotel)/billing/page.tsx`       |
| `INCIDENTS`         | `/incidents`     | `(hotel)/incidents/page.tsx`     |
| `USER_MGMT`         | `/users`         | `(hotel)/users/page.tsx`         |
| `ROLE_MGMT`         | `/roles`         | `(hotel)/roles/page.tsx`         |
| `HELP`              | `/help`          | `(hotel)/help/page.tsx`          |
| `HOTEL_REPORTS`     | `/reports`       | `(hotel)/reports/page.tsx`       |
| `HOTEL_PROFILE`     | `/profile`       | `(hotel)/profile/page.tsx`       |
| `HOTEL_SETTINGS`    | `/settings`      | `(hotel)/settings/page.tsx`      |

### Step 4.4 — Page Migration Template

Every existing page component becomes a `page.tsx` wrapper:

```tsx
// src/app/(authenticated)/(super)/dashboard/page.tsx
"use client";
import Dashboard from "@/presentation/pages/super/Dashboard";
export default function DashboardPage() {
  return <Dashboard />;
}
```

**Component internals are unchanged**. The page file is a thin wrapper. This means zero risk of breaking UI during migration.

### Step 4.5 — Replace Navigation

Replace all `onNavigate(ROUTES.X)` calls with Next.js `useRouter().push()`:

```tsx
// Before (prop drilling)
onNavigate(ROUTES.HOTELS);

// After (direct navigation)
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/hotels");
```

### Step 4.6 — Auth Middleware

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 4.7 — Environment Migration

| Vite                    | Next.js                | Notes              |
| ----------------------- | ---------------------- | ------------------ |
| `import.meta.env.X`     | `process.env.X`        | Server-side        |
| `VITE_*` prefix         | `NEXT_PUBLIC_*` prefix | Client-side        |
| `vite.config.ts` define | `next.config.ts` env   | Static replacement |

### Step 4.8 — Files to Delete

```
DELETE: vite.config.ts
DELETE: index.html
DELETE: index.tsx
DELETE: App.tsx                    ← routing logic moved to app/ layout + pages
DELETE: config/routes.ts           ← replaced by file-system routing
DELETE: components/layout/AppShell.tsx  ← replaced by (authenticated)/layout.tsx
```

---

## 5. Verification Strategy

### 5.1 UI Never Breaks Guarantee

1. **Page components are NOT modified** — They're wrapped by `page.tsx` files, original components are imported as-is.
2. **Layout is preserved** — `AppShell` → `layout.tsx` uses the exact same Sidebar + Header components.
3. **No CSS changes** — `globals.css` is identical to `styles/index.css`.
4. **No dependency changes** — Same React, same Tailwind, same lucide-react.

### 5.2 Verification Checklist

```
[ ] npm run build succeeds with 0 errors
[ ] Every route from the mapping table loads without error
[ ] Dark mode toggle works (cookie-persisted)
[ ] Light mode accent: blue. Dark mode accent: orange
[ ] All modals open/close correctly
[ ] Sidebar navigation works (all 28 routes)
[ ] Sidebar collapse/expand works
[ ] Mobile menu works
[ ] Login → Dashboard flow works
[ ] Impersonation: super → hotel → back to super works
[ ] All charts render (recharts in client components)
[ ] No hydration warnings in console
```

### 5.3 Type Safety

- `strict: true` in `tsconfig.json` (currently partially strict — enable fully)
- All repository contracts are typed with `Promise<T>` returns
- All hooks return typed state objects
- Page props validated at compile time

---

# PHASE 2 — FUTURE-PROOF ARCHITECTURE BLUEPRINT

## 6. Architectural Principles

### 6.1 Dependency Direction Rule

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│    PRESENTATION (pages, components, modals)           │
│         │                                            │
│         │  depends on                                │
│         ▼                                            │
│    APPLICATION (hooks, use-cases, context)            │
│         │                                            │
│         │  depends on                                │
│         ▼                                            │
│    DOMAIN (entities, contracts, value-objects)        │
│         ▲                                            │
│         │  implements                                │
│         │                                            │
│    INFRASTRUCTURE (repositories, API adapters)       │
│                                                      │
└──────────────────────────────────────────────────────┘

RULE: Dependencies ONLY point inward (toward Domain).
      Domain NEVER imports from any other layer.
      Infrastructure implements Domain contracts.
      Presentation consumes Application hooks.
```

### 6.2 Core Rules

1. **Domain is pure TypeScript** — No React, no Next.js, no browser APIs. Just types and interfaces.
2. **Application hooks are React-only** — They use `useState`/`useEffect` but no Next.js APIs.
3. **Presentation is React + Next.js** — `'use client'`, `useRouter`, etc. live here only.
4. **Infrastructure is pluggable** — Mock today, REST tomorrow, GraphQL next year. Domain doesn't care.
5. **Design system is logic-free** — `Button` renders a button. It doesn't know what clicking it does.

---

## 7. Final Folder Structure

```
HMS_Final/
├── src/
│   ├── app/                              ← NEXT.JS ROUTING ONLY
│   │   ├── layout.tsx                    ← Root: ThemeProvider + Fonts
│   │   ├── globals.css                   ← Design tokens
│   │   ├── login/page.tsx
│   │   └── (authenticated)/
│   │       ├── layout.tsx                ← AppShell + AuthGuard
│   │       ├── (super)/
│   │       │   ├── layout.tsx            ← Super-specific layout (optional)
│   │       │   ├── dashboard/page.tsx
│   │       │   ├── hotels/page.tsx
│   │       │   ├── hotels/[id]/page.tsx
│   │       │   └── ... (14 total)
│   │       └── (hotel)/
│   │           ├── layout.tsx            ← Hotel-specific layout (optional)
│   │           ├── dashboard/page.tsx
│   │           └── ... (14 total)
│   │
│   ├── domain/                           ← PURE TYPESCRIPT — NO FRAMEWORK
│   │   ├── entities/
│   │   │   ├── Hotel.ts
│   │   │   ├── Room.ts
│   │   │   ├── User.ts
│   │   │   ├── Kiosk.ts
│   │   │   ├── Plan.ts
│   │   │   ├── Invoice.ts
│   │   │   ├── Ticket.ts
│   │   │   ├── Booking.ts
│   │   │   ├── Guest.ts
│   │   │   ├── AuditLog.ts
│   │   │   └── Incident.ts
│   │   ├── contracts/
│   │   │   ├── IHotelRepository.ts
│   │   │   ├── IRoomRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IKioskRepository.ts
│   │   │   ├── IPlanRepository.ts
│   │   │   ├── IInvoiceRepository.ts
│   │   │   ├── ITicketRepository.ts
│   │   │   ├── IBookingRepository.ts
│   │   │   ├── IGuestRepository.ts
│   │   │   ├── IAuditLogRepository.ts
│   │   │   ├── IIncidentRepository.ts
│   │   │   └── IAuthService.ts
│   │   └── index.ts
│   │
│   ├── application/                      ← REACT HOOKS + CONTEXT
│   │   ├── hooks/
│   │   │   ├── useHotels.ts
│   │   │   ├── useRooms.ts
│   │   │   ├── useUsers.ts
│   │   │   ├── useKiosks.ts
│   │   │   ├── usePlans.ts
│   │   │   ├── useInvoices.ts
│   │   │   ├── useTickets.ts
│   │   │   ├── useBookings.ts
│   │   │   ├── useGuests.ts
│   │   │   ├── useAuditLogs.ts
│   │   │   ├── useIncidents.ts
│   │   │   └── useAuth.ts
│   │   └── context/
│   │       ├── AuthProvider.tsx
│   │       ├── LayoutProvider.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── infrastructure/                   ← SWAPPABLE IMPLEMENTATIONS
│   │   ├── repositories/
│   │   │   ├── mock/
│   │   │   │   ├── MockHotelRepository.ts
│   │   │   │   ├── MockRoomRepository.ts
│   │   │   │   └── ... (one per contract)
│   │   │   └── api/                      ← EMPTY UNTIL BACKEND READY
│   │   │       ├── ApiHotelRepository.ts
│   │   │       └── ...
│   │   ├── services/
│   │   │   ├── MockAuthService.ts
│   │   │   └── ApiAuthService.ts         ← EMPTY UNTIL BACKEND READY
│   │   ├── http/
│   │   │   └── client.ts                 ← Fetch wrapper (auth headers, error handling)
│   │   └── config/
│   │       └── container.ts              ← Dependency injection
│   │
│   ├── presentation/                     ← ALL REACT UI
│   │   ├── components/
│   │   │   ├── ui/                       ← Button, GlassInput, ModalShell, etc.
│   │   │   ├── layout/                   ← Sidebar, Header
│   │   │   ├── charts/                   ← Chart wrappers
│   │   │   └── shared/                   ← Access, AlertList, Team, etc.
│   │   ├── modals/
│   │   │   ├── super/
│   │   │   └── hotel/
│   │   └── pages/                        ← ACTUAL PAGE COMPONENTS
│   │       ├── super/                    ← Dashboard.tsx, Hotels.tsx, etc.
│   │       └── hotel/                    ← HotelDashboard.tsx, etc.
│   │
│   └── shared/                           ← CROSS-CUTTING UTILITIES
│       ├── utils/
│       │   ├── formatCurrency.ts
│       │   ├── formatDate.ts
│       │   └── classNames.ts
│       ├── constants/
│       │   └── index.ts
│       └── hooks/
│           ├── useClickOutside.ts
│           └── useModalVisibility.ts
│
├── public/                               ← Static assets
├── next.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

**Why no restructuring needed when backend arrives**:

- Backend plugs into `infrastructure/repositories/api/` only
- `infrastructure/config/container.ts` flips the switch
- Domain contracts are already defined
- Application hooks already call async repository methods
- Presentation doesn't change at all

---

## 8. Layered Architecture — Dependency Flow

```
                    ┌──────────────┐
                    │   Next.js    │
                    │  app/ dir    │   page.tsx files are thin wrappers
                    └──────┬───────┘
                           │ imports
                           ▼
              ┌────────────────────────┐
              │     PRESENTATION       │
              │  pages/ components/    │   React components, JSX, styling
              │  modals/               │   Uses application hooks for data
              └────────────┬───────────┘
                           │ imports
                           ▼
              ┌────────────────────────┐
              │      APPLICATION       │
              │  hooks/ context/       │   useHotels(), AuthProvider
              │                        │   Calls repository contracts
              └────────────┬───────────┘
                           │ imports
                           ▼
              ┌────────────────────────┐
              │        DOMAIN          │
              │  entities/ contracts/  │   Pure TS — Hotel, IHotelRepository
              │                        │   NEVER imports anything else
              └────────────────────────┘
                           ▲
                           │ implements
              ┌────────────┴───────────┐
              │    INFRASTRUCTURE      │
              │  mock/ → api/          │   MockHotelRepo → ApiHotelRepo
              │  http/client.ts        │   fetch() wrapper
              │  config/container.ts   │   DI: picks mock or real
              └────────────────────────┘
```

---

## 9. Contracts & Abstraction Strategy

### 9.1 Repository Interface Pattern

```ts
// domain/contracts/IHotelRepository.ts
export interface IHotelRepository {
  getAll(): Promise<Hotel[]>;
  getById(id: string): Promise<Hotel | null>;
  create(input: CreateHotelInput): Promise<Hotel>;
  update(id: string, input: UpdateHotelInput): Promise<Hotel>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Hotel[]>;
}
```

### 9.2 Mock Implementation

```ts
// infrastructure/repositories/mock/MockHotelRepository.ts
import { IHotelRepository } from "@/domain/contracts/IHotelRepository";
import { mockHotels } from "./data/hotels"; // ← current data/ files move here

export class MockHotelRepository implements IHotelRepository {
  async getAll() {
    return mockHotels;
  }
  async getById(id: string) {
    return mockHotels.find((h) => h.id === id) ?? null;
  }
  async create(input) {
    return { id: crypto.randomUUID(), ...input };
  }
  async update(id, input) {
    return { ...mockHotels[0], ...input };
  }
  async delete(id) {
    /* no-op */
  }
  async search(query) {
    return mockHotels.filter((h) => h.name.includes(query));
  }
}
```

### 9.3 Real API Implementation (future)

```ts
// infrastructure/repositories/api/ApiHotelRepository.ts
import { httpClient } from "../../http/client";
import { IHotelRepository } from "@/domain/contracts/IHotelRepository";

export class ApiHotelRepository implements IHotelRepository {
  async getAll() {
    return httpClient.get<Hotel[]>("/api/hotels");
  }
  async getById(id) {
    return httpClient.get<Hotel>(`/api/hotels/${id}`);
  }
  async create(input) {
    return httpClient.post<Hotel>("/api/hotels", input);
  }
  async update(id, input) {
    return httpClient.patch<Hotel>(`/api/hotels/${id}`, input);
  }
  async delete(id) {
    return httpClient.delete(`/api/hotels/${id}`);
  }
  async search(query) {
    return httpClient.get<Hotel[]>(`/api/hotels?q=${query}`);
  }
}
```

### 9.4 Environment-Based Swap

```ts
// infrastructure/config/container.ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const repositories = {
  hotels: USE_MOCK ? new MockHotelRepository() : new ApiHotelRepository(),
  rooms: USE_MOCK ? new MockRoomRepository() : new ApiRoomRepository(),
  users: USE_MOCK ? new MockUserRepository() : new ApiUserRepository(),
  // ... one line per domain entity
};
```

```env
# .env.local
NEXT_PUBLIC_USE_MOCK=true     # flip to false when backend is ready
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 9.5 Protocol-Agnostic

Contracts use `Promise<T>` — they don't specify REST, GraphQL, gRPC, or WebSocket. The infrastructure layer decides the protocol. If you switch from REST to GraphQL later, only the `api/` folder changes. Domain, application, and presentation layers are untouched.

---

## 10. Design System Strategy

### 10.1 Token Architecture (already implemented)

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

| Rule                                                        | Enforcement                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| UI components are **logic-free**                            | No data fetching, no context consumption (except `useTheme`) |
| UI components accept **only primitives and callbacks**      | `label: string`, `onClick: () => void`                       |
| UI components never import from `domain/` or `application/` | Only from `shared/` or other UI components                   |
| Variants are prop-driven                                    | `<Button variant="danger">` not `<DangerButton>`             |
| Theme changes are token-only                                | Swap CSS variables, never component code                     |

### 10.3 Adding a New Design Never Breaks Logic

Because UI components don't contain logic. If you redesign `Button.tsx` from scratch — change every gradient, shadow, animation — the hooks, repositories, and domain are untouched. The page component still calls `<Button onClick={handleSave}>Save</Button>` and it works.

---

## 11. Feature Scalability Model

### 11.1 Adding a Feature: "Amenities Management"

```
1. DOMAIN:   Create domain/entities/Amenity.ts
             Create domain/contracts/IAmenityRepository.ts

2. INFRA:    Create infrastructure/repositories/mock/MockAmenityRepository.ts
             Register in container.ts

3. APP:      Create application/hooks/useAmenities.ts

4. UI:       Create presentation/pages/hotel/Amenities.tsx
             Create presentation/modals/hotel/AddAmenityModal.tsx

5. ROUTING:  Create src/app/(authenticated)/(hotel)/amenities/page.tsx
             Add sidebar link in presentation/components/layout/Sidebar.tsx
```

**Nothing else changes**. No existing files are modified except Sidebar (to add a nav link).

### 11.2 Deleting a Feature

Reverse the steps above. Delete the files. Remove the sidebar link. Zero cascading failures because no other feature imports from amenities.

### 11.3 Preventing Cascading Dependencies

- Features never import from other features
- Shared code lives in `shared/` only if used by 3+ features
- Each feature's data comes from its own hook (`useAmenities`), not from a god-hook
- Each feature's modal is co-located with its parent page in the same `modals/` subdirectory

---

## 12. Backend Integration Plan (Future)

### 12.1 When Backend Arrives — Exact Steps

```
1. Create infrastructure/http/client.ts         ← fetch wrapper with auth headers
2. For each domain entity:
   a. Create infrastructure/repositories/api/Api{Entity}Repository.ts
   b. Implement the I{Entity}Repository interface
   c. Each method calls httpClient.get/post/patch/delete
3. In container.ts, flip USE_MOCK to false (or per-entity)
4. Set NEXT_PUBLIC_API_URL in .env.local
5. Done — zero changes to presentation, application, or domain
```

### 12.2 Gradual Swap Strategy

You don't need to swap all at once. Container supports per-entity mock/real:

```ts
export const repositories = {
  hotels: new ApiHotelRepository(), // ← backend ready
  rooms: new ApiRoomRepository(), // ← backend ready
  users: new MockUserRepository(), // ← still mock
  kiosks: new MockKioskRepository(), // ← still mock
};
```

### 12.3 Contract Validation

When backend is live, validate responses match domain entities:

```ts
// infrastructure/http/client.ts
import { z } from 'zod'; // optional runtime validation

async get<T>(url: string, schema?: z.ZodType<T>): Promise<T> {
  const res = await fetch(url, { headers: this.headers });
  const data = await res.json();
  return schema ? schema.parse(data) : data as T;
}
```

---

## 13. Language-Proof & Framework-Proof Design

### 13.1 Next.js Leakage Prevention

| Next.js API     | Where it lives                     | Where it NEVER appears    |
| --------------- | ---------------------------------- | ------------------------- |
| `useRouter()`   | `app/` page files only             | components, hooks, domain |
| `'use client'`  | `app/` page files only             | presentation components   |
| `next/image`    | presentation components (optional) | domain, application       |
| `next/link`     | presentation layout (Sidebar)      | domain, application       |
| `middleware.ts` | `src/middleware.ts` only           | anywhere else             |
| `cookies()`     | infrastructure only                | domain, application       |

### 13.2 React Leakage Prevention

| React API            | Where it lives                  | Where it NEVER appears |
| -------------------- | ------------------------------- | ---------------------- |
| `useState/useEffect` | application hooks, presentation | domain, infrastructure |
| `createContext`      | application context             | domain, infrastructure |
| JSX                  | presentation only               | domain, infrastructure |
| `React.FC`           | presentation only               | domain                 |

### 13.3 Domain is Portable

If you ever rewrite the frontend in Vue, Svelte, or even a mobile app:

- `domain/` works as-is (pure TypeScript)
- `infrastructure/` works as-is (pure TypeScript + fetch)
- Only `application/` (React hooks → Vue composables) and `presentation/` (JSX → templates) change

---

# Appendix A — Future-Proof Architecture Verification Checklist

```
DOMAIN LAYER
[  ] No imports from React, Next.js, or browser APIs
[  ] All entities are plain TypeScript interfaces/types
[  ] All contracts are interfaces with Promise<T> returns
[  ] Domain has zero dependencies on any other layer

APPLICATION LAYER
[  ] Hooks only import from domain/ and infrastructure/config/container
[  ] Hooks return { data, loading, error } pattern consistently
[  ] Context providers only manage cross-cutting state
[  ] No direct fetch() calls — all go through repository contracts

INFRASTRUCTURE LAYER
[  ] Every contract has both Mock and API implementations
[  ] container.ts is the ONLY place that knows which implementation is active
[  ] API implementations use httpClient, not raw fetch()
[  ] Mock data files live inside infrastructure/repositories/mock/data/

PRESENTATION LAYER
[  ] UI components have zero business logic
[  ] UI components only import from shared/ and other UI components
[  ] Pages import data exclusively via application hooks
[  ] Modals receive data via props, not via direct repository calls
[  ] No hardcoded colors — all via CSS tokens

NEXT.JS LAYER (app/)
[  ] page.tsx files are thin wrappers (<5 lines)
[  ] layout.tsx files only compose providers and layout components
[  ] middleware.ts handles auth only
[  ] No business logic in any app/ file

BACKEND INTEGRATION READINESS
[  ] Flipping USE_MOCK=false should be the ONLY change needed
[  ] No UI code references mock data directly
[  ] API URL is environment-variable driven
[  ] Auth token handling is in httpClient, not in components
```

---

# Appendix B — Concrete Example: Adding "Spa & Wellness" Feature

**Scenario**: Product team wants a new "Spa & Wellness" management page for hotel admins.

### Step 1: Domain (5 min)

```ts
// src/domain/entities/SpaService.ts
export interface SpaService {
  id: string;
  name: string;
  category: "massage" | "facial" | "body-treatment" | "wellness";
  duration: number; // minutes
  price: number;
  available: boolean;
}

// src/domain/contracts/ISpaRepository.ts
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
// src/infrastructure/repositories/mock/MockSpaRepository.ts
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
  async getById(id) {
    return this.data.find((s) => s.id === id) ?? null;
  }
  // ... CRUD methods
}

// Add to container.ts:
// spa: USE_MOCK ? new MockSpaRepository() : new ApiSpaRepository(),
```

### Step 3: Application (5 min)

```ts
// src/application/hooks/useSpaServices.ts
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
// src/presentation/pages/hotel/SpaManagement.tsx
"use client";
import { useSpaServices } from "@/application/hooks/useSpaServices";
import PageHeader from "@/presentation/components/ui/PageHeader";
import Button from "@/presentation/components/ui/Button";

export default function SpaManagement() {
  const { services, loading } = useSpaServices();
  return (
    <>
      <PageHeader
        title="Spa & Wellness"
        subtitle="Manage services and appointments"
      />
      {/* Table of services using existing UI primitives */}
    </>
  );
}
```

### Step 5: Routing (1 min)

```tsx
// src/app/(authenticated)/(hotel)/spa/page.tsx
"use client";
import SpaManagement from "@/presentation/pages/hotel/SpaManagement";
export default function SpaPage() {
  return <SpaManagement />;
}
```

### Step 6: Navigation (1 min)

Add one entry to Sidebar's hotel navigation array.

### What did NOT change:

- ❌ Zero existing pages modified
- ❌ Zero existing hooks modified
- ❌ Zero existing domain entities modified
- ❌ Zero existing infrastructure files modified (only `container.ts` got one line)
- ❌ Zero CSS changes
- ❌ Zero design system changes
- ❌ Build still passes

**Total time: ~50 minutes. Zero risk of regression.**
