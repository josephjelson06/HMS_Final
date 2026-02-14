
import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, Search, Filter, Calendar, User, 
  Monitor, Zap, ShieldCheck, ArrowRightLeft, 
  Download, LogIn, PlusCircle, Edit3, Trash2, 
  DoorOpen, IndianRupee, ShieldAlert, ChevronDown,
  Smartphone, MousePointer2, FileText, ClipboardCheck
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import type { HotelActionType, HotelModule, HotelAuditLog as HotelAuditEntry } from '@/domain/entities/HotelAuditLog';
import { useHotelAudit } from '@/application/hooks/useHotelAudit';

const ActionBadge = ({ action }: { action: HotelActionType }) => {
  const styles = {
    CREATE: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    UPDATE: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    DELETE: 'text-red-500 bg-red-500/10 border-red-500/20',
    LOGIN: 'text-accent bg-blue-500/10 border-accent/20',
    CHECKOUT: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    VOID: 'text-red-600 bg-red-600/10 border-red-600/20 font-black',
    REFUND: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    SHIFT_CLOSE: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    NIGHT_AUDIT: 'text-white bg-accent-strong border-transparent shadow-lg shadow-accent-strong/20'
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border w-fit text-[9px] font-bold uppercase tracking-widest ${styles[action]}`}>
      <span>{action.replace('_', ' ')}</span>
    </div>
  );
};

const HotelAudit: React.FC = () => {
  const { logs: allLogs } = useHotelAudit();
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('All Staff');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase());
      const matchesUser = userFilter === 'All Staff' || log.user === userFilter;
      const matchesModule = moduleFilter === 'All Modules' || log.module === moduleFilter;
      return matchesSearch && matchesUser && matchesModule;
    });
  }, [allLogs, search, userFilter, moduleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, userFilter, moduleFilter, itemsPerPage]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <PageHeader title="Audit Forensic" subtitle="Immutable Accountability Ledger">
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
          <ShieldCheck size={18} strokeWidth={3} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Logs Cryptographically Signed</span>
        </div>
        <Button
          size="md"
          icon={<Download size={16} strokeWidth={3} />}
        >
          Export CAR
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <GlassCard className="flex flex-col lg:flex-row gap-4 items-center justify-between" noPadding>
        <div className="p-2 w-full flex-1 flex flex-col md:flex-row gap-2">
            <div className="relative group flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-16 pr-6 py-4 border-none rounded-xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
                  placeholder="Search forensic descriptions..."
                />
            </div>
            
            <div className="flex items-center gap-2 px-2">
                <div className="relative">
                    <select 
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="appearance-none bg-black/5 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 pr-8 text-[10px] font-bold uppercase text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                    >
                        <option>All Staff</option>
                        <option>Arjun V.</option>
                        <option>Riya Mehta</option>
                        <option>Suresh Kumar</option>
                        <option>Meera L.</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                    <Calendar size={14} /> Range
                </button>
            </div>
        </div>
      </GlassCard>

      {/* Audit Table */}
      <div className="space-y-6">
        <GlassCard noPadding className="overflow-hidden border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/10 dark:bg-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                  <th className="px-8 py-6 w-48">Timestamp</th>
                  <th className="px-8 py-6 w-56">User Identity</th>
                  <th className="px-8 py-6 w-32">Action</th>
                  <th className="px-8 py-6 w-48">Functional Module</th>
                  <th className="px-8 py-6 min-w-[300px]">Narrative Description</th>
                  <th className="px-8 py-6 text-right pr-10">Access Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-white/5 transition-all group border-l-4 border-transparent hover:border-orange-500 ${log.action === 'NIGHT_AUDIT' ? 'bg-accent-strong/[0.03] border-l-accent-strong' : ''}`}
                  >
                    <td className="px-8 py-5 text-xs font-mono font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-2">
                            <User size={12} className="text-gray-500" />
                            <span className="text-sm font-black dark:text-white leading-none">{log.user}</span>
                         </div>
                         {log.isImpersonated && (
                           <div className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                              <ArrowRightLeft size={10} strokeWidth={3} />
                              <span className="text-[8px] font-bold uppercase tracking-tighter">Impersonated</span>
                           </div>
                         )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <Zap size={12} className="text-accent" />
                        {log.module}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className={`text-sm font-medium leading-relaxed italic ${log.action === 'NIGHT_AUDIT' ? 'text-accent font-bold not-italic' : 'dark:text-gray-300'}`}>
                        "{log.description}"
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right pr-10 text-[10px] font-mono font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
        
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={filteredLogs.length}
        />
      </div>

      {/* Bottom Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white shadow-2xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <ClipboardCheck size={28} />
            </div>
            <div>
                <h4 className="text-sm font-black leading-tight mb-1 uppercase italic tracking-tighter">System Integrity</h4>
                <p className="text-[11px] font-medium opacity-80 leading-relaxed">
                    Shift logs are transmitted to the Hotel Group HQ every 24 hours. Manual deletion is disabled by platform policy.
                </p>
            </div>
         </div>
         <div className="flex items-center gap-4 p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20">
            <ShieldAlert size={24} className="text-amber-500 shrink-0" />
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
              Any overrides performed by Super Admins during impersonation are highlighted in **Purple** and require manual confirmation by the GM.
            </p>
         </div>
      </div>

    </div>
  );
};

export default HotelAudit;
