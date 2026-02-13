
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Printer, Download, Mail, Ban, 
  CheckCircle2, Plus, Trash2, IndianRupee, 
  Building2, User, Clock, Zap, ExternalLink,
  ChevronDown, Save, ShieldCheck, FileText, Send, AlertCircle,
  CreditCard, QrCode
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceRecord } from '../../data/billingHub';

interface InvoiceDetailProps {
  invoice: InvoiceRecord;
  onBack: () => void;
}

interface LineItem {
  id: string;
  desc: string;
  sac: string;
  qty: number;
  price: number;
  gstRate: number;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onBack }) => {
  const { isDarkMode } = useTheme();
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', desc: 'Room — Deluxe Double (09 Feb)', sac: '996311', qty: 1, price: 5500, gstRate: 12 },
    { id: '2', desc: 'Room — Deluxe Double (10 Feb)', sac: '996311', qty: 1, price: 5500, gstRate: 12 },
    { id: '3', desc: 'Restaurant — Dinner (09 Feb)', sac: '996312', qty: 1, price: 1200, gstRate: 5 },
    { id: '4', desc: 'Laundry Service', sac: '999713', qty: 1, price: 350, gstRate: 18 },
  ]);

  const hotel = {
    name: 'HMS Hotel - Sapphire Unit',
    address: 'Plot 4, BKC G Block, Mumbai, MH 400051',
    gstin: '27AABCU1234A1Z5',
    state: 'Maharashtra',
    stateCode: '27'
  };

  const isInterState = invoice.companyGstin ? !invoice.companyGstin.startsWith(hotel.stateCode) : false;

  const totals = useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    lineItems.forEach(item => {
      const lineTotal = item.qty * item.price;
      taxable += lineTotal;
      const taxAmount = (lineTotal * item.gstRate) / 100;
      
      if (isInterState) {
        igst += taxAmount;
      } else {
        cgst += taxAmount / 2;
        sgst += taxAmount / 2;
      }
    });

    return {
      taxable,
      cgst,
      sgst,
      igst,
      grand: taxable + cgst + sgst + igst
    };
  }, [lineItems, isInterState]);

  const amountToWords = (amt: number) => "Rupees Thirteen Thousand Nine Hundred Ninety-Three Only";

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      desc: 'Miscellaneous Service Charge',
      sac: '9997',
      qty: 1,
      price: 0,
      gstRate: 18
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Logic: tariff threshold GST rate update
        if (field === 'price' && updated.sac === '996311') {
          updated.gstRate = value > 7500 ? 18 : 12;
        }
        return updated;
      }
      return item;
    }));
  };

  const ItemRow: React.FC<{ item: LineItem }> = ({ item }) => {
    const taxableLine = item.qty * item.price;
    const taxLine = (taxableLine * item.gstRate) / 100;
    
    return (
      <tr className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">
        <td className="px-8 py-5">
           <div className="flex flex-col gap-1">
              <input 
                className="bg-transparent border-none focus:outline-none text-sm font-black dark:text-white w-full" 
                value={item.desc}
                onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
              />
              <input 
                className="bg-transparent border-none focus:outline-none text-[10px] font-mono text-gray-500 w-20" 
                value={item.sac}
                onChange={(e) => updateItem(item.id, 'sac', e.target.value)}
              />
           </div>
        </td>
        <td className="px-4 py-5 text-center">
          <input 
            type="number"
            className="bg-transparent border-none focus:outline-none text-sm font-bold text-center w-12" 
            value={item.qty}
            onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
          />
        </td>
        <td className="px-4 py-5 text-right">
           <input 
             type="number"
             className="bg-transparent border-none focus:outline-none text-sm font-bold text-right w-24" 
             value={item.price}
             onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
           />
        </td>
        <td className="px-4 py-5 text-right text-sm font-bold dark:text-gray-400">₹{taxableLine.toLocaleString()}</td>
        <td className="px-4 py-5 text-center">
            <span className="text-xs font-black dark:text-white">{item.gstRate}%</span>
        </td>
        {!isInterState ? (
          <>
            <td className="px-4 py-5 text-right text-xs font-bold text-gray-500">₹{(taxLine/2).toLocaleString()}</td>
            <td className="px-4 py-5 text-right text-xs font-bold text-gray-500">₹{(taxLine/2).toLocaleString()}</td>
          </>
        ) : (
          <td className="px-4 py-5 text-right text-xs font-bold text-gray-500">₹{taxLine.toLocaleString()}</td>
        )}
        <td className="px-8 py-5 text-right">
          <div className="flex items-center justify-end gap-4">
             <span className="text-sm font-black dark:text-white">₹{(taxableLine + taxLine).toLocaleString()}</span>
             <button 
               onClick={() => removeItem(item.id)}
               className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
             >
                <Trash2 size={14} />
             </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Remote Nav */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-white transition-colors group">
           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
           BACK TO LEDGER
         </button>
         <div className="flex gap-3">
             <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"><Printer size={20} /></button>
             <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"><Mail size={20} /></button>
             <div className="w-px h-10 bg-white/10 mx-2"></div>
             {invoice.status === 'Draft' ? (
                <button className="px-8 py-3.5 rounded-2xl bg-accent-strong text-white text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Finalize & Generate Invoice</button>
             ) : (
                <button className="px-8 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Download Signed PDF</button>
             )}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Invoice Sheet */}
        <div className="xl:col-span-9 space-y-8">
            <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
                {/* 1. Official Header */}
                <div className="p-10 border-b border-white/5 bg-black/5 flex flex-col md:flex-row justify-between gap-10">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-accent-strong flex items-center justify-center text-white shadow-xl">
                            <Zap size={28} fill="currentColor" />
                         </div>
                         <div>
                            <h2 className="text-xl font-black dark:text-white leading-none uppercase">{hotel.name}</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Tax Invoice • GST Compliant</p>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs text-gray-400 font-medium max-w-xs">{hotel.address}</p>
                         <p className="text-xs font-bold dark:text-gray-300">GSTIN: <span className="font-mono">{hotel.gstin}</span></p>
                         <p className="text-[10px] text-gray-500 uppercase font-black">State: {hotel.state} ({hotel.stateCode})</p>
                      </div>
                   </div>

                   <div className="flex gap-10">
                      {/* E-Invoice QR Placeholder */}
                      <div className="hidden lg:flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100">
                         <QrCode size={64} className="text-black" />
                         <span className="text-[7px] font-bold uppercase text-black tracking-tighter">GST E-Invoice Auth</span>
                      </div>
                      <div className="text-right space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Invoice Number</p>
                          <p className="text-2xl font-black dark:text-white tracking-tighter">{invoice.id}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-right">
                           <div>
                              <p className="text-[9px] font-black text-gray-500 uppercase">Billing Date</p>
                              <p className="text-xs font-bold dark:text-white">11 Feb 2026</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-gray-500 uppercase">Booking Ref</p>
                              <p className="text-xs font-bold dark:text-white">{invoice.bookingRef}</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* 2. Bill To & Compliance */}
                <div className="grid grid-cols-1 md:grid-cols-2 p-10 gap-10 border-b border-white/5">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500">
                         <Building2 size={16} />
                         <h3 className="text-[10px] font-bold uppercase tracking-widest">Bill To (Customer)</h3>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
                         <h4 className="text-lg font-black dark:text-white mb-2">{invoice.companyName || invoice.guestName}</h4>
                         <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">Level 12, Tower B, Brigade Tech Gardens, Brookfield, Bangalore, KA 560037</p>
                         {invoice.companyGstin ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-accent/20 text-accent">
                               <ShieldCheck size={12} />
                               <span className="text-[10px] font-bold uppercase tracking-tight">GSTIN: {invoice.companyGstin}</span>
                            </div>
                         ) : (
                            <p className="text-[10px] font-bold text-amber-500 uppercase">B2C Retail Invoice (Consumer)</p>
                         )}
                      </div>
                   </div>
                   
                   <div className="flex flex-col justify-end">
                      <div className="p-6 rounded-[2rem] border border-dashed border-white/10 bg-black/5 dark:bg-white/[0.01]">
                         <div className="flex justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase text-gray-500">Place of Supply</span>
                            <span className="text-[10px] font-black dark:text-white uppercase">{hotel.state} ({hotel.stateCode})</span>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${isInterState ? 'bg-accent' : 'bg-accent'}`}></div>
                               <span className="text-[10px] font-bold uppercase dark:text-gray-300">{isInterState ? 'IGST Logic Applied' : 'CGST + SGST Logic Applied'}</span>
                            </div>
                            <div className="group relative">
                               <AlertCircle size={14} className="text-gray-600 cursor-help" />
                               <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-[9px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  GST logic automatically derived by comparing Hotel State Code (27) with Customer State Code.
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 3. Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/10 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/5">
                                <th className="px-8 py-5">Service Description / SAC</th>
                                <th className="px-4 py-5 text-center">Qty</th>
                                <th className="px-4 py-5 text-right">Rate</th>
                                <th className="px-4 py-5 text-right">Taxable Val</th>
                                <th className="px-4 py-5 text-center">GST %</th>
                                {!isInterState ? (
                                    <>
                                        <th className="px-4 py-5 text-right">CGST</th>
                                        <th className="px-4 py-5 text-right">SGST</th>
                                    </>
                                ) : (
                                    <th className="px-4 py-5 text-right">IGST</th>
                                )}
                                <th className="px-8 py-5 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {lineItems.map(item => <ItemRow key={item.id} item={item} />)}
                            <tr>
                               <td colSpan={9} className="px-8 py-4">
                                  <button 
                                    onClick={addItem}
                                    className="flex items-center gap-2 text-[10px] font-black text-accent-strong uppercase tracking-widest hover:underline"
                                  >
                                     <Plus size={12} strokeWidth={3} /> Add Service Item
                                  </button>
                               </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="p-10 bg-black/5 dark:bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-between gap-10">
                   {/* 4. Grouped Tax Summary */}
                   <div className="flex-1 max-w-md">
                      <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Consolidated Tax Summary</h5>
                      <div className="rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-[10px]">
                            <thead className="bg-black/10 dark:bg-white/5 text-gray-500 font-bold uppercase tracking-tighter">
                                <tr>
                                    <th className="px-4 py-2">Tax Rate</th>
                                    <th className="px-4 py-2 text-right">Taxable Amt</th>
                                    <th className="px-4 py-2 text-right">Total Tax</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 dark:text-gray-300">
                                <tr><td className="px-4 py-2 font-bold">12% (Rooms)</td><td className="px-4 py-2 text-right">₹11,000</td><td className="px-4 py-2 text-right">₹1,320</td></tr>
                                <tr><td className="px-4 py-2 font-bold">5% (F&B)</td><td className="px-4 py-2 text-right">₹1,200</td><td className="px-4 py-2 text-right">₹60</td></tr>
                                <tr><td className="px-4 py-2 font-bold">18% (Laundry)</td><td className="px-4 py-2 text-right">₹350</td><td className="px-4 py-2 text-right">₹63</td></tr>
                            </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-blue-500/5 text-[9px] font-medium text-gray-500 italic">
                         Amount in words: {amountToWords(totals.grand)}
                      </div>
                   </div>

                   {/* 5. Finals */}
                   <div className="w-full md:w-80 space-y-6">
                      <div className="space-y-4">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-bold">Subtotal (Pre-tax)</span>
                            <span className="font-bold dark:text-white">₹{totals.taxable.toLocaleString()}</span>
                         </div>
                         {!isInterState ? (
                           <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold">CGST Total</span>
                                <span className="font-bold dark:text-white">₹{totals.cgst.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold">SGST Total</span>
                                <span className="font-bold dark:text-white">₹{totals.sgst.toLocaleString()}</span>
                              </div>
                           </>
                         ) : (
                           <div className="flex justify-between text-sm">
                              <span className="text-gray-500 font-bold">IGST Total</span>
                              <span className="font-bold dark:text-white">₹{totals.igst.toLocaleString()}</span>
                           </div>
                         )}
                         <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                            <span className="text-xs font-black uppercase text-gray-400">Grand Total</span>
                            <span className="text-3xl font-black text-accent-strong tracking-tighter">₹{totals.grand.toLocaleString()}</span>
                         </div>
                      </div>

                      {/* Signature Block */}
                      <div className="pt-6 border-t border-white/5 flex flex-col items-center">
                         <div className="w-32 h-16 border-b border-gray-500 mb-2 flex items-center justify-center opacity-30 grayscale">
                            <span className="text-[10px] font-mono italic">Digital Signature</span>
                         </div>
                         <span className="text-[8px] font-bold uppercase text-gray-500">Authorized Signatory</span>
                      </div>
                   </div>
                </div>
            </GlassCard>
            
            {/* 6. Payment Log Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Clock size={20} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Transaction History</h3>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-900/20">
                        <Plus size={14} /> Record Payment
                    </button>
                </div>
                <div className="rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/10 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/5">
                            <tr>
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Payment Mode</th>
                                <th className="px-8 py-5">Reference Number</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                                <th className="px-8 py-5 text-right pr-10">Cashier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="dark:text-gray-300">
                                <td className="px-8 py-5 text-xs font-medium">09 Feb, 10:05 AM</td>
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                                      <span className="text-[10px] font-bold uppercase tracking-tighter">UPI Interface</span>
                                   </div>
                                </td>
                                <td className="px-8 py-5 font-mono text-[11px] opacity-60 uppercase">UPI-REF-9923847</td>
                                <td className="px-8 py-5 text-right text-sm font-black dark:text-white">₹12,400.00</td>
                                <td className="px-8 py-5 text-right pr-10 text-[10px] font-bold uppercase text-gray-500">Riya Mehta</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        {/* Floating Sidebar Actions */}
        <div className="xl:col-span-3 space-y-6">
            <GlassCard className="border-white/5 bg-black/10 dark:bg-white/[0.01]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">Financial Summary</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Gross Bill</span>
                        <span className="text-xl font-black dark:text-white">₹{totals.grand.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Received</span>
                        <span className="text-xl font-black text-emerald-500">₹{invoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-red-500 animate-pulse flex items-center gap-2">
                            <AlertCircle size={12} /> Balance
                        </span>
                        <span className="text-2xl font-black text-red-500 tracking-tighter">₹{(totals.grand - invoice.paidAmount).toLocaleString()}</span>
                    </div>
                </div>
                <div className="space-y-3">
                   <button className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                      <CreditCard size={16} /> Record Cash Receipt
                   </button>
                   <button className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                      <Send size={16} /> WhatsApp Bill link
                   </button>
                </div>
            </GlassCard>

            <div className="p-6 rounded-[2.5rem] bg-accent/5 border border-accent/20">
               <h4 className="text-[10px] font-bold uppercase text-accent-strong mb-3 flex items-center gap-2">
                  <ExternalLink size={14} /> OTA Collection Logic
               </h4>
               <p className="text-[11px] font-medium text-gray-500 leading-relaxed mb-4">
                  If this is a MakeMyTrip/Goibibo booking, mark payments as "OTA Collect" to settle the guest ledger and track platform receivables.
               </p>
               <button className="w-full py-2 rounded-xl border border-orange-500/30 text-accent-strong text-[10px] font-bold uppercase tracking-widest hover:bg-accent-muted transition-all">
                  Switch to OTA Payment
               </button>
            </div>

            <div className="pt-10 space-y-4">
               <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-xs font-black uppercase border border-white/5 group">
                  <span className="flex items-center gap-2"><Ban size={16} className="opacity-50 group-hover:opacity-100" /> Void this Invoice</span>
               </button>
               <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 hover:bg-accent-muted hover:text-accent transition-all text-xs font-black uppercase border border-white/5 group">
                  <span className="flex items-center gap-2"><FileText size={16} className="opacity-50 group-hover:opacity-100" /> View History Log</span>
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
