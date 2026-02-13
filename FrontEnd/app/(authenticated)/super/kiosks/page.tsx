"use client";

import { useRouter } from "next/navigation";

import KioskFleet from "@/presentation/pages/super/KioskFleet";

export default function SuperKiosksPage() {
  const router = useRouter();
  return <KioskFleet onNavigateDetail={(id) => router.push(`/super/kiosks/${id}`)} />;
}

