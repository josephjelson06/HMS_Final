
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Building, User, CreditCard, Monitor, CheckCircle2, Trash2 } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';
import { usePlans } from '@/application/hooks/usePlans';


interface KioskData {
  serialNumber: string;
  location: string;
}

interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateHotel: (data: any) => Promise<void>;
}

const AddHotelModal: React.FC<AddHotelModalProps> = ({ isOpen, onClose, onCreateHotel }) => {
  const { plans: apiPlans } = usePlans();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    pan: '',
    address: '',
    owner: '',
    mobile: '',
    email: '',
    plan: '',
    contractStartDate: new Date().toISOString().split('T')[0],
  });

  const [kiosks, setKiosks] = useState<KioskData[]>([]);
  const [currentKiosk, setCurrentKiosk] = useState<KioskData>({ serialNumber: '', location: '' });

  useEffect(() => {
    const activePlans = apiPlans.filter(p => !p.isArchived);
    if (activePlans.length > 0 && !formData.plan) {
      setFormData(prev => ({ ...prev, plan: activePlans[0].name }));
    }
  }, [apiPlans, formData.plan]);

  const handleAddKiosk = () => {
    if (currentKiosk.serialNumber && currentKiosk.location) {
      setKiosks([...kiosks, currentKiosk]);
      setCurrentKiosk({ serialNumber: '', location: '' });
    }
  };

  const handleRemoveKiosk = (index: number) => {
    const newKiosks = [...kiosks];
    newKiosks.splice(index, 1);
    setKiosks(newKiosks);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const activePlans = apiPlans.filter(p => !p.isArchived);
      setFormData({
        name: '',
        gstin: '',
        pan: '',
        address: '',
        owner: '',
        mobile: '',
        email: '',
        plan: activePlans.length > 0 ? activePlans[0].name : '',
        contractStartDate: new Date().toISOString().split('T')[0],
      });
      setKiosks([]);
      setCurrentKiosk({ serialNumber: '', location: '' });
    }
  }, [isOpen, apiPlans]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedPlan = apiPlans.find(p => p.name === formData.plan);
      const mrr = selectedPlan ? selectedPlan.price : 0;

      await onCreateHotel({
        name: formData.name,
        gstin: formData.gstin,
        owner: formData.owner,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        plan: formData.plan,
        status: 'Onboarding',
        kiosks: kiosks.length,
        kiosks_details: kiosks.map(k => ({ serial_number: k.serialNumber, location: k.location })),
        mrr: mrr,
        pan: formData.pan
      });
      onClose();
    } catch (error) {
      console.error("Failed to create hotel", error);
      alert("Failed to create hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? 'bg-accent text-white shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
            {s < step ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Hotel"
      subtitle={`Step ${step} of ${totalSteps}`}
      footer={
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={step === 1 || loading}
            onClick={() => setStep(step - 1)}
            icon={<ChevronLeft size={18} />}
          >
            Previous
          </Button>
          <Button
            variant="action"
            size="md"
            disabled={loading}
            onClick={() => step === 5 ? handleSubmit() : setStep(step + 1)}
            iconRight={loading ? undefined : <ChevronRight size={18} />}
          >
            {loading ? 'Processing...' : step === 5 ? 'Confirm & Create Tenant' : 'Next Step'}
          </Button>
        </div>
      }
    >
      <div className="p-8">
        <StepIndicator />
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><Building size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Business Details</span></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <GlassInput 
                  label="Hotel Legal Name *" 
                  placeholder="e.g., Royal Orchid Bangalore" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <GlassInput 
                label="GSTIN *" 
                placeholder="29AABCU9603R1ZM" 
                mono 
                maxLength={15} 
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
              />
              <GlassInput 
                label="PAN *" 
                placeholder="AABCU9603R" 
                mono 
                maxLength={10} 
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
              />
              <div className="col-span-2">
                <GlassInput 
                  label="Registered Address *" 
                  placeholder="Full legal address" 
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><User size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Contact Details</span></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <GlassInput 
                  label="Owner / Manager Name *" 
                  placeholder="e.g., Rajesh Malhotra" 
                  value={formData.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                />
              </div>
              <GlassInput 
                label="Mobile Number *" 
                type="tel" 
                placeholder="+91 98860 32101" 
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
              />
              <GlassInput 
                label="Email Address *" 
                type="email" 
                placeholder="owner@hotel.com" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Subscription Setup</span></div>
            <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {apiPlans.filter(p => !p.isArchived).map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => handleChange('plan', p.name)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${formData.plan === p.name ? 'border-orange-500/50 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold dark:text-white">{p.name} Plan</h4>
                    <span className="text-sm font-bold text-accent">₹{p.price.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{p.rooms} Rooms</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{p.kiosks} Kiosks</span>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <GlassInput 
                  label="Contract Start Date" 
                  type="date" 
                  value={formData.contractStartDate}
                  onChange={(e) => handleChange('contractStartDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><Monitor size={16} className="text-accent" /><span className="text-xs font-bold uppercase dark:text-white">Kiosk Assignment</span></div>
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <GlassInput 
                    label="Device Serial Number" 
                    placeholder="ATC-K-XXXX" 
                    value={currentKiosk.serialNumber}
                    onChange={(e) => setCurrentKiosk({ ...currentKiosk, serialNumber: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <GlassInput 
                    label="Location Label" 
                    placeholder="e.g., Main Lobby" 
                    value={currentKiosk.location}
                    onChange={(e) => setCurrentKiosk({ ...currentKiosk, location: e.target.value })}
                  />
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleAddKiosk}
                  disabled={!currentKiosk.serialNumber || !currentKiosk.location}
                >
                  Add
                </Button>
              </div>

              {kiosks.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-500">
                  No kiosks assigned yet. You can assign them later.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {kiosks.map((kiosk, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold dark:text-white">{kiosk.serialNumber}</span>
                        <span className="text-xs text-gray-500">{kiosk.location}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveKiosk(index)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={48} /></div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Ready to Go!</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">Review the details and confirm to create the tenant. A welcome email with login credentials will be sent automatically.</p>
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-left text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span>Property:</span> <span className="font-bold dark:text-white">{formData.name}</span></div>
                <div className="flex justify-between"><span>Owner:</span> <span className="font-bold dark:text-white">{formData.owner}</span></div>
                <div className="flex justify-between"><span>Plan:</span> <span className="font-bold dark:text-white">{formData.plan}</span></div>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default AddHotelModal;
