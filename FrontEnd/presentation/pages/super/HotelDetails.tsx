import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, Mail, Edit, LogIn, Building2, FileText, CreditCard, Monitor, ArrowUpRight, Download
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface HotelDetailsProps {
  onNavigate: (route: string) => void;
  onLoginAsAdmin?: (hotelName: string) => void;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({ onNavigate, onLoginAsAdmin }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const hotelName = "Royal Orchid Bangalore";
  const hotelAddress = "Domlur, Bangalore, KA";

  const tabs = [
    { name: 'Overview', icon: FileText },
    { name: 'Invoice History', icon: CreditCard },
  ];

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 p-8 relative z-10">
            <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${isDarkMode ? 'bg-white/10 border border-white/10' : 'bg-emerald-500 text-white'}`}>
                    <Building2 size={32} className={isDarkMode ? 'text-emerald-400' : 'text-white'} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{hotelName}</h1>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
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
                          <a href="mailto:ops@royalorchid.com" className="hover:text-accent-strong transition-colors">ops@royalorchid.com</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center gap-2"><Edit size={16} />Edit Profile</button>
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
          { label: 'Subscription', value: 'Enterprise', color: 'text-accent', footer: 'Renewing in 12 days' },
          { label: 'Status', value: 'Active', sub: 'Since June 2024', color: 'text-emerald-500', footer: 'Account in good standing' },
          { label: 'Total Revenue', value: '₹59.0k', color: 'text-accent', footer: 'Life-to-date yielding' },
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
                  { l: 'Trade Name', v: 'Royal Orchid Suites' },
                  { l: 'GSTIN', v: '29AABCU9603R1ZM', mono: true },
                  { l: 'PAN', v: 'AABCU9603R', mono: true },
                  { l: 'Registered Address', v: 'HAL Old Airport Rd, ISRO Colony, Domlur, Bangalore, Karnataka 560008' },
                  { l: 'State Code', v: '29 (KA)' },
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
                  { l: 'Current Plan', v: 'Enterprise Plan', badge: 'Orange' },
                  { l: 'Billing Cycle', v: 'Monthly (₹15,000/mo)' },
                  { l: 'Next Renewal', v: 'Dec 01, 2025' },
                  { l: 'Auto-Renewal', v: 'Enabled', badge: 'Emerald' },
                ].map((it, i) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{it.l}</span>
                    <span className="font-black dark:text-white uppercase tracking-tighter">{it.v}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-accent-strong hover:text-white transition-all border-t border-white/5">Change Subscription Plan</button>
            </GlassCard>
          </div>
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
    </div>
  );
};

export default HotelDetails;