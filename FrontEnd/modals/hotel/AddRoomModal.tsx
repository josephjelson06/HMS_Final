
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle2, Bed, Layers, Hash, Building2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (roomData: any) => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [category, setCategory] = useState('Standard');
  const [building, setBuilding] = useState('Building 01');

  if (!isVisible && !isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
        onAdd({ roomNumber, floor, category, building });
    }
    onClose();
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-md' : 'bg-transparent pointer-events-none'}`}>
      <div className={`relative w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-blue-600 dark:bg-orange-500 text-white shadow-lg">
                  <Bed size={20} />
               </div>
               <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Add Room</h2>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Expand Inventory</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                    <label className={labelClass}>Room Number</label>
                    <div className="relative">
                        <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="e.g. 101" 
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            className={`${inputClass} pl-11`}
                            required 
                        />
                    </div>
                </div>
                <div className="col-span-1">
                    <label className={labelClass}>Floor Number</label>
                    <div className="relative">
                        <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="number" 
                            placeholder="e.g. 1" 
                            value={floor}
                            onChange={(e) => setFloor(e.target.value)}
                            className={`${inputClass} pl-11`}
                            required 
                        />
                    </div>
                </div>
                <div className="col-span-2">
                    <label className={labelClass}>Building</label>
                    <div className="relative">
                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select 
                            value={building} 
                            onChange={(e) => setBuilding(e.target.value)} 
                            className={`${inputClass} pl-11 appearance-none cursor-pointer`}
                        >
                            <option>Building 01</option>
                            <option>Building 02</option>
                            <option>Annex Wing</option>
                        </select>
                    </div>
                </div>
                <div className="col-span-2">
                    <label className={labelClass}>Room Category</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Standard', 'Deluxe', 'Suite', 'Dormitory'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all ${category === cat ? 'bg-blue-600 dark:bg-orange-500 text-white border-transparent shadow-lg' : 'bg-transparent border-white/10 text-gray-500 hover:border-blue-500/50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
               <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Cancel</button>
               <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  <CheckCircle2 size={16} /> Save Room
               </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default AddRoomModal;
