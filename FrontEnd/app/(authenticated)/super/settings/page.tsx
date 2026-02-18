"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import PlatformSettings from "@/presentation/pages/super/PlatformSettings";

export default function SuperSettingsPage() {
  return (
    <PermissionGate requiredPermission="" adminOnly>
      <PlatformSettings />
    </PermissionGate>
  );
}
