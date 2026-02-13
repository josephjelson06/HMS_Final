import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Save, Building2, Calendar, IndianRupee, Plus, 
  Trash2, FileText, CheckCircle2, ShieldCheck, 
  Zap, Info, ChevronDown
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import { Invoice } from '../../data/invoices';

interface LineItem {
  id: string;
  description: string;
  amount: number;
}

interface InvoiceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

const InvoiceCreateModal: React.FC<InvoiceCreateModalProps> = ({ isOpen, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  
  // Form State
  const [selectedHotel, setSelectedHotel] = useState('');
  const [period, setPeriod] = useState('Feb 2026');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'Enterprise Plan Subscription', amount: 12711.86 }
  ]);

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setSelectedHotel('');
      setPeriod('Feb 2026');
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setLineItems([{ id: '1', description: 'Enterprise Plan Subscription', amount: 12711.86 }]);
    }
  }, [isOpen]);

  const subtotal = useMemo(() => lineItems.reduce((acc, curr) => acc + curr.amount, 0), [lineItems]);
  const gst = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Math.random().toString(), description: '', amount: 0 }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleConfirm = () => {
    if (!selectedHotel || total <= 0) return;

    const newInvoice: Invoice = {
      id: `ATC-INV-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`,
      hotel: selectedHotel,
      period,
      baseAmount: subtotal,
      gst,
      total,
      dueDate,
      status: 'pending'
    };

    onSave(newInvoice);
    onClose();
  };

  if (!isVisible && !isOpen) return null;

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`
          fixed inset-y-0 right-0 z-[9999] w-full max-w-2xl 
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          backdrop-blur-2xl
          ${isDarkMode ? 'bg-[#050505]/95 border-l border-white/10' : 'bg-white/95 border-l border-gray-200'}
        `}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className={`px-8 py-6 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">Generate Invoice</h2>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">Platform Billing Engine</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={24} /></button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                {/* 1. Recipient Context */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Building2 size={16} />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Billing Context</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className={labelClass}>Select Hotel Account *</label>
                            <div className="relative">
                                <select 
                                    value={selectedHotel}
                                    onChange={(e) => setSelectedHotel(e.target.value)}
                                    className={`${inputClass} appearance-none pr-10`}
                                >
                                    <option value="">Choose a property...</option>
                                    <option>Royal Orchid Bangalore</option>
                                    <option>Lemon Tree Premier</option>
                                    <option>Ginger Hotel, Panjim</option>
                                    <option>Taj Palace</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Billing Period</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className={`${inputClass} pl-11`} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Due Date</label>
                            <input 
                                type="date" 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={inputClass} 
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Line Items */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                            <FileText size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Revenue Items</h3>
                        </div>
                        <button 
                            onClick={addLineItem}
                            className="text-[10px] font-black text-blue-600 dark:text-orange-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            <Plus size={12} strokeWidth={4} /> Add Line
                        </button>
                    </div>

                    <div className="space-y-4">
                        {lineItems.map((item, index) => (
                            <div key={item.id} className="flex gap-4 items-start group">
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="Item description..." 
                                        value={item.description}
                                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="w-32">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">₹</span>
                                        <input 
                                            type="number" 
                                            value={item.amount}
                                            onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                            className={`${inputClass} pl-6 text-right`}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeLineItem(item.id)}
                                    className="mt-3 p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Summary & Tax */}
                <section className="pt-6 border-t border-white/5 space-y-4">
                    <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span>Taxable Value</span>
                            <span className="font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span className="flex items-center gap-2">IGST Logic (18%) <ShieldCheck size={12} className="text-blue-500" /></span>
                            <span className="font-mono">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                            <span className="text-sm font-black dark:text-white uppercase tracking-tighter">Grand Total</span>
                            <span className="text-3xl font-black text-blue-600 dark:text-orange-500 tracking-tighter font-mono">
                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </section>

                {/* 4. Policy Info */}
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                    <Info size={18} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase">
                        Generating this invoice will notify the property management team via email and WhatsApp. A draft will be saved in the property ledger.
                    </p>
                </div>

            </div>

            {/* Footer */}
            <div className={`px-8 py-6 border-t shrink-0 flex justify-end gap-3 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-gray-200/50 bg-white/50'}`}>
                <button onClick={onClose} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                    Discard Draft
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={!selectedHotel || total <= 0}
                  className="px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-30 disabled:grayscale"
                >
                    <Save size={16} /> Confirm & Publish
                </button>
            </div>
            
        </div>
      </div>
    </>
  , document.body);
};

export default InvoiceCreateModal;