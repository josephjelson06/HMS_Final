
import React, { useState } from 'react';
import { 
  Building2, CreditCard, FileText, Users, 
  ArrowLeft, FileOutput, ArrowRight,
  Calendar, Download, CheckSquare, Square,
  CheckCircle, FileSpreadsheet
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useHotels } from '../../../application/hooks/useHotels';
import { useSubscriptions } from '../../../application/hooks/useSubscriptions';
import { useInvoices } from '../../../application/hooks/useInvoices';
import { useUsers } from '../../../application/hooks/useUsers';

// --- SUB-COMPONENTS ---

const FormatBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {label}
  </span>
);

const ReportSummaryCard = ({ icon: Icon, title, preview, formats, color, onClick }: any) => {
  const colorStyles: Record<string, string> = {
    blue: 'text-accent bg-blue-500/10 dark:bg-blue-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/20',
  };

  return (
    <button 
      onClick={onClick}
      className="group text-center h-full transition-all w-full outline-none"
    >
      <GlassCard className="h-full flex flex-col items-center hover:border-accent/30 transition-all relative overflow-hidden p-8">
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
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white group-hover:text-accent-strong transition-colors">
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

// --- EXPORT PANEL COMPONENT ---

interface ReportExportPanelProps {
  reportId: string;
  reportTitle: string;
  totalRecords: number;
  availableColumns: string[];
  onBack: () => void;
}

const ReportExportPanel: React.FC<ReportExportPanelProps> = ({ 
  reportId, reportTitle, totalRecords, availableColumns, onBack 
}) => {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set(availableColumns));
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const toggleColumn = (col: string) => {
    const next = new Set(selectedColumns);
    if (next.has(col)) {
      if (next.size > 1) next.delete(col); // Prevent emptying selection
    } else {
      next.add(col);
    }
    setSelectedColumns(next);
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      // Reset after 3 seconds
      setTimeout(() => setExportComplete(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group mb-6"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Registry
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{reportTitle}</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-3">Configure Data Export</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-8">
          {/* Date Range & Format */}
          <GlassCard className="p-8 space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-accent-strong/10 text-accent-strong">
                   <Calendar size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Timeframe & Format</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Start Date</label>
                   <input 
                      type="date" 
                      className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 outline-none text-sm font-bold dark:text-white focus:border-accent-strong/50 transition-colors"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">End Date (Optional)</label>
                   <input 
                      type="date" 
                      className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 outline-none text-sm font-bold dark:text-white focus:border-accent-strong/50 transition-colors"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                   />
                </div>
             </div>

             <div className="pt-6 border-t border-white/5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Export Format</label>
                <div className="flex gap-4">
                   {['CSV', 'PDF', 'XLSX'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-6 py-3 rounded-xl border text-xs font-black tracking-widest transition-all
                          ${selectedFormat === fmt 
                            ? 'bg-accent-strong text-white border-transparent shadow-lg scale-105' 
                            : 'bg-transparent border-white/10 text-gray-500 hover:border-accent-strong/30 hover:text-accent-strong'
                          }
                        `}
                      >
                         {fmt}
                      </button>
                   ))}
                </div>
             </div>
          </GlassCard>

          {/* Column Selection */}
          <GlassCard className="p-8">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <FileSpreadsheet size={20} />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Data Points</h3>
                </div>
                <button 
                  onClick={() => setSelectedColumns(new Set(availableColumns))}
                  className="text-[10px] font-bold uppercase tracking-widest text-accent-strong hover:underline"
                >
                   Select All
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableColumns.map(col => {
                   const isSelected = selectedColumns.has(col);
                   return (
                      <button
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all group
                           ${isSelected 
                              ? 'bg-accent-strong/5 border-accent-strong/30' 
                              : 'bg-transparent border-white/5 hover:bg-white/5'
                           }
                        `}
                      >
                         <span className={`text-xs font-bold ${isSelected ? 'text-accent-strong' : 'text-gray-500'}`}>{col}</span>
                         {isSelected 
                            ? <CheckSquare size={16} className="text-accent-strong" /> 
                            : <Square size={16} className="text-gray-400 group-hover:text-gray-300" />
                         }
                      </button>
                   );
                })}
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Preview & Action */}
        <div className="space-y-8">
           <GlassCard className="p-8 sticky top-8 bg-gradient-to-br from-white/10 to-white/5 border-accent-strong/20">
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white mb-6">Export Summary</h3>
              
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Selected Records</span>
                    <span className="font-bold dark:text-white">{totalRecords}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Columns</span>
                    <span className="font-bold dark:text-white">{selectedColumns.size} / {availableColumns.length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Format</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-bold font-mono">{selectedFormat}</span>
                 </div>
              </div>

              <button
                disabled={isExporting}
                onClick={handleExport}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all
                   ${exportComplete 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white dark:bg-white text-black hover:scale-[1.02] active:scale-95'
                   }
                `}
              >
                 {isExporting ? (
                    <>
                       <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                       Generating...
                    </>
                 ) : exportComplete ? (
                    <>
                       <CheckCircle size={18} />
                       Export Complete
                    </>
                 ) : (
                    <>
                       <Download size={18} />
                       Download Report
                    </>
                 )}
              </button>
              
              <p className="text-[10px] text-center text-gray-500 mt-4 font-medium">
                 Data is encrypted end-to-end. {selectedFormat === 'PDF' ? 'Large PDFs may take time to generate.' : ''}
              </p>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const { hotels, loading: hotelsLoading } = useHotels();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { users, loading: usersLoading } = useUsers();

  const isLoading = hotelsLoading || subscriptionsLoading || invoicesLoading || usersLoading;

  // Configuration for each report type
  const reportConfigs: Record<string, { cols: string[] }> = {
     'hotels': {
        cols: ['Hotel Name', 'Status', 'Plan', 'GSTIN', 'Contact Person', 'Email', 'Phone', 'Address', 'Onboarded Date']
     },
     'subscriptions': {
        cols: ['Subscription ID', 'Hotel Name', 'Plan', 'Status', 'Amount', 'Billing Cycle', 'Next Renewal', 'Payment Method']
     },
     'invoices': {
        cols: ['Invoice ID', 'Date', 'Hotel Name', 'Amount', 'Status', 'Due Date', 'Payment Date', 'Transaction ID']
     },
     'users': {
        cols: ['User Name', 'Role', 'Email', 'Phone', 'Status', 'Last Active', 'Permissions Group']
     }
  };

  const reports = [
    { 
      id: 'hotels', 
      icon: Building2, 
      title: 'Hotels Report', 
      preview: 'Comprehensive registry of all onboarded properties, including operational status, licensing details, and tax identifiers.', 
      formats: ['CSV', 'PDF', 'XLSX'], 
      color: 'blue',
      rows: hotels.length,
    },
    { 
      id: 'subscriptions', 
      icon: CreditCard, 
      title: 'Subscriptions Report', 
      preview: 'Detailed breakdown of active recurring billing plans, renewal schedules, and commercial tier assignments across the network.', 
      formats: ['CSV', 'PDF', 'XLSX'], 
      color: 'cyan',
      rows: subscriptions.length,
    },
    { 
      id: 'invoices', 
      icon: FileText, 
      title: 'Invoices Report', 
      preview: 'Complete financial ledger of generated invoices, tracking payment statuses, overdue receivables, and revenue realization.', 
      formats: ['CSV', 'PDF', 'XLSX'], 
      color: 'emerald',
      rows: invoices.length,
    },
    { 
      id: 'users', 
      icon: Users, 
      title: 'Users Report', 
      preview: 'Audit log of all system access privileges, role assignments, and user identity metadata across the platform.', 
      formats: ['CSV', 'XLSX'], 
      color: 'purple',
      rows: users.length,
    },
  ];

  if (activeReport) {
     const selectedReport = reports.find((r) => r.id === activeReport);
     const config = reportConfigs[activeReport] || { cols: [] };
     
     return (
       <div className="p-4 md:p-8 space-y-8 min-h-screen pb-24">
          <ReportExportPanel 
             reportId={activeReport}
             reportTitle={selectedReport?.title || 'Report'}
             totalRecords={selectedReport?.rows || 0}
             availableColumns={config.cols}
             onBack={() => setActiveReport(null)}
          />
       </div>
     );
  }

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      <HeaderSection
        title="Intelligence Hub"
        sub={isLoading ? 'Analytical Insight & Data Export Engine | Syncing Sources' : 'Analytical Insight & Data Export Engine | Live Repository Data'}
      />
      
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
