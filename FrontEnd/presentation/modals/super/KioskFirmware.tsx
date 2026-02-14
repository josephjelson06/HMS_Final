import React, { useState } from 'react';
import { 
  Binary, Plus, Clock, Download, ShieldCheck, 
  Binary as BinaryIcon, Search, Filter, MoreVertical,
  CheckCircle2, AlertTriangle, Cpu, Zap, Activity
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassDropdown from '../../components/ui/GlassDropdown';
import AddFirmwareModal from './AddFirmwareModal';
import type { FirmwareRelease } from '@/domain/entities/Kiosk';
import { useKiosks } from '@/application/hooks/useKiosks';

const KioskFirmware: React.FC = () => {
  const { firmware: allFirmware } = useKiosks();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const StatusBadge = ({ status }: { status: FirmwareRelease['status'] }) => {
    const styles = {
      Published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Archived: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      Deprecated: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const ChannelBadge = ({ channel }: { channel: FirmwareRelease['channel'] }) => {
    const styles = {
      Stable: 'bg-accent-strong text-white shadow-blue-500/20',
      Beta: 'bg-purple-600 text-white shadow-purple-500/20',
      Alpha: 'bg-accent-strong text-white shadow-accent/20',
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg ${styles[channel]}`}>
        {channel}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Latest Stable" 
          value="v2.2.1" 
          subtext="Released 1 day ago" 
          icon={Binary} 
          color="text-emerald-500"
        />
        <SummaryCard 
          title="Fleet Coverage" 
          value="94%" 
          subtext="v2.2+ adoption rate" 
          icon={Activity} 
          color="text-accent"
        />
        <SummaryCard 
          title="Beta Testing" 
          value="02 Units" 
          subtext="Active RC-1 builds" 
          icon={Zap} 
          color="text-purple-500"
        />
        <SummaryCard 
          title="Auto-Update" 
          value="Enabled" 
          subtext="Global maintenance mode" 
          icon={ShieldCheck} 
          color="text-emerald-500"
        />
      </div>

      {/* Release Management Table */}
      <GlassCard noPadding className="overflow-hidden border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-black/5 dark:bg-white/[0.02]">
           <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                    placeholder="Search version or channel..."
                  />
              </div>
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors">
                <Filter size={14} /> Filter Releases
              </button>
           </div>
           
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="w-full md:w-auto flex items-center justify-center gap-2 bg-accent-strong text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
           >
              <Plus size={18} strokeWidth={3} />
              Upload New Build
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/10 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/10">
                <th className="px-10 py-5">Version Identifier</th>
                <th className="px-8 py-5">Release Channel</th>
                <th className="px-8 py-5">Publication Date</th>
                <th className="px-8 py-5">Hardware Logic</th>
                <th className="px-8 py-5 text-center">Coverage</th>
                <th className="px-8 py-5">Lifecycle Status</th>
                <th className="px-8 py-5 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allFirmware.map((f) => (
                <tr key={f.version} className="hover:bg-white/5 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-accent transition-colors">
                            <BinaryIcon size={20} />
                        </div>
                        <span className="text-sm font-black dark:text-white font-mono uppercase tracking-tighter">{f.version}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <ChannelBadge channel={f.channel} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Clock size={14} />
                        {f.releaseDate}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold uppercase text-gray-400">{f.compatibility}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                        <span className="text-sm font-black dark:text-white">{f.activeDevices} Units</span>
                        <div className="h-1 w-16 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-accent" style={{ width: `${(f.activeDevices / 65) * 100}%` }}></div>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-8 py-6 text-right pr-10">
                    <GlassDropdown 
                      trigger={<button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-all"><MoreVertical size={20} /></button>}
                      items={[
                        { icon: Download, label: 'Download Binary', onClick: () => {} },
                        { icon: Activity, label: 'Release Notes', onClick: () => {} },
                        { icon: ShieldCheck, label: 'Verify Checksum', onClick: () => {}, hasSeparatorAfter: true },
                        { icon: AlertTriangle, label: 'Deprecate Build', onClick: () => {}, variant: 'danger' }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Forge Policy Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white shadow-2xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Binary size={32} />
            </div>
            <div>
                <h4 className="text-sm font-black leading-tight mb-1 uppercase tracking-tight">Code Signing Authority</h4>
                <p className="text-[11px] font-medium opacity-80 leading-relaxed">
                    All firmware binaries are cryptographically signed using platform keys. Kiosks will reject any unverified OTA payloads.
                </p>
            </div>
         </div>
         <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={24} /></div>
               <div>
                  <h4 className="text-xs font-black dark:text-white uppercase tracking-widest">Global Patch Window</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Automatic: Sunday 02:00 AM IST</p>
               </div>
            </div>
            <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase text-gray-400 hover:text-white transition-all">Reschedule</button>
         </div>
      </div>

      <AddFirmwareModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

const SummaryCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <GlassCard className="flex flex-col justify-between h-36 border-white/5 bg-black/5 dark:bg-white/[0.01]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black dark:text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl bg-black/5 dark:bg-white/5 ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-gray-500 uppercase">{subtext}</p>
  </GlassCard>
);

export default KioskFirmware;
