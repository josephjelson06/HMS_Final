"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import BillingHub from "@/presentation/pages/hotel/BillingHub";

export default function HotelBillingPage() {
  return (
    <PermissionGate requiredPermission="hotel:billing:read">
      <BillingHub />
    </PermissionGate>
  );
}
