import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, Zap, ArrowRight, ShieldCheck, CheckCircle2, IndianRupee, Clock } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { Subscription } from '../../data/subscriptions';

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({ isOpen, onClose, subscription }) => {
  const { isDarkMode } = useTheme();
  const [months, setMonths] = useState(1);

  const options = [
    { label: '1 Month', value: 1, discount: 0 },
    { label: '6 Months', value: 6, discount: 5 },
    { label: '12 Months', value: 12, discount: 15 },
  ];

  if (!isOpen) return null;

  const currentRenewalDate = new Date(subscription.renewalDate);
  const newRenewalDate = new Date(currentRenewalDate);
  newRenewalDate.setMonth(newRenewalDate.getMonth() + months);

  const selectedOption = options.find(o => o.value === months);
  const subtotal = subscription.price * months;
  const discountAmount = (subtotal * (selectedOption?.discount || 0)) / 100;
  const total = subtotal - discountAmount;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-xl transform transition-all duration-300 pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4">
          <GlassCard noPadding className="shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-white/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-900/40">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">Extend Validity</h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Tenant Renewal Terminal</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 text-gray-500"><Calendar size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Expiry</p>
                        <p className="text-lg font-black dark:text-white">{subscription.renewalDate}</p>
                    </div>
                 </div>
                 <div className="p-2 rounded-full bg-white/5 text-gray-600"><ArrowRight size={20} /></div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Projected Expiry</p>
                    <p className="text-lg font-black text-blue-600">{newRenewalDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Extension Duration</label>
                 <div className="grid grid-cols-3 gap-3">
                    {options.map((opt) => (
                      <button 
                        key={opt.value}
                        onClick={() => setMonths(opt.value)}
                        className={`p-5 rounded-[1.5rem] border transition-all text-center group relative ${
                          months === opt.value ? 'border-orange-500 bg-orange-500/5 shadow-lg' : 'border-white/5 bg-black/5 hover:border-white/10'
                        }`}
                      >
                         {opt.discount > 0 && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[7px] font-black uppercase">-{opt.discount}% OFF</span>
                         )}
                         <p className={`text-sm font-black uppercase tracking-tighter mb-1 ${months === opt.value ? 'text-orange-500' : 'dark:text-white'}`}>{opt.label}</p>
                         <p className="text-[8px] font-bold text-gray-500 uppercase">{opt.value === 1 ? 'Standard' : 'Bulk Saver'}</p>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-black/20 border border-white/5 space-y-3">
                 <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Pro-rated Fee ({months} Mo)</span>
                    <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                 </div>
                 {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-500">
                        <span>Bulk Discount Applied</span>
                        <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                 )}
                 <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase dark:text-white">Amount to Settle</span>
                    <span className="text-3xl font-black text-orange-500 tracking-tighter">₹{total.toLocaleString()}</span>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-white">Cancel</button>
              <button 
                onClick={onClose}
                className="px-10 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                Execute Extension <CheckCircle2 size={16} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

export default ExtendSubscriptionModal;