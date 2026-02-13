import React from 'react';
import { Send, Camera, Monitor, ChevronDown, Plus, AlertCircle, Terminal } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';

interface KioskSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  kioskId: string;
}

const inputClass = `w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const KioskSupportTicketModal: React.FC<KioskSupportTicketModalProps> = ({ isOpen, onClose, kioskId }) => {
  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400`;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Initialize Hardware Ticket"
      subtitle="Direct Engineering Escalation"
      footer={
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 text-emerald-500">
             <AlertCircle size={16} />
             <span className="text-[10px] font-bold uppercase tracking-tight">Assigned to Hardware Engineering</span>
           </div>
           <div className="flex gap-4">
             <Button variant="ghost" onClick={onClose}>Discard</Button>
             <Button variant="action" icon={<Send size={18} />}>
               Initialize Ticket
             </Button>
           </div>
        </div>
      }
    >
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
             <label className={labelClass}>Infrastructure Node</label>
             <div className="p-4 rounded-xl bg-accent-strong/10 border border-accent-strong/20 flex items-center gap-3">
                <Monitor size={16} className="text-accent" />
                <span className="text-xs font-bold text-accent font-mono">{kioskId}</span>
             </div>
          </div>
          <div>
             <label className={labelClass}>Escalation Level</label>
             <div className="relative">
                <select className={`${inputClass} appearance-none pr-10`}>
                   <option>Normal — Maintenance</option>
                   <option>High — Process Degraded</option>
                   <option selected>Critical — Unit Offline</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
             </div>
          </div>
          <div className="col-span-2">
             <label className={labelClass}>Forensic Subject</label>
             <input type="text" defaultValue={`Unscheduled Uptime Loss on ${kioskId}`} className={inputClass} />
          </div>
          <div className="col-span-2">
             <label className={labelClass}>Detailed Technical Observation</label>
             <textarea rows={4} placeholder="Include any specific error codes or patterns observed in the telemetry logs..." className={inputClass} />
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-xl bg-black/20 text-gray-500 group-hover:text-white transition-colors">
                    <Camera size={24} />
                 </div>
                 <div>
                    <p className="text-sm font-bold dark:text-white leading-none mb-1">Hardware Snap</p>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Physical Evidence</p>
                 </div>
              </div>
              <Plus size={20} className="text-gray-500" />
           </div>
           <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-xl bg-black/20 text-gray-500 group-hover:text-white transition-colors">
                    <Terminal size={24} />
                 </div>
                 <div>
                    <p className="text-sm font-bold dark:text-white leading-none mb-1">Diagnostic Log</p>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Automated Capture</p>
                 </div>
              </div>
              <Plus size={20} className="text-gray-500" />
           </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default KioskSupportTicketModal;