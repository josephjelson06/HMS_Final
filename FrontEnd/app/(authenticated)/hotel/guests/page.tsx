"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import GuestRegistry from "@/presentation/pages/hotel/GuestRegistry";

export default function HotelGuestsPage() {
  return (
    <PermissionGate requiredPermission="hotel:guests:read">
      <GuestRegistry />
    </PermissionGate>
  );
}
