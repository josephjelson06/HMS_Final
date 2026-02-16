import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, Mail, Edit, LogIn, Building2, FileText, CreditCard, Monitor, ArrowUpRight, Download
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useTheme } from '../../hooks/useTheme';
import { useHotels } from '@/application/hooks/useHotels';
import EditHotelModal from '../../modals/super/EditHotelModal';

interface HotelDetailsProps {
  onNavigate: (route: string) => void;
  onLoginAsAdmin?: (hotelName: string) => void;
  hotelId?: number;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({ onNavigate, onLoginAsAdmin, hotelId }) => {
  const { isDarkMode } = useTheme();                        
  const [activeTab, setActiveTab] = useState('Overview');
  const { hotels: allHotels, loading, updateHotel, deleteHotel } = useHotels();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary';
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });   

  const openConfirm = (config: Omit<typeof modalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const selectedHotel = hotelId !== undefined
    ? allHotels.find((hotel) => hotel.id === hotelId)
    : allHotels[0];

  const hotelName = selectedHotel?.name ?? 'Hotel';
  const hotelAddress = selectedHotel?.address ?? 'Address unavailable';
  const hotelEmail = selectedHotel?.email ?? 'ops@example.com';
  const hotelStatus = selectedHotel?.status ?? 'Unknown';
  const hotelPlan = selectedHotel?.plan ?? 'Starter';
  const hotelMrr = selectedHotel?.mrr ?? 0;
  const hotelGstin = selectedHotel?.gstin ?? 'N/A';
  const hotelPan = hotelGstin.length >= 12 ? hotelGstin.slice(2, 12) : 'N/A';
  const hotelStateCode = hotelGstin.length >= 2 ? `${hotelGstin.slice(0, 2)} (IN)` : 'N/A';

  const isMissingRequestedHotel = !loading && hotelId !== undefined && !selectedHotel;

  const statusClasses: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
    'Past Due': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Onboarding: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };
  const statusClassName = statusClasses[hotelStatus] ?? 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  const tabs = [
    { name: 'Overview', icon: FileText },
    { name: 'Kiosk Fleet', icon: Monitor },
    { name: 'Invoice History', icon: CreditCard },
  ];

  if (isMissingRequestedHotel) {
    return (
      <div className="p-4 md:p-8 space-y-6 min-h-screen pb-20 animate-in fade-in duration-500">
        <button
          onClick={() => onNavigate('hotels')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Registry
        </button>
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-black dark:text-white tracking-tight">Hotel not found</h2>
          <p className="mt-2 text-sm text-gray-500">No hotel exists for ID: {hotelId}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen pb-20 animate-in fade-in duration-500">
      <button 
        onClick={() => onNavigate('hotels')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Registry
      </button>

      {/* UNIFIED CONTAINER: Header Info Section */}
      <GlassCard noPadding clipContent className="relative">
        <div className={`absolute top-0 right-0 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${hotelStatus === 'Suspended' ? 'grayscale opacity-10' : ''}`}></div>
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 p-8 relative z-10">
            <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${isDarkMode ? 'bg-white/10 border border-white/10' : 'bg-emerald-500 text-white'} ${hotelStatus === 'Suspended' ? 'grayscale opacity-50' : ''}`}>
                    <Building2 size={32} className={isDarkMode ? 'text-emerald-400' : 'text-white'} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{hotelName}</h1>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusClassName}`}>{hotelStatus}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelAddress + ", " + hotelName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-accent-strong transition-colors"
                        >
                          <MapPin size={14} />
                          <span>{hotelAddress}</span>
                        </a>
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} />
                          <a href={`mailto:${hotelEmail}`} className="hover:text-accent-strong transition-colors">{hotelEmail}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Edit size={16} />Edit Profile
                </button>
                <button 
                  onClick={() => onLoginAsAdmin?.(hotelName)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 bg-gray-900 dark:bg-accent text-white hover:scale-105 transition-all flex items-center gap-2"
                >
                  <LogIn size={16} /> Login as Manager
                </button>
            </div>
        </div>
      </GlassCard>

      {/* UNIFIED CONTAINER: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
          { label: 'Subscription', value: hotelPlan, color: 'text-accent', footer: 'Active plan assigned' },
          { label: 'Status', value: hotelStatus, sub: loading ? 'Loading...' : 'Current account state', color: 'text-emerald-500', footer: 'Operational status' },
          { label: 'Total Revenue', value: 'INR ' + (hotelMrr / 1000).toFixed(1) + 'k', color: 'text-accent', footer: 'Monthly recurring revenue' },
        ].map((m, i) => (
          <GlassCard key={i} noPadding clipContent className="flex flex-col h-32 border-white/5 dark:border-white/10">
            <div className="flex-1 px-6 flex flex-col justify-center">
              <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black dark:text-white tracking-tighter">{m.value}</h3>
                <span className={`text-[10px] font-semibold ${m.color}`}>{m.sub}</span>
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] px-6 py-2 border-t border-white/5">
               <p className="text-[8px] font-bold uppercase text-gray-500 tracking-wider">{m.footer}</p>
            </div>
          </GlassCard>
        ))}
      </div>
      
      {/* Tabs Switcher */}
      <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.name} 
            onClick={() => setActiveTab(tab.name)} 
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.name ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <tab.icon size={14} />{tab.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-full space-y-6">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard noPadding clipContent className="border-white/5 dark:border-white/10 flex flex-col">
              <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Hotel Profile</h3>
              </div>
              <div className="p-8 space-y-4 text-sm flex-1">
                {[
                  { l: 'Trade Name', v: hotelName },
                  { l: 'GSTIN', v: hotelGstin, mono: true },
                  { l: 'PAN', v: hotelPan, mono: true },
                  { l: 'Registered Address', v: hotelAddress },
                  { l: 'State Code', v: hotelStateCode },
                ].map((it, i) => (
                  <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{it.l}</span>
                    <span className={`font-bold dark:text-white ${it.mono ? 'font-mono' : ''}`}>{it.v}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard noPadding clipContent className="border-white/5 dark:border-white/10 flex flex-col">
              <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Subscription Info</h3>
              </div>
              <div className="p-8 space-y-4 text-sm flex-1">
                {[
                  { l: 'Current Plan', v: `${hotelPlan} Plan`, badge: 'Orange' },
                  { l: 'Billing Cycle', v: `Monthly (INR ${hotelMrr.toLocaleString()}/mo)` },
                  { l: 'Next Renewal', v: 'Dec 01, 2025' },
                  { l: 'Auto-Renewal', v: 'Enabled', badge: 'Emerald' },
                ].map((it, i) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{it.l}</span>
                    <span className="font-black dark:text-white uppercase tracking-tighter">{it.v}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        
        {activeTab === 'Kiosk Fleet' && (
           <GlassCard noPadding clipContent className="overflow-hidden border-white/5 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {(selectedHotel?.kiosk_list?.length ?? 0) === 0 ? (
               <div className="p-12 text-center">
                 <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <Monitor size={32} />
                 </div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">No Kiosks Found</h3>
                 <p className="text-xs text-gray-400 max-w-xs mx-auto">This hotel currently has no kiosks assigned to its fleet.</p>
               </div>
             ) : (
               <table className="w-full text-left">
                 <thead className="bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   <tr>
                     <th className="px-8 py-6">Status</th>
                     <th className="px-8 py-6">Serial Number</th>
                     <th className="px-8 py-6">Location</th>
                     <th className="px-8 py-6 text-right pr-10">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {selectedHotel?.kiosk_list?.map((kiosk, i) => (
                     <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                       <td className="px-8 py-6">
                         <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>
                       </td>
                       <td className="px-8 py-6 text-sm font-mono font-bold text-accent-strong">{kiosk.serial_number}</td>
                       <td className="px-8 py-6 text-sm font-bold dark:text-white uppercase tracking-tight">{kiosk.location}</td>
                       <td className="px-8 py-6 text-right pr-10">
                         <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Edit size={16} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </GlassCard>
        )}

        {activeTab === 'Invoice History' && (
          <GlassCard noPadding clipContent className="overflow-hidden border-white/5 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left">
              <thead className="bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <tr><th className="px-8 py-6">Number</th><th className="px-8 py-6">Period</th><th className="px-8 py-6 text-right">Amount</th><th className="px-8 py-6 text-center">Status</th><th className="px-8 py-6 text-right pr-10">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { id: 'INV-2024-006', p: 'Jan 2025', a: 15000, s: 'paid', d: 'Jan 10' },
                  { id: 'INV-2024-005', p: 'Dec 2024', a: 15000, s: 'paid', d: 'Dec 12' },
                  { id: 'INV-2024-004', p: 'Nov 2024', a: 15000, s: 'overdue', d: '-' },
                ].map((inv, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-8 py-6 text-sm font-mono font-bold text-accent-strong">{inv.id}</td>
                    <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest dark:text-gray-400">{inv.p}</td>
                    <td className="px-8 py-6 text-sm font-black text-right dark:text-white tracking-tighter">₹{inv.a.toLocaleString()}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${inv.s === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {inv.s}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right pr-10">
                      <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"><Download size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}
      </div>

      {/* Danger Zone */}
      <GlassCard className="border-red-500/20 bg-red-500/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Irreversible actions for this hotel account. Proceed with caution.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const isSuspended = hotelStatus === 'Suspended';
                openConfirm({
                  title: isSuspended ? 'Activate Hotel' : 'Suspend Hotel',
                  message: isSuspended 
                    ? `Are you sure you want to activate ${hotelName}? This will restore access to all services.`
                    : `Are you sure you want to suspend ${hotelName}? This will immediately suspend the account and restrict all involved services.`,
                  variant: 'warning',
                  confirmLabel: isSuspended ? 'Activate' : 'Suspend',
                  onConfirm: async () => {
                     const newStatus = isSuspended ? 'Active' : 'Suspended';
                     if (hotelId) {
                       await updateHotel(hotelId, { status: newStatus });
                     }
                  }
                });
              }}
              className="px-5 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
            >
              {hotelStatus === 'Suspended' ? 'Activate Hotel' : 'Suspend Hotel'}
            </button>
            <button 
               onClick={() => {
                 openConfirm({
                   title: 'Delete Hotel',
                   message: `Are you sure you want to permanently delete ${hotelName}? This action cannot be undone and will remove all associated data including kiosks and invoices.`,
                   variant: 'danger',
                   confirmLabel: 'Delete Forever',
                   onConfirm: async () => {
                     if (hotelId) {
                       await deleteHotel(hotelId);
                       onNavigate('hotels');
                     }
                   }
                 });
               }}
              className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-bold shadow-lg shadow-red-500/20"
            >
              Delete Hotel
            </button>
          </div>
        </div>
      </GlassCard>
      
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
      />

      {selectedHotel && (
        <EditHotelModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          hotel={selectedHotel}
          onUpdate={async (id, data) => {
             await updateHotel(id, data);
             // Instant UI update is handled by the hook's state
          }}
        />
      )}
    </div>
  );
};

export default HotelDetails;

