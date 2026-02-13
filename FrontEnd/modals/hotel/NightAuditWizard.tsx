import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, ChevronRight, ChevronLeft, ShieldCheck, 
  IndianRupee, CheckCircle2, AlertCircle, 
  Search, Clock, FileText, Database,
  TrendingUp, Fingerprint, Scan,
  ArrowRight, Zap, DoorOpen, Users
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface NightAuditWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const NightAuditWizard: React.FC<NightAuditWizardProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const totalSteps = 2;

  const handleNext = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep(step + 1);
    }, 1500);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden border-white/10 flex h-[600px]">
          
          {/* Sidebar Progress */}
          <div className="w-64 bg-black/40 border-r border-white/5 p-8 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">Night Audit</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Day Close Terminal</p>
              </div>
              <div className="space-y-6">
                {[
                  { id: 1, label: 'Occupancy Check', icon: DoorOpen },
                  { id: 2, label: 'Revenue Settlement', icon: IndianRupee },
                ].map((s) => (
                  <div key={s.id} className={`flex items-center gap-4 transition-all ${step === s.id ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step === s.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'bg-white/5 text-gray-400'}`}>
                      <s.icon size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest dark:text-gray-300">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-center">
              <p className="text-[9px] font-black text-orange-500 uppercase">Shift Lock Active</p>
              <p className="text-[8px] font-medium text-gray-500 mt-1 uppercase tracking-tighter">Terminal ID: DESK-AUDIT-01</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-black/20 relative overflow-hidden">
            
            {/* Header */}
            <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-black/5">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cross-referencing databases...</span>
                </div>
                <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-500"><X size={20} /></button>
            </div>

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="relative w-48 h-48 mb-8">
                   <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full animate-[ping_2s_infinite]"></div>
                   <div className="absolute inset-0 border-4 border-orange-500 rounded-full animate-pulse flex items-center justify-center">
                      <Scan size={48} className="text-orange-500" />
                   </div>
                </div>
                <h4 className="text-sm font-black dark:text-white uppercase tracking-widest animate-pulse">Analyzing Transaction Signatures</h4>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              
              {step === 1 && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-2">Inventory Reconciliation</h3>
                    <p className="text-xs text-gray-500 font-medium">Comparing Physical Room Status vs Logical Guest Status.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Physical Occupancy</span>
                          <span className="text-emerald-500">Manual Entry Log</span>
                       </div>
                       <div className="text-3xl font-black dark:text-white">94 Rooms</div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Logical Registry</span>
                          <span className="text-blue-500">System Book</span>
                       </div>
                       <div className="text-3xl font-black dark:text-white">94 Check-Ins</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-6 animate-in zoom-in-95 delay-300 fill-mode-both">
                     <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30">
                        <CheckCircle2 size={32} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-emerald-500 uppercase tracking-tighter">Inventory Matched</h4>
                        <p className="text-xs font-medium text-gray-500">No discrepancies detected.</p>
                     </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-2">Revenue Settlement</h3>
                    <p className="text-xs text-gray-500 font-medium">Comparing Invoices with Daily Transaction Logs.</p>
                  </div>

                  <div className="rounded-[2.5rem] border border-white/5 overflow-hidden">
                     <table className="w-full text-left text-[11px]">
                        <thead className="bg-black/40 dark:text-gray-500 font-black uppercase tracking-widest">
                           <tr>
                              <th className="px-8 py-4">Ref/Room</th>
                              <th className="px-8 py-4">Billed Rate</th>
                              <th className="px-8 py-4">Inventory Rate</th>
                              <th className="px-8 py-4 text-right pr-8">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           <tr>
                              <td className="px-8 py-5 font-black dark:text-white">INV-887 (#305)</td>
                              <td className="px-8 py-5 text-gray-400 font-bold">₹5,500.00</td>
                              <td className="px-8 py-5 text-gray-400 font-bold">₹5,500.00</td>
                              <td className="px-8 py-5 text-right pr-8 text-emerald-500 font-black uppercase tracking-widest">Matched</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Daily Gross POS</p>
                        <h4 className="text-2xl font-black dark:text-white tracking-tighter">₹42,560.00</h4>
                     </div>
                     <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Settled via Terminal</p>
                        <h4 className="text-2xl font-black text-emerald-500 tracking-tighter">₹42,560.00</h4>
                     </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Navigation */}
            <div className="px-10 py-8 border-t border-white/5 flex justify-between items-center bg-black/5">
                <button 
                  disabled={step === 1} 
                  onClick={() => setStep(step - 1)} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={16} strokeWidth={3} /> Re-Check
                </button>
                <div className="flex gap-4">
                  <button onClick={onClose} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-white">Discard Audit</button>
                  <button 
                    onClick={step === totalSteps ? onClose : handleNext} 
                    className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    {step === totalSteps ? 'Final Commitment: Close Day' : 'Proceed to next check'}
                    <ArrowRight size={16} strokeWidth={3} />
                  </button>
                </div>
            </div>

          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default NightAuditWizard;