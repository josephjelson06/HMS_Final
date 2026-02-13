import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User as UserIcon, Mail, Phone, Shield, CheckCircle2, Save, Briefcase, Hash } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import { User } from '../../data/users';

interface EditUserModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, user, onClose, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile);
  const [role, setRole] = useState(user.role);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setMobile(user.mobile);
      setRole(user.role);
    }
  }, [isOpen, user]);

  const handleUpdate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdate({
        ...user,
        name,
        email,
        mobile,
        role
      });
      setIsSubmitting(false);
    }, 800);
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
          <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5">
              <div>
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">Modify Identity</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Editing UID: {user.id}</p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Full Legal Name *</label>
                  <div className="relative group">
                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Patel" 
                      className={`${inputClass} pl-11`} 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Work Email *</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="v.patel@atc.com" 
                      className={`${inputClass} pl-11`} 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Contact Mobile *</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="tel" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 99999 00000" 
                      className={`${inputClass} pl-11`} 
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Assign RBAC Role *</label>
                  <div className="relative group">
                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`${inputClass} pl-11 appearance-none cursor-pointer`}
                    >
                      <option>Super Admin</option>
                      <option>Finance</option>
                      <option>Operations</option>
                      <option>Support</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                Discard
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-10 py-3 rounded-xl bg-blue-600 dark:bg-orange-500 text-white text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Syncing...' : (
                  <>
                    <Save size={16} />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

export default EditUserModal;