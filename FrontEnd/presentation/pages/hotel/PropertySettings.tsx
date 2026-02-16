import React, { useEffect, useState } from 'react';
import { 
  Save, IndianRupee, MapPin, Phone, 
  Mail, Globe, Plus
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useHotels } from '../../../application/hooks/useHotels';
import { useRooms } from '../../../application/hooks/useRooms';
import { useGuests } from '../../../application/hooks/useGuests';



const PropertySettings: React.FC = () => {
  const { hotels, loading: hotelsLoading, updateHotel } = useHotels();
  const primaryHotel = hotels[0];
  
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    email: '',
    mobile: '',
    address: '',
    gstin: '',
    pan: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (primaryHotel) {
      setFormData({
        name: primaryHotel.name || '',
        legal_name: primaryHotel.legal_name || `${primaryHotel.name} Hospitality Pvt Ltd`,
        email: primaryHotel.email || '',
        mobile: primaryHotel.mobile || '',
        address: primaryHotel.address || '',
        gstin: primaryHotel.gstin || '',
        pan: primaryHotel.pan || ''
      });
    }
  }, [primaryHotel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!primaryHotel) return;
    setSaving(true);
    try {
      await updateHotel(primaryHotel.id, formData);
      // Optional: Show toast or success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Failed to save settings", error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isLoading = hotelsLoading;
  
  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 dark:focus:border-accent/50";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400";

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <PageHeader
        title="Hotel Settings"
        subtitle={isLoading ? 'Property-wide logic sync in progress' : 'Property-wide Logic & Compliance Defaulting'}
      >
        <Button
          size="md"
          icon={<Save size={18} strokeWidth={3} />}
          onClick={handleSave}
          disabled={saving || isLoading}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </PageHeader>

      <div className="max-w-6xl mx-auto">
        <GlassCard className="min-h-[650px] border-l-4 border-l-accent-strong">
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className={labelClass}>Hotel Trade Name (Public)</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className={inputClass} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Legal Entity Name</label>
                    <input 
                      type="text" 
                      name="legal_name" 
                      value={formData.legal_name} 
                      onChange={handleChange} 
                      className={inputClass} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Official Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          className={inputClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Front Desk Mobile</label>
                        <input 
                          type="tel" 
                          name="mobile" 
                          value={formData.mobile} 
                          onChange={handleChange} 
                          className={inputClass} 
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>GSTIN (Tax ID)</label>
                        <input 
                          type="text" 
                          name="gstin" 
                          value={formData.gstin} 
                          onChange={handleChange} 
                          className={`${inputClass} font-mono uppercase`} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>PAN (Income Tax)</label>
                        <input 
                          type="text" 
                          name="pan" 
                          value={formData.pan} 
                          onChange={handleChange} 
                          className={`${inputClass} font-mono uppercase`} 
                        />
                      </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                      <label className={labelClass}>Invoice & Digital Branding Logo</label>
                      <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-black/10 dark:bg-white/[0.01] hover:border-orange-500/50 transition-all cursor-pointer group">
                        <Plus size={32} className="text-gray-500 group-hover:scale-110 transition-transform mb-3" />
                        <span className="text-[10px] font-bold uppercase text-gray-500">Upload High-Res SVG</span>
                      </div>
                  </div>
                  <div>
                    <label className={labelClass}>Physical Postal Address</label>
                    <textarea 
                      rows={4} 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      className={`${inputClass} resize-none`} 
                    />
                  </div>
                </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default PropertySettings;
