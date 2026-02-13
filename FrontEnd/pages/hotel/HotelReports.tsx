import React from 'react';
import { 
  IndianRupee, 
  ArrowRight, 
  Clock, 
  Globe, 
  Info,
  Layout
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

const DummyTag = () => (
  <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 w-fit animate-pulse">
    <Info size={14} strokeWidth={3} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dummy Data Page</span>
  </div>
);

const FormatChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
    {label}
  </span>
);

const IntelligenceCard = ({ icon: Icon, title, description, formats, colorClass }: any) => {
  return (
    <GlassCard className="flex flex-col items-center text-center p-10 h-full border-white/10 hover:border-blue-500/30 dark:hover:border-orange-500/30 transition-all group shadow-2xl">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 duration-500 ${colorClass}`}>
        <Icon size={36} />
      </div>
      
      <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-4 leading-none">{title}</h3>
      
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-8 px-2 h-12 overflow-hidden">
        {description}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {formats.map((f: string) => <FormatChip key={f} label={f} />)}
      </div>
      
      <button className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-orange-500 transition-colors mt-auto">
        Export <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </GlassCard>
  );
};

const HotelReports: React.FC = () => {
  const { isDarkMode } = useTheme();

  const reports = [
    { 
      id: 'occ', 
      icon: Layout, 
      title: 'Occupancy Report', 
      description: 'Comprehensive yield analysis including RevPAR, ADR, and daily fill trajectory.',
      formats: ['CSV', 'PDF', 'XLSX'],
      colorClass: 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
    },
    { 
      id: 'rev', 
      icon: IndianRupee, 
      title: 'Revenue Report', 
      description: 'Detailed GST split analysis by service type (Rooms/F&B) and channel yield.',
      formats: ['CSV', 'PDF', 'XLSX'],
      colorClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
    },
    { 
      id: 'gst', 
      icon: Globe, 
      title: 'Guest Report', 
      description: 'Demographic analysis, C-Form compliance data, and nationality mix tracking.',
      formats: ['CSV', 'PDF', 'XLSX'],
      colorClass: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
    },
    { 
      id: 'ops', 
      icon: Clock, 
      title: 'Operations Report', 
      description: 'Turnaround efficiency by floor, MTTR for incidents, and staff productivity.',
      formats: ['CSV', 'XLSX'],
      colorClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-12 min-h-screen pb-32 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="space-y-2">
        <DummyTag />
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Intelligence Hub</h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mt-3">Property Performance & Data Export Engine</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {reports.map(r => <IntelligenceCard key={r.id} {...r} />)}
      </div>

    </div>
  );
};

export default HotelReports;