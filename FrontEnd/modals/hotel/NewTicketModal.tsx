import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, LifeBuoy, FileText, Send, Camera, Info, Flag, ChevronDown, Plus } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  
  if (!isOpen) return null;

  const inputClass = `w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
             <div>
                <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Request Platform Support</h2>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Issue Ticket Intake</p>
             </div>
             <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
          </div>

          <div className="p-8 space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className={labelClass}>Issue Category</label>
                   <div className="relative">
                      <select className={`${inputClass} appearance-none pr-10`}>
                         <option>Software (Bug/Logic)</option>
                         <option>Billing (Invoice/Payment)</option>
                         <option>General Support</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                   </div>
                </div>
                <div>
                   <label className={labelClass}>Operational Priority</label>
                   <div className="relative">
                      <select className={`${inputClass} appearance-none pr-10`}>
                         <option className="text-gray-500">Low — Request doc/info</option>
                         <option className="text-blue-500">Medium — Minor glitch</option>
                         <option className="text-orange-500">High — Process impact</option>
                         <option className="text-red-500">Critical — Site down</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                   </div>
                </div>
                <div className="col-span-2">
                   <label className={labelClass}>Subject Summary</label>
                   <input type="text" placeholder="e.g. Rate parity issue on mobile view" className={inputClass} />
                </div>
                <div className="col-span-2">
                   <label className={labelClass}>Issue Description</label>
                   <textarea rows={4} placeholder="Describe exactly what happened and when..." className={inputClass} />
                </div>
             </div>

             <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-black/20 text-gray-500 group-hover:text-white transition-colors">
                      <Camera size={24} />
                   </div>
                   <div>
                      <p className="text-sm font-black dark:text-white">Attach Evidence</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Photos or error logs (Max 10MB)</p>
                   </div>
                </div>
                <Plus size={20} className="text-gray-500" />
             </div>
          </div>

          <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-between items-center">
             <div className="flex items-center gap-2 text-emerald-500">
                <Info size={14} />
                <span className="text-[10px] font-black uppercase tracking-tight">Our team responds within 60 mins</span>
             </div>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Discard</button>
                <button 
                  onClick={onClose}
                  className="px-10 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                >
                   <Send size={18} /> Initialize Ticket
                </button>
             </div>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default NewTicketModal;