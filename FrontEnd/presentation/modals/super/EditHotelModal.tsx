
import React, { useState, useEffect } from 'react';
import { User, Building, MapPin, Save } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';
import type { Hotel } from '@/domain/entities/Hotel';

interface EditHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel;
  onUpdate: (id: number, data: Partial<Hotel>) => Promise<void>;
}

const EditHotelModal: React.FC<EditHotelModalProps> = ({ isOpen, onClose, hotel, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    mobile: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen && hotel) {
      setFormData({
        name: hotel.name || '',
        owner: hotel.owner || '',
        mobile: hotel.mobile || '',
        email: hotel.email || '',
        address: hotel.address || '',
      });
    }
  }, [isOpen, hotel]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate(hotel.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to update hotel", error);
      alert("Failed to update hotel profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hotel Profile"
      subtitle={`Update details for ${hotel.name}`}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="action"
            size="md"
            disabled={loading}
            onClick={handleSubmit}
            icon={<Save size={18} />}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2 text-accent"><Building size={16} /><span className="text-xs font-bold uppercase dark:text-white">Business Identity</span></div>
              <GlassInput 
                label="Hotel Name" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
           </div>

           <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2 text-accent mt-2"><User size={16} /><span className="text-xs font-bold uppercase dark:text-white">Management Contact</span></div>
           </div>
           
           <GlassInput 
             label="Owner / Manager Name" 
             value={formData.owner}
             onChange={(e) => handleChange('owner', e.target.value)}
           />
           <GlassInput 
             label="Mobile Number" 
             value={formData.mobile}
             onChange={(e) => handleChange('mobile', e.target.value)}
           />
           <div className="md:col-span-2">
             <GlassInput 
               label="Email Address" 
               value={formData.email}
               onChange={(e) => handleChange('email', e.target.value)}
             />
           </div>

           <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2 text-accent mt-2"><MapPin size={16} /><span className="text-xs font-bold uppercase dark:text-white">Location</span></div>
              <GlassInput 
                label="Registered Address" 
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
           </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default EditHotelModal;
