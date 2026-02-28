"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useSubscriptions } from "@/application/hooks/useSubscriptions";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";

export default function BillingHub() {
  const { user } = useAuth();
  // In a real app we might fetch specific sub for this tenant
  const { subscriptions, loading, fetchSubscriptions } = useSubscriptions();

  // Filter for THIS tenant's subscription (mock logic mostly since we use getAll currently)
  const mySub = subscriptions.find((s) => s.tenantId === user?.tenantId);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  if (loading)
    return (
      <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
        Loading billing info...
      </div>
    );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Billing & Subscription" />

      <GlassCard className="mb-8">
        <h2 className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-white/5 pb-4">
          Current Subscription
        </h2>
        {mySub ? (
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Plan
              </label>
              <div className="text-xl font-black dark:text-white tracking-tight">
                {mySub.planId || "Unknown Plan"}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Status
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  mySub.status === "Active"
                    ? "bg-green-500/10 text-emerald-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {mySub.status}
              </span>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Start Date
              </label>
              <div className="text-sm font-bold dark:text-gray-300">
                {mySub.startDate
                  ? new Date(mySub.startDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                End Date
              </label>
              <div className="text-sm font-bold dark:text-gray-300">
                {mySub.endDate
                  ? new Date(mySub.endDate).toLocaleDateString()
                  : "Auto-renew/Indefinite"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-bold text-gray-500 italic py-4">
            No active subscription found.
          </div>
        )}
      </GlassCard>

      {/* Invoices section removed as per migration plan */}
      <GlassCard className="text-center py-10">
        <p className="text-sm font-bold text-gray-500">
          Invoices and payment history features are currently disabled.
        </p>
      </GlassCard>
    </div>
  );
}
