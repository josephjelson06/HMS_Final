"use client";

import { useRouter } from "next/navigation";

import Subscriptions from "@/presentation/pages/super/Subscriptions";
import { legacyRouteToPath } from "@/application/navigation/legacyRouteMap";

export default function SuperSubscriptionsPage() {
  const router = useRouter();
  return <Subscriptions onNavigate={(route) => router.push(legacyRouteToPath(route, "super"))} />;
}

