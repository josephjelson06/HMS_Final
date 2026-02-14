import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, Search, Filter, Calendar, User, 
  Monitor, Zap, ShieldCheck, ArrowRightLeft, 
  Download, LogIn, PlusCircle, Edit3, Trash2, 
  FileOutput, ShieldAlert, ChevronDown
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import type { AuditLog as AuditEntry } from '@/domain/entities/AuditLog';
import { useAuditLogs } from '@/application/hooks/useAuditLogs';

const ActionBadge = ({ action }: { action: AuditEntry['action'] }) => {
  const styles = {
    LOGIN: 'text-accent bg-blue-500/10 border-accent/20',
    CREATE: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    UPDATE: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    DELETE: 'text-red-500 bg-red-500/10 border-red-500/20',
    IMPERSONATE: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    EXPORT: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  };

  const Icons = {
    LOGIN: LogIn,
    CREATE: PlusCircle,
    UPDATE: Edit3,
    DELETE: Trash2,
    IMPERSONATE: ArrowRightLeft,
    EXPORT: FileOutput,
  };

  const Icon = Icons[action];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border w-fit ${styles[action]}`}>
      <Icon size={10} strokeWidth={3} />
      <span className="text-[9px] font-black tracking-widest">{action}</span>
    </div>
  );
};

const AuditLogs: React.FC = () => {
  const { logs: allLogs } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [userFilter, setUserFilter] = useState('All Users');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) || log.id.toLowerCase().includes(search.toLowerCase());
      const matchesModule = moduleFilter === 'All Modules' || log.module === moduleFilter;
      const matchesUser = userFilter === 'All Users' || log.user === userFilter;
      return matchesSearch && matchesModule && matchesUser;
    });
  }, [allLogs, search, moduleFilter, userFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, moduleFilter, userFilter, itemsPerPage]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <PageHeader title="The Source of Truth" subtitle="Immutable System Audit Trail">
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
          <ShieldCheck size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Verified</span>
        </div>
        <Button
          size="md"
          icon={<Download size={16} />}
        >
          Export Archive
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <GlassCard className="flex flex-col lg:flex-row gap-4 items-center justify-between" noPadding>
        <div className="p-2 w-full flex-1 flex flex-col md:flex-row gap-2">
            <div className="relative group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border-none rounded-xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
                  placeholder="Filter logs by keyword or description..."
                />
            </div>
            
            <div className="flex items-center gap-2 px-2">
                <div className="relative">
                    <select 
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="appearance-none bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase text-gray-700 dark:text-gray-300 outline-none cursor-pointer pr-8"
                    >
                        <option>All Users</option>
                        {Array.from(new Set(allLogs.map(l => l.user))).map(u => <option key={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select 
                      value={moduleFilter}
                      onChange={(e) => setModuleFilter(e.target.value)}
                      className="appearance-none bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase text-gray-700 dark:text-gray-300 outline-none cursor-pointer pr-8"
                    >
                        <option>All Modules</option>
                        {Array.from(new Set(allLogs.map(l => l.module))).map(m => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
      </GlassCard>

      {/* Unified High-Density Data Table */}
      <GlassCard noPadding clipContent className="overflow-hidden border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10">
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Module</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5 text-right pr-8">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-2.5 text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-2">
                       <User size={12} className="text-gray-400" />
                       <span className="text-[11px] font-bold dark:text-gray-200">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2.5">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-6 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{log.module}</span>
                  </td>
                  <td className="px-6 py-2.5">
                    <div className="space-y-1">
                      <p className="text-xs font-medium dark:text-white leading-tight">
                        {log.description}
                      </p>
                      {log.isImpersonated && (
                        <div className="text-[9px] font-bold uppercase tracking-tighter text-accent">
                          Impersonating {log.impersonationDetail}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-right pr-8 text-[10px] font-mono font-bold text-gray-400 group-hover:text-gray-200">
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
  );
};

export default AuditLogs;
