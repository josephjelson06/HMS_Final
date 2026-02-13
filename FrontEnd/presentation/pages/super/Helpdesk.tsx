import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, List, LayoutGrid, Building2, 
  Plus, CheckCircle2, Monitor, ChevronDown, Info
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import HelpdeskDetailModal from '../../modals/super/HelpdeskDetailModal';
import type { HelpdeskTicket as Ticket, HelpdeskPriority as Priority, HelpdeskStatus as Status, HelpdeskCategory as Category } from '@/domain/entities/Ticket';
import { mockTickets } from '../../../data/helpdesk';

type ViewMode = 'table' | 'kanban';

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    Low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    Medium: 'bg-blue-500/10 text-accent border-accent/20',
    High: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Critical: 'bg-red-600 text-white shadow-lg shadow-red-900/40 font-black border-transparent',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border leading-none whitespace-nowrap ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    Open: 'bg-accent-strong text-white',
    'In Progress': 'bg-purple-500 text-white',
    'Waiting on Client': 'bg-amber-500 text-white',
    Resolved: 'bg-emerald-500 text-white',
    Closed: 'bg-gray-500 text-white',
  };
  return (
    <span className={`inline-block px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
};

const Helpdesk: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Status | 'All'>('All');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredTickets = useMemo(() => {
    return mockTickets.filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                           t.id.toLowerCase().includes(search.toLowerCase()) ||
                           t.hotel.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'All' || t.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, viewMode, itemsPerPage]);

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
        badge="Dummy Data Page"
      >
        <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1 border border-white/5">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-white/10 shadow-lg text-accent-strong' : 'text-gray-400 hover:text-white'}`}>
            <List size={20} />
          </button>
          <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-white/10 shadow-lg text-accent-strong' : 'text-gray-400 hover:text-white'}`}>
            <LayoutGrid size={20} />
          </button>
        </div>
        <Button
          variant="action"
          size="md"
          icon={<Plus size={18} strokeWidth={3} />}
        >
          New Ticket
        </Button>
      </PageHeader>

      {/* Main Container */}
      {viewMode === 'table' ? (
        <GlassCard noPadding clipContent className="overflow-hidden border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 py-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/[0.01]">
              <div className="relative group w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-black/5 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-xs font-bold"
                      placeholder="Search ID, Hotel or Subject..."
                  />
              </div>
              <div className="flex items-center gap-2">
                  <div className="relative">
                      <select 
                          value={activeTab}
                          onChange={(e) => setActiveTab(e.target.value as any)}
                          className="appearance-none bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase text-gray-700 dark:text-gray-300 outline-none cursor-pointer pr-8"
                      >
                          <option>All Status</option>
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Waiting on Client</option>
                          <option>Resolved</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
              </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10">
                  <th className="px-8 py-3.5">Ticket ID</th>
                  <th className="px-8 py-3.5">Priority</th>
                  <th className="px-8 py-3.5">Subject / Hotel</th>
                  <th className="px-8 py-3.5">Category</th>
                  <th className="px-8 py-3.5">Assignee</th>
                  <th className="px-8 py-3.5 text-right pr-10">Last Update</th>
                  <th className="px-8 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedTickets.map((t) => (
                  <tr key={t.id} onClick={() => setSelectedTicket(t)} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all group cursor-pointer">
                    <td className="px-8 py-4"><span className="text-xs font-mono font-bold text-accent-strong">{t.id}</span></td>
                    <td className="px-8 py-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                          <span className="text-xs font-black dark:text-white leading-tight mb-1">{t.subject}</span>
                          <span className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1"><Building2 size={10} /> {t.hotel}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4"><span className="text-[9px] font-bold uppercase text-gray-400 border border-white/5 px-2 py-0.5 rounded">{t.category}</span></td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-[7px] font-black text-accent-strong uppercase border border-accent/20">
                          {t.assignedTo !== 'Unassigned' ? t.assignedTo.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                        <span className="text-[11px] font-bold dark:text-gray-300">{t.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right pr-10 text-[10px] font-bold text-gray-500 uppercase">{t.lastUpdated}</td>
                    <td className="px-8 py-4 text-center"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[500px]">
           {['Open', 'In Progress', 'Waiting on Client', 'Resolved'].map(s => (
             <div key={s} className="flex flex-col gap-4 min-w-[300px] flex-1">
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{s}</h3>
                <div className="space-y-4">
                   {filteredTickets.filter(t => t.status === s).map(t => (
                      <div key={t.id} onClick={() => setSelectedTicket(t)} className="glass-card p-5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/30 cursor-pointer shadow-sm group">
                         <div className="flex justify-between mb-3"><PriorityBadge priority={t.priority} /></div>
                         <h4 className="text-sm font-black dark:text-white leading-snug group-hover:text-accent transition-colors">{t.subject}</h4>
                         <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                            <span>{t.hotel}</span>
                            <span>{t.lastUpdated}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}

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
