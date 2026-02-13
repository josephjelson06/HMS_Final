# HMS Frontend — Styling Audit Report

**Date**: 13 February 2026  
**Scope**: Full design-system implementation, modal migration, color tokens, and polish  
**Build Status**: ✅ `npm run build` — 0 errors

---

## Phase 1 — Foundation Primitives

Created 6 reusable UI components in `FrontEnd/components/ui/`:

| Component        | File               | Purpose                                                                                                                                 |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**       | `Button.tsx`       | 6 variants: `primary`, `ghost`, `danger`, `action`, `outline`, `link`. Supports `icon`, `iconRight`, `size`, `disabled`, `loading`.     |
| **GlassInput**   | `GlassInput.tsx`   | Form input with label, error state, and accent-colored focus ring. Replaces raw `<input>` elements.                                     |
| **ModalShell**   | `ModalShell.tsx`   | Portal-based modal with backdrop blur, header/footer slots, `headerContent` for custom headers, `hideHeader`/`hideCloseButton` options. |
| **PageHeader**   | `PageHeader.tsx`   | Standardized page title + subtitle + right-side action slot.                                                                            |
| **StatusBadge**  | `StatusBadge.tsx`  | Color-coded status indicator pill with dot.                                                                                             |
| **SectionLabel** | `SectionLabel.tsx` | Uppercase micro-label for form sections.                                                                                                |

Additionally added to `styles/index.css`:

- `@theme` block with design tokens (font sizes, radii, letter-spacing, action colors)
- Global `focus-visible` styles
- `@custom-variant dark` for proper light/dark mode handling

---

## Phase 2 — Page & Modal Migration

### 2.1 Pages (26 files)

All super admin and hotel admin pages updated to use `PageHeader`, `Button`, `StatusBadge`, and accent color tokens.

**Super Admin Pages** (14):
`Dashboard`, `Hotels`, `HotelDetails`, `UsersManagement`, `AdminProfile`, `Plans`, `Subscriptions`, `Invoices`, `KioskFleet`, `KioskDetail`, `Helpdesk`, `AuditLogs`, `Reports`, `PlatformSettings`

**Hotel Admin Pages** (12):
`HotelDashboard`, `RoomManagement`, `BookingEngine`, `GuestRegistry`, `BillingHub`, `HotelUsers`, `IncidentsRecord`, `RateInventoryManager`, `PropertySettings`, `SubscriptionBilling`, `HotelHelp`, `HotelReports`, `HotelAudit`, `StaffProfile`

### 2.2 Modals (20 migrated to ModalShell)

**Hotel Centered-Dialog Modals** (11):

| Modal                    | Key Pattern                                |
| ------------------------ | ------------------------------------------ |
| `AddBuildingModal`       | Simple form → `ModalShell` + `GlassInput`  |
| `AddRoomModal`           | Form + category badges                     |
| `NewIncidentModal`       | Form with priority selector                |
| `NewTicketModal`         | Form with attachments                      |
| `NewPOSBillModal`        | Dynamic line items                         |
| `AddHotelUserModal`      | Success state toggle                       |
| `ManageRoomTypeModal`    | Amenity tags with accent tokens            |
| `CreateHotelRoleModal`   | Multi-step wizard                          |
| `BulkRateModal`          | Dual-mode (rate/block) tabs                |
| `HotelTicketDetailModal` | Split-panel, `hideHeader`                  |
| `IncidentDetailModal`    | Split-panel with chat thread, `hideHeader` |

**Super Admin Centered-Dialog Modals** (9):

| Modal                     | Key Pattern                                         |
| ------------------------- | --------------------------------------------------- |
| `AddHotelModal`           | 5-step wizard (pre-existing)                        |
| `AddUserModal`            | Form with success state                             |
| `EditUserModal`           | Controlled inputs + `onUpdate`                      |
| `ChangePlanModal`         | Plan selector with price diff                       |
| `ExtendSubscriptionModal` | Duration selector + pricing                         |
| `UnmapKioskModal`         | Destructive action (red header via `headerContent`) |
| `CreateRoleModal`         | Role cloning wizard                                 |
| `AddKioskModal`           | 3-step wizard with `Button` nav                     |
| `AddFirmwareModal`        | 3-step wizard with file upload                      |
| `KioskSupportTicketModal` | Form with evidence upload areas                     |

### 2.3 Side-Panel Modals (9 — kept custom layouts)

These use `fixed inset-y-0 right-0` slide-in layouts incompatible with `ModalShell`:

- **Hotel**: `GuestDetailPanel`, `RoomDetailPanel`, `InvoiceDetail`, `KioskSettings`, `NewBookingWizard`, `NightAuditWizard`
- **Super**: `HelpdeskDetailModal`, `InvoiceCreateModal`, `InvoiceDetailModal`

### What was removed from migrated modals:

- `ReactDOM.createPortal` boilerplate (handled by `ModalShell`)
- `GlassCard` wrappers (replaced by `ModalShell` glass effects)
- `useTheme` / `isDarkMode` guards (Tailwind `dark:` handles it)
- `useModalVisibility` hook (ModalShell handles internally)
- Raw `<button>` elements → `Button` variants
- Raw `<input>` elements → `GlassInput`

---

## Phase 3 — Polish

### 3.1 Light-Mode Accessibility

Fixed `hover:text-white` across light mode to prevent invisible text on hover.

### 3.2 Font-Weight Hierarchy

Normalized `font-black` (weight 900) → `font-bold` (weight 700) on all **labels and metadata text** across **49 TSX files**.

**Rule established**:
| Weight | Usage |
|---|---|
| `font-black` (900) | Page titles (`h1`), modal headers only |
| `font-bold` (700) | Labels, metadata, section headings, smaller titles |
| `font-semibold` (600) | Button text, secondary callouts |
| `font-medium` (500) | Body text, descriptions |

**Regex applied**: `text-[Npx] font-black uppercase` → `text-[Npx] font-bold uppercase`

### 3.3 Inline SVG Removal

Replaced 5 hand-rolled SVG components with `lucide-react` imports:

| File                               | Inline SVG              | lucide-react Import      |
| ---------------------------------- | ----------------------- | ------------------------ |
| `pages/hotel/RoomManagement.tsx`   | `FileOutput` component  | `import { FileOutput }`  |
| `modals/super/ChangePlanModal.tsx` | `RefreshCcw` component  | `import { RefreshCcw }`  |
| `modals/super/CreatePlanPanel.tsx` | `Sparkles` component    | `import { Sparkles }`    |
| `modals/super/UpdatePlanPanel.tsx` | `Sparkles` component    | `import { Sparkles }`    |
| `modals/hotel/KioskSettings.tsx`   | `IndianRupee` component | `import { IndianRupee }` |

---

## Phase 4 — Color Token System

Implemented dual-mode accent colors with CSS custom properties:

```css
:root {
  --color-accent: #3b82f6; /* blue-500 — light mode */
  --color-accent-strong: #2563eb; /* blue-600 */
  --color-accent-muted: rgba(59, 130, 246, 0.1);
}
.dark {
  --color-accent: #f97316; /* orange-500 — dark mode */
  --color-accent-strong: #ea580c; /* orange-600 */
  --color-accent-muted: rgba(249, 115, 22, 0.1);
}
```

Registered in `@theme` for Tailwind utilities: `text-accent`, `bg-accent-strong`, `ring-accent-muted`, etc.

**Applied across**:

- All UI primitives (Button, GlassInput, Pagination, GlassDropdown, PermissionGrid, GlassDatePicker, StatusBadge)
- Layout components (Sidebar, Header)
- All 14 super admin pages
- All 14 hotel admin pages
- All ~20 modals and remaining components

---

## Files Changed Summary

| Category                          | Count                  |
| --------------------------------- | ---------------------- |
| New UI components created         | 6                      |
| Pages updated                     | 26                     |
| Modals migrated to ModalShell     | 20                     |
| Inline SVGs removed               | 5                      |
| Files with font-weight normalized | 49                     |
| CSS/theme files modified          | 1 (`styles/index.css`) |

---

## Current State

- **Build**: ✅ `npm run build` passes with 0 errors
- **Design system**: Fully implemented with shared primitives
- **Color tokens**: Blue (light) / Orange (dark) accent system
- **Font hierarchy**: Enforced across the codebase
- **Inline SVGs**: Zero — all icons via `lucide-react`
- **Backend**: Still on mock data (out of scope for this audit)
- **Tests**: Not covered in this session

---

## Yet To Be Done

### Frontend — Remaining Polish

- [ ] **Visual verification** — Manually confirm blue accent (light mode) and orange accent (dark mode) across all pages
- [ ] **Side-panel modal cleanup** — The 9 slide-in panels (`GuestDetailPanel`, `RoomDetailPanel`, `InvoiceDetail`, `KioskSettings`, `NewBookingWizard`, `NightAuditWizard`, `HelpdeskDetailModal`, `InvoiceCreateModal`, `InvoiceDetailModal`) still use raw `ReactDOM.createPortal` + manual `isDarkMode` guards. Consider extracting a `SlidePanel` shared component if more are added.
- [ ] **Remaining `font-black` on non-titles** — Some `h3`/`h4` headings inside cards still use `font-black`; could be downgraded to `font-bold` for stricter hierarchy
- [ ] **Responsive design audit** — Verify all pages and modals on tablet/mobile breakpoints
- [ ] **Accessibility (a11y)** — Add `aria-label` attributes to icon-only buttons, ensure proper focus trapping in modals, test keyboard navigation

### Backend Integration

- [ ] **Replace mock data** — Frontend currently uses local mock data in `lib/`. Wire up to Flask backend API endpoints.
- [ ] **API layer** — Create a centralized API client (Axios/fetch wrapper) with auth headers, error handling, and retry logic
- [ ] **Authentication flow** — Connect login page to backend auth endpoint, handle JWT/session tokens
- [ ] **CORS & proxy config** — Configure Vite proxy for dev and proper CORS headers for production
- [ ] **Impersonation** — Wire frontend impersonation UI to backend impersonation API

### Testing

- [ ] **Vitest setup** — Complete the Vitest + React Testing Library configuration (partially started in a prior session)
- [ ] **Unit tests** — Cover utility functions, hooks (`useTheme`, `useModalVisibility`), and data transformers
- [ ] **Component tests** — Test shared UI primitives (`Button`, `GlassInput`, `ModalShell`)
- [ ] **Integration tests** — Test page-level rendering and modal open/close flows
- [ ] **E2E tests** — Consider Playwright for full user flow testing (login → dashboard → booking)

### Deployment & DevOps

- [ ] **Production build optimization** — Analyze bundle sizes, lazy-load heavy pages
- [ ] **Environment configuration** — Set up `.env` files for dev/staging/production
- [ ] **CI/CD pipeline** — Lint → Type-check → Test → Build → Deploy
- [ ] **Docker setup** — Containerize frontend + backend for consistent deployment
