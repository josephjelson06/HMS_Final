import React from 'react';
import ReactDOM from 'react-dom';
import { X, ShieldAlert, Unlink, AlertTriangle, ArrowRight, ShieldX } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface UnmapKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  kioskId: string;
  hotelName: string;
}

const UnmapKioskModal: React.FC<UnmapKioskModalProps> = ({ isOpen, onClose, onConfirm, kioskId, hotelName }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);

  if (!isVisible && !isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[10000] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/80 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`w-full max-w-lg transform transition-all duration-300 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
          <GlassCard noPadding className="shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-red-500/20 overflow-hidden">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-red-600/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/40">
                  <ShieldX size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Sever Infrastructure Link</h2>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Hardware De-provisioning</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-bold dark:text-gray-200 leading-relaxed">
                  You are initiating a terminal disconnection protocol for <span className="text-red-500 font-black">{kioskId}</span> currently mapped to <span className="font-black underline decoration-red-500/50">{hotelName}</span>.
                </p>
                
                <div className="space-y-4">
                   <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                      <Unlink size={18} className="text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-500 font-medium">The kiosk will immediately enter <span className="text-white font-bold">'Standby/Unassigned'</span> mode and will be unreachable by the hotel staff.</p>
                   </div>
                   <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                      <AlertTriangle size={18} className="text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-500 font-medium">This will clear all localized guest check-in sessions and transaction cache for security compliance.</p>
                   </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-center">
                <ShieldAlert size={24} className="text-amber-600 shrink-0" />
                <p className="text-[11px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-tight">
                  This action is irreversible and requires physical re-sync to re-map.
                </p>
              </div>
            </div>

            <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 flex justify-end gap-3">
               <button onClick={onClose} className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="px-10 py-3 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                Confirm Disconnection
                <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  , document.body);
};

export default UnmapKioskModal;