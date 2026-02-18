"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import PropertySettings from "@/presentation/pages/hotel/PropertySettings";

export default function HotelSettingsPage() {
  return (
    <PermissionGate requiredPermission="" adminOnly>
      <PropertySettings />
    </PermissionGate>
  );
}
