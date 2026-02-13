import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Monitor, RefreshCw, Power, ShieldAlert, Cpu, HardDrive, 
  Thermometer, Terminal, Play, Save, Activity, Signal, Zap, 
  CheckCircle2, AlertCircle, XCircle, Printer, Camera, Scan, CreditCard,
  Unlink, FileQuestion, ChevronRight
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import UnmapKioskModal from '../../modals/super/UnmapKioskModal';
import KioskSupportTicketModal from '../../modals/super/KioskSupportTicketModal';

interface KioskDetailProps {
  kioskId: string;
  onBack: () => void;
}

const TelemetryGauge = ({ label, value, unit, color, percentage }: any) => (
  <div className="flex flex-col gap-3">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black dark:text-white">{value}{unit}</span>
    </div>
    <div className="h-2 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const PeripheralItem = ({ icon: Icon, name, status, detail }: any) => {
  const statusStyles = {
    ok: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-500 bg-red-500/10 border-red-500/20',
    offline: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  };
  const Icons = {
    ok: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
    offline: AlertCircle,
  };
  const StatusIcon = Icons[status as keyof typeof Icons];
  
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-white/5 dark:text-gray-400">
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold dark:text-white leading-none mb-1">{name}</h4>
          <p className="text-[10px] text-gray-500 font-medium">{detail}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusStyles[status as keyof typeof statusStyles]}`}>
        <StatusIcon size={12} />
        <span className="text-[9px] font-bold uppercase tracking-wider">{status}</span>
      </div>
    </div>
  );
};

const KioskDetail: React.FC<KioskDetailProps> = ({ kioskId, onBack }) => {
  const { isDarkMode } = useTheme();
  const [isUnmapModalOpen, setIsUnmapModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [logs, setLogs] = useState<any[]>([
    { t: '07:42 AM', type: 'ERROR', msg: 'Network timeout after 3 retries', color: 'text-red-500' },
    { t: '07:41 AM', type: 'SYNC', msg: 'Guest check-in #GR-8891 synced', color: 'text-emerald-500' },
    { t: '07:38 AM', type: 'HEARTBEAT', msg: 'All systems normal', color: 'text-gray-500' },
    { t: '06:15 AM', type: 'PERIPHERAL', msg: 'Paper roll below 20%', color: 'text-amber-500' },
    { t: '02:00 AM', type: 'SYSTEM', msg: 'Auto-maintenance cycle complete', color: 'text-accent' },
  ]);

  const handleUnmapConfirm = () => {
    // Logic for unmapping would go here
    setIsUnmapModalOpen(false);
    onBack();
  };

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Remote Nav & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          EXIT COMMAND CENTER
        </button>
        <div className="flex gap-2">
           <button className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2 border border-red-500/20">
            <Power size={14} />
            Force Restart
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-accent text-white text-[10px] font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <RefreshCw size={14} />
            Push Firmware
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Telemetry Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity & Network Status */}
          <GlassCard className="flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center text-white shadow-2xl border border-white/20">
                <Monitor size={40} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black dark:text-white tracking-tighter">{kioskId}</h1>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20">Online</span>
                </div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Hotel Sapphire • Main Lobby</p>
              </div>
            </div>
            <div className="flex gap-8 relative z-10">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Heartbeat</p>
                <div className="flex items-center gap-2 text-emerald-500 font-black">
                   <Zap size={14} fill="currentColor" />
                   <span className="text-lg">2m 14s ago</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Uptime</p>
                <p className="text-lg font-black dark:text-white">14d 2h 11m</p>
              </div>
            </div>
          </GlassCard>

          {/* Core Health Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Connection & Network</h3>
                <div className="space-y-8">
                    <TelemetryGauge label="Signal Strength" value="-42" unit="dBm" color="bg-emerald-500" percentage={85} />
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <Signal size={20} className="text-emerald-500" />
                            <div>
                                <p className="text-xs font-bold dark:text-white">Connection Type</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Wi-Fi (WPA3 Enterprise)</p>
                            </div>
                        </div>
                        <span className="text-xs font-black dark:text-white">Stable</span>
                    </div>
                </div>
            </GlassCard>

            <GlassCard>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Hardware Environment</h3>
                <div className="space-y-8">
                    <TelemetryGauge label="CPU Temperature" value="42" unit="°C" color="bg-emerald-500" percentage={45} />
                    <TelemetryGauge label="UPS Battery" value="98" unit="%" color="bg-emerald-500" percentage={98} />
                </div>
            </GlassCard>
          </div>

          {/* Event Log Terminal */}
          <GlassCard className="flex flex-col h-[400px]" noPadding>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-black/5">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-gray-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Forensic System Events</h3>
              </div>
              <button className="text-[10px] font-black text-accent-strong uppercase tracking-widest hover:underline">Download full log</button>
            </div>
            <div className="flex-1 bg-[#0a0a0b] p-6 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="mb-2 group flex gap-4">
                  <span className="opacity-30 shrink-0">{log.t}</span>
                  <span className={`font-black shrink-0 w-24 ${log.color}`}>[{log.type}]</span>
                  <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{log.msg}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Diagnostics Column */}
        <div className="space-y-6">
          
          {/* Peripheral Checklist */}
          <GlassCard className="h-full">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Peripheral Health</h3>
            <div className="space-y-3">
              <PeripheralItem icon={Printer} name="Thermal Printer" status="warning" detail="42% Paper Remaining" />
              <PeripheralItem icon={Camera} name="Face Camera" status="ok" detail="1080p Stream Active" />
              <PeripheralItem icon={Scan} name="ID Scanner" status="ok" detail="Aadhar/PAN Optimized" />
              <PeripheralItem icon={CreditCard} name="Card Reader" status="offline" detail="Device Disconnected" />
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Critical Actions</h3>
                 <div className="space-y-3">
                     <button 
                       onClick={() => setIsUnmapModalOpen(true)}
                       className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-bold border border-white/5 group"
                     >
                        <span className="flex items-center gap-2"><Unlink size={16} className="opacity-50 group-hover:opacity-100" /> Unmap from Hotel</span>
                        <ChevronRight size={14} className="opacity-30" />
                     </button>
                     <button 
                       onClick={() => setIsTicketModalOpen(true)}
                       className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 hover:bg-accent-muted hover:text-accent transition-all text-sm font-bold border border-white/5 group"
                     >
                        <span className="flex items-center gap-2"><FileQuestion size={16} className="opacity-50 group-hover:opacity-100" /> Raise Support Ticket</span>
                        <ChevronRight size={14} className="opacity-30" />
                     </button>
                 </div>
            </div>
          </GlassCard>

          {/* Hardware Identity Card */}
          <GlassCard className="bg-gradient-to-br from-gray-900 to-black text-white border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Physical Specs</h3>
            <div className="space-y-4">
              {[
                { l: 'MAC Address', v: '00:1B:44:11:3A:B7' },
                { l: 'Serial No', v: 'SN-2024-X492-B' },
                { l: 'Processor', v: 'Octa-core AI SoC' },
                { l: 'Deployment', v: 'Oct 12, 2024' },
                { l: 'Firmware', v: 'v2.1.4 (Stable)' }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{spec.l}</span>
                  <span className="text-xs font-mono font-bold">{spec.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>

      <UnmapKioskModal 
        isOpen={isUnmapModalOpen} 
        onClose={() => setIsUnmapModalOpen(false)} 
        onConfirm={handleUnmapConfirm}
        kioskId={kioskId}
        hotelName="Hotel Sapphire"
      />

      <KioskSupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
        kioskId={kioskId}
      />
    </div>
  );
};

export default KioskDetail;