
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, IndianRupee, Layers, CheckCircle2, AlertCircle, TrendingUp, Lock, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface BulkRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkRateModal: React.FC<BulkRateModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState<'rate' | 'block'>('rate');
  
  if (!isOpen) return null;

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
             <div>
                <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Bulk Yield Engine</h2>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Global Inventory Adjustment</p>
             </div>
             <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
          </div>

          <div className="p-8 space-y-8">
             {/* 1. Operation Mode */}
             <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                 <button 
                   onClick={() => setMode('rate')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'rate' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-orange-500 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                    <IndianRupee size={14} /> Price Adjustment
                 </button>
                 <button 
                   onClick={() => setMode('block')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'block' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-orange-500 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                    <Lock size={14} /> Inventory Block
                 </button>
             </div>

             {/* 2. Selection Scope */}
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <label className={labelClass}>Select Room Types</label>
                   <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {['Deluxe Double', 'Standard Single', 'Executive Suite', 'Standard Double'].map(rt => (
                         <label key={rt} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-all">
                            <input type="checkbox" className="w-4 h-4 rounded-md border-white/10 bg-black text-orange-500" defaultChecked />
                            <span className="text-xs font-bold dark:text-gray-300">{rt}</span>
                         </label>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <div>
                      <label className={labelClass}>Date Window</label>
                      <div className="grid grid-cols-2 gap-2">
                         <input type="date" defaultValue="2026-02-14" className={inputClass} />
                         <input type="date" defaultValue="2026-02-16" className={inputClass} />
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/20 text-blue-600 flex gap-3">
                      <Calendar size={16} className="shrink-0" />
                      <p className="text-[10px] font-bold uppercase leading-tight">Selection spans 3 nights including 1 peak festival date.</p>
                   </div>
                </div>
             </div>

             {/* 3. Logical Parameters */}
             <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.01] border-2 border-dashed border-white/10">
                {mode === 'rate' ? (
                   <div className="grid grid-cols-2 gap-10">
                      <div>
                         <label className={labelClass}>Adjustment Type</label>
                         <div className="flex gap-2">
                            <button className="flex-1 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">Increase By</button>
                            <button className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase border border-amber-500/20 opacity-40">Decrease By</button>
                         </div>
                      </div>
                      <div>
                         <label className={labelClass}>Yield Value (INR)</label>
                         <div className="relative group">
                            <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500" />
                            <input type="number" defaultValue={2000} className={`${inputClass} pl-11 text-lg`} />
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 rounded-3xl bg-red-500/10 text-red-500"><Lock size={32} /></div>
                         <div>
                            <h4 className="text-sm font-black dark:text-white uppercase">Confirm Inventory Freeze</h4>
                            <p className="text-xs text-gray-500 font-medium">This will prevent all bookings (online and manual) for the selected dates and room types.</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>Block Reason</label>
                            <select className={inputClass}>
                               <option>Maintenance Work</option>
                               <option>Group Allocation Holder</option>
                               <option>VIP Blockout</option>
                               <option>Service Disruption</option>
                            </select>
                         </div>
                         <div>
                            <label className={labelClass}>Rooms to Block</label>
                            <input type="number" placeholder="Leave empty for all" className={inputClass} />
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* Footer */}
          <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-between items-center">
             <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tight">Affects 12 Grid Cells</span>
             </div>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Discard changes</button>
                <button 
                  onClick={onClose}
                  className="px-12 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-[1.02] transition-all"
                >
                   <Zap size={18} fill="currentColor" /> {mode === 'rate' ? 'Apply Yield Logic' : 'Execute System Block'}
                </button>
             </div>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default BulkRateModal;
