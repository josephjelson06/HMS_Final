
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, LifeBuoy, Clock, CheckCircle2, MessageSquare, 
  Send, Paperclip, ChevronRight, Monitor, HelpCircle,
  History, Camera, ShieldCheck
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { HotelTicket as Ticket } from '../../data/hotelHelp';

interface HotelTicketDetailModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
}

const HotelTicketDetailModal: React.FC<HotelTicketDetailModalProps> = ({ isOpen, ticket, onClose }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen || !ticket) return null;

  const messages = [
    { sender: 'Riya Mehta (Hotel)', text: ticket.description, time: ticket.createdAt, isMe: true },
    { sender: 'Vikram (ATC Support)', text: "Hi Riya, I see the error on Kiosk-1. We are pushing a remote recalibration to the printer motor now. Can you check if the paper tray is seated correctly?", time: '10 Feb, 11:30 AM', isMe: false },
  ];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10 flex h-[80vh]">
          
          {/* Main Resolution Panel (Left) */}
          <div className="flex-1 flex flex-col min-w-0">
             {/* Header */}
             <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${
                      ticket.priority === 'Critical' ? 'bg-red-600' : 'bg-blue-600'
                   }`}>
                      <LifeBuoy size={32} />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">{ticket.id}</h2>
                         <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-black/10 dark:bg-white/10 dark:text-gray-400 border border-white/5">{ticket.status}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest truncate max-w-md">{ticket.subject}</p>
                   </div>
                </div>
                <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={24} /></button>
             </div>

             {/* Thread Area */}
             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 mb-8">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Original Issue Detail</p>
                   <p className="text-sm font-medium dark:text-gray-300 leading-relaxed italic">"{ticket.description}"</p>
                </div>

                <div className="space-y-6">
                   {messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                         <div className="flex items-center gap-2 mb-1.5 px-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{m.sender}</span>
                            <span className="text-[8px] font-bold text-gray-400">{m.time}</span>
                         </div>
                         <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                            m.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-black/5 dark:bg-white/5 dark:text-gray-200 border border-white/5 rounded-tl-none'
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
                     placeholder="Reply to ATC support team..." 
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-16 text-sm dark:text-white focus:outline-none focus:border-blue-500/50 resize-none transition-all"
                   />
                   <div className="absolute right-3 bottom-3 flex gap-1">
                      <button className="p-2.5 rounded-xl hover:bg-white/10 text-gray-500"><Paperclip size={18} /></button>
                      <button className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg"><Send size={18} /></button>
                   </div>
                </div>
             </div>
          </div>

          {/* Context Sidebar (Right) */}
          <div className="w-80 bg-black/10 dark:bg-white/[0.02] border-l border-white/10 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             
             {/* Ticket Metadata */}
             <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Support Intelligence</h3>
                <div className="space-y-3">
                   <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Issue Category</p>
                      <div className="flex items-center gap-2">
                         <Monitor size={14} className="text-blue-500" />
                         <span className="text-xs font-black dark:text-white">{ticket.category}</span>
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Assessed Priority</p>
                      <span className="text-xs font-black text-orange-500">{ticket.priority}</span>
                   </div>
                </div>
             </section>

             {/* SLA Progress */}
             <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Service Level Status</h3>
                <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Target Resolution</span>
                      <span className="text-[10px] font-black dark:text-white">4 Hours</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-emerald-500 w-[72%]"></div>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Status</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase italic">On-Track</span>
                   </div>
                </div>
             </section>

             {/* ATC Ownership */}
             <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">ATC Lead Agent</h3>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                   <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-xs">VP</div>
                   <div>
                      <h4 className="text-xs font-black dark:text-white">Vikram Patel</h4>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Support Engineer</p>
                   </div>
                </div>
             </section>

             {/* Resolution Control */}
             {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <div className="pt-10 border-t border-white/10">
                   <button className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Mark as Resolved
                   </button>
                   <p className="text-[9px] text-center text-gray-500 font-medium mt-3 uppercase tracking-tighter">Only close if issue is verified fixed</p>
                </div>
             )}

          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default HotelTicketDetailModal;
