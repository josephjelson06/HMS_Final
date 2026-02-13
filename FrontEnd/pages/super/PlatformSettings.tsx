import React, { useState } from 'react';
// Add AlertCircle and Ban to the imports to fix the missing name errors on lines 194 and 195
import { 
  Building2, Receipt, Monitor, Mail, Save, ChevronRight, 
  Settings as SettingsIcon, Shield, Database, Layout, Clock, 
  Smartphone, IndianRupee, BellRing, Edit2, AlertCircle, Ban
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

type Section = 'COMPANY' | 'BILLING' | 'KIOSK' | 'TEMPLATES';

const PlatformSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState<Section>('COMPANY');

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  const NavItem = ({ section, label, icon: Icon }: { section: Section, label: string, icon: any }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all duration-300 group
        ${activeSection === section 
          ? 'bg-blue-600 dark:bg-orange-500 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] dark:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)] translate-x-1' 
          : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <Icon 
          size={20} 
          className={`transition-colors duration-300 ${
            activeSection === section 
              ? 'text-white' 
              : 'group-hover:text-blue-600 dark:group-hover:text-orange-500'
          }`} 
        />
        <span className="text-sm font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight 
        size={16} 
        className={`transition-all duration-300 ${
          activeSection === section 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'
        }`} 
      />
    </button>
  );

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Global Parameters</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Platform-wide governance & logic defaults</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
          <Save size={18} />
          Sync All Nodes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <NavItem section="COMPANY" label="Company Profile" icon={Building2} />
          <NavItem section="BILLING" label="Billing Logic" icon={Receipt} />
          <NavItem section="KIOSK" label="Kiosk Thresholds" icon={Monitor} />
          <NavItem section="TEMPLATES" label="Comms Templates" icon={Mail} />
          
          <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
             <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-dashed border-white/10">
                <div className="flex items-center gap-2 mb-2 text-emerald-500">
                   <Shield size={14} />
                   <span className="text-[10px] font-black uppercase">Data Sovereignty</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Changes made here propagate to the CDN and Edge nodes within 60 seconds.</p>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <GlassCard className="min-h-[600px] border-l-4 border-l-blue-600 dark:border-l-orange-500">
            {activeSection === 'COMPANY' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">ATC Platform Identity</h2>
                   <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 flex items-center justify-center text-gray-400">
                      <Layout size={32} />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className={labelClass}>Legal Business Name</label>
                    <input type="text" defaultValue="ATC Platform Solutions Private Limited" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>GSTIN (Tax ID)</label>
                    <input type="text" defaultValue="27AABCU1234A1Z5" className={`${inputClass} font-mono uppercase`} />
                  </div>
                  <div>
                    <label className={labelClass}>PAN (Income Tax)</label>
                    <input type="text" defaultValue="AABCU1234A" className={`${inputClass} font-mono uppercase`} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Registered Office Address</label>
                    <textarea rows={3} defaultValue="Level 4, Sky Tower, Business Bay, Pune, Maharashtra 411001, India" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'BILLING' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Default Billing Logic</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelClass}>Default GST Rate (%)</label>
                    <div className="relative">
                      <input type="number" defaultValue="18" className={`${inputClass} pr-12`} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Invoice Number Prefix</label>
                    <input type="text" defaultValue="ATC-INV-" className={`${inputClass} font-mono`} />
                  </div>
                  <div>
                    <label className={labelClass}>Default Payment Terms</label>
                    <div className="relative">
                      <select className={`${inputClass} appearance-none cursor-pointer pr-12`}>
                        <option>Net 7 Days</option>
                        <option selected>Net 15 Days</option>
                        <option>Net 30 Days</option>
                        <option>Due on Receipt</option>
                      </select>
                      <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Platform Currency</label>
                    <div className="relative">
                      <input type="text" defaultValue="INR (₹)" className={`${inputClass} pr-12`} readOnly />
                      <IndianRupee size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-2 p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-white/5 space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bank Settlement Details (Appears on Invoices)</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Account Name" className={inputClass} />
                        <input type="text" placeholder="Account Number" className={inputClass} />
                        <input type="text" placeholder="IFSC Code" className={inputClass} />
                        <input type="text" placeholder="Branch Name" className={inputClass} />
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'KIOSK' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Edge Hardware Protocols</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelClass}>Heartbeat Interval (Min)</label>
                    <div className="relative">
                       <input type="number" defaultValue="5" className={`${inputClass} pr-12`} />
                       <Smartphone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 font-medium">Frequency of 'I am alive' signals from kiosks.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Critical Offline Threshold (Min)</label>
                    <div className="relative">
                       <input type="number" defaultValue="60" className={`${inputClass} pr-12`} />
                       <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500 font-medium">Wait time before triggering 'Critical' alert feed.</p>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Global Firmware Repository (URL)</label>
                    <div className="relative">
                       <input type="text" defaultValue="https://cdn.atc-platform.com/firmware/v2/stable" className={`${inputClass} font-mono pr-12`} />
                       <Database size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'TEMPLATES' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Comms & Messaging Templates</h2>
                <div className="space-y-4">
                  {[
                    { type: 'EMAIL', id: 'welcome', label: 'Welcome (New Hotel Onboarded)', icon: Building2 },
                    { type: 'EMAIL', id: 'inv_gen', label: 'Invoice Generated Alert', icon: Receipt },
                    { type: 'SMS', id: 'pay_rem', label: 'Payment Due Reminder', icon: BellRing },
                    { type: 'EMAIL', id: 'pay_over', label: 'Payment Overdue Notice', icon: AlertCircle },
                    { type: 'EMAIL', id: 'acc_susp', label: 'Account Suspended Warning', icon: Ban },
                  ].map((temp) => (
                    <div key={temp.id} className="flex items-center justify-between p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`px-2 py-1 rounded text-[8px] font-black tracking-widest ${temp.type === 'SMS' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>{temp.type}</div>
                          <div>
                             <h4 className="text-sm font-bold dark:text-white">{temp.label}</h4>
                             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">ID: TPL_{temp.id.toUpperCase()}</p>
                          </div>
                       </div>
                       <button className="p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-blue-500 transition-all">
                          <Edit2 size={18} />
                       </button>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-600/20">
                   <h4 className="text-xs font-black uppercase text-blue-600 mb-3 flex items-center gap-2">
                      <Database size={14} /> Available Variables
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {['{{hotel_name}}', '{{owner_name}}', '{{invoice_id}}', '{{amount}}', '{{due_date}}', '{{kiosk_id}}'].map(v => (
                         <span key={v} className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-mono font-bold dark:text-gray-300 border border-white/5 cursor-copy hover:bg-white/20">{v}</span>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;