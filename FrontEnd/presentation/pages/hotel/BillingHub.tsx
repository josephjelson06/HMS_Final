import React, { useState, useMemo } from 'react';
import { 
  Receipt, Search, Filter, Plus, Download, 
  ArrowLeft, CreditCard, IndianRupee, FileText,
  CheckCircle2, Clock, AlertCircle, Ban, Printer,
  Mail, Trash2, Edit3, ChevronRight, Building2,
  ExternalLink, FileOutput, ShieldCheck, TrendingUp,
  Info
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import InvoiceDetail from '../../modals/hotel/InvoiceDetail';
import NewPOSBillModal from '../../modals/hotel/NewPOSBillModal';
import type { DetachedInvoiceStatus as InvoiceStatus, DetachedBillingInvoice as InvoiceRecord } from '@/application/hooks/_detachedTypes';
import { useBilling } from '@/application/hooks/useBilling';

const BillingHub: React.FC = () => {
  const { invoices: allInvoices } = useBilling();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'All'>('All');

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      const searchStr = search.toLowerCase();
      const matchesSearch = inv.guestName.toLowerCase().includes(searchStr) || 
                           inv.id.toLowerCase().includes(searchStr) ||
                           (inv.companyName && inv.companyName.toLowerCase().includes(searchStr));
      const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [allInvoices, search, filterStatus]);

  const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
    const styles = {
      Draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      Issued: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      Paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Void: 'bg-red-500/10 text-red-500 border-red-500/20 line-through'
    };
    return (
      <span className={`px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const handleOpenInvoice = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setView('detail');
  };

  if (view === 'detail' && selectedInvoice) {
    return <InvoiceDetail invoice={selectedInvoice} onBack={() => setView('list')} />;
  }

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader
        title="Account Receivables"
        subtitle="Centralized Billing Hub • GST GSTR-1 Automation"
        badge="Dummy Data Page"
      >
        <div className="hidden xl:flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent-strong/10 border border-accent-strong/20 text-accent shadow-sm">
          <ShieldCheck size={20} strokeWidth={3} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Rate Reconciliation Active</span>
        </div>
        <Button
          size="md"
          icon={<FileOutput size={18} strokeWidth={3} />}
        >
          Export GSTR-1
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsPOSOpen(true)}
          icon={<Plus size={20} strokeWidth={4} />}
        >
          New POS Bill
        </Button>
      </PageHeader>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard title="Gross Yield" value="₹2,84,550" subtext="Month-to-date performance" icon={IndianRupee} color="text-accent" />
          <SummaryCard title="Actual Collections" value="₹2,06,557" subtext="Settled & Reconciled" icon={CheckCircle2} color="text-emerald-500" trend="up" />
          <SummaryCard title="Ledger Receivables" value="₹77,993" subtext="Outstanding B2B/Guest" icon={AlertCircle} color="text-red-500" trend="down" />
          <SummaryCard title="Draft Entries" value="08" subtext="Awaiting finalization" icon={FileText} color="text-amber-500" />
      </div>

      {/* Control Bar */}
      <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between" noPadding>
        <div className="p-3 w-full flex-1 flex flex-col md:flex-row gap-3">
            <div className="relative group flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-16 pr-6 py-5 border border-white/10 rounded-[1.5rem] bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 sm:text-sm shadow-sm backdrop-blur-md font-bold uppercase tracking-widest"
                    placeholder="Search Invoice #, Guest or Corporate Client..."
                />
            </div>
            <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 w-full lg:w-fit overflow-x-auto no-scrollbar">
                {['All', 'Draft', 'Issued', 'Paid', 'Void'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilterStatus(f as any)}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === f ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>
      </GlassCard>

      {/* Invoice Table */}
      <GlassCard noPadding className="overflow-hidden border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/10 dark:bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10">
                <th className="px-10 py-6">Ledger Number</th>
                <th className="px-8 py-6">Customer Identity</th>
                <th className="px-6 py-6 text-center">Unit</th>
                <th className="px-6 py-6">Settlement</th>
                <th className="px-8 py-6 text-right">Gross Total</th>
                <th className="px-8 py-6 text-right">Received</th>
                <th className="px-8 py-6 text-right">Variance</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-6 py-6 text-center">Audit</th>
                <th className="px-8 py-6 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => handleOpenInvoice(inv)}
                  className="hover:bg-white/5 transition-all group cursor-pointer border-l-4 border-transparent hover:border-accent-strong"
                >
                  <td className="px-10 py-6">
                    <span className="text-xs font-mono font-black text-accent-strong group-hover:underline">
                      {inv.id}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black dark:text-white leading-none mb-1.5 uppercase tracking-tighter">{inv.companyName || inv.guestName}</span>
                        {inv.companyName && <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Occupant: {inv.guestName}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center font-black dark:text-gray-300">#{inv.room}</td>
                  <td className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-tighter">{inv.checkOutDate}</td>
                  <td className="px-8 py-6 text-right text-sm font-black dark:text-white tracking-tighter">₹{inv.grandTotal.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right text-sm font-black text-emerald-500 tracking-tighter">₹{inv.paidAmount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-sm font-black tracking-tighter ${inv.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        ₹{inv.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={inv.status as InvoiceStatus} />
                  </td>
                  <td className="px-6 py-6 text-center">
                      {inv.rateAudited ? (
                         <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner" title="Rack Rate Compliance Verified">
                            <CheckCircle2 size={12} strokeWidth={4} />
                         </div>
                      ) : (
                         <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto" title="Pending Revenue Audit">
                            <Clock size={12} strokeWidth={3} />
                         </div>
                      )}
                  </td>
                  <td className="px-8 py-6 text-right pr-12">
                    <div className="flex justify-end gap-3">
                        <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white hover:bg-accent-strong transition-all shadow-sm"><Printer size={18} /></button>
                        <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white hover:bg-accent transition-all shadow-sm"><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <NewPOSBillModal isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} />

    </div>
  );
};

const SummaryCard = ({ title, value, subtext, icon: Icon, color = 'text-gray-400', trend }: any) => (
    <GlassCard className="flex flex-col justify-between h-44 border-white/5 bg-black/5 dark:bg-white/[0.01] hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
          <div className="flex items-center gap-3">
             <h3 className="text-3xl font-black dark:text-white tracking-tighter leading-none">{value}</h3>
             {trend && (
                <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase flex items-center gap-1 ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                   {trend === 'up' ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />} 12%
                </div>
             )}
          </div>
        </div>
        <div className={`p-3 rounded-2xl bg-black/10 dark:bg-white/5 ${color} shadow-inner`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">{subtext}</p>
    </GlassCard>
);

export default BillingHub;
