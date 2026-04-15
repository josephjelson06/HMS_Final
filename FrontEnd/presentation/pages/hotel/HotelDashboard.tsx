"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import {
  Users,
  Bed,
  IndianRupee,
  Info,
  Activity,
  UserCheck,
  ArrowUpRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useGuests } from "../../../application/hooks/useGuests";
import { useRooms } from "../../../application/hooks/useRooms";
import { useHotelStaff } from "../../../application/hooks/useHotelStaff";
import { useTheme } from "../../hooks/useTheme";
import GlassDatePicker from "../../components/ui/GlassDatePicker";

// --- REUSABLE DASHBOARD COMPONENTS ---

const KPIBadge = ({
  value,
  trend,
}: {
  value: string;
  trend: "up" | "down" | "neutral";
}) => {
  const styles = {
    up: "bg-emerald-500/20 text-emerald-500",
    down: "bg-red-500/20 text-red-500",
    neutral: "bg-gray-500/20 text-gray-500",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${styles[trend]}`}
    >
      {trend === "up" ? "+" : trend === "down" ? "-" : ""}
      {value}
    </span>
  );
};

const WarRoomCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  state = "normal",
  badge,
  colorVariant,
}: any) => {
  const { isDarkMode } = useTheme();

  const colors = {
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      footer: "bg-blue-500/10 text-accent-strong dark:text-blue-400",
      icon: "text-accent bg-blue-500/10",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      footer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-500 bg-emerald-500/10",
    },
    orange: {
      border: "border-orange-500/30",
      bg: "bg-orange-500/5",
      footer: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      icon: "text-orange-500 bg-orange-500/10",
    },
    purple: {
      border: "border-purple-500/30",
      bg: "bg-purple-500/5",
      footer: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      icon: "text-purple-500 bg-purple-500/10",
    },
    default: {
      border: "border-white/10",
      bg: "bg-white/5",
      footer: "bg-black/5 dark:bg-white/5 text-gray-500",
      icon: "text-gray-400 bg-black/5",
    },
  };

  const current = colors[colorVariant as keyof typeof colors] || colors.default;

  return (
    <GlassCard
      noPadding
      clipContent
      className={`flex flex-col h-44 relative group border transition-all duration-500 ${isDarkMode ? current.border + " " + current.bg : "bg-white border-slate-200"}`}
    >
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {value}
              </h3>
              {badge}
            </div>
          </div>
          <div
            className={`p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${current.icon}`}
          >
            <Icon size={22} />
          </div>
        </div>
      </div>

      <div
        className={`w-full py-3 px-6 border-t border-black/5 dark:border-white/5 ${current.footer}`}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider">
          {subtext}
        </p>
      </div>
    </GlassCard>
  );
};

export default function HotelDashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { guests, loading: guestsLoading, fetchGuests } = useGuests();
  const { rooms, loading: roomsLoading, fetchRooms } = useRooms();
  const {
    staff,
    loading: staffLoading,
    fetchStaff,
  } = useHotelStaff(user?.tenantId || "");

  useEffect(() => {
    if (user?.tenantId) {
      fetchGuests(user.tenantId);
      fetchRooms(user.tenantId);
      fetchStaff();
    }
  }, [user?.tenantId, fetchGuests, fetchRooms, fetchStaff]);

  const isLoading = guestsLoading || roomsLoading || staffLoading;

  // Derived Metrics
  const activeBookings = guests.filter(
    (b) => b.status === "Checked In" || b.status === "Confirmed",
  ).length;
  const inHouseGuests = guests.filter((b) => b.status === "Checked In").length;
  const totalRevenueMTD = guests
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Simple Mock Occupancy Rate
  const totalRooms = rooms.length > 0 ? rooms.length : 20; // Default fallback if no rooms defined
  const occupancyRate = Math.round((inHouseGuests / totalRooms) * 100) || 0;

  const formatINR = (value: number) =>
    `₹${new Intl.NumberFormat("en-IN").format(Math.round(value))}`;

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-700">
      <PageHeader
        title={`Property Overview | Welcome, ${user?.name || "Manager"}`}
        subtitle={`Nominal operations for ${inHouseGuests} guests in-house.`}
        badge={
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-500 w-fit">
            <Activity size={14} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {isLoading ? "Syncing Logic" : "Terminal Active"}
            </span>
          </div>
        }
      >
        <GlassDatePicker />
      </PageHeader>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WarRoomCard
          title="Daily Occupancy"
          value={`${occupancyRate}%`}
          subtext="Inventory absorption"
          icon={Bed}
          colorVariant="blue"
          badge={
            <KPIBadge value={`${totalRooms} Total Units`} trend="neutral" />
          }
        />
        <WarRoomCard
          title="Revenue (MTD)"
          value={isLoading ? "--" : formatINR(totalRevenueMTD)}
          subtext="Net transactional yield"
          icon={IndianRupee}
          colorVariant="emerald"
          badge={<KPIBadge value="+12%" trend="up" />}
        />
        <WarRoomCard
          title="Guests On-Site"
          value={isLoading ? "--" : String(inHouseGuests)}
          subtext={`${activeBookings - inHouseGuests} pending arrivals`}
          icon={UserCheck}
          colorVariant="orange"
          badge={<KPIBadge value="Peak Hours" trend="neutral" />}
        />
        <WarRoomCard
          title="Active Personnel"
          value={isLoading ? "--" : String(staff.length)}
          subtext="Operational footprint"
          icon={Users}
          colorVariant="purple"
          badge={
            <KPIBadge
              value={`${staff.filter((s) => s.status === "Active").length} Online`}
              trend="up"
            />
          }
        />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard
          noPadding
          clipContent
          className="lg:col-span-2 shadow-2xl border-white/10 h-[400px] flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">
                Performance Velocity
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                Bookings & Revenue Cycle
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                <TrendingUp size={12} />
                +1.4k today
              </div>
            </div>
          </div>
          <div className="flex-1 p-8 flex items-center justify-center relative overflow-hidden">
            {/* Mock chart representation since we need dedicated component for SVG/Recharts */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none"></div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-white/5 text-gray-500 animate-pulse">
                <Activity size={40} strokeWidth={1} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest max-w-xs">
                Real-time analytics engine initializing. Synchronizing with
                Property Management System...
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard
          noPadding
          clipContent
          className="lg:col-span-1 shadow-2xl border-white/10 h-[400px] flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">
              Live Feed
            </h3>
            <Clock size={16} className="text-gray-500" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
            {guests.length > 0 ? (
              guests.slice(0, 8).map((guest, idx) => (
                <div
                  key={guest.id}
                  className="p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs ring-1 ring-orange-500/20 group-hover:scale-105 transition-transform">
                    {guest.guestName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white tracking-tight">
                      {guest.guestName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {guest.status} • Room {guest.roomTypeId.slice(-3)}
                    </p>
                  </div>
                  <div className="text-[10px] font-black text-gray-600 uppercase">
                    JUST NOW
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                <Activity size={24} className="text-gray-700 animate-bounce" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Awaiting system telemetry...
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <button className="w-full py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest transition-all">
              Full Audit Log
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions / Getting Started */}
      <GlassCard className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-dashed border-white/20 bg-transparent hover:bg-white/[0.02] transition-colors">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black text-white tracking-tighter">
            TERMINAL DEPLOYED
          </h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest max-w-lg leading-relaxed">
            Your property management environment is fully synchronized. Use the
            control center to monitor real-time occupancy and guest operations.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
            Configure PMS <ArrowUpRight size={16} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
