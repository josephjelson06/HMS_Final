import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, Camera, Info, Monitor, ChevronDown, Plus, AlertCircle, Terminal } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface KioskSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  kioskId: string;
}

const KioskSupportTicketModal: React.FC<KioskSupportTicketModalProps> = ({ isOpen, onClose, kioskId }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[10000] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/80 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-2xl transform transition-all duration-300 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
              <div>
                <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Initialize Hardware Ticket</h2>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Direct Engineering Escalation</p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className={labelClass}>Infrastructure Node</label>
                   <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center gap-3">
                      <Monitor size={16} className="text-blue-500" />
                      <span className="text-xs font-black text-blue-500 font-mono">{kioskId}</span>
                   </div>
                </div>
                <div>
                   <label className={labelClass}>Escalation Level</label>
                   <div className="relative">
                      <select className={`${inputClass} appearance-none pr-10`}>
                         <option className="text-blue-500">Normal — Maintenance</option>
                         <option className="text-orange-500">High — Process Degraded</option>
                         <option className="text-red-500" selected>Critical — Unit Offline</option>
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
                          <p className="text-sm font-black dark:text-white leading-none mb-1">Hardware Snap</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Physical Evidence</p>
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
                          <p className="text-sm font-black dark:text-white leading-none mb-1">Diagnostic Log</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Automated Capture</p>
                       </div>
                    </div>
                    <Plus size={20} className="text-gray-500" />
                 </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-between items-center">
               <div className="flex items-center gap-2 text-emerald-500">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-tight">Assigned to Hardware Engineering</span>
               </div>
               <div className="flex gap-4">
                  <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Discard</button>
                  <button className="px-10 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <Send size={18} /> Initialize Ticket
                  </button>
               </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

export default KioskSupportTicketModal;