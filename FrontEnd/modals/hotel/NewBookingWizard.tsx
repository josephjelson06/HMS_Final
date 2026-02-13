import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, ChevronRight, ChevronLeft, Phone, User, 
  DoorOpen, ShieldCheck, IndianRupee, CheckCircle2,
  Scan, Camera, Search, UserCheck, History, Calendar,
  Users, Coffee, CreditCard, ArrowRight, ShieldAlert,
  ClipboardCheck, Smartphone, Clock, FileText, Package,
  Layers
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface NewBookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewBookingWizard: React.FC<NewBookingWizardProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [isReturning, setIsReturning] = useState(false);
  
  const [formData, setFormData] = useState({
    mobile: '',
    name: '',
    room: null as any,
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    adults: 2,
    children: 0,
    mealPlan: 'CP (Bed & Breakfast)',
    kycType: 'Aadhaar Card',
    paymentMode: 'UPI',
    advanceAmount: 0
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsReturning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const inputClass = `w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-10">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${s === step ? 'bg-orange-500 text-white scale-110 shadow-lg' : s < step ? 'bg-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
            {s < step ? <CheckCircle2 size={14} /> : s}
          </div>
          {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4">
        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/5">
            <div>
              <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Walk-in Reservation</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Direct Check-In Workflow • Desk-1</p>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="p-10 min-h-[500px] flex flex-col">
            <StepIndicator />

            <div className="flex-1">
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3">
                        <Phone size={20} className="text-orange-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Guest Identification</h3>
                    </div>
                    <div>
                        <label className={labelClass}>Mobile Number (Primary Search Key)</label>
                        <div className="relative group">
                            <input 
                              type="tel" 
                              placeholder="+91 00000 00000" 
                              className={`${inputClass} text-lg py-5 pl-14`} 
                              onChange={(e) => {
                                if (e.target.value.length >= 10) setIsReturning(true);
                                setFormData({...formData, mobile: e.target.value});
                              }} 
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500" size={24} />
                        </div>
                        {isReturning && (
                            <div className="mt-6 p-5 rounded-[2rem] bg-blue-500/5 border border-blue-500/20 flex items-center gap-4 animate-in slide-in-from-top-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><UserCheck size={28} /></div>
                                <div>
                                    <h4 className="text-sm font-black text-blue-600 uppercase">Repeat Guest Identified</h4>
                                    <p className="text-xs text-gray-500 font-medium">Vikram Patel • Bangalore, India • 3 Past Stays</p>
                                </div>
                            </div>
                        )}
                        {!isReturning && (
                           <div className="mt-8">
                              <label className={labelClass}>Full Legal Name (as per ID)</label>
                              <input type="text" placeholder="e.g. Rahul Sharma" className={inputClass} />
                           </div>
                        )}
                    </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3">
                        <Package size={20} className="text-orange-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Inventory Selection</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: '305', cat: 'Deluxe Double', price: 5500, status: 'Clean' },
                            { id: '102', cat: 'Standard Single', price: 3500, status: 'Clean' },
                            { id: '608', cat: 'Executive Suite', price: 9000, status: 'Clean' },
                            { id: '402', cat: 'Deluxe Twin', price: 5500, status: 'Clean' },
                        ].map(room => (
                            <button 
                              key={room.id} 
                              onClick={() => setFormData({...formData, room})}
                              className={`text-left p-6 rounded-[2rem] border transition-all group flex flex-col justify-between h-36 ${formData.room?.id === room.id ? 'border-orange-500 bg-orange-500/5 shadow-lg' : 'bg-black/5 dark:bg-white/5 border-white/5 hover:border-orange-500/30'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                   <span className="text-[8px] font-black text-emerald-500 uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{room.status}</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className={`text-xl font-black uppercase tracking-tighter leading-tight ${formData.room?.id === room.id ? 'text-orange-500' : 'dark:text-white'}`}>{room.cat}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-500">₹{room.price.toLocaleString()}</span>
                                        <ArrowRight size={14} className={`transition-transform duration-300 ${formData.room?.id === room.id ? 'translate-x-1 text-orange-500' : 'text-gray-600'}`} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-orange-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Stay Parameters</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className={labelClass}>Check-Out Date (Expected)</label>
                          <input type="date" className={inputClass} value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} />
                       </div>
                       <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                          <Clock size={20} className="text-gray-500" />
                          <div>
                             <p className="text-[9px] font-black text-gray-500 uppercase">Calculated Duration</p>
                             <p className="text-sm font-black dark:text-white">2 Nights</p>
                          </div>
                       </div>
                       <div>
                          <label className={labelClass}>Guests (Adults / Children)</label>
                          <div className="flex gap-2">
                             <input type="number" defaultValue={2} className={`${inputClass} text-center`} />
                             <input type="number" defaultValue={0} className={`${inputClass} text-center`} />
                          </div>
                       </div>
                       <div>
                          <label className={labelClass}>Meal Plan</label>
                          <select className={inputClass} defaultValue="CP">
                             <option value="EP">EP (Room Only)</option>
                             <option value="CP">CP (Bed & Breakfast)</option>
                             <option value="MAP">MAP (Breakfast + Dinner)</option>
                             <option value="AP">AP (All Meals)</option>
                          </select>
                       </div>
                    </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto text-orange-500 mb-6 border-4 border-orange-500/20 shadow-xl">
                        <Scan size={32} />
                    </div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Identity Digitization</h3>
                    <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">Place original Aadhaar or Passport on scanner. Extraction of details and legal check in progress...</p>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-white/5 flex flex-col items-center">
                           <FileText size={24} className="text-gray-500 mb-3" />
                           <span className="text-[10px] font-black uppercase text-gray-500">ID Scan Status</span>
                           <span className="text-xs font-bold text-emerald-500">Document Detected</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-white/5 flex flex-col items-center">
                           <Camera size={24} className="text-gray-500 mb-3" />
                           <span className="text-[10px] font-black uppercase text-gray-500">Face Recognition</span>
                           <span className="text-xs font-bold text-gray-500">Waiting for Stream</span>
                        </div>
                    </div>
                    <button className="mt-8 flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl mx-auto">
                        <Camera size={18} /> Capture Live Snapshot
                    </button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3">
                        <IndianRupee size={20} className="text-orange-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Payment & Settlement</h3>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-orange-500/10 border border-orange-500/20">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-orange-600 uppercase">Estimated Bill (incl Tax)</span>
                          <span className="text-2xl font-black text-orange-600">₹12,400</span>
                       </div>
                       <p className="text-[9px] font-bold text-orange-700/60 uppercase">2 Nights • {formData.room?.cat || 'Deluxe Double'} • CP Plan</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       {['UPI', 'Cash', 'Credit Card'].map(mode => (
                          <button key={mode} className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.paymentMode === mode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black/5 dark:bg-white/5 border-white/5 text-gray-500'}`} onClick={() => setFormData({...formData, paymentMode: mode})}>
                             {mode}
                          </button>
                       ))}
                    </div>
                    <div>
                       <label className={labelClass}>Advance Amount Collected</label>
                       <input type="number" placeholder="Enter amount" className={`${inputClass} text-lg`} />
                    </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center pb-6">
                       <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"><ClipboardCheck size={32} /></div>
                       <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Confirm Registration</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                          <div>
                             <p className="text-[9px] font-black text-gray-500 uppercase">Guest</p>
                             <p className="text-sm font-black dark:text-white">{formData.mobile} • Vikram Patel</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-gray-500 uppercase">Room Category</p>
                             <p className="text-sm font-black dark:text-white">{formData.room?.cat || 'Deluxe Double'}</p>
                          </div>
                       </div>
                       <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                          <ShieldCheck size={20} className="text-emerald-500" />
                          <p className="text-xs font-bold text-emerald-600">KYC Verified & Identity Matched Successfully</p>
                       </div>
                       <div className="p-4 rounded-2xl border border-dashed border-white/10 text-[10px] font-medium text-gray-500 italic text-center">
                          A confirmation SMS with room key digital access will be sent to +91 {formData.mobile}
                       </div>
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-10 flex justify-between items-center">
              <button 
                disabled={step === 1} 
                onClick={() => setStep(step - 1)} 
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-0 transition-all px-6 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                <ChevronLeft size={16} /> BACK
              </button>
              <button 
                onClick={() => step === totalSteps ? onClose() : setStep(step + 1)} 
                className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-12 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                {step === totalSteps ? 'Activate Check-In' : 'Next Stage'}
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default NewBookingWizard;