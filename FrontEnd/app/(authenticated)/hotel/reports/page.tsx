"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import HotelReports from "@/presentation/pages/hotel/HotelReports";

export default function HotelReportsPage() {
  return (
    <PermissionGate requiredPermission="hotel:reports:read">
      <HotelReports />
    </PermissionGate>
  );
}
