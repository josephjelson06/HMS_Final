import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, Search, CheckCircle2, Clock, AlertCircle, FileText, 
  Calendar, ChevronDown, Plus
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SharedStatusBadge, { statusToVariant } from '../../components/ui/StatusBadge';
import InvoiceDetailModal from '../../modals/super/InvoiceDetailModal';
import InvoiceCreateModal from '../../modals/super/InvoiceCreateModal';
import type { Invoice } from '@/domain/entities/Invoice';
import { useInvoices } from '@/application/hooks/useInvoices';

const StatusBadge = ({ status }: { status: string }) => (
  <SharedStatusBadge label={status} variant={statusToVariant(status.charAt(0).toUpperCase() + status.slice(1))} />
);

const Invoices: React.FC = () => {
  const { invoices: hookInvoices, updateInvoice, createInvoice, deleteInvoice, loading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredInvoices = useMemo(() => {
    return hookInvoices.filter(inv => {
      const matchesSearch = inv.hotel.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || inv.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [hookInvoices, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, itemsPerPage]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const totals = useMemo(() => {
    return hookInvoices.reduce((acc, inv) => {
      acc.total += inv.total || 0;
      if (inv.status.toLowerCase() === 'paid') acc.collected += inv.total || 0;
      if (inv.status.toLowerCase() === 'pending') acc.pending += inv.total || 0;
      if (inv.status.toLowerCase() === 'overdue') acc.overdue += inv.total || 0;
      return acc;
    }, { total: 0, collected: 0, pending: 0, overdue: 0 });
  }, [hookInvoices]);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <PageHeader title="The Ledger" subtitle="B2B Billing Registry">
        <Button
          variant="action"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus size={16} strokeWidth={4} />}
        >
          Generate Invoice
        </Button>
      </PageHeader>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Invoiced" value={`₹${totals.total.toLocaleString()}`} subtext="Aggregated Volume" icon={FileText} />
        <SummaryCard title="Collected" value={`₹${totals.collected.toLocaleString()}`} icon={CheckCircle2} color="text-emerald-500" />
        <SummaryCard title="Pending" value={`₹${totals.pending.toLocaleString()}`} icon={Clock} color="text-amber-500" />
        <SummaryCard title="Overdue" value={`₹${totals.overdue.toLocaleString()}`} icon={AlertCircle} color="text-red-500" />
      </div>

      {/* Integrated Data Grid */}
      <GlassCard noPadding clipContent className="overflow-hidden border-white/10 shadow-2xl">
        <div className="px-8 py-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/[0.01]">
            <div className="relative group w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-black/5 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-xs font-bold"
                  placeholder="Search Invoice # or Hotel..."
                />
            </div>
            <div className="flex items-center gap-2">
                <GlassDropdown 
                    trigger={
                        <button className="flex items-center justify-between gap-3 px-5 py-2 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase text-gray-700 dark:text-gray-300 hover:bg-black/20 dark:hover:bg-white/10 transition-all min-w-[140px]">
                            <span>{statusFilter}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>
                    }
                    items={[
                        { label: 'All Status', onClick: () => setStatusFilter('All Status'), variant: statusFilter === 'All Status' ? 'selected' : 'default' },
                        { label: 'Paid', onClick: () => setStatusFilter('Paid'), variant: statusFilter === 'Paid' ? 'selected' : 'default' },
                        { label: 'Pending', onClick: () => setStatusFilter('Pending'), variant: statusFilter === 'Pending' ? 'selected' : 'default' },
                        { label: 'Overdue', onClick: () => setStatusFilter('Overdue'), variant: statusFilter === 'Overdue' ? 'selected' : 'default' },
                        // Fixed error on line 145: changed setFormatBadge to setStatusFilter
                        { label: 'Failed', onClick: () => setStatusFilter('Failed'), variant: statusFilter === 'Failed' ? 'selected' : 'default' }
                    ]}
                />
            </div>
        </div>

        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-accent-strong border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Syncing Ledger...</p>
                </div>
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10">
                <th className="px-8 py-3.5">Invoice #</th>
                <th className="px-8 py-3.5">Hotel Name</th>
                <th className="px-8 py-3.5 text-right">Base</th>
                <th className="px-8 py-3.5 text-right">Tax</th>
                <th className="px-8 py-3.5 text-right">Total</th>
                <th className="px-8 py-3.5">Due Date</th>
                <th className="px-8 py-3.5 text-center">Status</th>
                <th className="px-8 py-3.5 pr-10 text-right">Aging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedInvoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => setSelectedInvoice(inv)}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <td className="px-8 py-3">
                    <span className="text-xs font-mono font-bold text-accent-strong">
                      {inv.id}
                    </span>
                  </td>
                  <td className="px-8 py-3 text-xs font-black dark:text-white uppercase truncate">{inv.hotel}</td>
                  <td className="px-8 py-3 text-right text-xs font-mono text-gray-500">₹{inv.baseAmount.toLocaleString()}</td>
                  <td className="px-8 py-3 text-right text-xs font-mono text-gray-500">₹{inv.gst.toLocaleString()}</td>
                  <td className="px-8 py-3 text-right text-xs font-black dark:text-white">
                    ₹{inv.total.toLocaleString()}
                  </td>
                  <td className="px-8 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{inv.dueDate}</td>
                  <td className="px-8 py-3 text-center"><StatusBadge status={inv.status} /></td>
                  <td className="px-8 py-3 text-right pr-10">
                      {inv.daysOverdue && (
                          <span className="text-[10px] font-black text-red-500 uppercase">
                              {inv.daysOverdue}D overdue
                          </span>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <InvoiceDetailModal 
        isOpen={!!selectedInvoice} 
        invoice={selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        onUpdate={async (id, data) => {
            const updated = await updateInvoice(id, data);
            setSelectedInvoice(updated);
        }}
        onDelete={async (id) => {
            await deleteInvoice(id);
            setSelectedInvoice(null);
        }}
      />

      <InvoiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async (data) => {
            await createInvoice(data);
        }}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredInvoices.length}
      />
    </div>
  );
};

const SummaryCard = ({ title, value, subtext, icon: Icon, color = 'text-gray-400' }: any) => (
  <GlassCard className="flex flex-col justify-between h-28 border-white/5 bg-black/5 dark:bg-white/[0.01]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black dark:text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  </GlassCard>
);

export default Invoices;
