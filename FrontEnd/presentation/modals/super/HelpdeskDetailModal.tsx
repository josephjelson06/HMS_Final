"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Clock,
  ShieldAlert,
  Monitor,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";
import type { SupportTicket } from "@/domain/entities/Support";

interface HelpdeskDetailModalProps {
  isOpen: boolean;
  ticket: SupportTicket;
  onClose: () => void;
  onResolve: (ticketId: string) => Promise<void>;
}

const HelpdeskDetailModal: React.FC<HelpdeskDetailModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onResolve,
}) => {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(ticket.id);
      onClose();
    } catch (error) {
      console.error("Failed to resolve ticket", error);
    } finally {
      setResolving(false);
    }
  };

  const isClosed = ticket.status === "closed";

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title="Ticket Details"
      subtitle={`Reference ID: ${ticket.id.slice(0, 8).toUpperCase()}`}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                ticket.status === "closed"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : ticket.priority === "high"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              }`}
            >
              {ticket.status}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} />{" "}
              {formatDistanceToNow(new Date(ticket.createdAt))} ago
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {!isClosed && (
              <Button
                variant="primary"
                onClick={handleResolve}
                disabled={resolving}
                icon={<CheckCircle2 size={16} />}
              >
                {resolving ? "Resolving..." : "Mark Resolved"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-gray-400">
                <Building2 size={16} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">
                  Tenant
                </label>
                <span className="text-xs font-mono font-bold dark:text-white">
                  {ticket.tenantId
                    ? `${ticket.tenantId.slice(0, 12)}…`
                    : "Platform"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-gray-400">
                <ShieldAlert size={16} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">
                  Priority
                </label>
                <span
                  className={`text-xs font-bold ${ticket.priority === "high" ? "text-red-500" : "text-gray-400"}`}
                >
                  {ticket.priority || "medium"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-gray-400">
                <Monitor size={16} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">
                  Category
                </label>
                <span className="text-xs font-bold dark:text-white">
                  {ticket.category || "General"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">
              Subject
            </label>
            <h3 className="font-bold dark:text-white leading-tight">
              {ticket.title}
            </h3>
          </div>
          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">
              Description
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default HelpdeskDetailModal;
