
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Search, Phone, Calendar, 
  ChevronRight, ArrowRight, History
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import GuestDetailPanel from '../../modals/hotel/GuestDetailPanel';
import type { DetachedGuestStatus as GuestStatus, DetachedGuest as Guest } from '@/application/hooks/_detachedTypes';
import { useGuests } from '@/application/hooks/useGuests';


const StatusBadge = ({ status }: { status: GuestStatus }) => {
  const styles = {
    Reserved: 'bg-amber-500 text-white',
    'Checked-In': 'bg-emerald-600 text-white',
    'Checked-Out': 'bg-slate-400 text-white',
    Cancelled: 'bg-red-600 text-white',
    'No-Show': 'bg-slate-900 text-white'
  };
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${styles[status]}`}>
      {status}
    </span>
  );
};

const GuestRegistry: React.FC = () => {
  const { guests: allGuests } = useGuests();
  const [search, setSearch] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [activeFilter, setActiveFilter] = useState<GuestStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredGuests = useMemo(() => {
    return allGuests.filter(g => {
      const s = search.toLowerCase();
      const matchesSearch = g.mobile.includes(search) || 
                           g.name.toLowerCase().includes(s) || 
                           g.refId.toLowerCase().includes(s) || 
                           g.room.includes(search);
      
      const matchesFilter = activeFilter === 'All' || g.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allGuests, search, activeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter, itemsPerPage]);

  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGuests.slice(start, start + itemsPerPage);
  }, [filteredGuests, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader title="Guest Registry" subtitle="Active Guest List" />

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent-strong transition-colors" />
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-16 pr-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 sm:text-sm shadow-sm backdrop-blur-md font-medium"
                placeholder="Search phone, name, room or ref ID..."
            />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
                {['All', 'Checked-In', 'Checked-Out'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setActiveFilter(f as any)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f ? 'bg-white dark:bg-white/10 text-accent-strong dark:text-white shadow-sm border border-slate-200 dark:border-white/10' : 'text-slate-500 hover:text-slate-900 dark:hover:text-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

        </div>
      </div>

      {/* Main Table */}
      <GlassCard noPadding className="overflow-hidden border-slate-200 dark:border-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">
                <th className="px-8 py-5">Booking Ref</th>
                <th className="px-8 py-5">Guest Name</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5 text-center">Room</th>
                <th className="px-8 py-5">Stay Dates</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {paginatedGuests.map((g) => (
                <tr 
                  key={g.id} 
                  onClick={() => setSelectedGuest(g)}
                  className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-all group cursor-pointer border-l-4 border-transparent hover:border-accent-strong"
                >
                  <td className="px-8 py-6 align-middle">
                    <span className="text-sm font-bold text-orange-800 dark:text-orange-400 group-hover:underline font-mono">
                      {g.refId}
                    </span>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-600 dark:text-white shadow-inner">
                            {g.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1.5">{g.name}</span>
                            {g.isReturning && <span className="text-[9px] font-bold text-accent-strong bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100 dark:border-accent/20 uppercase w-fit">Repeat Guest</span>}
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-middle text-sm font-medium text-slate-500 dark:text-slate-400">{g.mobile}</td>
                  <td className="px-8 py-6 align-middle text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-200">#{g.room}</span>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-gray-400 whitespace-nowrap">
                        <Calendar size={12} className="text-slate-400" />
                        {g.checkIn} <ArrowRight size={10} className="text-slate-400" /> {g.checkOut}
                    </div>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <StatusBadge status={g.status as GuestStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Empty State */}
      {filteredGuests.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-60">
              <Users size={64} className="text-slate-300 mb-6" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Registry Matches</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">Adjust your filters or try a different search term.</p>
          </div>
      )}

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredGuests.length}
      />

      <GuestDetailPanel 
        isOpen={!!selectedGuest} 
        guest={selectedGuest} 
        onClose={() => setSelectedGuest(null)} 
      />

    </div>
  );
};

export default GuestRegistry;
