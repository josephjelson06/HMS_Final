export type ViewMode = "super" | "hotel";

function cleanPathname(pathname: string): string {
  // next/navigation's usePathname() already excludes query, but keep this defensive.
  return pathname.split("?")[0].split("#")[0];
}

export function pathnameToLegacyRoute(pathname: string): string {
  const clean = cleanPathname(pathname);
  const parts = clean.split("/").filter(Boolean);
  const [mode, section, id] = parts;

  if (mode === "super") {
    switch (section) {
      case "dashboard":
        return "dashboard";
      case "hotels":
        return id ? "hotel-details" : "hotels";
      case "kiosks":
        return id ? "kiosk-detail" : "kiosk-fleet";
      case "plans":
        return "plans";
      case "subscriptions":
        return "subscriptions";
      case "invoices":
        return "invoices";
      case "reports":
        return "reports";
      case "users":
        return "users-mgmt";
      case "audit-logs":
        return "audit-logs";
      case "helpdesk":
        return "helpdesk";
      case "profile":
        return "profile";
      case "settings":
        return "platform-settings";
      default:
        return "dashboard";
    }
  }

  if (mode === "hotel") {
    switch (section) {
      case "dashboard":
        return "hotel-dashboard";
      case "guests":
        return "guest-registry";
      case "rooms":
        return "room-mgmt";
      case "bookings":
        return "booking-engine";
      case "rates":
        return "rate-inventory";
      case "billing":
        return "billing";
      case "incidents":
        return "incidents";
      case "users":
        return "user-mgmt";
      case "roles":
        return "role-mgmt";
      case "help":
        return "help";
      case "reports":
        return "hotel-reports";
      case "profile":
        return "hotel-profile";
      case "settings":
        return "hotel-settings";
      case "subscription":
        return "my-subscription";
      default:
        return "hotel-dashboard";
    }
  }

  return "dashboard";
}

export function legacyRouteToPath(route: string, viewMode: ViewMode): string {
  if (viewMode === "super") {
    switch (route) {
      case "dashboard":
        return "/super/dashboard";
      case "hotels":
        return "/super/hotels";
      case "hotel-details":
        return "/super/hotels/1";
      case "plans":
        return "/super/plans";
      case "kiosk-fleet":
        return "/super/kiosks";
      case "kiosk-detail":
        return "/super/kiosks/ATC-SN-7766";
      case "subscriptions":
        return "/super/subscriptions";
      case "invoices":
        return "/super/invoices";
      case "reports":
        return "/super/reports";
      case "users-mgmt":
        return "/super/users";
      case "audit-logs":
        return "/super/audit-logs";
      case "helpdesk":
        return "/super/helpdesk";
      case "profile":
        return "/super/profile";
      case "platform-settings":
        return "/super/settings";
      default:
        return "/super/dashboard";
    }
  }

  // viewMode === "hotel"
  switch (route) {
    case "hotel-dashboard":
      return "/hotel/dashboard";
    case "guest-registry":
      return "/hotel/guests";
    case "room-mgmt":
      return "/hotel/rooms";
    case "booking-engine":
      return "/hotel/bookings";
    case "rate-inventory":
      return "/hotel/rates";
    case "billing":
      return "/hotel/billing";
    case "incidents":
      return "/hotel/incidents";
    case "user-mgmt":
      return "/hotel/users";
    case "role-mgmt":
      return "/hotel/roles";
    case "help":
      return "/hotel/help";
    case "hotel-reports":
      return "/hotel/reports";
    case "hotel-profile":
      return "/hotel/profile";
    case "hotel-settings":
      return "/hotel/settings";
    case "my-subscription":
      return "/hotel/subscription";
    default:
      return "/hotel/dashboard";
  }
}

