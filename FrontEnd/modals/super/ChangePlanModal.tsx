import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Zap, Check, ArrowRight, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { Subscription } from '../../data/subscriptions';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ isOpen, onClose, subscription }) => {
  const { isDarkMode } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(subscription.plan);

  const plans = [
    { id: 'Starter', price: 3000, color: 'blue', desc: 'Single Kiosk + Basic Ops' },
    { id: 'Professional', price: 12000, color: 'purple', desc: '5 Kiosks + Analytics' },
    { id: 'Enterprise', price: 45000, color: 'orange', desc: '15 Kiosks + API Access' },
  ];

  if (!isOpen) return null;

  const currentPlanData = plans.find(p => p.id === subscription.plan);
  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const priceDiff = (selectedPlanData?.price || 0) - (currentPlanData?.price || 0);

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl transform transition-all duration-300 pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4">
          <GlassCard noPadding className="shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-white/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                  <RefreshCcw size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Modify Entitlement Tier</h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{subscription.hotel}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Available Offerings</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const isCurrent = p.id === subscription.plan;
                    const isSelected = p.id === selectedPlan;
                    
                    return (
                      <button 
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id as any)}
                        className={`text-left p-5 rounded-[2rem] border transition-all relative overflow-hidden group ${
                          isSelected ? `border-${p.color}-500 bg-${p.color}-500/10` : 'border-white/5 bg-black/5 hover:border-white/20'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[7px] font-black uppercase px-2 py-1 rounded-bl-xl">Current</span>
                        )}
                        <div className={`mb-3 p-2 rounded-xl bg-white/5 w-fit ${isSelected ? `text-${p.color}-500` : 'text-gray-500'}`}>
                          <Zap size={18} fill={isSelected ? "currentColor" : "none"} />
                        </div>
                        <p className="text-sm font-black dark:text-white mb-1 uppercase tracking-tight">{p.id}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase leading-tight mb-3">{p.desc}</p>
                        <p className="text-lg font-black dark:text-white">₹{p.price.toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedPlan !== subscription.plan && (
                <div className="p-6 rounded-[2.5rem] bg-blue-600/10 border border-blue-600/20 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-xl bg-blue-600 text-white"><Info size={16} /></div>
                    <h4 className="text-xs font-black uppercase dark:text-white">Commercial Impact</h4>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Monthly Variance</p>
                      <p className={`text-xl font-black ${priceDiff > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {priceDiff > 0 ? `+ ₹${priceDiff.toLocaleString()}` : `- ₹${Math.abs(priceDiff).toLocaleString()}`}
                      </p>
                    </div>
                    <p className="text-[9px] font-medium text-gray-500 max-w-[200px] text-right italic">
                      Price adjustment will be reflected in the next billing cycle on {subscription.renewalDate}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-white">Discard</button>
              <button 
                onClick={onClose}
                disabled={selectedPlan === subscription.plan}
                className="px-10 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 disabled:opacity-30 disabled:grayscale"
              >
                Confirm Migration <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

const RefreshCcw = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

export default ChangePlanModal;