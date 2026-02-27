"use client";

import React from "react";
import {
  LifeBuoy,
  Monitor,
  X,
  Clock,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ModalShell from "../../components/ui/ModalShell";
import type { SupportTicket } from "@/domain/entities/Support";

interface HotelTicketDetailModalProps {
  isOpen: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
}

const HotelTicketDetailModal: React.FC<HotelTicketDetailModalProps> = ({
  isOpen,
  ticket,
  onClose,
}) => {
  if (!ticket) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      hideHeader
    >
      <div className="flex flex-col md:flex-row h-[70vh]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/5 dark:bg-black/20">
          {/* Header */}
          <div className="px-8 py-8 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl ${
                  ticket.priority === "high"
                    ? "bg-red-600 shadow-red-900/40"
                    : "bg-accent-strong shadow-accent-strong/40"
                }`}
              >
                <LifeBuoy size={36} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">
                    #{ticket.id.slice(0, 8)}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-white/5 ${
                      ticket.status === "closed"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-black/10 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">
                  Platform Support Ticket
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"
            >
              <X size={28} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-6">
            {/* Subject */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-3 bg-accent rounded-full" /> Ticket
                Subject
              </h3>
              <h1 className="text-2xl font-black dark:text-white leading-tight">
                {ticket.title}
              </h1>
            </div>

            {/* Description */}
            <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.03] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <LifeBuoy size={120} />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
                Description
              </h3>
              <p className="text-base font-medium dark:text-gray-300 leading-relaxed relative z-10 whitespace-pre-wrap">
                {ticket.description || "No detailed description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 bg-white dark:bg-transparent border-l border-white/10 overflow-y-auto p-8 space-y-10 custom-scrollbar shrink-0">
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
              Ticket Metadata
            </h3>
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Category
                </p>
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-accent-strong" />
                  <span className="text-xs font-black dark:text-white uppercase tracking-wider">
                    {ticket.category || "—"}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Priority
                </p>
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    size={16}
                    className={
                      ticket.priority === "high"
                        ? "text-red-500"
                        : "text-accent"
                    }
                  />
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${ticket.priority === "high" ? "text-red-500" : "text-accent"}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Reported
                </p>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-xs font-black dark:text-white uppercase tracking-tighter">
                    {formatDistanceToNow(new Date(ticket.createdAt))} ago
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all">
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                Knowledge Base
              </p>
              <p className="text-[10px] font-bold dark:text-gray-300">
                View Platform Docs
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-gray-700 group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default HotelTicketDetailModal;
