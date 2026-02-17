"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import HotelUsers from "@/presentation/pages/hotel/HotelUsers";

export default function HotelUsersPage() {
  return (
    <PermissionGate requiredPermission="hotel:users:read">
      <HotelUsers />
    </PermissionGate>
  );
}
