
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, IndianRupee, Smartphone, User, CheckCircle2, CreditCard, Send, Coffee, Brush, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface NewPOSBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewPOSBillModal: React.FC<NewPOSBillModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState<any[]>([{ id: 1, name: 'Restaurant — Buffet Lunch', qty: 1, price: 850 }]);
  
  if (!isOpen) return null;

  const total = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  const tax = total * 0.18; // 18% Standard for POS
  const grandTotal = total + tax;

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
             <div>
                <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Direct Point-of-Sale</h2>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Walk-in Billing Terminal</p>
             </div>
             <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
          </div>

          <div className="p-8 space-y-8">
             {/* Customer Context */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className={labelClass}>Customer Mobile</label>
                   <div className="relative group">
                      <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="tel" placeholder="+91" className={`${inputClass} pl-11`} />
                   </div>
                </div>
                <div>
                   <label className={labelClass}>Customer Name (Optional)</label>
                   <div className="relative group">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="Walk-in Guest" className={`${inputClass} pl-11`} />
                   </div>
                </div>
             </div>

             {/* Service Items */}
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Items</h3>
                   <button className="text-[9px] font-black text-blue-600 dark:text-orange-500 uppercase hover:underline">+ Add Custom</button>
                </div>
                <div className="space-y-3">
                   {items.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                         <div className="flex-1">
                            <p className="text-sm font-black dark:text-white">{item.name}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Qty: {item.qty} • ₹{item.price}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black dark:text-white">₹{(item.qty * item.price).toLocaleString()}</p>
                         </div>
                         <button className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                   ))}
                </div>
                {/* quick add chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                   {[
                     { l: 'Laundry', i: Brush },
                     { l: 'F&B', i: Coffee },
                     { l: 'Extra Bed', i: Zap }
                   ].map(chip => (
                     <button key={chip.l} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white/10 transition-all text-gray-400">
                        <chip.i size={12} /> {chip.l}
                     </button>
                   ))}
                </div>
             </div>

             {/* Calculation Summary */}
             <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                   <span>Subtotal</span>
                   <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500">
                   <span>GST (18%)</span>
                   <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                   <span className="text-[10px] font-black uppercase text-gray-400">Grand Total</span>
                   <span className="text-3xl font-black text-blue-600 dark:text-orange-500 tracking-tighter">₹{grandTotal.toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
             <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-white">Discard</button>
             <button className="px-12 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
                <CheckCircle2 size={18} /> Complete & Pay
             </button>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default NewPOSBillModal;
