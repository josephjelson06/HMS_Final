
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle2, BedDouble, IndianRupee, Users, Tag, Plus, Trash2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface ManageRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (typeData: any) => void;
  initialData?: any;
}

const ManageRoomTypeModal: React.FC<ManageRoomTypeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [occupancy, setOccupancy] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setRate(initialData.rate);
        setOccupancy(initialData.occupancy);
        setAmenities(initialData.amenities || []);
      } else {
        // Reset for new entry
        setName('');
        setRate('');
        setOccupancy('');
        setAmenities(['WiFi', 'TV']);
      }
    }
  }, [isOpen, initialData]);

  if (!isVisible && !isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
        id: initialData?.id || Math.random().toString(36).substr(2, 9),
        name, 
        rate: Number(rate), 
        occupancy: Number(occupancy), 
        amenities 
    });
    onClose();
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (idx: number) => {
    setAmenities(amenities.filter((_, i) => i !== idx));
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
               <div className="p-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white shadow-lg">
                  <BedDouble size={20} />
               </div>
               <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">{initialData ? 'Edit Room Type' : 'Define Room Type'}</h2>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Inventory Category Config</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
                <label className={labelClass}>Category Name</label>
                <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="e.g. Ocean View Suite" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${inputClass} pl-11`}
                        required 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Base Rack Rate</label>
                    <div className="relative">
                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="number" 
                            placeholder="5500" 
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className={`${inputClass} pl-11`}
                            required 
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Max Occupancy</label>
                    <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="number" 
                            placeholder="2" 
                            value={occupancy}
                            onChange={(e) => setOccupancy(e.target.value)}
                            className={`${inputClass} pl-11`}
                            required 
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className={labelClass}>Included Amenities</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text" 
                        placeholder="Add feature (e.g. Balcony)" 
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                        className={`${inputClass} flex-1`}
                    />
                    <button 
                        type="button" 
                        onClick={addAmenity}
                        className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-gray-600 dark:text-white"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider">
                            {amenity}
                            <button type="button" onClick={() => removeAmenity(idx)} className="p-1 hover:bg-blue-500/20 rounded-md ml-1"><X size={12} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
               <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Cancel</button>
               <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  <CheckCircle2 size={16} /> Save Definition
               </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default ManageRoomTypeModal;
