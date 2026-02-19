import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';
import type { Role } from '@/domain/entities/User';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role & { id?: string };
  onSaveRole: (payload: { description?: string }) => Promise<void>;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, onClose, role, onSaveRole }) => {
  const [roleName, setRoleName] = useState(role.name);
  const [description, setDescription] = useState(role.desc || role.description || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoleName(role.name);
      setDescription(role.desc || role.description || '');
      setIsSaving(false);
    }
  }, [isOpen, role]);

  const handleSave = async () => {
    if (!roleName) return;
    setIsSaving(true);
    try {
      await onSaveRole({ description });
      setTimeout(() => {
          onClose();
      }, 800);
    } catch (err) {
      console.error("Failed to update role", err);
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-strong text-white flex items-center justify-center shadow-lg shadow-accent-strong/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">Edit Role Profile</h2>
            <p className="text-[10px] font-bold text-accent-strong uppercase tracking-widest mt-1">Modify Identity Configuration</p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            variant="primary"
            size="lg"
            disabled={!roleName || isSaving}
            onClick={handleSave}
            icon={<Check size={16} strokeWidth={3} />}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-8 flex flex-col">
        <GlassInput
          label="Role Public Designation *"
          placeholder="e.g. Regional Auditor"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          autoFocus
        />

        <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 pl-1">
                Role Description
            </label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the primary responsibilities of this role..."
                className="w-full h-32 bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all resize-none placeholder:text-gray-600"
            />
        </div>
      </div>
    </ModalShell>
  );
};

export default EditRoleModal;
