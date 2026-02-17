"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import BookingEngine from "@/presentation/pages/hotel/BookingEngine";

export default function HotelBookingsPage() {
  return (
    <PermissionGate requiredPermission="hotel:bookings:read">
      <BookingEngine />
    </PermissionGate>
  );
}
