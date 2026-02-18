import React from 'react';
import { 
  ShieldAlert, DoorOpen, User, 
  CheckCircle2, 
  Camera, X,
  ChevronRight
} from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import type { DetachedIncident as Incident } from '@/application/hooks/_detachedTypes';

interface IncidentDetailModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onUpdate?: (id: string, data: Partial<Incident>) => Promise<void>;
}

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ isOpen, incident, onClose, onUpdate }) => {
  if (!incident) return null;

  const handleStatusChange = async (newStatus: 'Resolved' | 'Closed') => {
    if (onUpdate && incident) {
        await onUpdate(incident.id, { status: newStatus });
        onClose();
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      hideHeader
    >
      <div className="flex h-[80vh]">
        {/* Main Briefing Panel (Left) */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/5 dark:bg-black/20">
           {/* Header */}
           <div className="px-8 py-8 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-6">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl ${
                    incident.priority === 'Critical' ? 'bg-red-600 shadow-red-900/40' : 'bg-accent'
                 }`}>
                    <ShieldAlert size={36} />
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">{incident.id}</h2>
                       <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-black/10 dark:bg-white/10 dark:text-gray-400 border border-white/5">{incident.status}</span>
                    </div>
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">Operational Incident Briefing</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={28} /></button>
              </div>
           </div>

           {/* Core Issue Content */}
           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="space-y-10">
                {/* Subject Section */}
                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                      <div className="w-1 h-3 bg-accent rounded-full"></div> Case Subject
                   </h3>
                   <h1 className="text-2xl font-black dark:text-white leading-tight">
                      {incident.subject}
                   </h1>
                </div>

                {/* Description Body */}
                <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldAlert size={80} />
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Problem Description</h3>
                    <p className="text-lg font-medium dark:text-gray-300 leading-relaxed relative z-10 italic">
                      "{incident.description || 'No detailed description provided for this incident.'}"
                    </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Timestamp</p>
                      <p className="text-sm font-black dark:text-white">
                        {new Date(incident.createdAt).toLocaleString()}
                      </p>
                   </div>
                   <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</p>
                      <p className="text-sm font-black dark:text-accent uppercase tracking-wider">{incident.category}</p>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Intelligence Sidebar (Right) */}
        <div className="w-80 bg-white shadow-2xl dark:bg-transparent dark:shadow-none border-l border-white/10 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           
           {/* Linked Entities */}
           <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Linked Infrastructure</h3>
              <div className="space-y-3">
                 <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/20 border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-accent/30 transition-all">
                    <div className="p-2 rounded-xl bg-accent/10 text-accent"><DoorOpen size={18} /></div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-bold dark:text-white leading-none">Room #{incident.room}</h4>
                       <p className="text-[9px] font-medium text-gray-500 uppercase mt-1">Deluxe Double</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                 </div>
                 {incident.bookingRef && (
                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/20 border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-accent/30 transition-all">
                       <div className="p-2 rounded-xl bg-accent-muted text-accent"><User size={18} /></div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold dark:text-white leading-none truncate">{incident.guestName}</h4>
                          <p className="text-[9px] font-medium text-gray-500 uppercase mt-1">{incident.bookingRef}</p>
                       </div>
                       <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                 )}
              </div>
           </section>

           {/* SLA Assessment */}
           <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">SLA Status</h3>
              <div className={`p-6 rounded-[2rem] border border-white/5 ${incident.slaBreached ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-medium text-gray-500 uppercase">Status</span>
                    <span className={`text-[10px] font-bold uppercase ${incident.slaBreached ? 'text-red-500' : 'text-emerald-500'}`}>
                        {incident.slaBreached ? 'Breached' : 'On Track'}
                    </span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-400">
                    {incident.slaBreached 
                        ? 'Resolution time has exceeded the service level agreement.' 
                        : 'Incident is being handled within the expected timeframe.'}
                 </p>
              </div>
           </section>

           {/* Ownership */}
           <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Operational Owner</h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                 <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent-strong font-bold text-xs">
                    {incident.assignedTo.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div>
                    <h4 className="text-xs font-bold dark:text-white">{incident.assignedTo}</h4>
                    <p className="text-[9px] font-medium text-gray-500 uppercase">On Shift</p>
                 </div>
              </div>
              <button className="w-full mt-3 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Reassign Ticket</button>
           </section>

           {/* Final Resolution Control */}
           <div className="pt-10 border-t border-white/10 flex flex-col gap-3">
              <button 
                onClick={() => handleStatusChange('Resolved')}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                 <CheckCircle2 size={16} /> Resolve Incident
              </button>
              <button 
                onClick={() => handleStatusChange('Closed')}
                className="w-full py-3 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                 Close Ticket
              </button>
           </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default IncidentDetailModal;
