
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Building, User, CreditCard, Monitor, CheckCircle2 } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHotelModal: React.FC<AddHotelModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? 'bg-accent text-white shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
            {s < step ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Hotel"
      subtitle={`Step ${step} of ${totalSteps}`}
      footer={
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            icon={<ChevronLeft size={18} />}
          >
            Previous
          </Button>
          <Button
            variant="action"
            size="md"
            onClick={() => step === 5 ? onClose() : setStep(step + 1)}
            iconRight={<ChevronRight size={18} />}
          >
            {step === 5 ? 'Confirm & Create Tenant' : 'Next Step'}
          </Button>
        </div>
      }
    >
      <div className="p-8">
        <StepIndicator />
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><Building size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Business Details</span></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2"><GlassInput label="Hotel Legal Name *" placeholder="e.g., Royal Orchid Bangalore" /></div>
              <GlassInput label="GSTIN *" placeholder="29AABCU9603R1ZM" mono maxLength={15} />
              <GlassInput label="PAN *" placeholder="AABCU9603R" mono maxLength={10} />
              <div className="col-span-2"><GlassInput label="Registered Address *" placeholder="Full legal address" /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><User size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Contact Details</span></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2"><GlassInput label="Owner / Manager Name *" placeholder="e.g., Rajesh Malhotra" /></div>
              <GlassInput label="Mobile Number *" type="tel" placeholder="+91 98860 32101" />
              <GlassInput label="Email Address *" type="email" placeholder="owner@hotel.com" />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Subscription Setup</span></div>
            <div className="grid grid-cols-1 gap-4">
              {['Starter', 'Professional', 'Enterprise'].map((p) => (
                <div key={p} className={`p-4 rounded-2xl border cursor-pointer transition-all ${p === 'Enterprise' ? 'border-orange-500/50 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="flex justify-between items-center"><h4 className="font-bold dark:text-white">{p} Plan</h4><span className="text-sm font-bold text-accent">₹{p === 'Starter' ? '4,999' : p === 'Professional' ? '12,999' : '24,999'}/mo</span></div>
                </div>
              ))}
              <div className="mt-4"><GlassInput label="Contract Start Date" type="date" /></div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><Monitor size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Kiosk Assignment</span></div>
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1"><GlassInput label="Device Serial Number" placeholder="ATC-K-XXXX" /></div>
                <div className="flex-1"><GlassInput label="Location Label" placeholder="e.g., Main Lobby" /></div>
                <Button variant="secondary" size="sm">Add</Button>
              </div>
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-500">No kiosks assigned yet. You can assign them later.</div>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={48} /></div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Ready to Go!</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">Review the details and confirm to create the tenant. A welcome email with login credentials will be sent automatically.</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default AddHotelModal;
