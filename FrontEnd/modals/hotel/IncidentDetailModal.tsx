import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, ShieldAlert, Clock, User, DoorOpen, Link as LinkIcon, 
  CheckCircle2, AlertCircle, MessageSquare, 
  Send, Paperclip, Camera, ShieldCheck, Wrench, Info,
  ChevronRight, ArrowRight
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { Incident } from '../../data/incidents';

interface IncidentDetailModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
}

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ isOpen, incident, onClose }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen || !incident) return null;

  const messages = [
    { sender: 'Riya Mehta', text: "Raised critical alert. Room 412 guest called Front Desk — ceiling is leaking near the AC unit.", time: '03:15 PM', isStaff: true },
    { sender: 'Suresh K. (Maint)', text: "On the way. Investigating Floor 5 for source leak.", time: '03:32 PM', isStaff: true },
    { sender: 'Suresh K. (Maint)', text: "Found source: Valve failure in Room 512 bathroom. Shutting off main supply for North Wing Floor 4/5.", time: '03:45 PM', isStaff: true },
  ];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10 flex h-[85vh]">
          
          {/* Main Investigation Panel (Left) */}
          <div className="flex-1 flex flex-col min-w-0">
             {/* Header */}
             <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                      incident.priority === 'Critical' ? 'bg-red-600 shadow-red-900/40' : 'bg-orange-500'
                   }`}>
                      <ShieldAlert size={32} />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">{incident.id}</h2>
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-black/10 dark:bg-white/10 dark:text-gray-400 border border-white/5`}>{incident.status}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">{incident.subject}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"><Camera size={20} /></button>
                   <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={24} /></button>
                </div>
             </div>

             {/* Tab Content Area */}
             <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-4 bg-black/10 border-b border-white/5">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Resolution Thread</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 mb-8">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Issue Detail</p>
                        <p className="text-sm font-medium dark:text-gray-300 leading-relaxed italic">"{incident.description}"</p>
                    </div>
                    <div className="space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.sender === 'Riya Mehta' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1.5 px-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{m.sender}</span>
                                <span className="text-[8px] font-bold text-gray-400">{m.time}</span>
                                </div>
                                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed ${
                                m.sender === 'Riya Mehta' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-black/5 dark:bg-white/5 dark:text-gray-200 border border-white/5 rounded-tl-none'
                                }`}>
                                {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Input */}
                <div className="p-6 border-t border-white/5 bg-black/5">
                   <div className="relative group">
                      <textarea 
                        rows={2} 
                        placeholder="Add note or update maintenance team..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-16 text-sm dark:text-white focus:outline-none focus:border-orange-500/50 resize-none transition-all"
                      />
                      <div className="absolute right-3 bottom-3 flex gap-1">
                         <button className="p-2.5 rounded-xl hover:bg-white/10 text-gray-500"><Paperclip size={18} /></button>
                         <button className="p-2.5 rounded-xl bg-orange-600 text-white shadow-lg"><Send size={18} /></button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Incident Intelligence Sidebar (Right) */}
          <div className="w-80 bg-black/10 dark:bg-white/[0.02] border-l border-white/10 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             
             {/* Linked Entities Mapping */}
             <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Linked Infrastructure</h3>
                <div className="space-y-3">
                   <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-blue-500/30 transition-all">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><DoorOpen size={18} /></div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-xs font-black dark:text-white leading-none">Room #{incident.room}</h4>
                         <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">Deluxe Double</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                   </div>
                   {incident.bookingRef && (
                      <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-orange-500/30 transition-all">
                         <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><User size={18} /></div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black dark:text-white leading-none truncate">{incident.guestName}</h4>
                            <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">{incident.bookingRef}</p>
                         </div>
                         <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                   )}
                </div>
             </section>

             {/* SLA Assessment */}
             <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">SLA Status</h3>
                <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Target (Critical)</span>
                      <span className="text-[10px] font-black dark:text-white">60 Minutes</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-emerald-500 w-[42%]"></div>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Time Elasped</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase italic">On-Track</span>
                   </div>
                </div>
             </section>

             {/* Ownership */}
             <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Operational Owner</h3>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                   <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-xs">SK</div>
                   <div>
                      <h4 className="text-xs font-black dark:text-white">{incident.assignedTo}</h4>
                      <p className="text-[9px] font-bold text-gray-500 uppercase">On Shift</p>
                   </div>
                </div>
                <button className="w-full mt-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Reassign Ticket</button>
             </section>

             {/* Final Resolution Control */}
             <div className="pt-10 border-t border-white/10 flex flex-col gap-3">
                <button className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                   <CheckCircle2 size={16} /> Resolve Incident
                </button>
                <button className="w-full py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                   Close Ticket
                </button>
             </div>

          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default IncidentDetailModal;