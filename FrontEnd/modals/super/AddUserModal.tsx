import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, CheckCircle2, UserPlus, AlertCircle, Briefcase, Hash } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const selectClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none cursor-pointer`;

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title={isSuccess ? undefined : "Add Platform Member"}
      subtitle={isSuccess ? undefined : "Direct Administrative Entry"}
      hideHeader={isSuccess}
      footer={
        !isSuccess ? (
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Discard</Button>
            <Button
              variant="action"
              onClick={handleCreate}
              disabled={isSubmitting}
              icon={!isSubmitting ? <UserPlus size={16} /> : undefined}
            >
              {isSubmitting ? 'Processing...' : 'Create New Member'}
            </Button>
          </div>
        ) : undefined
      }
    >
      {!isSuccess ? (
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Full Legal Name *</label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10" />
                <GlassInput placeholder="e.g. Vikram Patel" className="pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Work Email *</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10" />
                <GlassInput type="email" placeholder="v.patel@atc.com" className="pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Contact Mobile *</label>
              <div className="relative group">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10" />
                <GlassInput type="tel" placeholder="+91 99999 00000" className="pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Internal Employee ID</label>
              <div className="relative group">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                <GlassInput placeholder="ATC-EMP-000" mono className="pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Primary Department</label>
              <div className="relative group">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                <select className={`${selectClass} pl-11`}>
                  <option>Engineering</option>
                  <option>Operations</option>
                  <option>Finance</option>
                  <option>Sales & Growth</option>
                  <option>Support</option>
                </select>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Assign RBAC Role *</label>
              <div className="relative group">
                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                <select className={`${selectClass} pl-11`}>
                  <option>Super Admin</option>
                  <option>Finance Manager</option>
                  <option>Logistics Lead</option>
                  <option>Senior Support</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-accent/5 border border-white/5 flex gap-3">
            <AlertCircle size={18} className="text-accent shrink-0" />
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed uppercase">
              New members are created with 'Active' status. Credentials will be delivered via secure internal mail.
            </p>
          </div>
        </div>
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
    </ModalShell>
  );
};

export default AddUserModal;