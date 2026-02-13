import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Monitor, Cpu, MapPin, Building2, CheckCircle2, Zap, ArrowRight, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface AddKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddKioskModal: React.FC<AddKioskModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-600 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-10">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${s === step ? 'bg-orange-500 text-white shadow-xl scale-110' : s < step ? 'bg-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
            {s < step ? <CheckCircle2 size={18} strokeWidth={3} /> : s}
          </div>
          {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[10000] transition-opacity duration-500 ${isOpen ? 'opacity-100 bg-black/80 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-2xl transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
          <GlassCard noPadding className="shadow-[0_50px_100px_rgba(0,0,0,0.6)] border-white/10 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-black/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-2xl shadow-orange-900/40">
                  <Monitor size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">Register Kiosk Node</h2>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1.5">Hardware Provisioning Terminal</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 text-gray-400 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 min-h-[480px] flex flex-col">
              <StepIndicator />

              <div className="flex-1">
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-3 text-orange-500">
                        <Cpu size={20} strokeWidth={2.5} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Hardware Identity</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className={labelClass}>Kiosk Asset ID (Public Tag)</label>
                            <input type="text" placeholder="e.g. ATC-K-0902" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Serial Number</label>
                            <input type="text" placeholder="SN-2026-XXXX" className={`${inputClass} font-mono uppercase`} />
                        </div>
                        <div>
                            <label className={labelClass}>MAC Address</label>
                            <input type="text" placeholder="00:00:00:00:00:00" className={`${inputClass} font-mono uppercase`} />
                        </div>
                        <div className="col-span-2">
                           <label className={labelClass}>Hardware Model Tier</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['Floor Standing', 'Desktop', 'Wall Mount'].map(type => (
                                <button key={type} className="p-4 rounded-2xl border border-white/5 bg-black/5 dark:bg-white/[0.02] text-[10px] font-black uppercase text-gray-500 hover:text-white hover:border-orange-500/50 transition-all">
                                   {type}
                                </button>
                              ))}
                           </div>
                        </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-3 text-blue-500">
                        <Building2 size={20} strokeWidth={2.5} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Property Assignment</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                           <label className={labelClass}>Target Hotel Account</label>
                           <div className="relative">
                              <select className={`${inputClass} appearance-none pr-12`}>
                                 <option>Select a property...</option>
                                 <option>Royal Orchid Bangalore</option>
                                 <option>Lemon Tree Premier</option>
                                 <option>Ginger Hotel, Panjim</option>
                                 <option>Taj Palace, Delhi</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                           </div>
                        </div>
                        <div>
                            <label className={labelClass}>Specific Deployment Location</label>
                            <div className="relative group">
                               <input type="text" placeholder="e.g. Main Lobby - North Wing" className={`${inputClass} pl-12`} />
                               <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-blue-600/5 border border-blue-600/20 flex gap-4">
                           <ShieldCheck size={24} className="text-blue-500 shrink-0" />
                           <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                              Mapping this kiosk to a hotel will immediately sync its branding, UI settings, and PMS integration logic.
                           </p>
                        </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                     <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-900/40 relative">
                        <CheckCircle2 size={48} strokeWidth={2.5} />
                        <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] animate-ping opacity-20"></div>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Ready for Boot</h3>
                        <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
                           Hardware identity verified. Hotel mapping complete. Click below to initialize the terminal heartbeat.
                        </p>
                     </div>
                     <div className="w-full grid grid-cols-2 gap-4 p-8 rounded-[3rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
                        <div className="text-left">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Asset Assigned</p>
                           <p className="text-sm font-black dark:text-white uppercase">ATC-K-XXXX</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                           <p className="text-sm font-black text-emerald-500 uppercase">Provisioned</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                <button 
                  disabled={step === 1} 
                  onClick={() => setStep(step - 1)} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white disabled:opacity-0 transition-all px-4 py-2"
                >
                  <ChevronLeft size={16} strokeWidth={3} /> Re-Check
                </button>
                <button 
                  onClick={() => step === totalSteps ? onClose() : setStep(step + 1)} 
                  className={`flex items-center gap-3 px-12 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all
                    ${step === totalSteps ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-blue-900/20'}
                  `}
                >
                  {step === totalSteps ? 'Activate Terminal' : 'Next Stage'}
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

const ChevronDown = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export default AddKioskModal;