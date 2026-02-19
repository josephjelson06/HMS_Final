"use client";

import React, { useEffect, useState } from "react";
import { useTenants } from "@/application/hooks/useTenants";
import type { Tenant } from "@/domain/entities/Tenant";

interface HotelDetailsProps {
  hotelId?: string;
  onNavigate: (route: string) => void;
  onLoginAsAdmin: (tenantId: string) => void;
}

export default function HotelDetails({
  hotelId,
  onNavigate,
  onLoginAsAdmin,
}: HotelDetailsProps) {
  const { getTenant } = useTenants();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hotelId) {
      setLoading(true);
      getTenant(hotelId)
        .then(setTenant)
        .catch(() => setError("Failed to load tenant details"))
        .finally(() => setLoading(false));
    }
  }, [hotelId, getTenant]);

  if (loading) return <div className="p-8">Loading tenant details...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!tenant) return <div className="p-8">Tenant not found</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <div className="space-x-4">
          {/* Impersonation logic handled by parent via onLoginAsAdmin */}
          <button
            onClick={() => onLoginAsAdmin(tenant.id)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Login as Admin
          </button>
          <button
            onClick={() => onNavigate("tenants")}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-medium mb-4">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              ID
            </label>
            <div>{tenant.id}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Status
            </label>
            <div>{tenant.status}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Address
            </label>
            <div>{tenant.address || "-"}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Plan
            </label>
            <div>{tenant.planId || "None"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
