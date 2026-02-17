"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import IncidentsRecord from "@/presentation/pages/hotel/IncidentsRecord";

export default function HotelIncidentsPage() {
  return (
    <PermissionGate requiredPermission="hotel:incidents:read">
      <IncidentsRecord />
    </PermissionGate>
  );
}
