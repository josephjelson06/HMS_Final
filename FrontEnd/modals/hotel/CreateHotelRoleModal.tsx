import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Shield, ShieldCheck, Zap, Info, ArrowRight, Copy, Check } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface CreateHotelRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (roleName: string) => void;
}

const CreateHotelRoleModal: React.FC<CreateHotelRoleModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [step, setStep] = useState(1);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [cloneFrom, setCloneFrom] = useState<string | null>(null);

  const templates = ['Front Desk', 'Housekeeping', 'Maintenance', 'Night Auditor'];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRoleName('');
      setRoleDesc('');
      setCloneFrom(null);
    }
  }, [isOpen]);

  const handleInitialize = () => {
    setStep(2);
    // Simulate blueprint deployment
    setTimeout(() => {
        onCreated?.(roleName || 'New Property Role');
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
        className={`fixed inset-0 z-[10000] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-xl transform transition-all duration-500 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <GlassCard noPadding className="shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-white/10 overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-8 border-b border-white/10 flex justify-between items-center ${isDarkMode ? 'bg-orange-500/5' : 'bg-orange-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">New Property Role</h2>
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mt-1">Operational Policy Setup</p>
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
                    <label className={labelClass}>Role Functional Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Concierge Supervisor" 
                      className={inputClass}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Work Scope Description</label>
                    <textarea 
                      rows={2} 
                      className={`${inputClass} resize-none`} 
                      placeholder="Describe what this role is authorized to perform..."
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                       <label className={labelClass}>Clone From Template</label>
                       <span className="text-[9px] font-black text-gray-400 uppercase bg-black/5 px-2 py-0.5 rounded">Optional</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       {templates.map(tpl => (
                         <button 
                           key={tpl}
                           onClick={() => setCloneFrom(tpl === cloneFrom ? null : tpl)}
                           className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${cloneFrom === tpl ? 'bg-orange-600 border-orange-600 text-white shadow-xl' : 'bg-black/5 dark:bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Copy size={14} className={cloneFrom === tpl ? 'text-white' : 'text-gray-400'} />
                               <span className="text-xs font-bold uppercase tracking-tighter">{tpl}</span>
                            </div>
                            {cloneFrom === tpl && <Check size={14} strokeWidth={4} />}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-orange-500 text-white flex items-center justify-center shadow-2xl shadow-orange-900/40 border-4 border-white/20">
                      <Zap size={48} fill="currentColor" className="animate-pulse" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Deploying Blueprint</h3>
                      <p className="text-sm font-medium text-gray-500 mt-2">Initializing logical schema for <span className="text-orange-500 font-black">"{roleName}"</span>...</p>
                   </div>
                   <div className="w-full max-w-xs h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
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
                    Generate & Customize Right
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

export default CreateHotelRoleModal;