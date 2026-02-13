import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User, Mail, Smartphone, Shield, Send, Info, CheckCircle2, ChevronDown, Hash, UserCheck } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface AddHotelUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHotelUserModal: React.FC<AddHotelUserModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleAdd = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-xl transform transition-all duration-300 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
            {!isSuccess ? (
              <>
                <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
                  <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Add Property Member</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Direct Staff Provisioning</p>
                  </div>
                  <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2">
                      <label className={labelClass}>Staff Full Name *</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                        <input type="text" placeholder="e.g. Meera Lakhani" className={`${inputClass} pl-12`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Staff Mobile *</label>
                      <div className="relative group">
                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                        <input type="tel" placeholder="+91" className={`${inputClass} pl-12`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Staff Email *</label>
                      <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                        <input type="email" placeholder="meera.l@hotel.com" className={`${inputClass} pl-12`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Employee ID</label>
                      <div className="relative group">
                        <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="STAFF-000" className={`${inputClass} pl-12 font-mono uppercase`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Assign Role *</label>
                      <div className="relative group">
                        <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <select className={`${inputClass} pl-12 appearance-none cursor-pointer`}>
                          <option>Front Desk Executive</option>
                          <option>Housekeeping Lead</option>
                          <option>Night Auditor</option>
                          <option>Maintenance Engineer</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-500/5 dark:bg-white/5 border border-white/5 flex gap-4">
                    <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed uppercase">
                      New staff members will receive an activation SMS with their initial PIN. Their identity will be cryptographically bound to this property.
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
                  <button onClick={onClose} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                    Cancel
                  </button>
                  <button 
                    onClick={handleAdd}
                    disabled={isSubmitting}
                    className="px-12 py-4 rounded-2xl bg-[#f97316] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? 'Provisioning...' : (
                      <>
                        <UserCheck size={18} strokeWidth={3} />
                        Confirm & Add Member
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <CheckCircle2 size={48} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-3xl font-black dark:text-white tracking-tighter uppercase">Member Registered</h3>
                  <p className="text-sm font-medium text-gray-500 mt-2">Identity sync successful. Staff ID activated.</p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

export default AddHotelUserModal;