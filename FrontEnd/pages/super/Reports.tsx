import React, { useState } from 'react';
import { 
  Building2, CreditCard, FileText, Users, 
  ArrowLeft, FileOutput, ArrowRight
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';

// --- SUB-COMPONENTS ---

const FormatBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {label}
  </span>
);

const ReportSummaryCard = ({ icon: Icon, title, preview, formats, color, onClick }: any) => {
  const colorStyles: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/20',
  };

  return (
    <button 
      onClick={onClick}
      className="group text-center h-full transition-all w-full outline-none"
    >
      <GlassCard className="h-full flex flex-col items-center hover:border-blue-500/30 dark:hover:border-orange-500/30 transition-all relative overflow-hidden p-8">
        {/* Icon Container */}
        <div className={`p-5 rounded-2xl ${colorStyles[color]} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
          <Icon size={32} />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-black dark:text-white mb-3 tracking-tight uppercase">{title}</h3>
        
        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 px-2">
          {preview}
        </p>
        
        {/* Format Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 mt-auto">
          {formats.map((f: string) => <FormatBadge key={f} label={f} />)}
        </div>
        
        {/* Export Link */}
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-orange-500 transition-colors">
          Export <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </GlassCard>
    </button>
  );
};

const HeaderSection = ({ title, sub }: any) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{title}</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-3">{sub}</p>
        </div>
    </div>
);

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reports = [
    { 
      id: 'hotels', 
      icon: Building2, 
      title: 'Hotels Report', 
      preview: 'Export complete hotel registry data including status, ratings, and amenities.', 
      formats: ['CSV', 'PDF', 'XLSX'], 
      color: 'blue' 
    },
    { 
      id: 'subscriptions', 
      icon: CreditCard, 
      title: 'Subscriptions Report', 
      preview: 'Export subscription data with plan details, status, and renewal information.', 
      formats: ['CSV', 'PDF', 'XLSX'], 
      color: 'cyan' 
    },
    { 
      id: 'invoices', 
      icon: FileText, 
      title: 'Invoices Report', 
      preview: 'Export invoice data with payment status, amounts, and hotel details.', 
      formats: ['CSV', 'PDF', 'XLSX'], 
      color: 'emerald' 
    },
    { 
      id: 'users', 
      icon: Users, 
      title: 'Users Report', 
      preview: 'Export user accounts data with roles, status, and activity information.', 
      formats: ['CSV', 'XLSX'], 
      color: 'purple' 
    },
  ];

  if (activeReport) {
     return (
       <div className="p-4 md:p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
          <button 
            onClick={() => setActiveReport(null)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>
          <HeaderSection title={reports.find(r => r.id === activeReport)?.title} sub="Comprehensive Data Analysis" />
          <GlassCard className="h-96 flex flex-col items-center justify-center text-gray-500 border-dashed border-2 border-white/10">
             <div className="text-center space-y-4">
                <FileOutput size={64} className="mx-auto opacity-10 animate-pulse text-blue-500" />
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">Compiling Archive...</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Aggregating real-time data from platform nodes</p>
                </div>
             </div>
          </GlassCard>
       </div>
     );
  }

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      <HeaderSection title="Intelligence Hub" sub="Analytical Insight & Data Export Engine" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {reports.map((r) => (
          <ReportSummaryCard 
            key={r.id} 
            {...r} 
            onClick={() => setActiveReport(r.id)} 
          />
        ))}
      </div>
      
    </div>
  );
};

export default Reports;