
import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Bell, Globe, Camera, ShieldCheck, Check, Save } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useUsers } from '../../../application/hooks/useUsers';

const AdminProfile: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { users } = useUsers();
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const primaryAdmin = users.find((u) => u.role.toLowerCase().includes('super')) ?? users[0];
  const fullName = primaryAdmin?.name ?? 'Vikram Patel';
  const email = primaryAdmin?.email ?? 'vikram@atc.com';
  const mobile = primaryAdmin?.mobile ?? primaryAdmin?.phone ?? '+91 99988 77766';
  const roleLabel = primaryAdmin?.role ?? 'Super Admin';
  const avatarUrl = primaryAdmin?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=128`;

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-accent/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-accent/50 focus:ring-2 focus:ring-accent/10'
    }`;
    
  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Account Settings</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your personal profile & preferences</p>
        </div>
        <button className="flex items-center gap-2 bg-accent-strong text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo & Basic Identity */}
        <div className="space-y-8">
          <GlassCard className="flex flex-col items-center text-center p-10">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-100 to-blue-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-accent-strong dark:text-gray-300 shadow-inner overflow-hidden border-4 border-white dark:border-white/10">
                <img src={avatarUrl} alt="Profile" />
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black dark:text-white mb-1">{fullName}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent-strong">{roleLabel} (Root Access)</p>
            <div className="mt-6 pt-6 border-t border-white/10 w-full">
               <div className="flex items-center justify-center gap-2 text-emerald-500">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verified Identity</span>
               </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Language & Region</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Preferred Language</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <select className={`${inputClass} pl-11 appearance-none cursor-pointer`}>
                    <option>English (United States)</option>
                    <option>Hindi (India)</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Columns: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-blue-500/10 text-accent"><User size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Full Legal Name</label>
                <input type="text" defaultValue={fullName} className={inputClass} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" defaultValue={email} className={`${inputClass} pl-11`} readOnly />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" defaultValue={mobile} className={`${inputClass} pl-11`} />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Security & 2FA */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-accent-muted text-accent"><Lock size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Security Controls</h3>
            </div>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 md:items-end">
                <div className="flex-1">
                  <label className={labelClass}>New Password</label>
                  <input type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Confirm New Password</label>
                  <input type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className={inputClass} />
                </div>
                <button className="px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                  Update Password
                </button>
              </div>
              
              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-500">Secure your account with an OTP code on login</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={is2FAEnabled} 
                    onChange={() => setIs2FAEnabled(!is2FAEnabled)} 
                  />
                  <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </GlassCard>

          {/* Notification Preferences */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Bell size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Notification Matrix</h3>
            </div>
            <div className="space-y-2">
              {[
                { id: 'crit', label: 'Critical Kiosk Events', desc: 'Hardware failures or connectivity loss > 1hr', default: true },
                { id: 'inv', label: 'Overdue Invoices', desc: 'Alerts when a client is 7+ days past due', default: true },
                { id: 'tenant', label: 'New Tenant Signups', desc: 'Notify when a new hotel self-registers', default: false },
                { id: 'sys', label: 'System Maintenance', desc: 'Scheduled maintenance windows & updates', default: true }
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                  <div>
                    <h4 className="text-xs font-bold dark:text-white">{notif.label}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">{notif.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={notif.default} />
                    <div className={`w-9 h-5 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent-strong after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
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

export default AdminProfile;
