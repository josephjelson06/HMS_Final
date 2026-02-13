import React, { useState } from 'react';
import { 
  Building2, Receipt, Settings2, DoorOpen, BellRing, 
  Save, ChevronRight, IndianRupee, MapPin, Phone, 
  Mail, Globe, Star, ShieldCheck, Percent, Clock, 
  Trash2, Plus, Edit3, Check, Smartphone, Info, 
  AlertTriangle, Bed, Trash
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

type Tab = 'PROFILE' | 'TAX' | 'OPS' | 'ROOMS' | 'NOTIFS';

interface RoomType {
  id: string;
  name: string;
  rackRate: number;
  occupancy: number;
  amenities: string[];
}

const PropertySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PROFILE');

  // Room Configuration States
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { id: '1', name: 'Deluxe Double', rackRate: 5500, occupancy: 2, amenities: ['AC', 'WiFi', 'Mini Bar'] },
    { id: '2', name: 'Executive Suite', rackRate: 9500, occupancy: 3, amenities: ['AC', 'WiFi', 'Bathtub', 'Balcony'] },
  ]);

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 dark:focus:border-accent/50";
    
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400";

  const NavItem = ({ tab, label, icon: Icon }: { tab: Tab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group
        ${activeTab === tab 
          ? 'bg-accent-strong text-white shadow-xl' 
          : 'hover:bg-white/5 text-gray-500 hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className={activeTab === tab ? 'text-white' : 'group-hover:text-white'} />
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight size={16} className={activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
    </button>
  );

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <PageHeader title="The Configuration" subtitle="Property-wide Logic & Compliance Defaulting">
        <Button
          size="md"
          icon={<Save size={18} strokeWidth={3} />}
        >
          Sync All Departments
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-3">
          <NavItem tab="PROFILE" label="Property Identity" icon={Building2} />
          <NavItem tab="TAX" label="Tax & GST Engine" icon={Receipt} />
          <NavItem tab="OPS" label="Operations Logic" icon={Settings2} />
          <NavItem tab="ROOMS" label="Inventory Setup" icon={DoorOpen} />
          <NavItem tab="NOTIFS" label="SMS & Staff Alerts" icon={BellRing} />
          
          <div className="pt-10 mt-6 border-t border-white/5">
             <div className="p-5 rounded-[2rem] bg-accent/5 border border-accent/20 flex gap-4">
                <ShieldCheck size={20} className="text-accent-strong shrink-0" />
                <p className="text-[10px] font-medium text-gray-500 leading-relaxed">Changes propagate to POS Terminals within 2 minutes.</p>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <GlassCard className="min-h-[650px] border-l-4 border-l-accent-strong">
            
            {/* 1. PROPERTY IDENTITY TAB */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Property Identity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div>
                        <label className={labelClass}>Hotel Trade Name (Public)</label>
                        <input type="text" defaultValue="Sapphire Boutique Hotel" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Legal Entity Name</label>
                        <input type="text" defaultValue="Sapphire Hospitality Pvt Ltd" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>Official Email</label>
                            <input type="email" defaultValue="ops@sapphire.com" className={inputClass} />
                         </div>
                         <div>
                            <label className={labelClass}>Front Desk Mobile</label>
                            <input type="tel" defaultValue="+91 98860 32101" className={inputClass} />
                         </div>
                      </div>
                      <div>
                        <label className={labelClass}>Property Star Rating</label>
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(s => (
                             <button key={s} className={`p-3 rounded-xl border ${s <= 4 ? 'bg-accent-muted border-orange-500 text-accent' : 'bg-black/5 border-white/5 text-gray-500'}`}>
                                <Star size={16} fill={s <= 4 ? 'currentColor' : 'none'} />
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div>
                         <label className={labelClass}>Invoice & Digital Branding Logo</label>
                         <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-black/10 dark:bg-white/[0.01] hover:border-orange-500/50 transition-all cursor-pointer group">
                            <Plus size={32} className="text-gray-500 group-hover:scale-110 transition-transform mb-3" />
                            <span className="text-[10px] font-bold uppercase text-gray-500">Upload High-Res SVG</span>
                         </div>
                      </div>
                      <div>
                        <label className={labelClass}>Physical Postal Address</label>
                        <textarea rows={4} className={`${inputClass} resize-none`} defaultValue="HAL Old Airport Rd, ISRO Colony, Domlur, Bangalore, Karnataka 560008" />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* 2. TAX ENGINE TAB */}
            {activeTab === 'TAX' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Tax & GST Engine</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div>
                        <label className={labelClass}>Hotel GSTIN (Tax Identification)</label>
                        <input type="text" defaultValue="29AABCU9603R1ZM" className={`${inputClass} font-mono uppercase`} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>PAN (Income Tax)</label>
                            <input type="text" defaultValue="AABCU9603R" className={`${inputClass} font-mono uppercase`} />
                         </div>
                         <div>
                            <label className={labelClass}>State Code</label>
                            <input type="text" defaultValue="29 (Karnataka)" className={inputClass} />
                         </div>
                      </div>
                   </div>
                   <div className="p-8 rounded-[3rem] bg-accent-strong/5 border border-blue-600/10 space-y-8">
                      <div className="flex items-center gap-3 text-accent">
                         <Percent size={20} strokeWidth={3} />
                         <h3 className="text-xs font-black uppercase tracking-widest">Active Slab Logic</h3>
                      </div>
                      <div className="space-y-6">
                         <div>
                            <label className={labelClass}>Room Tariff GST Threshold (INR)</label>
                            <div className="relative">
                               <input type="number" defaultValue={7500} className={inputClass} />
                               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">Threshold</span>
                            </div>
                            <p className="mt-2 text-[9px] font-bold text-gray-500 uppercase">Tariff {'>'} Threshold applies 18%, else 12%.</p>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Restaurant GST %</label>
                                <select className={inputClass}>
                                   <option>5% (Non-AC/Standard)</option>
                                   <option selected>18% (Luxury Property)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Other Services %</label>
                                <select className={inputClass}>
                                   <option selected>18% (Default)</option>
                                   <option>12%</option>
                                </select>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* 3. OPERATIONS LOGIC TAB */}
            {activeTab === 'OPS' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Operations Blueprint</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className={labelClass}>Standard Check-In</label>
                            <div className="relative">
                               <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                               <input type="time" defaultValue="14:00" className={`${inputClass} pl-11`} />
                            </div>
                         </div>
                         <div>
                            <label className={labelClass}>Standard Check-Out</label>
                            <div className="relative">
                               <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                               <input type="time" defaultValue="11:00" className={`${inputClass} pl-11`} />
                            </div>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className={labelClass}>Early Check-In Fee</label>
                            <div className="relative">
                               <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                               <input type="number" defaultValue={500} className={`${inputClass} pl-11`} />
                            </div>
                         </div>
                         <div>
                            <label className={labelClass}>Late Check-Out Fee</label>
                            <div className="relative">
                               <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                               <input type="number" defaultValue={500} className={`${inputClass} pl-11`} />
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div>
                         <label className={labelClass}>Default Meal Plan Basis</label>
                         <select className={inputClass}>
                            <option selected>EP (Room Only)</option>
                            <option>CP (Bed & Breakfast)</option>
                            <option>MAP (Breakfast + Dinner)</option>
                            <option>AP (All Meals)</option>
                         </select>
                      </div>
                      <div>
                         <label className={labelClass}>Invoice Number Prefix</label>
                         <input type="text" defaultValue="INV-H-" className={`${inputClass} font-mono uppercase`} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="opacity-50 grayscale pointer-events-none">
                            <label className={labelClass}>Currency (Locked)</label>
                            <input type="text" defaultValue="INR (₹)" className={inputClass} />
                         </div>
                         <div className="opacity-50 grayscale pointer-events-none">
                            <label className={labelClass}>Timezone (Locked)</label>
                            <input type="text" defaultValue="Asia/Kolkata" className={inputClass} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* 4. ROOM INVENTORY SETUP TAB */}
            {activeTab === 'ROOMS' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Physical Blueprint</h2>
                   <button className="flex items-center gap-2 bg-accent-strong text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                      <Plus size={14} strokeWidth={3} /> Add Room Category
                   </button>
                </div>
                
                <div className="space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Room Categories & Rack Rates</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roomTypes.map(rt => (
                         <div key={rt.id} className="p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all h-48">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h4 className="text-lg font-black dark:text-white uppercase">{rt.name}</h4>
                                  <div className="flex gap-1.5 mt-2">
                                     {rt.amenities.map(a => <span key={a} className="text-[8px] font-bold uppercase text-gray-500 bg-black/10 dark:bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{a}</span>)}
                                  </div>
                               </div>
                               <button className="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-white/5">
                               <div>
                                  <p className="text-[9px] font-black text-gray-500 uppercase">Base Rack Rate</p>
                                  <p className="text-xl font-black text-accent-strong tracking-tighter">₹{rt.rackRate.toLocaleString()}</p>
                               </div>
                               <button className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all">
                                  <Edit3 size={12} /> Manage Category
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-accent-strong/10 border border-accent-strong/20 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-accent-strong text-white flex items-center justify-center shadow-lg"><Bed size={28} /></div>
                      <div>
                         <h4 className="text-sm font-black dark:text-white uppercase">Room Hardware Registry</h4>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">120 Total Rooms Mapped to floors</p>
                      </div>
                   </div>
                   <button className="px-8 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest shadow-xl">Audit Room Grid</button>
                </div>
              </div>
            )}

            {/* 5. NOTIFICATION SETTINGS TAB */}
            {activeTab === 'NOTIFS' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Automated Switchboard</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Guest SMS */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 text-emerald-500 mb-6">
                         <Smartphone size={20} />
                         <h3 className="text-xs font-black uppercase tracking-[0.2em]">Guest Lifecycle SMS</h3>
                      </div>
                      {[
                        { l: 'Booking Confirmation', d: 'Send SMS on new reservation' },
                        { l: 'Check-In Welcome', d: 'Send on guest check-in' },
                        { l: 'Digital Checkout Link', d: 'SMS invoice on payment completion' },
                        { l: 'Post-Stay Feedback', d: '24h after departure' }
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                           <div>
                              <p className="text-sm font-black dark:text-white uppercase">{s.l}</p>
                              <p className="text-[10px] font-bold text-gray-500 mt-1">{s.d}</p>
                           </div>
                           <button className={`w-11 h-6 rounded-full relative transition-all ${i % 3 === 0 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${i % 3 === 0 ? 'left-6' : 'left-1'}`}></div>
                           </button>
                        </div>
                      ))}
                   </div>

                   {/* Staff Notifications */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 text-accent mb-6">
                         <AlertTriangle size={20} />
                         <h3 className="text-xs font-black uppercase tracking-[0.2em]">Escalation Triggers</h3>
                      </div>
                      {[
                        { l: 'New Walk-In Alert', d: 'Notify GM on manual check-in' },
                        { l: 'Balance Overdue Check-out', d: 'Notify Manager if guest owes money' },
                        { l: 'Incident Escalation', d: 'Notify Supervisor if TTR > 2h' }
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                           <div>
                              <p className="text-sm font-black dark:text-white uppercase">{s.l}</p>
                              <p className="text-[10px] font-bold text-gray-500 mt-1">{s.d}</p>
                           </div>
                           <button className={`w-11 h-6 rounded-full relative transition-all ${i < 2 ? 'bg-accent-strong' : 'bg-gray-300 dark:bg-white/10'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${i < 2 ? 'left-6' : 'left-1'}`}></div>
                           </button>
                        </div>
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

export default PropertySettings;