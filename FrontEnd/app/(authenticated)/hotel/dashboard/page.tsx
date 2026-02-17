"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import HotelDashboard from "@/presentation/pages/hotel/HotelDashboard";

export default function HotelDashboardPage() {
  return (
    <PermissionGate requiredPermission="hotel:dashboard:read">
      <HotelDashboard />
    </PermissionGate>
  );
}
