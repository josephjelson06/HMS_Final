
import React from 'react';
import { useSubscriptionInvoices, Invoice } from '@/application/hooks/useSubscriptionInvoices';
import { Subscription } from '@/domain/entities/Subscription';
import ModalShell from '@/presentation/components/ui/ModalShell';
import { Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Button from '@/presentation/components/ui/Button';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({ isOpen, onClose, subscription }) => {
  const { invoices, loading, error } = useSubscriptionInvoices(subscription.id);

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'Paid': return <CheckCircle2 size={14} className="text-emerald-500" />;
        case 'Overdue': return <AlertCircle size={14} className="text-red-500" />;
        default: return <Clock size={14} className="text-amber-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
     switch(status) {
        case 'Paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'Overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
     }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerContent={
        <div>
           <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">Financial Ledger</h2>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Invoice History for {subscription.hotel}</p>
        </div>
      }
    >
        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading records...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">Failed to load invoices</div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic">No invoices generated yet.</div>
            ) : (
                <div className="space-y-3">
                    {invoices.map((inv: Invoice) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white/5 text-[10px] font-bold text-gray-500 uppercase border border-white/5">
                                    <span>{new Date(inv.generated_on).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-sm text-gray-300">{new Date(inv.generated_on).getDate()}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold dark:text-white uppercase tracking-wider mb-1">INV-{String(inv.id).padStart(6, '0')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${getStatusStyle(inv.status)}`}>
                                            {getStatusIcon(inv.status)}
                                            {inv.status}
                                        </span>
                                        <span className="text-[9px] text-gray-500 uppercase tracking-wider">Due: {new Date(inv.due_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black dark:text-white tracking-tight">₹{inv.amount.toLocaleString()}</p>
                                <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline flex items-center gap-1 justify-end mt-1">
                                    <Download size={10} /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="p-4 border-t border-white/10 bg-black/5 flex justify-end">
            <Button variant="ghost" onClick={onClose}>Close Ledger</Button>
        </div>
    </ModalShell>
  );
};

export default InvoiceHistoryModal;
