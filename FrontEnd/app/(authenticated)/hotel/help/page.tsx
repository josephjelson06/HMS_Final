"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import HotelHelp from "@/presentation/pages/hotel/HotelHelp";

export default function HotelHelpPage() {
  return (
    <PermissionGate requiredPermission="" alwaysAllow>
      <HotelHelp />
    </PermissionGate>
  );
}
