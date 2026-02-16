import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import HelpdeskDetailModal from '../../modals/super/HelpdeskDetailModal';
import { useAdminTickets } from '@/application/hooks/useAdminTickets';
// import { useAdminIncidents } from '@/application/hooks/useAdminIncidents'; // Removed
import type { IncidentPriority, IncidentStatus } from '@/domain/entities/Incident';
import type { HotelTicket as Ticket, HotelTicketStatus as Status } from '@/domain/entities/HotelTicket';

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles: Record<string, string> = {
    Low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    Medium: 'bg-blue-500/10 text-accent border-accent/20',
    High: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Critical: 'bg-red-600 text-white shadow-lg shadow-red-900/40 font-black border-transparent',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border leading-none whitespace-nowrap ${styles[priority] || styles.Low}`}>
      {priority}
    </span>
  );
};

const Helpdesk: React.FC = () => {
  const { tickets: allTickets, loading, error } = useAdminTickets();
  const [search, setSearch] = useState('');
  const [activeTab] = useState<IncidentStatus | 'All'>('All'); // Changed Status to IncidentStatus
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredTickets = useMemo(() => {
    return (allTickets as unknown as Ticket[]).filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                           t.id.toString().toLowerCase().includes(search.toLowerCase()) ||
                           (t as any).hotelName?.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'All' || t.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [allTickets, search, activeTab]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader
        title="Support Helpdesk"
        subtitle="Active Infrastructure Issue Tracking"
      />

      {/* Kanban View */}
      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[500px]">
         {['Open', 'In Progress', 'Waiting on Client', 'Resolved'].map(s => {
           const ticketsInColumn = paginatedTickets.filter(t => t.status === s);
           return (
             <div key={s} className="flex flex-col gap-4 min-w-[300px] flex-1">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{s}</h3>
                  <span className="text-[10px] font-black text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">{ticketsInColumn.length}</span>
                </div>
                <div className="space-y-4">
                   {ticketsInColumn.map((t: any) => (
                      <div key={t.id} onClick={() => setSelectedTicket(t)} className="glass-card p-5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/30 cursor-pointer shadow-sm group">
                         <div className="flex justify-between mb-3"><PriorityBadge priority={t.priority} /></div>
                         <h4 className="text-sm font-black dark:text-white leading-snug group-hover:text-accent transition-colors">{t.subject}</h4>
                         <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                            <span>{t.hotelName}</span>
                            <span>{t.createdAt ? formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }) : 'Just now'}</span>
                         </div>
                      </div>
                   ))}
                   {ticketsInColumn.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[1.5rem] opacity-30">
                        <CheckCircle2 size={32} className="mb-2 text-gray-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">All Clear</span>
                      </div>
                   )}
                </div>
             </div>
           );
         })}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredTickets.length}
      />

      {selectedTicket && <HelpdeskDetailModal isOpen={!!selectedTicket} ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
};

export default Helpdesk;
