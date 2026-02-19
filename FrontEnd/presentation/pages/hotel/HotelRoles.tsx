"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useHotelStaff } from "@/application/hooks/useHotelStaff";

export default function HotelRoles() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const { roles, loading, error, fetchRoles, deleteRole } = useHotelStaff(
    tenantId || "",
  );

  useEffect(() => {
    if (tenantId) fetchRoles();
  }, [fetchRoles, tenantId]);

  if (!tenantId)
    return <div className="p-8 text-red-500">Error: No Tenant Context</div>;
  if (loading) return <div className="p-8">Loading roles...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded shadow p-6 border-t-4"
            style={{ borderColor: role.color || "#ccc" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {role.name}
            </h3>
            <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">
              {role.description}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {role.permissions?.length || 0} Permissions
              </span>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Edit
                </button>
                <button
                  onClick={() => deleteRole(role.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
