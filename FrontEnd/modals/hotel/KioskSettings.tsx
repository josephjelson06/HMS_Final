
import React, { useState } from 'react';
import { 
  Monitor, Settings2, Globe, Layout, CreditCard, 
  Smartphone, CheckCircle2, Save, Trash2, Edit3, 
  Upload, CheckSquare, Square, Info, ShieldCheck,
  Zap, Languages, Check, Image as ImageIcon,
  Clock, Signal
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface AssignedKiosk {
  id: string;
  label: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

const KioskSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  // 1. Behavior State
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [checkOutEnabled, setCheckOutEnabled] = useState(false);
  const [acceptedIDs, setAcceptedIDs] = useState(['Aadhaar', 'Passport']);
  const [paymentModes, setPaymentModes] = useState(['UPI QR', 'Card']);

  // 2. UI State
  const [welcomeMsg, setWelcomeMsg] = useState("Welcome to Hotel Sapphire! Touch to begin.");
  const [activeLanguages, setActiveLanguages] = useState(['English', 'Hindi']);

  // 3. Hardware State (Mock)
  const [assignedKiosks, setAssignedKiosks] = useState<AssignedKiosk[]>([
    { id: 'ATC-SN-7766', label: 'Main Lobby Kiosk', status: 'online', lastSeen: 'Just now' },
    { id: 'ATC-K-0402', label: 'North Entrance', status: 'offline', lastSeen: '2h 14m ago' },
  ]);

  const toggleID = (id: string) => {
    setAcceptedIDs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleLang = (lang: string) => {
    setActiveLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;
  
  const toggleBtnClass = (active: boolean) => `
    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
    ${active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'}
  `;

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Self-Service Config</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Configure Guest Kiosk Behavior & UI</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
          <Save size={18} strokeWidth={3} />
          Sync to Hardware
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Workflow & UI Settings */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Section 1: Kiosk Behavior */}
          <GlassCard className="border-l-4 border-l-blue-600">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><Settings2 size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">Workflow Governance</h3>
            </div>

            <div className="space-y-10">
              {/* Primary Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="flex items-center justify-between p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                    <div>
                       <h4 className="text-sm font-black dark:text-white">Self Check-In</h4>
                       <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Allow guests to register</p>
                    </div>
                    <button onClick={() => setCheckInEnabled(!checkInEnabled)} className={toggleBtnClass(checkInEnabled)}>
                       <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checkInEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                    <div>
                       <h4 className="text-sm font-black dark:text-white">Self Check-Out</h4>
                       <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Allow direct settlement</p>
                    </div>
                    <button onClick={() => setCheckOutEnabled(!checkOutEnabled)} className={toggleBtnClass(checkOutEnabled)}>
                       <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checkOutEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>

              {/* ID Whitelist */}
              <div>
                <label className={labelClass}>Regulatory ID Whitelist</label>
                <div className="flex flex-wrap gap-3">
                   {['Aadhaar', 'Passport', 'Driving License', 'Voter ID'].map(id => (
                     <button 
                        key={id} 
                        onClick={() => toggleID(id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all text-xs font-bold uppercase tracking-widest ${acceptedIDs.includes(id) ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-black/5 dark:bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                      >
                        {acceptedIDs.includes(id) ? <Check size={14} strokeWidth={4} /> : <div className="w-3.5 h-3.5 rounded border border-current opacity-30" />}
                        {id}
                     </button>
                   ))}
                </div>
              </div>

              {/* Payment Modes */}
              <div>
                <label className={labelClass}>Authorized Payment Nodes</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {[
                     { l: 'UPI QR', i: Smartphone },
                     { l: 'Card Payment', i: CreditCard },
                     { l: 'Cash Acceptor', i: IndianRupee }
                   ].map(mode => (
                     <div key={mode.l} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                           <mode.i size={16} className="text-gray-500" />
                           <span className="text-[11px] font-black uppercase text-gray-600 dark:text-gray-300">{mode.l}</span>
                        </div>
                        <input 
                           type="checkbox" 
                           checked={paymentModes.includes(mode.l)}
                           onChange={() => setPaymentModes(prev => prev.includes(mode.l) ? prev.filter(m => m !== mode.l) : [...prev, mode.l])}
                           className="w-4 h-4 rounded-md border-white/10 bg-black text-orange-500" 
                        />
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Visual Customization */}
          <GlassCard className="border-l-4 border-l-orange-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><Layout size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">Brand & Visual Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Property Brand Logo</label>
                    <div className="aspect-video w-full rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-black/5 dark:bg-white/[0.01] group hover:border-orange-500/30 transition-all cursor-pointer">
                       <ImageIcon size={32} className="text-gray-600 mb-3" />
                       <span className="text-[10px] font-black uppercase text-gray-500">Upload SVG or PNG</span>
                       <span className="text-[8px] font-bold text-gray-600 mt-1">200x200px recommended</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Localization Support</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['English', 'Hindi', 'Marathi', 'Tamil', 'French', 'Spanish'].map(lang => (
                         <button 
                           key={lang}
                           onClick={() => toggleLang(lang)}
                           className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${activeLanguages.includes(lang) ? 'bg-orange-500/10 border-orange-500/30 text-orange-600' : 'bg-black/5 dark:bg-white/5 border-white/5 text-gray-500'}`}
                         >
                           {lang}
                           {activeLanguages.includes(lang) && <Check size={12} strokeWidth={4} />}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Welcome Greeting (Interactive Screen)</label>
                    <textarea 
                       rows={4}
                       value={welcomeMsg}
                       onChange={(e) => setWelcomeMsg(e.target.value)}
                       className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-black dark:text-white focus:outline-none focus:border-orange-500/50 resize-none shadow-inner leading-relaxed"
                       placeholder="Enter message..."
                    />
                  </div>
                  <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
                     <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <Languages size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Translation Active</span>
                     </div>
                     <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                        Our AI engine will automatically translate your custom welcome greeting for all enabled languages.
                     </p>
                  </div>
               </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Hardware Registry (Read-only reference) */}
        <div className="xl:col-span-4 space-y-6">
          <GlassCard className="sticky top-24">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Monitor size={20} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Assigned Hardware</h3>
               </div>
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{assignedKiosks.length} Units</span>
            </div>

            <div className="space-y-4 mb-8">
               {assignedKiosks.map((k) => (
                 <div key={k.id} className="p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 group">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="text-sm font-black dark:text-white">{k.label}</h4>
                             <Edit3 size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer" />
                          </div>
                          <p className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">{k.id}</p>
                       </div>
                       <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${k.status === 'online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${k.status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_currentColor]' : 'bg-red-500'}`}></div>
                          {k.status}
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
                           <Clock size={10} /> {k.lastSeen}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold dark:text-gray-400 uppercase">
                           <Signal size={10} className="text-emerald-500" /> Excellent
                        </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-5 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex gap-4">
                <ShieldCheck size={24} className="text-orange-600 shrink-0" />
                <p className="text-[10px] font-medium text-orange-800 dark:text-orange-500 leading-relaxed">
                   Hardware inventory is managed by the platform provider. To add or decommission a kiosk, please contact support.
                </p>
            </div>
            
            <button className="w-full mt-6 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
               Raise Hardware Ticket
            </button>
          </GlassCard>

          <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Zap size={28} fill="currentColor" />
              </div>
              <div>
                  <h4 className="text-sm font-black leading-tight mb-1 uppercase italic tracking-tighter">Pro-Tip</h4>
                  <p className="text-[11px] font-medium opacity-90 leading-relaxed">
                      Hotels with Self Check-Out enabled see 15% faster turnaround on "Clean & Vacant" rooms.
                  </p>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const IndianRupee = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3h12"/>
    <path d="M6 8h12"/>
    <path d="m6 13 8.5 8"/>
    <path d="M6 13h3"/>
    <path d="M9 13c6.667 0 6.667-10 0-10"/>
  </svg>
);

export default KioskSettings;
