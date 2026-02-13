"use client";

import { useRouter } from "next/navigation";

import Hotels from "@/presentation/pages/super/Hotels";
import { legacyRouteToPath } from "@/application/navigation/legacyRouteMap";
import { useStartImpersonation } from "../../impersonation";

export default function SuperHotelsPage() {
  const router = useRouter();
  const startImpersonation = useStartImpersonation();

  return (
    <Hotels
      onNavigate={(route) => router.push(legacyRouteToPath(route, "super"))}
      onLoginAsAdmin={startImpersonation}
    />
  );
}

