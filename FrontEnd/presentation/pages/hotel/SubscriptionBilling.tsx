import React, { useEffect, useState } from 'react';
import { 
  CreditCard, Zap, Calendar, CheckCircle2, Download, 
  ArrowRightLeft, Package, ShieldCheck,
  Clock, IndianRupee, FileText, ChevronRight, 
  ArrowUpRight, HelpCircle, History,
  Layout, Monitor, Users, Plus,
  Wallet, PieChart as PieChartIcon
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useSubscriptions } from '@/application/hooks/useSubscriptions';

// --- Sub-Components for Modular Structure ---

const UsageGauge = ({ label, current, max, icon: Icon, colorClass }: any) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 ${colorClass}`}>
            <Icon size={14} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        </div>
        <div className="text-right leading-none">
          <span className="text-sm font-black dark:text-white">{current}</span>
          <span className="text-[9px] font-bold text-gray-500 ml-1">/ {max}</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${colorClass.replace('text-', 'bg-')}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const AddonCard = ({ title, price, icon: Icon }: any) => (
  <button className="group flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-all text-left">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-accent-muted text-accent group-hover:scale-110 transition-transform">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[11px] font-black dark:text-white uppercase tracking-tight">{title}</p>
        <p className="text-[9px] font-bold text-gray-500 uppercase">₹{price} / mo</p>
      </div>
    </div>
    <Plus size={16} className="text-gray-600 group-hover:text-accent transition-colors" />
  </button>
);

const SubscriptionBilling: React.FC = () => {
  const { subscriptions } = useSubscriptions();
  const activeSubscription = subscriptions.find((sub) => sub.status === 'Active') ?? subscriptions[0];

  const subscriptionPlan = activeSubscription?.plan ?? 'Enterprise';
  const subscriptionPrice = activeSubscription?.price ?? 15000;
  const subscriptionRenewalDate = activeSubscription?.renewalDate ?? '';
  const subscriptionAutoRenew = activeSubscription?.autoRenew ?? true;

  const [autoRenew, setAutoRenew] = useState(subscriptionAutoRenew);

  useEffect(() => {
    setAutoRenew(subscriptionAutoRenew);
  }, [subscriptionAutoRenew]);

  const renewalLabel = subscriptionRenewalDate
    ? new Date(subscriptionRenewalDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  const invoices = [
    { id: 'INV-ATC-2026-01-004', period: 'Jan 2026', amount: 17700, status: 'Paid', date: '10 Jan 2026' },
    { id: 'INV-ATC-2025-12-003', period: 'Dec 2025', amount: 17700, status: 'Paid', date: '12 Dec 2025' },
    { id: 'INV-ATC-2025-11-002', period: 'Nov 2025', amount: 17700, status: 'Paid', date: '10 Nov 2025' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <PageHeader
        title="Subscription Hub"
        subtitle="Manage Property License & Billing Operations"
      >
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            icon={<History size={16} />}
            className="border-white/5 bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-white"
          >
            Update History
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRightLeft size={16} strokeWidth={3} />}
            className="shadow-accent-strong/20"
          >
            Change Plan
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Active Plan & Usage */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Main Plan Information */}
          <GlassCard noPadding className="border-t-8 border-t-orange-500 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-orange-500">
              <Zap size={200} fill="currentColor" />
            </div>
            
            <div className="p-10 flex flex-col md:flex-row justify-between gap-10 relative z-10">
              <div className="flex-1 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-accent-muted text-accent flex items-center justify-center shadow-inner border border-accent/20">
                    <Package size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tighter uppercase leading-none">{subscriptionPlan} Tier</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">Unlimited Mappings • Priority Hardware logic</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Commitment</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black dark:text-white tracking-tighter">INR {subscriptionPrice.toLocaleString()}</span>
                      <span className="text-sm font-bold text-gray-500">/ month</span>
                    </div>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> 18% GST Compliance Included
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Term Expiry</p>
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-accent" />
                      <span className="text-xl font-black dark:text-white uppercase tracking-tighter">{renewalLabel}</span>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase italic">Next auto-settlement in 18 days</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Quick Toggles */}
              <div className="md:w-64 space-y-6">
                 <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Auto-Renewal</span>
                       <button 
                          onClick={() => setAutoRenew(!autoRenew)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${autoRenew ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-700'}`}
                       >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
                       </button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Settlement Node</p>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-black/40 border border-white/10 shadow-sm">
                         <div className="p-2 rounded-xl bg-blue-500/10 text-accent"><CreditCard size={18} /></div>
                         <div className="min-w-0">
                            <p className="text-xs font-black dark:text-white leading-none mb-1">•••• 4412</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase">Visa • Exp 08/28</p>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Bottom: Analytics Strip */}
            <div className="px-10 py-8 bg-black/5 dark:bg-white/[0.01] border-t border-white/5">
                <div className="flex items-center gap-3 mb-8">
                   <PieChartIcon size={16} className="text-gray-500" />
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Resource Consumption Analytics</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
                   <UsageGauge label="Room Capacity" current={120} max={250} icon={Layout} colorClass="text-accent" />
                   <UsageGauge label="Kiosk Nodes" current={2} max={15} icon={Monitor} colorClass="text-accent" />
                   <UsageGauge label="Admin Accounts" current={19} max={50} icon={Users} colorClass="text-emerald-500" />
                   <UsageGauge label="Support Tickets" current={1} max={10} icon={HelpCircle} colorClass="text-purple-500" />
                </div>
            </div>
          </GlassCard>

          {/* Ledger Table */}
          <GlassCard noPadding className="overflow-hidden border-white/10 shadow-xl">
             <div className="px-10 py-6 border-b border-white/5 bg-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <History size={18} className="text-gray-500" />
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Commercial History Ledger</h3>
                </div>
                <button className="text-[10px] font-black text-accent-strong uppercase tracking-widest hover:underline flex items-center gap-1.5 group">
                   Full Audit Download <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-black/10 dark:bg-white/[0.01] text-[9px] font-bold uppercase tracking-widest text-gray-500">
                      <tr>
                         <th className="px-10 py-4">Auth Reference</th>
                         <th className="px-8 py-4">Period</th>
                         <th className="px-8 py-4 text-right">Settled Amount</th>
                         <th className="px-8 py-4 text-center">Protocol Status</th>
                         <th className="px-8 py-4">Date</th>
                         <th className="px-8 py-4 text-right pr-12">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                           <td className="px-10 py-6 text-xs font-mono font-black dark:text-white uppercase tracking-tighter">{inv.id}</td>
                           <td className="px-8 py-6 text-sm font-bold dark:text-gray-400 uppercase tracking-tight">{inv.period}</td>
                           <td className="px-8 py-6 text-right text-sm font-black dark:text-white tracking-tighter">₹{inv.amount.toLocaleString()}</td>
                           <td className="px-8 py-6 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase">
                                 <CheckCircle2 size={10} strokeWidth={4} /> {inv.status}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-[10px] font-bold text-gray-500 uppercase">{inv.date}</td>
                           <td className="px-8 py-6 text-right pr-12">
                              <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white transition-all shadow-sm">
                                <Download size={18} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Add-ons */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Add-on Marketplace */}
          <GlassCard className="border-white/5 bg-black/5 dark:bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent-muted text-accent shadow-inner"><Plus size={20} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Capacity Add-ons</h3>
               </div>
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Store</span>
            </div>
            <div className="space-y-4">
               <AddonCard title="+5 Kiosk Nodes" price="4,999" icon={Monitor} />
               <AddonCard title="+50 Staff Slots" price="1,500" icon={Users} />
               <AddonCard title="API Webhook Suite" price="2,999" icon={Zap} />
               <AddonCard title="GSTR-1 Automation" price="999" icon={FileText} />
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
                <button className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-accent-strong text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                   <span className="text-xs font-black uppercase tracking-widest">Open Marketplace</span>
                   <ChevronRight size={18} />
                </button>
            </div>
          </GlassCard>

          {/* Service Commitment Information */}
          <GlassCard className="border-white/5 bg-black/5 dark:bg-white/[0.01]">
             <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                   <ShieldCheck className="text-emerald-500 mt-1 shrink-0" size={18} />
                   <div className="min-w-0">
                      <p className="text-[10px] font-black dark:text-white uppercase mb-1">Commercial Integrity</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
                        Secure settlements via 256-bit encrypted gateways.
                      </p>
                   </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                   <FileText className="text-accent mt-1 shrink-0" size={18} />
                   <div className="min-w-0">
                      <p className="text-[10px] font-black dark:text-white uppercase mb-1">Billing Policy</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
                        30-day notice for deactivation. Data stored for 6 months post-exit.
                      </p>
                   </div>
                </div>
             </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};

export default SubscriptionBilling;
