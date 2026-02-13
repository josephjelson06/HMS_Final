import React from 'react';
import { ShieldAlert, Unlink, AlertTriangle, ArrowRight, ShieldX } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';

interface UnmapKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  kioskId: string;
  hotelName: string;
}

const UnmapKioskModal: React.FC<UnmapKioskModalProps> = ({ isOpen, onClose, onConfirm, kioskId, hotelName }) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/40">
            <ShieldX size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Sever Infrastructure Link</h2>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Hardware De-provisioning</p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button
             variant="danger"
             onClick={onConfirm}
             iconRight={<ArrowRight size={16} strokeWidth={3} />}
           >
             Confirm Disconnection
           </Button>
        </div>
      }
    >
      <div className="p-10 space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium dark:text-gray-200 leading-relaxed">
            You are initiating a terminal disconnection protocol for <span className="text-red-500 font-bold">{kioskId}</span> currently mapped to <span className="font-bold underline decoration-red-500/50">{hotelName}</span>.
          </p>
          
          <div className="space-y-4">
             <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                <Unlink size={18} className="text-gray-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 font-medium">The kiosk will immediately enter <span className="text-white font-medium">&#39;Standby/Unassigned&#39;</span> mode and will be unreachable by the hotel staff.</p>
             </div>
             <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                <AlertTriangle size={18} className="text-gray-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 font-medium">This will clear all localized guest check-in sessions and transaction cache for security compliance.</p>
             </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-center">
          <ShieldAlert size={24} className="text-amber-600 shrink-0" />
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight">
            This action is irreversible and requires physical re-sync to re-map.
          </p>
        </div>
      </div>
    </ModalShell>
  );
};

export default UnmapKioskModal;