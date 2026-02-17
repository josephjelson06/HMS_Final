"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import RateInventoryManager from "@/presentation/pages/hotel/RateInventoryManager";

export default function HotelRatesPage() {
  return (
    <PermissionGate requiredPermission="hotel:rates:read">
      <RateInventoryManager />
    </PermissionGate>
  );
}
