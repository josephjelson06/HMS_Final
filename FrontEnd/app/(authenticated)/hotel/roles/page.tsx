"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import HotelRoles from "@/presentation/pages/hotel/HotelRoles";

export default function HotelRolesPage() {
  return (
    <PermissionGate requiredPermission="hotel:users:read">
      <HotelRoles />
    </PermissionGate>
  );
}
