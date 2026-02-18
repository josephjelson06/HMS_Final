import React from "react";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import {
  Building,
  Monitor,
  Zap,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  IndianRupee,
  Activity,
  Info,
} from "lucide-react";
import TenantOnboardingTrend from "../../components/dashboard/charts/TenantOnboardingTrend";
import CriticalAlertsFeed from "../../components/dashboard/CriticalAlertsFeed";
import GlassDatePicker from "../../components/ui/GlassDatePicker";
import { useTheme } from "../../hooks/useTheme";
import { useHotels } from "../../../application/hooks/useHotels";
import { useKiosks } from "../../../application/hooks/useKiosks";
import { useInvoices } from "../../../application/hooks/useInvoices";

const KPIBadge = ({
  value,
  trend,
}: {
  value: string;
  trend: "up" | "down";
}) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${trend === "up" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}
  >
    {trend === "up" ? "+" : "-"}
    {value}
  </span>
);

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
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      footer: "bg-red-500/20 text-red-600 dark:text-red-400",
      icon: "text-red-500 bg-red-500/10",
    },
    amber: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      footer: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: "text-amber-500 bg-amber-500/10",
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
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
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
        {state === "red" && (
          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
        )}
      </div>

      <div
        className={`w-full py-3 px-6 border-t border-black/5 dark:border-white/5 ${current.footer}`}
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
          {subtext}
        </p>
      </div>
    </GlassCard>
  );
};

const Dashboard: React.FC = () => {
  const { hotels, loading: hotelsLoading } = useHotels();
  const { kiosks, loading: kiosksLoading } = useKiosks();
  const { invoices, loading: invoicesLoading } = useInvoices();

  const activeHotels = hotels.filter(
    (hotel) => hotel.status === "Active",
  ).length;
  const onboardingHotels = hotels.filter(
    (hotel) => hotel.status === "Onboarding",
  ).length;
  const monthlyRevenue = hotels.reduce((sum, hotel) => sum + hotel.mrr, 0);
  const avgRevenuePerActiveHotel =
    activeHotels > 0 ? Math.round(monthlyRevenue / activeHotels) : 0;

  const onlineKiosks = kiosks.filter(
    (kiosk) => kiosk.status === "ONLINE",
  ).length;
  const nonOnlineKiosks = kiosks.filter(
    (kiosk) => kiosk.status !== "ONLINE",
  ).length;
  const criticalKiosks = kiosks.filter(
    (kiosk) => kiosk.status === "CRITICAL",
  ).length;

  const overdueInvoiceCount = invoices.filter(
    (invoice) => invoice.status.toLowerCase() === "overdue",
  ).length;
  const unpaidReceivables = invoices
    .filter((invoice) => invoice.status.toLowerCase() !== "paid")
    .reduce((sum, invoice) => sum + (invoice.total ?? invoice.amount ?? 0), 0);

  const isLoading = hotelsLoading || kiosksLoading || invoicesLoading;
  const formatINR = (value: number) =>
    `INR ${new Intl.NumberFormat("en-IN").format(value)}`;
  const platformStatus = criticalKiosks > 0 ? "Attention Required" : "Nominal";

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-700">
      <PageHeader
        title="Business Overview"
        subtitle={`Platform Status: ${platformStatus}`}
        badge={
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 w-fit">
            <Info size={14} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {isLoading ? "Syncing Data" : "Live Repository Data"}
            </span>
          </div>
        }
      >
        <GlassDatePicker />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WarRoomCard
          title="Active Hotels"
          value={isLoading ? "--" : String(activeHotels)}
          subtext="Customer base health"
          icon={Building}
          colorVariant="blue"
          badge={
            <KPIBadge
              value={`${onboardingHotels} onboarding`}
              trend={onboardingHotels > 0 ? "up" : "down"}
            />
          }
        />
        <WarRoomCard
          title="MRR (Revenue)"
          value={isLoading ? "--" : formatINR(monthlyRevenue)}
          subtext="Projected monthly yield"
          icon={IndianRupee}
          colorVariant="emerald"
          badge={
            <KPIBadge
              value={formatINR(avgRevenuePerActiveHotel)}
              trend={avgRevenuePerActiveHotel > 0 ? "up" : "down"}
            />
          }
        />
        <WarRoomCard
          title="Kiosk Fleet"
          value={isLoading ? "--" : `${onlineKiosks}/${nonOnlineKiosks}`}
          subtext="Online / Offline Ratio"
          icon={Monitor}
          colorVariant="red"
          state="red"
          badge={
            <span className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-[9px] font-bold uppercase tracking-tighter animate-pulse shadow-lg shadow-red-900/40">
              {criticalKiosks} Critical
            </span>
          }
        />
        <WarRoomCard
          title="Overdue Invoices"
          value={isLoading ? "--" : String(overdueInvoiceCount)}
          subtext={`${formatINR(unpaidReceivables)} Unpaid Receivables`}
          icon={TrendingUp}
          colorVariant="amber"
          state="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard
          noPadding
          clipContent
          className="lg:col-span-1 flex flex-col h-[480px] shadow-2xl border-white/10"
        >
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Tenant Onboarding
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                Growth Metrics
              </p>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex-1 p-8 min-h-0">
            <TenantOnboardingTrend />
          </div>
        </GlassCard>

        <div className="lg:col-span-2 h-[480px]">
          <CriticalAlertsFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
