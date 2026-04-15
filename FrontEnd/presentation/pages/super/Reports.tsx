"use client";

import React, { useState } from "react";
import {
  Building2,
  CreditCard,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { useTenants } from "../../../application/hooks/useTenants";
import { useSubscriptions } from "../../../application/hooks/useSubscriptions";
import { useUsers } from "../../../application/hooks/useUsers";
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
    cyan: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
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
        <h3 className="text-xl font-black dark:text-white mb-4 tracking-tighter uppercase">
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

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const { tenants, loading: tenantsLoading, fetchTenants } = useTenants();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { users, loading: usersLoading } = useUsers();

  // Mock invoices since the API doesn't support them currently
  const invoices: any[] = [];
  const invoicesLoading = false;

  React.useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const isLoading =
    tenantsLoading || subscriptionsLoading || invoicesLoading || usersLoading;

  // Configuration for each report type
  const reportConfigs: Record<
    string,
    { title: string; data: any[]; cols: Column[] }
  > = {
    hotels: {
      title: "Hotels Registry",
      data: tenants,
      cols: [
        {
          key: "name",
          label: "Hotel Name",
          render: (row) => <span className="font-bold">{row.name}</span>,
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {row.status}
            </span>
          ),
        },
        { key: "plan", label: "Plan" },
        {
          key: "gstin",
          label: "GSTIN",
          render: (row) => (
            <span className="font-mono text-xs">{row.gstin}</span>
          ),
        },
        {
          key: "email",
          label: "Contact",
          render: (row) => (
            <div className="flex flex-col text-xs">
              <span>{row.email}</span>
              <span className="text-gray-400">{row.mobile}</span>
            </div>
          ),
        },
        {
          key: "creationDate",
          label: "Onboarded",
          render: (row) =>
            new Date(row.creationDate || Date.now()).toLocaleDateString(),
        },
      ],
    },
    subscriptions: {
      title: "Subscription Ledger",
      data: subscriptions,
      cols: [
        {
          key: "id",
          label: "Sub ID",
          render: (row) => <span className="font-mono text-xs">#{row.id}</span>,
        },
        {
          key: "hotelName",
          label: "Hotel Name",
          render: (row) => (
            <span className="font-bold">
              {row.hotelName || `Hotel #${row.hotelId}`}
            </span>
          ),
        },
        { key: "plan", label: "Current Plan" },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "amount",
          label: "Amount",
          render: (row) => `\u20B9${row.amount}`,
        },
        {
          key: "nextBillingDate",
          label: "Renewal",
          render: (row) => new Date(row.nextBillingDate).toLocaleDateString(),
        },
      ],
    },
    invoices: {
      title: "Financial Invoices",
      data: invoices,
      cols: [
        {
          key: "id",
          label: "Invoice #",
          render: (row) => <span className="font-mono text-xs">{row.id}</span>,
        },
        {
          key: "date",
          label: "Date Issued",
          render: (row) => new Date(row.date).toLocaleDateString(),
        },
        {
          key: "hotelName",
          label: "Billed To",
          render: (row) => (
            <span className="font-bold">
              {row.hotelName || "Unknown Hotel"}
            </span>
          ),
        },
        {
          key: "amount",
          label: "Total",
          render: (row) => `\u20B9${row.total || row.amount}`,
        },
        {
          key: "status",
          label: "Payment",
          render: (row) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "Paid"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-orange-500/10 text-orange-500"
              }`}
            >
              {row.status}
            </span>
          ),
        },
      ],
    },
    users: {
      title: "User Access Log",
      data: users,
      cols: [
        {
          key: "name",
          label: "User Name",
          render: (row) => (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                {row.name.charAt(0)}
              </div>
              <span className="font-bold">{row.name}</span>
            </div>
          ),
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
        { key: "email", label: "Email" },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {row.status}
            </span>
          ),
        },
        { key: "lastLogin", label: "Last Active" },
      ],
    },
  };

  const reports = [
    {
      id: "hotels",
      icon: Building2,
      title: "Hotels Report",
      preview:
        "Export complete hotel registry data including status, ratings, and amenities.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "blue",
      rows: tenants.length,
    },
    {
      id: "subscriptions",
      icon: CreditCard,
      title: "Subscriptions Report",
      preview:
        "Export subscription data with plan details, status, and renewal information.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "cyan",
      rows: subscriptions.length,
    },
    {
      id: "invoices",
      icon: FileText,
      title: "Invoices Report",
      preview:
        "Export invoice data with payment status, amounts, and hotel details.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "emerald",
      rows: invoices.length,
    },
    {
      id: "users",
      icon: Users,
      title: "Users Report",
      preview:
        "Export user accounts data with roles, status, and activity information.",
      formats: ["CSV", "XLSX"],
      color: "purple",
      rows: users.length,
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
    <div className="p-4 md:p-8 space-y-12 min-h-screen pb-24 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="mb-14">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-3">
          INTELLIGENCE HUB
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.25em]">
          ANALYTICAL INSIGHT & DATA EXPORT ENGINE
        </p>
      </div>

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

export default Reports;
