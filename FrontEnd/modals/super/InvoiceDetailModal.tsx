
import React from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Printer, Download, Mail, Ban, CheckSquare, 
  Building2, MapPin, FileText, Zap, CreditCard, 
  ArrowRight, ShieldCheck, HelpCircle, History
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoice: any;
  onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, invoice, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);

  if (!isVisible && !isOpen) return null;

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
        <div className="h-full flex flex-col relative">
            
            {/* Header / Nav */}
            <div className={`px-8 py-6 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'}`}>
                <div>
                    <h2 className="text-xl font-black dark:text-white tracking-tighter">Invoice Detail</h2>
                    <p className="text-[10px] font-bold text-accent-strong uppercase tracking-widest">{invoice?.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400"><Printer size={20} /></button>
                    <button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400"><Download size={20} /></button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={24} /></button>
                </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                {/* 1. Branding & Basics */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-strong flex items-center justify-center text-white shadow-lg">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black dark:text-white">ATC Platform Pvt Ltd</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-tight">GSTIN: 27AABCU1234A1Z5</p>
                            <p className="text-[10px] text-gray-400 font-medium">Pune, Maharashtra, India</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border mb-3 inline-block ${
                            invoice?.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                            {invoice?.status}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due on: {invoice?.dueDate}</p>
                    </div>
                </div>

                {/* 2. Bill To Section */}
                <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-gray-500">
                        <Building2 size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Bill To</span>
                    </div>
                    <h4 className="text-lg font-black dark:text-white mb-1">{invoice?.hotel}</h4>
                    <p className="text-[11px] font-medium text-gray-400 max-w-xs mb-3">HAL Old Airport Rd, Domlur, Bangalore, Karnataka 560008</p>
                    <div className="flex gap-4">
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold font-mono dark:text-gray-300 uppercase">
                            GST: 29AABCU9603R1ZM
                        </div>
                    </div>
                </div>

                {/* 3. Line Items Table */}
                <div className="space-y-4">
                    <div className="grid grid-cols-12 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">
                        <div className="col-span-6">Description / SAC</div>
                        <div className="col-span-3 text-right">HSN/SAC</div>
                        <div className="col-span-3 text-right">Amount</div>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2 text-sm font-bold items-center">
                        <div className="col-span-6">
                            <p className="dark:text-white">Subscription — Enterprise Plan</p>
                            <p className="text-[10px] text-gray-500 font-medium">{invoice?.period}</p>
                        </div>
                        <div className="col-span-3 text-right font-mono text-gray-400">998314</div>
                        <div className="col-span-3 text-right dark:text-white">₹{invoice?.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                {/* 4. Tax Split & Total */}
                <div className="flex justify-end pt-6 border-t border-white/5">
                    <div className="w-full max-w-xs space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500 font-bold uppercase tracking-widest">CGST (9%)</span>
                            <span className="font-mono dark:text-gray-300">₹{(invoice?.gst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs pb-4 border-b border-white/5">
                            <span className="text-gray-500 font-bold uppercase tracking-widest">SGST (9%)</span>
                            <span className="font-mono dark:text-gray-300">₹{(invoice?.gst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2">
                            <span className="text-sm font-black dark:text-white uppercase tracking-widest">Total Invoice</span>
                            <span className="text-2xl font-black text-accent-strong tracking-tighter">₹{invoice?.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* 5. Payment History */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-gray-500" />
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] dark:text-white">Transaction Logs</h3>
                    </div>
                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-black/10 dark:bg-white/5 text-gray-500 font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Mode</th>
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="dark:text-gray-300">
                                    <td className="px-4 py-3">03 Feb 2026</td>
                                    <td className="px-4 py-3 font-bold">UPI Auto-debit</td>
                                    <td className="px-4 py-3 font-mono opacity-50">UPI-REF-98472</td>
                                    <td className="px-4 py-3 text-right text-red-500 font-black">FAILED</td>
                                </tr>
                                <tr className="dark:text-white bg-emerald-500/[0.03]">
                                    <td className="px-4 py-3">05 Feb 2026</td>
                                    <td className="px-4 py-3 font-bold">Manual NEFT</td>
                                    <td className="px-4 py-3 font-mono opacity-50">NEFT-REF-1122</td>
                                    <td className="px-4 py-3 text-right text-emerald-500 font-black">SUCCESS</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className={`px-8 py-6 border-t shrink-0 flex items-center justify-between gap-3 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-gray-200/50 bg-white/50'}`}>
                <div className="flex gap-2">
                    <button className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20" title="Void Invoice">
                        <Ban size={18} />
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center gap-2">
                        <Mail size={16} /> Send Reminder
                    </button>
                </div>
                <button 
                  onClick={onClose}
                  className="px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <CheckSquare size={16} /> Mark as Paid
                </button>
            </div>
            
        </div>
      </div>
    </>
  , document.body);
};

export default InvoiceDetailModal;
