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
import { useGuests } from '../../../application/hooks/useGuests';
import { useBookings } from '../../../application/hooks/useBookings';
import { useRooms } from '../../../application/hooks/useRooms';

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
  const { guests, loading: guestsLoading } = useGuests();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { rooms, loading: roomsLoading } = useRooms();

  const isLoading = guestsLoading || bookingsLoading || roomsLoading;
  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const arrivalsToday = bookings.filter((booking) => booking.status === 'confirmed' || booking.status === 'pending').length;
  const expectedArrivals = bookings.filter((booking) => booking.status === 'confirmed').length;
  const departuresToday = guests.filter((guest) => guest.status === 'Checked-Out').length;
  const pendingBalanceCount = guests.filter((guest) => guest.balance > 0).length;
  const inHouseGuests = guests.filter((guest) => guest.status === 'Checked-In').length;

  const cleanVacantCount = rooms.filter((room) => room.status === 'CLEAN_VACANT').length;
  const dirtyVacantCount = rooms.filter((room) => room.status === 'DIRTY_VACANT').length;
  const cleanOccupiedCount = rooms.filter((room) => room.status === 'CLEAN_OCCUPIED').length;
  const dirtyOccupiedCount = rooms.filter((room) => room.status === 'DIRTY_OCCUPIED').length;
  const maintenanceCount = rooms.filter((room) => room.status === 'MAINTENANCE').length;
  const occupiedRooms = cleanOccupiedCount + dirtyOccupiedCount;
  const totalRooms = rooms.length;
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const queueGuests = guests.slice(0, 7);
  const queueOverdueCount = queueGuests.filter((guest) => guest.balance > 0 || guest.kycStatus !== 'Verified').length;

  const reservationsCount = bookings.length;
  const preCheckinDoneCount = guests.filter((guest) => guest.status === 'Reserved' || guest.status === 'Checked-In').length;
  const verifiedKycCount = guests.filter((guest) => guest.kycStatus === 'Verified').length;
  const keyIssuedCount = guests.filter((guest) => guest.status === 'Checked-In').length;
  const funnelBase = reservationsCount > 0 ? reservationsCount : 1;
  const funnelSteps = [
    { label: 'Reservations', count: reservationsCount, pct: 100, color: 'bg-gray-500' },
    { label: 'Pre-checkin done', count: preCheckinDoneCount, pct: Math.round((preCheckinDoneCount / funnelBase) * 100), color: 'bg-accent' },
    { label: 'KYC Verified', count: verifiedKycCount, pct: Math.round((verifiedKycCount / funnelBase) * 100), color: 'bg-emerald-500' },
    { label: 'Key Issued', count: keyIssuedCount, pct: Math.round((keyIssuedCount / funnelBase) * 100), color: 'bg-accent' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-32 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader
        title="Shift Overview"
        subtitle={`Property Status | ${todayLabel}`}
        badge={isLoading ? 'Syncing Data' : 'Live Repository Data'}
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
              <h3 className="text-4xl font-black text-accent-strong tracking-tighter">{isLoading ? '--' : arrivalsToday}</h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-accent-strong"><ArrowDownRight size={24} /></div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/5 w-fit px-2 py-1 rounded-lg border border-emerald-500/10">
            {isLoading ? '--' : expectedArrivals} Expected Arrival
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-44 border-l-4 border-l-orange-500 bg-accent/[0.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Departures Today</p>
              <h3 className="text-4xl font-black text-accent tracking-tighter">{isLoading ? '--' : departuresToday}</h3>
            </div>
            <div className="p-2 rounded-xl bg-accent-muted text-accent"><ArrowUpRight size={24} /></div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase bg-red-500/5 w-fit px-2 py-1 rounded-lg border border-red-500/10 animate-pulse">
            {isLoading ? '--' : pendingBalanceCount} with pending balance
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-44 border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">In-House Guests</p>
              <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">{isLoading ? '--' : inHouseGuests}</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Users size={24} /></div>
          </div>
          <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-black bg-zinc-700"></div>
                  ))}
              </div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">+{Math.max(inHouseGuests - 3, 0)} More</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between h-44 border-l-4 border-l-amber-500 bg-amber-500/[0.02]">
          <div className="flex-1">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Occupancy %</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{occupiedRooms} of {totalRooms} rooms sold</p>
             <div className="mt-4 flex items-center gap-2 text-emerald-500">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase">+12% vs LW</span>
             </div>
          </div>
          <OccupancyGauge percentage={occupancyPercent} />
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
                  {funnelSteps.map((step, i) => (
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
                <span className="px-4 py-2 rounded-xl bg-red-600/10 text-red-600 border border-red-600/20 text-[9px] font-bold uppercase tracking-widest shadow-sm">{queueOverdueCount} Overdue</span>
                <span className="px-4 py-2 rounded-xl bg-accent-strong/10 text-accent-strong border border-accent-strong/20 text-[9px] font-bold uppercase tracking-widest shadow-sm">{expectedArrivals} Expected</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {queueGuests.map((guest) => (
              <CheckInRow
                key={guest.id}
                refId={guest.refId}
                name={guest.name}
                room={guest.room}
                kyc={guest.kycStatus === 'Verified' ? 'verified' : 'pending'}
                source={guest.source}
                isOverdue={guest.balance > 0 || guest.kycStatus !== 'Verified'}
              />
            ))}
            {queueGuests.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                No live queue entries found
              </div>
            )}
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
                 <ReadinessItem label="Clean & Vacant" count={cleanVacantCount} color="bg-emerald-500" />
                 <ReadinessItem label="Dirty & Vacant" count={dirtyVacantCount} color="bg-red-500" />
                 <ReadinessItem label="Clean & Occupied" count={cleanOccupiedCount} color="bg-accent" />
                 <ReadinessItem label="Dirty & Occupied" count={dirtyOccupiedCount} color="bg-accent" />
                 <ReadinessItem label="Maintenance" count={maintenanceCount} color="bg-gray-500" />
               </div>
           </div>
        </GlassCard>
      </div>

      <NightAuditWizard isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
};

export default HotelDashboard;
