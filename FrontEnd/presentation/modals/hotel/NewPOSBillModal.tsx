
import React, { useState } from 'react';
import { Trash2, Smartphone, User, CheckCircle2, Coffee, Brush, Zap } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';

interface NewPOSBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const NewPOSBillModal: React.FC<NewPOSBillModalProps> = ({ isOpen, onClose }) => {
  const [items] = useState<any[]>([{ id: 1, name: 'Restaurant — Buffet Lunch', qty: 1, price: 850 }]);

  const total = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  const tax = total * 0.18;
  const grandTotal = total + tax;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Direct Point-of-Sale"
      subtitle="Walk-in Billing Terminal"
      footer={
        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={onClose}>Discard</Button>
           <Button variant="action" size="lg" icon={<CheckCircle2 size={18} />}>Complete & Pay</Button>
        </div>
      }
    >
      <div className="p-8 space-y-8">
         {/* Customer Context */}
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Customer Mobile</label>
               <div className="relative group">
                  <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <input type="tel" placeholder="+91" className={`${inputClass} pl-11`} />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Customer Name (Optional)</label>
               <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <input type="text" placeholder="Walk-in Guest" className={`${inputClass} pl-11`} />
               </div>
            </div>
         </div>

         {/* Service Items */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Service Items</h3>
               <button className="text-[9px] font-bold text-accent-strong uppercase hover:underline">+ Add Custom</button>
            </div>
            <div className="space-y-3">
               {items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                     <div className="flex-1">
                        <p className="text-sm font-bold dark:text-white">{item.name}</p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Qty: {item.qty} • ₹{item.price}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold dark:text-white">₹{(item.qty * item.price).toLocaleString()}</p>
                     </div>
                     <button className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
               ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
               {[
                 { l: 'Laundry', i: Brush },
                 { l: 'F&B', i: Coffee },
                 { l: 'Extra Bed', i: Zap }
               ].map(chip => (
                 <button key={chip.l} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase flex items-center gap-2 hover:bg-white/10 transition-all text-gray-400">
                    <chip.i size={12} /> {chip.l}
                 </button>
               ))}
            </div>
         </div>

         {/* Calculation Summary */}
         <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 space-y-3">
            <div className="flex justify-between text-xs font-medium text-gray-500">
               <span>Subtotal</span>
               <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
               <span>GST (18%)</span>
               <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between items-end">
               <span className="text-[10px] font-bold uppercase text-gray-400">Grand Total</span>
               <span className="text-3xl font-black text-accent-strong tracking-tighter">₹{grandTotal.toLocaleString()}</span>
            </div>
         </div>
      </div>
    </ModalShell>
  );
};

export default NewPOSBillModal;
