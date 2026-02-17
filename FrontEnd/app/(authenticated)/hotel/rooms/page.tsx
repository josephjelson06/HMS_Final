"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import RoomManagement from "@/presentation/pages/hotel/RoomManagement";

export default function HotelRoomsPage() {
  return (
    <PermissionGate requiredPermission="hotel:rooms:read">
      <RoomManagement />
    </PermissionGate>
  );
}
