import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User, Mail, Phone, Shield, CheckCircle2, UserPlus, AlertCircle, Briefcase, Hash } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1000);
  };

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-lg transform transition-all duration-300 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <GlassCard noPadding className="shadow-2xl overflow-hidden">
            {!isSuccess ? (
              <>
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Add Platform Member</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Direct Administrative Entry</p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className={labelClass}>Full Legal Name *</label>
                      <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                        <input type="text" placeholder="e.g. Vikram Patel" className={`${inputClass} pl-11`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Work Email *</label>
                      <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                        <input type="email" placeholder="v.patel@atc.com" className={`${inputClass} pl-11`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Contact Mobile *</label>
                      <div className="relative group">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                        <input type="tel" placeholder="+91 99999 00000" className={`${inputClass} pl-11`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Internal Employee ID</label>
                      <div className="relative group">
                        <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="ATC-EMP-000" className={`${inputClass} pl-11 font-mono uppercase`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Primary Department</label>
                      <div className="relative group">
                        <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select className={`${inputClass} pl-11 appearance-none cursor-pointer`}>
                          <option>Engineering</option>
                          <option>Operations</option>
                          <option>Finance</option>
                          <option>Sales & Growth</option>
                          <option>Support</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Assign RBAC Role *</label>
                      <div className="relative group">
                        <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <select className={`${inputClass} pl-11 appearance-none cursor-pointer`}>
                          <option>Super Admin</option>
                          <option>Finance Manager</option>
                          <option>Logistics Lead</option>
                          <option>Senior Support</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-white/5 border border-white/5 flex gap-3">
                    <AlertCircle size={18} className="text-blue-500 shrink-0" />
                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed uppercase">
                      New members are created with 'Active' status. Credentials will be delivered via secure internal mail.
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
                  <button onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                    Discard
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="px-10 py-3 rounded-xl bg-blue-600 dark:bg-orange-500 text-white text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? 'Processing...' : (
                      <>
                        <UserPlus size={16} />
                        Create New Member
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-16 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Member Added</h3>
                  <p className="text-sm font-medium text-gray-500 mt-2">Identity successfully synced to platform directory.</p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

export default AddUserModal;