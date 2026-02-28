"use client";

import React, { useState } from "react";
import {
  Users,
  Globe,
  ArrowRight,
  Layout,
  IndianRupee,
  Clock,
  Info,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import { useGuests } from "../../../application/hooks/useGuests";
import { useHotelStaff } from "../../../application/hooks/useHotelStaff";
import { useAuth } from "../../../application/hooks/useAuth";
import ReportDataView, { Column } from "../../components/domain/ReportDataView";

// --- SUB-COMPONENTS ---

const FormatBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {label}
  </span>
);

const ReportSummaryCard = ({
  icon: Icon,
  title,
  preview,
  formats,
  color,
  onClick,
}: any) => {
  const colorStyles: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
    teal: "text-teal-500 bg-teal-500/10 dark:bg-teal-500/20",
    orange: "text-orange-500 bg-orange-500/10 dark:bg-orange-500/20",
    purple: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  };

  return (
    <button
      onClick={onClick}
      className="group text-center h-full transition-all w-full outline-none"
    >
      <GlassCard className="h-full flex flex-col items-center hover:border-accent/30 transition-all relative overflow-hidden p-8 px-6">
        {/* Icon Container */}
        <div
          className={`p-5 rounded-2xl ${colorStyles[color]} mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner`}
        >
          <Icon size={36} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold dark:text-white mb-4 tracking-tighter uppercase">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 px-2 max-w-[240px]">
          {preview}
        </p>

        {/* Format Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 mt-auto">
          {formats.map((f: string) => (
            <FormatBadge key={f} label={f} />
          ))}
        </div>

        {/* Export Link */}
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors">
          EXPORT{" "}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </GlassCard>
    </button>
  );
};

const HotelReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const { user } = useAuth();
  const { guests, loading: guestsLoading, fetchGuests } = useGuests();
  const {
    staff,
    loading: staffLoading,
    fetchStaff,
  } = useHotelStaff(user?.tenantId || "");

  React.useEffect(() => {
    if (user?.tenantId) {
      fetchGuests(user.tenantId);
      fetchStaff();
    }
  }, [user?.tenantId, fetchGuests, fetchStaff]);

  const isLoading = guestsLoading || staffLoading;
  // Fallback to 0 if nationality isn't tracked in this version
  const foreignGuests = 0;

  const reportConfigs: Record<
    string,
    { title: string; data: any[]; cols: Column[] }
  > = {
    occ: {
      title: "Occupancy Analysis",
      data: guests, // Use guest data as proxy
      cols: [
        {
          key: "guestName",
          label: "Guest Name",
          render: (row) => <span className="font-bold">{row.guestName}</span>,
        },
        { key: "status", label: "Status" },
        {
          key: "checkInDate",
          label: "Check-In",
          render: (row) => new Date(row.checkInDate).toLocaleDateString(),
        },
        {
          key: "roomTypeId",
          label: "Room Type ID",
          render: (row) => (
            <span className="font-mono text-xs">{row.roomTypeId}</span>
          ),
        },
      ],
    },
    rev: {
      title: "Revenue Audit",
      data: guests,
      cols: [
        {
          key: "guestName",
          label: "Reference",
          render: (row) => <span className="font-bold">{row.guestName}</span>,
        },
        {
          key: "totalPrice",
          label: "Amount",
          render: (row) => `\u20B9${row.totalPrice || 0}`,
        },
        {
          key: "checkInDate",
          label: "Date",
          render: (row) => new Date(row.checkInDate).toLocaleDateString(),
        },
      ],
    },
    gst: {
      title: "Guest Log",
      data: guests,
      cols: [
        {
          key: "guestName",
          label: "Guest Name",
          render: (row) => <span className="font-bold">{row.guestName}</span>,
        },
        { key: "status", label: "Status" },
        {
          key: "checkInDate",
          label: "Check-In",
          render: (row) => new Date(row.checkInDate).toLocaleDateString(),
        },
        { key: "adults", label: "Adults" },
      ],
    },
    ops: {
      title: "Operations Log",
      data: staff,
      cols: [
        {
          key: "name",
          label: "Staff Name",
          render: (row) => <span className="font-bold">{row.name}</span>,
        },
        {
          key: "role",
          label: "Role",
          render: (row) => (
            <span className="uppercase text-[10px] font-bold text-gray-500">
              {row.role}
            </span>
          ),
        },
        { key: "status", label: "Active Status" },
      ],
    },
  };

  const reports = [
    {
      id: "occ",
      icon: Layout,
      title: "Occupancy Report",
      preview:
        "Comprehensive yield analysis including RevPAR, ADR, and daily fill rates by room category.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "blue",
    },
    {
      id: "rev",
      icon: IndianRupee,
      title: "Revenue Report",
      preview:
        "Detailed GST split analysis by service type (Rooms/F&B) and commercial source auditing.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "teal",
    },
    {
      id: "gst",
      icon: Globe,
      title: "Guest Report",
      preview:
        "Demographic analysis, C-Form compliance data, and nationality insights across guests.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "orange",
    },
    {
      id: "ops",
      icon: Clock,
      title: "Operations Report",
      preview:
        "Turnaround efficiency by floor, MTTR for incidents, and staff task completion audit.",
      formats: ["CSV", "XLSX"],
      color: "purple",
    },
  ];

  if (activeReport) {
    const config = reportConfigs[activeReport];

    if (config) {
      return (
        <div className="p-4 md:p-8 min-h-screen pb-24">
          <ReportDataView
            title={config.title}
            data={config.data}
            columns={config.cols}
            onBack={() => setActiveReport(null)}
            isLoading={isLoading}
          />
        </div>
      );
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-12 min-h-screen pb-32 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
            <Info size={12} />
            DUMMY DATA PAGE
          </div>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-3">
          INTELLIGENCE HUB
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.25em]">
          PROPERTY PERFORMANCE & DATA EXPORT ENGINE
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {reports.map((r) => (
          <ReportSummaryCard
            key={r.id}
            {...r}
            onClick={() => setActiveReport(r.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HotelReports;
