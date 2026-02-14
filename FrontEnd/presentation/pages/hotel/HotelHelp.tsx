import React, { useState, useMemo } from 'react';
import { 
  LifeBuoy, MessageSquare, Plus, FileQuestion, Monitor, 
  Phone, ChevronRight, Search, Filter, Clock, 
  CheckCircle2, AlertTriangle, MessageCircle, ArrowRight,
  ShieldAlert, Headphones, IndianRupee, HelpCircle, Info
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import NewTicketModal from '../../modals/hotel/NewTicketModal';
import HotelTicketDetailModal from '../../modals/hotel/HotelTicketDetailModal';
import type { HotelTicketCategory as TicketCategory, HotelTicketPriority as TicketPriority, HotelTicketStatus as TicketStatus, HotelTicket as Ticket } from '@/domain/entities/HotelTicket';
import { useHotelHelp } from '@/application/hooks/useHotelHelp';

const HotelHelp: React.FC = () => {
  const { tickets: allTickets } = useHotelHelp();
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = useMemo(() => {
    return allTickets.filter(t => 
      t.subject.toLowerCase().includes(search.toLowerCase()) || 
      t.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [allTickets, search]);

  const PriorityBadge = ({ level }: { level: TicketPriority }) => {
    const styles = {
      Critical: 'bg-red-600 text-white shadow-lg shadow-red-900/20',
      High: 'bg-accent text-white',
      Medium: 'bg-accent text-white',
      Low: 'bg-gray-500 text-white'
    };
    return <span className={`inline-block px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[level]}`}>{level}</span>;
  };

  const StatusBadge = ({ status }: { status: TicketStatus }) => {
    const styles = {
      Open: 'bg-blue-500/10 text-accent border-accent/20',
      'In Progress': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Waiting on Client': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return <span className={`inline-block px-3 py-1.5 rounded-full border text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader
        title="Support Helpdesk"
        subtitle="Direct Lifeline to ATC Platform Team"
        badge="Dummy Data Page"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsNewModalOpen(true)}
          icon={<Plus size={18} strokeWidth={3} />}
        >
          Raise New Ticket
        </Button>
      </PageHeader>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <SummaryItem label="Active Tickets" value="01" icon={LifeBuoy} color="text-accent" />
         <SummaryItem label="Awaiting Action" value="00" icon={Clock} color="text-amber-500" />
         <SummaryItem label="SLA Health" value="98%" icon={ShieldAlert} color="text-emerald-500" />
         <SummaryItem label="Avg Response" value="42m" icon={MessageSquare} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Ticket List */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard noPadding className="overflow-hidden border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
                <div className="relative w-64 group">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search ticket # or subject..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold dark:text-white focus:outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors">
                    <Filter size={14} /> Filter All Status
                </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/10 dark:bg-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <tr>
                    <th className="px-8 py-5">Ticket ID</th>
                    <th className="px-8 py-5">Issue Subject</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">Priority</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right pr-10">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map(t => (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTicket(t)}
                      className="hover:bg-white/5 transition-all group cursor-pointer border-l-4 border-transparent hover:border-accent-strong"
                    >
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono font-bold text-accent-strong group-hover:underline">{t.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black dark:text-white group-hover:text-accent transition-colors">{t.subject}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold uppercase text-gray-400">{t.category}</span>
                      </td>
                      <td className="px-8 py-6"><PriorityBadge level={t.priority} /></td>
                      <td className="px-8 py-6"><StatusBadge status={t.status} /></td>
                      <td className="px-8 py-6 text-right pr-10 text-[10px] font-bold text-gray-500 uppercase">{t.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Support Resources Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <GlassCard className="border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Staff Training & Docs</h3>
              <div className="space-y-3">
                 {[
                   { l: 'Billing & GST Logic', i: IndianRupee },
                   { l: 'KYC Compliance Guide', i: HelpCircle },
                   { l: 'Platform Release Notes', i: FileQuestion }
                 ].map((res, i) => (
                   <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-xl bg-white/5 text-gray-500 group-hover:text-accent transition-colors"><res.i size={16} /></div>
                         <span className="text-xs font-black uppercase dark:text-gray-300">{res.l}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-700 group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
              </div>
           </GlassCard>

           <div className="p-10 rounded-[2.5rem] bg-accent-strong text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <h4 className="text-xl font-black tracking-tighter mb-2 uppercase italic">Need Urgent Help?</h4>
              <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">Our platform engineers are available 24/7 for critical system failures.</p>
              <div className="p-5 rounded-3xl bg-black/20 text-center space-y-1 group hover:bg-black/30 transition-all cursor-pointer">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Emergency Line</p>
                 <p className="text-2xl font-black tracking-widest">+91 1800-ATC-HMS</p>
              </div>
           </div>
        </div>
      </div>

      <NewTicketModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
      <HotelTicketDetailModal isOpen={!!selectedTicket} ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />

    </div>
  );
};

const SummaryItem = ({ label, value, icon: Icon, color }: any) => (
    <GlassCard className="flex flex-col justify-between h-32 border-white/5 bg-black/5 dark:bg-white/[0.01]">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <div className={`p-2.5 rounded-xl bg-black/5 dark:bg-white/5 ${color}`}><Icon size={18} /></div>
      </div>
      <h3 className="text-3xl font-black dark:text-white tracking-tighter">{value}</h3>
    </GlassCard>
);

export default HotelHelp;
