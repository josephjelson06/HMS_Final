
import React, { useState } from 'react';
import { Calendar, IndianRupee, Layers, AlertCircle, Lock, Zap } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';

interface BulkRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const BulkRateModal: React.FC<BulkRateModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'rate' | 'block'>('rate');

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Yield Engine"
      subtitle="Global Inventory Adjustment"
      footer={
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle size={14} strokeWidth={3} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Affects 12 Grid Cells</span>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>Discard changes</Button>
              <Button variant="action" size="lg" onClick={onClose} icon={<Zap size={18} fill="currentColor" />}>
                {mode === 'rate' ? 'Apply Yield Logic' : 'Execute System Block'}
              </Button>
           </div>
        </div>
      }
    >
      <div className="p-8 space-y-8">
         {/* 1. Operation Mode */}
         <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
             <button 
               onClick={() => setMode('rate')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'rate' ? 'bg-white dark:bg-white/10 text-accent-strong shadow-lg' : 'text-gray-500 hover:text-white'}`}
             >
                <IndianRupee size={14} /> Price Adjustment
             </button>
             <button 
               onClick={() => setMode('block')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'block' ? 'bg-white dark:bg-white/10 text-accent-strong shadow-lg' : 'text-gray-500 hover:text-white'}`}
             >
                <Lock size={14} /> Inventory Block
             </button>
         </div>

         {/* 2. Selection Scope */}
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Select Room Types</label>
               <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {['Deluxe Double', 'Standard Single', 'Executive Suite', 'Standard Double'].map(rt => (
                     <label key={rt} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-all">
                        <input type="checkbox" className="w-4 h-4 rounded-md border-white/10 bg-black text-accent" defaultChecked />
                        <span className="text-xs font-medium dark:text-gray-300">{rt}</span>
                     </label>
                  ))}
               </div>
            </div>
            <div className="space-y-6">
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Date Window</label>
                  <div className="grid grid-cols-2 gap-2">
                     <input type="date" defaultValue="2026-02-14" className={inputClass} />
                     <input type="date" defaultValue="2026-02-16" className={inputClass} />
                  </div>
               </div>
               <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 text-accent-strong flex gap-3">
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
                     <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Adjustment Type</label>
                     <div className="flex gap-2">
                        <button className="flex-1 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20">Increase By</button>
                        <button className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase border border-amber-500/20 opacity-40">Decrease By</button>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Yield Value (INR)</label>
                     <div className="relative group">
                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent z-10" />
                        <input type="number" defaultValue={2000} className={`${inputClass} pl-11 text-lg`} />
                     </div>
                  </div>
               </div>
            ) : (
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="p-4 rounded-3xl bg-red-500/10 text-red-500"><Lock size={32} /></div>
                     <div>
                        <h4 className="text-sm font-bold dark:text-white uppercase">Confirm Inventory Freeze</h4>
                        <p className="text-xs text-gray-500 font-medium">This will prevent all bookings (online and manual) for the selected dates and room types.</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Block Reason</label>
                        <select className={inputClass}>
                           <option>Maintenance Work</option>
                           <option>Group Allocation Holder</option>
                           <option>VIP Blockout</option>
                           <option>Service Disruption</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Rooms to Block</label>
                        <input type="number" placeholder="Leave empty for all" className={inputClass} />
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </ModalShell>
  );
};

export default BulkRateModal;
