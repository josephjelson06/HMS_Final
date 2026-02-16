import React from 'react';
import { 
  LifeBuoy, CheckCircle2, 
  Monitor, X, Clock, ShieldAlert,
  HelpCircle, Info, ChevronRight
} from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import type { HotelTicket as Ticket } from '@/domain/entities/HotelTicket';

interface HotelTicketDetailModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
}

const HotelTicketDetailModal: React.FC<HotelTicketDetailModalProps> = ({ isOpen, ticket, onClose }) => {
  if (!ticket) return null;


  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      hideHeader
    >
      <div className="flex h-[75vh]">
        {/* Main Briefing Panel (Left) */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/5 dark:bg-black/20">
           {/* Header */}
           <div className="px-8 py-8 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-6">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl ${
                    ticket.priority === 'Critical' ? 'bg-red-600 shadow-red-900/40' : 'bg-accent-strong shadow-accent-strong/40'
                 }`}>
                    <LifeBuoy size={36} />
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">{ticket.id}</h2>
                       <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-black/10 dark:bg-white/10 dark:text-gray-400 border border-white/5">{ticket.status}</span>
                    </div>
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">Platform Support Ticket</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={28} /></button>
              </div>
           </div>

           {/* Core Ticket Content */}
           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="space-y-10">
                {/* Subject Section */}
                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-accent rounded-full"></div> Ticket Subject
                   </h3>
                   <h1 className="text-2xl font-black dark:text-white leading-tight">
                      {ticket.subject}
                   </h1>
                </div>

                {/* Problem Description Body */}
                <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.03] border border-white/5 relative overflow-hidden group min-h-[250px]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LifeBuoy size={120} />
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Original Reported Description</h3>
                    <p className="text-lg font-medium dark:text-gray-300 leading-relaxed relative z-10 italic">
                      "{ticket.description || 'No detailed description provided for this ticket.'}"
                    </p>
                </div>

                {/* Engagement Notice */}
                <div className="flex items-start gap-4 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                    <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">One-Way Transmission</p>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tight">
                        This ticket has been transmitted to the ATC Platform Team. Updates will be reflected in the ticket status above as our engineers process the request.
                      </p>
                    </div>
                </div>
              </div>
           </div>
        </div>

        {/* Support Intelligence Sidebar (Right) */}
        <div className="w-80 bg-white dark:bg-transparent border-l border-white/10 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           
           {/* Context Metadata */}
           <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Ticket Metadata</h3>
              <div className="space-y-4">
                 <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</p>
                    <div className="flex items-center gap-2">
                       <Monitor size={16} className="text-accent-strong" />
                       <span className="text-xs font-black dark:text-white uppercase tracking-wider">{ticket.category}</span>
                    </div>
                 </div>
                 <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Assessed Priority</p>
                    <div className="flex items-center gap-2">
                       <ShieldAlert size={16} className={ticket.priority === 'Critical' ? 'text-red-500' : 'text-accent'} />
                       <span className={`text-xs font-black uppercase tracking-wider ${ticket.priority === 'Critical' ? 'text-red-500' : 'text-accent'}`}>{ticket.priority}</span>
                    </div>
                 </div>
                 <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Reported On</p>
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-gray-500" />
                       <span className="text-xs font-black dark:text-white uppercase tracking-tighter">{ticket.createdAt}</span>
                    </div>
                 </div>
              </div>
           </section>

           {/* ATC Assignment */}
           <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Platform Engineer</h3>
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                 <div className="w-12 h-12 rounded-2xl bg-accent-strong/10 flex items-center justify-center text-accent-strong font-black text-sm border border-accent-strong/10">
                    VP
                 </div>
                 <div>
                    <h4 className="text-xs font-black dark:text-white">Vikram Patel</h4>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Assigned Agent</p>
                 </div>
              </div>
           </section>

           {/* Resolution Control */}
           {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
              <div className="pt-10 border-t border-white/10 space-y-3">
                 <button className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-emerald-500/20">
                    <CheckCircle2 size={16} /> Mark as Resolved
                 </button>
                 <p className="text-[9px] text-center text-gray-500 font-bold uppercase tracking-[0.1em] opacity-80 leading-relaxed px-4"> Mark resolved only if the platform team has verified the fix.</p>
              </div>
           )}

           {/* Documentation Link Placeholder */}
           <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all mt-auto">
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Internal Reference</p>
                <p className="text-[10px] font-bold dark:text-gray-300">View Platform Docs</p>
              </div>
              <ChevronRight size={14} className="text-gray-700 group-hover:translate-x-1 transition-all" />
           </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default HotelTicketDetailModal;
