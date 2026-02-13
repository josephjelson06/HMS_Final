import React, { useState } from 'react';
import { 
  Users, DoorOpen, Zap, History, Bell, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  AlertCircle, ChevronRight, Clock, Building2,
  Scan, Info, Printer, ShieldAlert, ArrowRight,
  TrendingUp, ClipboardCheck, ShieldCheck,
  Terminal, LogOut, AlertTriangle, IndianRupee,
  Activity, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import OccupancyGauge from '../../components/hotel/OccupancyGauge';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import NightAuditWizard from '../../modals/hotel/NightAuditWizard';

const CheckInRow = ({ refId, name, room, kyc, source, isOverdue }: any) => (
  <div className={`group flex items-center justify-between p-4 rounded-2xl border-y border-r border-white/5 transition-all cursor-pointer bg-black/10 hover:bg-white/5 ${isOverdue ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-transparent'}`}>
    <div className="flex items-center gap-4 flex-1">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${kyc === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
        {kyc === 'verified' ? <CheckCircle2 size={18} /> : <Scan size={18} />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
            <h4 className="text-sm font-black dark:text-white truncate uppercase tracking-tighter">{name}</h4>
            {isOverdue && <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-bold uppercase tracking-tighter">Overdue</span>}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          <span>{refId}</span>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <span>{source}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
       <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Assigned</p>
          <p className="text-sm font-black dark:text-gray-200">#{room}</p>
       </div>
       <button className="px-5 py-2 rounded-xl bg-accent-strong text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent-strong/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-105">
          Process
       </button>
    </div>
  </div>
);

const ReadinessItem = ({ status, count, color, label }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-[0_0_8px_currentColor]`}></div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-lg font-black dark:text-white">{count}</span>
      <ChevronRight size={14} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

const InlineAlert = ({ type, message }: { type: 'critical' | 'warning', message: string }) => {
  const styles = type === 'critical' 
    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
    : 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${styles} animate-in slide-in-from-top-2 duration-500`}>
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${type === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
        <div className={`absolute inset-0 rounded-full ${type === 'critical' ? 'bg-red-500' : 'bg-amber-500'} animate-ping opacity-30`} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{message}</span>
    </div>
  );
};

const HotelDashboard: React.FC = () => {
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-32 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader
        title="Shift Overview"
        subtitle="Property Status • Feb 10, 2026"
        badge="Dummy Data Page"
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setIsAuditOpen(true)}
            icon={<Terminal size={18} />}
            className="border border-white/20 text-gray-500 dark:text-gray-400 hover:text-white hover:border-white/40"
          >
            Start Night Audit
          </Button>
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-muted border border-accent/20 text-accent-strong">
            <Clock size={16} strokeWidth={3} className="animate-spin-slow" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Shift Ends: 5h 22m</span>
          </div>
        </div>
      </PageHeader>

      {/* Top Notification Banner */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <InlineAlert type="critical" message="Room 412: Maintenance Required (Plumbing)" />
         <InlineAlert type="warning" message="Compliance GAP: Missing Signature RM 608" />
      </div> */}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col justify-between h-44 border-l-4 border-l-blue-500 bg-blue-500/[0.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Arrivals Today</p>
              <h3 className="text-4xl font-black text-accent-strong tracking-tighter">38</h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-accent-strong"><ArrowDownRight size={24} /></div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/5 w-fit px-2 py-1 rounded-lg border border-emerald-500/10">
            26 Expected Arrival
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-44 border-l-4 border-l-orange-500 bg-accent/[0.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Departures Today</p>
              <h3 className="text-4xl font-black text-accent tracking-tighter">22</h3>
            </div>
            <div className="p-2 rounded-xl bg-accent-muted text-accent"><ArrowUpRight size={24} /></div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase bg-red-500/5 w-fit px-2 py-1 rounded-lg border border-red-500/10 animate-pulse">
            8 with pending balance
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-44 border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">In-House Guests</p>
              <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">104</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Users size={24} /></div>
          </div>
          <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-black bg-zinc-700"></div>
                  ))}
              </div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">+101 More</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between h-44 border-l-4 border-l-amber-500 bg-amber-500/[0.02]">
          <div className="flex-1">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Occupancy %</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">94 of 120 rooms sold</p>
             <div className="mt-4 flex items-center gap-2 text-emerald-500">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase">+12% vs LW</span>
             </div>
          </div>
          <OccupancyGauge percentage={78} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-8">
          {/* Arrivals Funnel - Now takes more space as yield chart is removed */}
          <GlassCard noPadding clipContent className="flex flex-col h-[400px] border-white/10 shadow-2xl bg-gradient-to-br from-black/20 to-transparent">
              <div className="p-8 border-b border-white/5 bg-black/5">
                  <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em]">Efficiency Funnel</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Arrival Process Stream</p>
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                  {[
                    { label: 'Reservations', count: 38, pct: 100, color: 'bg-gray-500' },
                    { label: 'Pre-checkin done', count: 24, pct: 63, color: 'bg-accent' },
                    { label: 'KYC Verified', count: 18, pct: 47, color: 'bg-emerald-500' },
                    { label: 'Key Issued', count: 12, pct: 31, color: 'bg-accent' }
                  ].map((step, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase text-gray-500">{step.label}</span>
                            <span className="text-sm font-black dark:text-white">{step.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                            <div className={`h-full ${step.color} shadow-[0_0_10px_currentColor] opacity-60`} style={{ width: `${step.pct}%` }}></div>
                        </div>
                    </div>
                  ))}
              </div>
          </GlassCard>
      </div>

      {/* Main Operational Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Arrivals & Overdue List */}
        <GlassCard className="lg:col-span-8 flex flex-col min-h-[450px]" noPadding>
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/5 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em]">Live Operational Queue</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time Task Prioritization</p>
            </div>
            <div className="flex gap-2">
                <span className="px-4 py-2 rounded-xl bg-red-600/10 text-red-600 border border-red-600/20 text-[9px] font-bold uppercase tracking-widest shadow-sm">3 Overdue</span>
                <span className="px-4 py-2 rounded-xl bg-accent-strong/10 text-accent-strong border border-accent-strong/20 text-[9px] font-bold uppercase tracking-widest shadow-sm">26 Expected</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <CheckInRow refId="BK-9827" name="Johnathan Doe" room="402" kyc="verified" source="MakeMyTrip" isOverdue={true} />
            <CheckInRow refId="BK-1102" name="Sarah Jenkins" room="204" kyc="pending" source="Goibibo" isOverdue={true} />
            <CheckInRow refId="BK-5541" name="Michael Chen" room="105" kyc="pending" source="Direct Website" />
            <CheckInRow refId="BK-8891" name="Priya Kapoor" room="312" kyc="verified" source="Booking.com" />
            <CheckInRow refId="BK-2231" name="Robert Vance" room="501" kyc="pending" source="Walk-in" />
            <CheckInRow refId="BK-7742" name="Elena Petrova" room="215" kyc="verified" source="Agoda" />
            <CheckInRow refId="BK-0912" name="Aman Sharma" room="408" kyc="pending" source="MakeMyTrip" />
          </div>
        </GlassCard>

        {/* Room Readiness List */}
        <GlassCard className="lg:col-span-4 flex flex-col min-h-[450px]" noPadding>
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/[0.02]">
            <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em]">Inventory Health</h3>
            <div className="p-2 rounded-xl bg-accent-strong/10 text-accent-strong"><ShieldCheck size={20} /></div>
          </div>

          <div className="p-6 space-y-6">
              <div className="space-y-2">
                 <ReadinessItem label="Clean & Vacant" count={26} color="bg-emerald-500" />
                 <ReadinessItem label="Dirty & Vacant" count={14} color="bg-red-500" />
                 <ReadinessItem label="Clean & Occupied" count={68} color="bg-accent" />
                 <ReadinessItem label="Dirty & Occupied" count={10} color="bg-accent" />
                 <ReadinessItem label="Maintenance" count={2} color="bg-gray-500" />
              </div>
          </div>
        </GlassCard>
      </div>

      <NightAuditWizard isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
};

export default HotelDashboard;