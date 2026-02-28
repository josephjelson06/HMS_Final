"use client";

import React from "react";
import { useAuth } from "@/application/hooks/useAuth";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";

export default function HotelDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title={`Welcome, ${user?.name || "Hotel Manager"}`}
        subtitle="Here's what's happening at your property today."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simplified Metrics for now */}
        <GlassCard className="border-l-4 border-blue-500 p-6 flex flex-col justify-center min-h-[120px]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Occupancy
          </h3>
          <p className="text-2xl font-black dark:text-white tracking-tighter">
            --%
          </p>
          <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Room management module disabled
          </p>
        </GlassCard>

        <GlassCard className="border-l-4 border-green-500 p-6 flex flex-col justify-center min-h-[120px]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Revenue (MTD)
          </h3>
          <p className="text-2xl font-black dark:text-white tracking-tighter">
            $0.00
          </p>
          <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Invoice module disabled
          </p>
        </GlassCard>

        <GlassCard className="border-l-4 border-purple-500 p-6 flex flex-col justify-center min-h-[120px]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Active Staff
          </h3>
          <p className="text-2xl font-black dark:text-white tracking-tighter">
            --
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
        <h3 className="text-xl font-black dark:text-white mb-2">
          Getting Started
        </h3>
        <p className="text-sm font-bold text-gray-500">
          Use the sidebar to manage your staff (Users & Roles) and view your
          Subscription details.
        </p>
      </GlassCard>
    </div>
  );
}
