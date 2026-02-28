"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useSubscriptions } from "@/application/hooks/useSubscriptions";
import { usePlans } from "@/application/hooks/usePlans";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Activity,
} from "lucide-react";

export default function BillingHub() {
  const { user } = useAuth();
  const {
    subscriptions,
    loading: subLoading,
    fetchSubscriptions,
  } = useSubscriptions();
  const { plans, loading: plansLoading, fetchPlans } = usePlans();

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, [fetchSubscriptions, fetchPlans]);

  // Filter for THIS tenant's subscription
  const mySub = subscriptions.find((s) => s.tenantId === user?.tenantId);
  const myPlan = plans.find((p) => p.id === mySub?.planId);

  const isLoading = subLoading || plansLoading;

  if (isLoading)
    return (
      <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse min-h-[400px] flex items-center justify-center">
        Synchronizing Billing Registry...
      </div>
    );

  // Mock some features if not present in the plan object
  const features = [
    "Unlimited Property Management",
    "Real-time Kiosk Synchronization",
    "Advanced Analytical Hub",
    "Multi-user Access Control",
    "Multi-device Deployment",
    "24/7 Priority Support",
  ];

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-700">
      <PageHeader
        title="COMMERCIAL ECOSYSTEM"
        subtitle="Tier Assignment & Financial Repository"
        badge={
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 w-fit">
            <ShieldCheck size={14} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Validated Terminal
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan Details */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard
            noPadding
            clipContent
            className="border-white/10 shadow-2xl relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none">
              <CreditCard size={120} strokeWidth={1} />
            </div>

            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <CreditCard size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Active Tier
                </span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                {myPlan?.name || "Premium Enterprise"}
              </h2>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Platform Configuration: {myPlan?.id || "HMS-ADV-01"}
              </p>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                  Inclusive Capabilities
                </h3>
                <div className="space-y-4">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 group/feat">
                      <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-xs font-bold text-gray-300 group-hover/feat:text-white transition-colors capitalize">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                      Tier Pricing
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white tracking-tight">
                        ₹{myPlan?.price || "15,000"}
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        /{myPlan?.period_months === 12 ? "Yearly" : "Monthly"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                      Network Status
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                        mySub?.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${mySub?.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                      ></div>
                      {mySub?.status || "Active"}
                    </div>
                  </div>
                </div>

                <button className="mt-8 w-full py-4 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2">
                  Modify Subscription Tier <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="border-white/10 hover:border-blue-500/30 transition-colors p-8 group">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Calendar size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  Cycle Data
                </span>
              </div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Last Billing Event
              </h4>
              <p className="text-xl font-black text-white tracking-tight mb-4">
                {mySub?.startDate
                  ? new Date(mySub.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
              <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-wider">
                Next cycle initiation pending system verification.
              </p>
            </GlassCard>

            <GlassCard className="border-white/10 hover:border-amber-500/30 transition-colors p-8 group">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <Clock size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  Health Registry
                </span>
              </div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Next Renewal Date
              </h4>
              <p className="text-xl font-black text-white tracking-tight mb-4">
                {mySub?.endDate
                  ? new Date(mySub.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Auto-Renew Indefinite"}
              </p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                <div className="w-2/3 h-full bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Column: Financial Summary & Support */}
        <div className="space-y-8">
          <GlassCard
            noPadding
            clipContent
            className="border-white/10 shadow-xl flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-500">
                <Receipt size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Ledger Summary
                </span>
              </div>
              <TrendingUp size={16} className="text-gray-700" />
            </div>

            <div className="p-8 space-y-8 flex-1">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Upcoming Invoice
                </p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  ₹{myPlan?.price || "15,000"}
                </p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Scheduled for auto-debit
                </p>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center group/item">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/item:text-white transition-colors">
                    Billing Frequency
                  </span>
                  <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">
                    {myPlan?.period_months === 12 ? "Annual" : "Monthly"}
                  </span>
                </div>
                <div className="flex justify-between items-center group/item">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/item:text-white transition-colors">
                    Payment Method
                  </span>
                  <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">
                    •••• 4421
                  </span>
                </div>
                <div className="flex justify-between items-center group/item">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/item:text-white transition-colors">
                    Currency
                  </span>
                  <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">
                    INR (₹)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.01] border-t border-white/5">
              <button className="w-full py-2.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                Update Payment Parameters
              </button>
            </div>
          </GlassCard>

          <GlassCard className="border-white/10 p-8 flex flex-col items-center text-center justify-center gap-4 bg-transparent hover:bg-white/[0.02] transition-colors h-[280px]">
            <div className="p-4 rounded-full bg-theme-dark border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <HelpCircle
                size={32}
                className="text-gray-400 group-hover:text-white relative z-10 transition-colors"
              />
            </div>
            <div>
              <h4 className="text-lg font-black text-white tracking-tighter uppercase mb-2">
                Need Assistance?
              </h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-6">
                Our billing department is available to verify custom Enterprise
                tiers.
              </p>
              <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1 mx-auto">
                Contact Commercial Support <ArrowRight size={12} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* History Section placeholder as a clean state */}
      <GlassCard
        noPadding
        clipContent
        className="border-white/10 border-dashed bg-transparent"
      >
        <div className="p-12 text-center flex flex-col items-center gap-4">
          <Activity size={32} className="text-gray-700" />
          <h3 className="text-lg font-black text-gray-500 tracking-tighter uppercase">
            Transactional History Disabled
          </h3>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest max-w-lg leading-relaxed">
            Invoice repository and historical auditing features are currently
            undergoing synchronization. Please contact the platform
            administrator for physical invoice copies.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
