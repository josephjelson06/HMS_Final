"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  CalendarCheck,
  IndianRupee,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/application/hooks/useAuth";
import { useGuests } from "@/application/hooks/useGuests";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";

const Guests: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const { guests, fetchGuests, loading } = useGuests();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (tenantId) {
      fetchGuests(tenantId);
    }
  }, [tenantId, fetchGuests]);

  const filteredGuests = useMemo(() => {
    return guests.filter(
      (g) =>
        g.guestName.toLowerCase().includes(search.toLowerCase()) ||
        g.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [guests, search]);

  const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
      confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      draft: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-full border text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[s] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      <PageHeader title="Guest Log" subtitle="Manage and view guest bookings" />

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors"
            />
            <input
              type="text"
              placeholder="Search by Guest Name or Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-gray-500"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-black/10 transition-all border border-white/5">
            <Filter size={14} /> Filter Bookings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGuests.map((g) => (
            <GlassCard
              key={g.id}
              className="p-6 group hover:scale-[1.02] transition-all border border-white/5 hover:border-accent/30 relative overflow-hidden flex flex-col min-h-48"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono font-black text-accent-strong tracking-tighter opacity-70">
                  #{g.id.slice(0, 8)}
                </span>
                <StatusBadge status={g.status} />
              </div>

              <h4 className="text-xl font-black dark:text-white leading-tight mb-4 group-hover:text-accent transition-colors truncate">
                {g.guestName}
              </h4>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Guests
                  </span>
                  <span className="text-xs font-bold dark:text-gray-300">
                    {g.adults} Adults, {g.children} Kids
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                    {g.nights} Nights
                  </p>
                  <p className="text-[10px] font-black dark:text-gray-300">
                    {new Date(g.checkInDate).toLocaleDateString()} -{" "}
                    {new Date(g.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {g.totalPrice !== null && (
                <div className="mt-4 pt-3 border-t border-white/5">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Total
                  </span>
                  <p className="text-sm font-black dark:text-white tracking-tighter mt-1 flex items-center">
                    <IndianRupee size={12} className="mr-1 opacity-70" />
                    {g.totalPrice}
                  </p>
                </div>
              )}

              <div className="absolute top-0 right-0 w-16 h-16 bg-accent opacity-0 group-hover:opacity-[0.03] rounded-full blur-2xl transition-opacity translate-x-1/2 -translate-y-1/2"></div>
            </GlassCard>
          ))}
        </div>

        {loading && filteredGuests.length === 0 && (
          <div className="py-24 text-center text-gray-500 animate-pulse font-bold text-sm tracking-widest uppercase">
            Fetching Guests...
          </div>
        )}

        {!loading && filteredGuests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 mb-6">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-black dark:text-white mb-2">
              No guests found
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;
