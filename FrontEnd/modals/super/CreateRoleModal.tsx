import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Shield, ShieldCheck, Zap, Info, Copy, ArrowRight, Check } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (roleName: string) => void;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [step, setStep] = useState(1);
  const [roleName, setRoleName] = useState('');
  const [cloneFrom, setCloneFrom] = useState<string | null>(null);

  const existingRoles = ['Super Admin', 'Finance', 'Operations', 'Support'];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRoleName('');
      setCloneFrom(null);
    }
  }, [isOpen]);

  const handleInitialize = () => {
    setStep(2);
    // Simulate brief processing
    setTimeout(() => {
        onCreated?.(roleName || 'New Custom Role');
        onClose();
    }, 1200);
  };

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-xl transform transition-all duration-500 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <GlassCard noPadding className="shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden border-white/10">
            
            {/* Modal Header */}
            <div className={`p-8 border-b border-white/10 flex justify-between items-center ${isDarkMode ? 'bg-blue-600/5' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">New Security Role</h2>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">Configure Custom Entitlements</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 min-h-[400px] flex flex-col">
              {step === 1 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                  <div>
                    <label className={labelClass}>Role Public Designation *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Regional Auditor" 
                      className={inputClass}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                       <label className={labelClass}>Clone Permissions From (Optional)</label>
                       <span className="text-[9px] font-black text-gray-400 uppercase bg-black/5 px-2 py-0.5 rounded">Speed up setup</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       {existingRoles.map(role => (
                         <button 
                           key={role}
                           onClick={() => setCloneFrom(role === cloneFrom ? null : role)}
                           className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${cloneFrom === role ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-black/5 dark:bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Copy size={14} className={cloneFrom === role ? 'text-white' : 'text-gray-400'} />
                               <span className="text-xs font-bold uppercase tracking-tighter">{role}</span>
                            </div>
                            {cloneFrom === role && <Check size={14} strokeWidth={4} />}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-dashed border-amber-500/20 flex gap-4 items-start">
                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                      Custom roles are assigned at the platform level. To manage property-specific roles, use the **Hotel Panel** configuration.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-900/40 border-4 border-white/20">
                      <Zap size={48} fill="currentColor" className="animate-pulse" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Initializing Blueprint</h3>
                      <p className="text-sm font-medium text-gray-500 mt-2">Deploying schema for <span className="text-blue-600 font-black">"{roleName}"</span>...</p>
                   </div>
                   <div className="w-full max-w-xs h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                   </div>
                </div>
              )}

              {/* Bottom Actions */}
              {step === 1 && (
                <div className="mt-10 pt-8 border-t border-white/10 flex justify-end gap-3">
                  <button onClick={onClose} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                    Discard
                  </button>
                  <button 
                    disabled={!roleName}
                    onClick={handleInitialize}
                    className="px-12 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Generate & Edit Matrix
                    <ArrowRight size={16} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </>
  , document.body);
};

export default CreateRoleModal;