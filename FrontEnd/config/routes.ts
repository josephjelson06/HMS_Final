// Type-safe route constants for the application.
// All route strings are defined here to prevent typos and enable autocomplete.

export const ROUTES = {
  // Super Admin Routes
  DASHBOARD: 'dashboard',
  HOTELS: 'hotels',
  HOTEL_DETAILS: 'hotel-details',
  PLANS: 'plans',
  KIOSK_FLEET: 'kiosk-fleet',
  KIOSK_DETAIL: 'kiosk-detail',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES: 'invoices',
  REPORTS: 'reports',
  USERS_MGMT: 'users-mgmt',
  AUDIT_LOGS: 'audit-logs',
  HELPDESK: 'helpdesk',
  PROFILE: 'profile',
  PLATFORM_SETTINGS: 'platform-settings',

  // Hotel Admin Routes
  HOTEL_DASHBOARD: 'hotel-dashboard',
  GUEST_REGISTRY: 'guest-registry',
  ROOM_MGMT: 'room-mgmt',
  BOOKING_ENGINE: 'booking-engine',
  RATE_INVENTORY: 'rate-inventory',
  BILLING: 'billing',
  MY_SUBSCRIPTION: 'my-subscription',
  INCIDENTS: 'incidents',
  USER_MGMT: 'user-mgmt',
  ROLE_MGMT: 'role-mgmt',
  HELP: 'help',
  HOTEL_REPORTS: 'hotel-reports',
  HOTEL_PROFILE: 'hotel-profile',
  HOTEL_SETTINGS: 'hotel-settings',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
