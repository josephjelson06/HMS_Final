"use client";

import { useParams, useRouter } from "next/navigation";

import KioskDetail from "@/presentation/pages/super/KioskDetail";

export default function SuperKioskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const raw = params?.kioskId;
  const kioskId = Array.isArray(raw) ? raw[0] : raw;

  return (
    <KioskDetail
      kioskId={kioskId || "ATC-SN-7766"}
      onBack={() => router.push("/super/kiosks")}
    />
  );
}

