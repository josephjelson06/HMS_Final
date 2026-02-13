import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Bell, Globe, Camera, ShieldCheck, Save, ClipboardList, CheckCircle2, History } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

const StaffProfile: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">My Terminal Access</h1>
          <p className="text-sm font-bold text-gray-500 font-bold uppercase tracking-widest mt-1">Staff Profile & Operational Preferences</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
          <Save size={18} strokeWidth={3} />
          Commit Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Staff Identity */}
        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="flex flex-col items-center text-center p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner overflow-hidden border-4 border-white dark:border-white/10">
                <img src="https://ui-avatars.com/api/?name=Riya+Mehta&background=f97316&color=fff&size=128" alt="Profile" />
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-2xl font-black dark:text-white tracking-tighter uppercase mb-1">Riya Mehta</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-orange-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">General Manager</p>
            
            <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Employee ID</span>
                  <span className="dark:text-white font-mono">STAFF-7701</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Joined On</span>
                  <span className="dark:text-white">12 Jan 2025</span>
               </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><History size={20} /></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Session History</h3>
            </div>
            <div className="space-y-4">
                {[
                    { t: 'Today, 08:00 AM', d: 'Chrome • Desk Terminal 1' },
                    { t: 'Yesterday, 02:45 PM', d: 'Safari • iPhone 15 Pro' }
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                        <p className="text-xs font-black dark:text-white mb-1">{s.t}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{s.d}</p>
                    </div>
                ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Information & Notification Matrix */}
        <div className="lg:col-span-8 space-y-8">
          {/* Identity Form */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><User size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Personal Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Full Legal Name</label>
                <input type="text" defaultValue="Riya Mehta" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Work Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" defaultValue="riya.m@sapphire.com" className={`${inputClass} pl-11`} readOnly />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact Mobile</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" defaultValue="+91 98860 32101" className={`${inputClass} pl-11`} />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Security Deck */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><Lock size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Security & Access</h3>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>New Secret Password</label>
                  <input type="password" placeholder="••••••••••••" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Repeat Password</label>
                  <input type="password" placeholder="••••••••••••" className={inputClass} />
                </div>
              </div>
              
              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">Require an SMS code for every terminal login</p>
                </div>
                <button 
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${is2FAEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Operational Notification Matrix */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Bell size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Operational Notification Matrix</h3>
            </div>
            <div className="space-y-3">
              {[
                { id: 'checkin', label: 'Guest Arrival Alerts', desc: 'Real-time notification when a guest checks in', default: true },
                { id: 'hk', label: 'Housekeeping Updates', desc: 'Alerts when room status changes (Dirty to Clean)', default: false },
                { id: 'incident', label: 'Incident Assignments', desc: 'Direct notification for maintenance tickets assigned to you', default: true },
                { id: 'night', label: 'End-of-Day Summary', desc: 'Daily summary report of property revenue and occupancy', default: true }
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-5 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group">
                  <div className="flex-1 pr-10">
                    <h4 className="text-sm font-black dark:text-white uppercase tracking-tight">{notif.label}</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5 tracking-wide">{notif.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={notif.default} />
                    <div className={`w-9 h-5 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all shadow-inner`}></div>
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;