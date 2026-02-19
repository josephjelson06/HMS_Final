"use client";

import React, { useEffect, useState } from "react";
import { usePlans } from "@/application/hooks/usePlans";
import type { PlanData } from "@/domain/entities/Plan";

export default function Plans() {
  const { plans, loading, error, fetchPlans, createPlan } = usePlans();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  if (loading) return <div className="p-8">Loading plans...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Billing Plans</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-4">${plan.price}</div>

            <div className="space-y-2 text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Period</span>
                <span className="font-medium">
                  {plan.period_months || 1} Month(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Users</span>
                <span className="font-medium">
                  {plan.max_users === 0 || !plan.max_users
                    ? "Unlimited"
                    : plan.max_users}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Roles</span>
                <span className="font-medium">
                  {plan.max_roles === 0 || !plan.max_roles
                    ? "Unlimited"
                    : plan.max_roles}
                </span>
              </div>
            </div>

            <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
              Edit Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
