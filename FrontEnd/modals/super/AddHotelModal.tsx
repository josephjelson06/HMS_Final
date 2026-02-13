
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronRight, ChevronLeft, Building, User, CreditCard, Monitor, CheckCircle2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHotelModal: React.FC<AddHotelModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen, 200);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 ${isDarkMode ? 'bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'}`;
  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? 'bg-orange-500 text-white shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
            {s < step ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 backdrop-blur-md bg-black/60' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-2xl transform transition-all duration-300 z-10 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <GlassCard className="relative flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl p-0" noPadding>
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <div><h2 className="text-2xl font-bold dark:text-white">Onboard New Hotel</h2><p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Step {step} of {totalSteps}</p></div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
          </div>

          <div className="p-8">
            <StepIndicator />
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2"><Building size={16} className="text-orange-500" /><span className="text-xs font-bold uppercase dark:text-white">Business Details</span></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2"><label className={labelClass}>Hotel Legal Name *</label><input type="text" placeholder="e.g., Royal Orchid Bangalore" className={inputClass} /></div>
                  <div><label className={labelClass}>GSTIN *</label><input type="text" placeholder="29AABCU9603R1ZM" className={`${inputClass} font-mono uppercase`} maxLength={15} /></div>
                  <div><label className={labelClass}>PAN *</label><input type="text" placeholder="AABCU9603R" className={`${inputClass} font-mono uppercase`} maxLength={10} /></div>
                  <div className="col-span-2"><label className={labelClass}>Registered Address *</label><input type="text" placeholder="Full legal address" className={inputClass} /></div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2"><User size={16} className="text-orange-500" /><span className="text-xs font-bold uppercase dark:text-white">Contact Details</span></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2"><label className={labelClass}>Owner / Manager Name *</label><input type="text" placeholder="e.g., Rajesh Malhotra" className={inputClass} /></div>
                  <div><label className={labelClass}>Mobile Number *</label><input type="tel" placeholder="+91 98860 32101" className={inputClass} /></div>
                  <div><label className={labelClass}>Email Address *</label><input type="email" placeholder="owner@hotel.com" className={inputClass} /></div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-orange-500" /><span className="text-xs font-bold uppercase dark:text-white">Subscription Setup</span></div>
                <div className="grid grid-cols-1 gap-4">
                  {['Starter', 'Professional', 'Enterprise'].map((p) => (
                    <div key={p} className={`p-4 rounded-2xl border cursor-pointer transition-all ${p === 'Enterprise' ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}>
                      <div className="flex justify-between items-center"><h4 className="font-bold dark:text-white">{p} Plan</h4><span className="text-sm font-bold text-orange-500">₹{p === 'Starter' ? '4,999' : p === 'Professional' ? '12,999' : '24,999'}/mo</span></div>
                    </div>
                  ))}
                  <div className="mt-4"><label className={labelClass}>Contract Start Date</label><input type="date" className={inputClass} /></div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2"><Monitor size={16} className="text-orange-500" /><span className="text-xs font-bold uppercase dark:text-white">Kiosk Assignment</span></div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1"><label className={labelClass}>Device Serial Number</label><input type="text" placeholder="ATC-K-XXXX" className={inputClass} /></div>
                    <div className="flex-1"><label className={labelClass}>Location Label</label><input type="text" placeholder="e.g., Main Lobby" className={inputClass} /></div>
                    <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all">Add</button>
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

          <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-between">
            <button disabled={step === 1} onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white disabled:opacity-0 transition-all"><ChevronLeft size={18} />Previous</button>
            <button onClick={() => step === 5 ? onClose() : setStep(step + 1)} className="flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all">{step === 5 ? 'Confirm & Create Tenant' : 'Next Step'}<ChevronRight size={18} /></button>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default AddHotelModal;
