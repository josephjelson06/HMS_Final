# Frontend Components Report

## Platform (Super Admin) Module

### 1. App Routes (`app/(authenticated)/super/`)

Total Routes: 15

- **Active (8)**: `dashboard`, `tenants`, `tenants/[hotelId]`, `users`, `plans`, `subscriptions`, `helpdesk`, `profile`
- **Pending/Empty (2)**: `audit-logs`, `reports`
- **Deprecated/Orphaned (5)**: `hotels`, `invoices`, `kiosks`, `kiosks/[kioskId]`, `settings`

### 2. Presentation Pages (`presentation/pages/super/`)

Total Pages: 8

1.  `Dashboard.tsx`
2.  `Tenants.tsx`
3.  `HotelDetails.tsx` (Tenant Details)
4.  `UsersManagement.tsx`
5.  `Plans.tsx`
6.  `Subscriptions.tsx`
7.  `Helpdesk.tsx`
8.  `AdminProfile.tsx`

### 3. Modals & Panels (`presentation/modals/super/`)

Total Modals: 12

1.  `AddHotelModal.tsx`
2.  `AddUserModal.tsx`
3.  `EditUserModal.tsx`
4.  `CreateRoleModal.tsx`
5.  `EditRoleModal.tsx`
6.  `RoleDetailView.tsx`
7.  `CreatePlanPanel.tsx`
8.  `UpdatePlanPanel.tsx`
9.  `ChangePlanModal.tsx`
10. `ExtendSubscriptionModal.tsx`
11. `HelpdeskDetailModal.tsx`
12. `InvoiceHistoryModal.tsx`

---

## Tenant (Hotel) Module

### 1. App Routes (`app/(authenticated)/hotel/`)

Total Routes: 13

- **Active (6)**: `dashboard`, `users`, `roles`, `billing`, `help`, `profile`
- **Pending/Empty (1)**: `reports`
- **Deprecated/Orphaned (6)**: `bookings`, `guests`, `incidents`, `rates`, `rooms`, `settings`

### 2. Presentation Pages (`presentation/pages/hotel/`)

Total Pages: 6

1.  `HotelDashboard.tsx`
2.  `HotelUsers.tsx`
3.  `HotelRoles.tsx`
4.  `BillingHub.tsx`
5.  `HotelHelp.tsx`
6.  `StaffProfile.tsx`

### 3. Modals (`presentation/modals/hotel/`)

Total Modals: 4

1.  `AddHotelUserModal.tsx`
2.  `CreateHotelRoleModal.tsx`
3.  `NewTicketModal.tsx`
4.  `HotelTicketDetailModal.tsx`
