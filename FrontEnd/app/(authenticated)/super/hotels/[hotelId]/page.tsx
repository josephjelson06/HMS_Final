"use client";

import { useRouter } from "next/navigation";

import HotelDetails from "@/presentation/pages/super/HotelDetails";
import { legacyRouteToPath } from "@/application/navigation/legacyRouteMap";
import { useStartImpersonation } from "../../../impersonation";

export default function SuperHotelDetailsPage() {
  const router = useRouter();
  const startImpersonation = useStartImpersonation();

  return (
    <HotelDetails
      onNavigate={(route) => router.push(legacyRouteToPath(route, "super"))}
      onLoginAsAdmin={startImpersonation}
    />
  );
}

