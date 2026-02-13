import React, { useState } from 'react';
import { Zap, ArrowRight, Info, X, RefreshCcw } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';
import { Subscription } from '../../../data/subscriptions';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}


const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ isOpen, onClose, subscription }) => {
  const [selectedPlan, setSelectedPlan] = useState(subscription.plan);

  const plans = [
    { id: 'Starter', price: 3000, color: 'blue', desc: 'Single Kiosk + Basic Ops' },
    { id: 'Professional', price: 12000, color: 'purple', desc: '5 Kiosks + Analytics' },
    { id: 'Enterprise', price: 45000, color: 'orange', desc: '15 Kiosks + API Access' },
  ];

  const currentPlanData = plans.find(p => p.id === subscription.plan);
  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const priceDiff = (selectedPlanData?.price || 0) - (currentPlanData?.price || 0);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-strong text-white flex items-center justify-center shadow-lg">
            <RefreshCcw size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Modify Entitlement Tier</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{subscription.hotel}</p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Discard</Button>
          <Button
            variant="action"
            onClick={onClose}
            disabled={selectedPlan === subscription.plan}
            iconRight={<ArrowRight size={16} strokeWidth={3} />}
          >
            Confirm Migration
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Available Offerings</label>
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
                    <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[7px] font-bold uppercase px-2 py-1 rounded-bl-xl">Current</span>
                  )}
                  <div className={`mb-3 p-2 rounded-xl bg-white/5 w-fit ${isSelected ? `text-${p.color}-500` : 'text-gray-500'}`}>
                    <Zap size={18} fill={isSelected ? "currentColor" : "none"} />
                  </div>
                  <p className="text-sm font-bold dark:text-white mb-1 uppercase tracking-tight">{p.id}</p>
                  <p className="text-[9px] font-medium text-gray-500 uppercase leading-tight mb-3">{p.desc}</p>
                  <p className="text-lg font-black dark:text-white">₹{p.price.toLocaleString()}</p>
                </button>
              );
            })}
          </div>
        </div>

        {selectedPlan !== subscription.plan && (
          <div className="p-6 rounded-[2.5rem] bg-accent-strong/10 border border-accent-strong/20 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 rounded-xl bg-accent-strong text-white"><Info size={16} /></div>
              <h4 className="text-xs font-bold uppercase dark:text-white">Commercial Impact</h4>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500 uppercase">Monthly Variance</p>
                <p className={`text-xl font-black ${priceDiff > 0 ? 'text-accent' : 'text-emerald-500'}`}>
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
    </ModalShell>
  );
};

export default ChangePlanModal;
