import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, Search, Filter, Plus, Clock, 
  MessageSquare, User, DoorOpen, ChevronRight,
  AlertTriangle, CheckCircle2, History, Wrench,
  Zap, Info, LayoutGrid, AlertCircle,
  Link as LinkIcon, Camera, MousePointer2, UserPlus,
  Monitor, Brush, Lock
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import IncidentDetailModal from '../../modals/hotel/IncidentDetailModal';
import type { IncidentCategory, IncidentPriority, IncidentStatus, Incident } from '@/domain/entities/Incident';
import { useIncidents } from '@/application/hooks/useIncidents';

const IncidentsRecord: React.FC = () => {
  const { incidents: allIncidents } = useIncidents();
  const [activeTab, setActiveTab] = useState<IncidentStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter(inc => {
      const matchesSearch = inc.subject.toLowerCase().includes(search.toLowerCase()) || 
                           inc.id.toLowerCase().includes(search.toLowerCase()) ||
                           inc.room.includes(search);
      const matchesStatus = activeTab === 'All' || inc.status === activeTab;
      return matchesSearch && matchesStatus;
    });
  }, [allIncidents, search, activeTab]);

  const PriorityBadge = ({ level }: { level: IncidentPriority }) => {
    const styles = {
      Critical: 'bg-red-600 text-white shadow-lg shadow-red-900/20',
      High: 'bg-accent text-white',
      Medium: 'bg-accent text-white',
      Low: 'bg-gray-500 text-white'
    };
    return <span className={`inline-block px-3 py-1.5 rounded text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[level]}`}>{level}</span>;
  };

  const KanbanColumn = ({ status }: { status: IncidentStatus }) => {
    const columnIncidents = filteredIncidents.filter(i => i.status === status);
    return (
      <div className="flex flex-col gap-4 min-w-[300px] flex-1">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{status}</h3>
          <span className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-black dark:text-gray-400 border border-white/5">{columnIncidents.length}</span>
        </div>
        <div className="space-y-4">
          {columnIncidents.map(inc => (
            <GlassCard 
              key={inc.id} 
              onClick={() => setSelectedIncident(inc)}
              className={`p-5 group cursor-pointer hover:scale-[1.02] transition-all border-l-4 ${
                inc.priority === 'Critical' ? 'border-l-red-600' : 
                inc.priority === 'High' ? 'border-l-orange-500' : 
                'border-l-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <PriorityBadge level={inc.priority} />
                {inc.slaBreached && (
                  <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase animate-pulse leading-none whitespace-nowrap">
                    <AlertCircle size={10} /> SLA Breached
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black dark:text-white leading-snug mb-3 group-hover:text-accent-strong transition-colors">
                {inc.subject}
              </h4>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-500">
                    <DoorOpen size={12} />
                  </div>
                  <span className="text-[10px] font-black dark:text-gray-300">#{inc.room}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 uppercase">{inc.createdAt.split(',')[1]}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader title="Incident Records" subtitle="Operational Issue & Problem Tracker" />

      {/* Analytics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <SummaryCard label="Open Critical" value="01" sub="Resolution Overdue" icon={ShieldAlert} color="text-red-500" />
         <SummaryCard label="Maintenance" value="08" sub="On-going repair" icon={Wrench} color="text-accent" />
         <SummaryCard label="Housekeeping" value="14" sub="Priority Cleaning" icon={Brush} color="text-accent" />
         <SummaryCard label="MTTR (Today)" value="42m" sub="Mean Time To Resolve" icon={Clock} color="text-emerald-500" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 w-fit overflow-x-auto no-scrollbar">
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex-1 w-full lg:max-w-md">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-16 pr-6 py-4 border border-white/10 rounded-[1.5rem] bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 sm:text-sm shadow-sm"
                  placeholder="Search Subject, ID, Room..."
                />
            </div>
        </div>
      </div>

      {/* Main Content Rendering - Kanban View Only */}
      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
        <KanbanColumn status="Open" />
        <KanbanColumn status="In Progress" />
        <KanbanColumn status="Resolved" />
        <KanbanColumn status="Closed" />
      </div>

      <IncidentDetailModal isOpen={!!selectedIncident} incident={selectedIncident} onClose={() => setSelectedIncident(null)} />

    </div>
  );
};

const SummaryCard = ({ label, value, sub, icon: Icon, color }: any) => (
  <GlassCard className="flex flex-col justify-between h-36 border-white/5 bg-black/5 dark:bg-white/[0.01]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black dark:text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl bg-black/5 dark:bg-white/5 ${color}`}><Icon size={20} /></div>
    </div>
    <p className="text-[10px] font-bold text-gray-500 uppercase">{sub}</p>
  </GlassCard>
);

export default IncidentsRecord;
