import React, { useState } from 'react';
import { 
  Shield, Check, X, ShieldAlert, Save, RotateCcw, 
  ArrowLeft, Search, Info, ChevronRight, Layout,
  Eye, Edit3, Trash2, PlusCircle, FileOutput, Zap,
  ShieldCheck
} from 'lucide-react';
import GlassCard from './GlassCard';
import { useTheme } from '../../hooks/useTheme';

interface PermissionAction {
  id: string;
  label: string;
  icon: any;
  isHighRisk?: boolean;
}

interface PermissionModule {
  id: string;
  label: string;
  description: string;
  actions: string[]; // IDs of actions available for this module
}

interface PermissionGridProps {
  roleName: string;
  onBack: () => void;
  type: 'super' | 'hotel';
}

const PermissionGrid: React.FC<PermissionGridProps> = ({ roleName, onBack, type }) => {
  const { isDarkMode } = useTheme();
  const [search, setSearch] = useState('');

  // 1. Define available actions (X-Axis)
  const availableActions: PermissionAction[] = [
    { id: 'view', label: 'View', icon: Eye },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'edit', label: 'Edit', icon: Edit3 },
    { id: 'delete', label: 'Delete', icon: Trash2, isHighRisk: true },
    { id: 'export', label: 'Export', icon: FileOutput },
    { id: 'special', label: 'Override', icon: Zap, isHighRisk: true },
  ];

  // 2. Define modules based on context (Y-Axis)
  const modules: PermissionModule[] = type === 'super' ? [
    { id: 'hotels', label: 'Hotels Registry', description: 'Tenant management and onboarding', actions: ['view', 'create', 'edit', 'delete', 'export', 'special'] },
    { id: 'kiosks', label: 'Kiosk Fleet', description: 'Hardware telemetry and firmware control', actions: ['view', 'edit', 'special'] },
    { id: 'plans', label: 'Product Catalog', description: 'Commercial plan definitions', actions: ['view', 'create', 'edit', 'delete'] },
    { id: 'billing', label: 'Platform Billing', description: 'Invoice generation and B2B receivables', actions: ['view', 'edit', 'export', 'special'] },
    { id: 'users', label: 'Admin Users', description: 'Platform team management', actions: ['view', 'create', 'edit', 'delete'] },
    { id: 'audit', label: 'Audit Forensic', description: 'Immutable system logs access', actions: ['view', 'export'] },
  ] : [
    { id: 'guests', label: 'Guest Registry', description: 'Guest details and KYC assets', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { id: 'rooms', label: 'Room Management', description: 'Status and cleaning tasks', actions: ['view', 'edit', 'special'] },
    { id: 'rates', label: 'Rate & Inventory', description: 'Revenue and yield management', actions: ['view', 'edit', 'special'] },
    { id: 'pos', label: 'Billing/POS', description: 'Guest invoices and settlement', actions: ['view', 'create', 'edit', 'delete', 'export', 'special'] },
    { id: 'staff', label: 'Staff Directory', description: 'Property personnel access', actions: ['view', 'create', 'edit', 'delete'] },
    { id: 'audit_h', label: 'Property Audit', description: 'Night audit and shift logs', actions: ['view', 'export', 'special'] },
  ];

  // 3. Current Permission State (Mocked)
  const [permissions, setPermissions] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    modules.forEach(m => {
      initial[m.id] = new Set(['view']); // Default only view access
    });
    return initial;
  });

  const togglePermission = (moduleId: string, actionId: string) => {
    const newPerms = { ...permissions };
    const modulePerms = new Set(newPerms[moduleId]);
    if (modulePerms.has(actionId)) {
      modulePerms.delete(actionId);
    } else {
      modulePerms.add(actionId);
    }
    newPerms[moduleId] = modulePerms;
    setPermissions(newPerms);
  };

  const toggleRow = (moduleId: string) => {
    const newPerms = { ...permissions };
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const allCurrent = module.actions.every(a => newPerms[moduleId].has(a));
    if (allCurrent) {
      newPerms[moduleId] = new Set();
    } else {
      newPerms[moduleId] = new Set(module.actions);
    }
    setPermissions(newPerms);
  };

  const filteredModules = modules.filter(m => 
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 dark:hover:text-orange-500 transition-colors group mb-3"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Role Registry
          </button>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center text-white shadow-xl">
                <Shield size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">RBAC Matrix</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Configuring Role: <span className="text-blue-600 dark:text-orange-500">{roleName}</span></p>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <RotateCcw size={16} /> Reset Default
          </button>
          <button className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all">
            <Save size={18} /> Commit Changes
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4 border-white/10" noPadding>
          <div className="relative w-full md:flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-16 pr-6 py-5 border-none rounded-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
              placeholder="Search module or action keyword..."
            />
          </div>
          <div className="px-6 py-2 flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">High Risk Action</span>
             </div>
             <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Permissions Propagate in Real-Time</span>
             </div>
          </div>
      </GlassCard>

      {/* Main Grid */}
      <GlassCard noPadding clipContent className="overflow-hidden shadow-2xl border-white/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/10 dark:bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/10">
                <th className="px-8 py-6 w-[350px] sticky left-0 z-20 bg-gray-100 dark:bg-[#121212] border-r border-white/5">
                   Module Identity
                </th>
                {availableActions.map((action) => (
                  <th key={action.id} className="px-6 py-6 text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-2">
                       <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 ${action.isHighRisk ? 'text-red-500' : 'text-gray-400'}`}>
                          <action.icon size={18} />
                       </div>
                       <span>{action.label}</span>
                    </div>
                  </th>
                ))}
                <th className="px-8 py-6 text-right pr-10">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredModules.map((module) => (
                <tr key={module.id} className="group hover:bg-black/5 dark:hover:bg-white/[0.01] transition-all">
                  <td className="px-8 py-6 sticky left-0 z-20 bg-gray-50 dark:bg-[#0a0a0a] group-hover:bg-gray-100 dark:group-hover:bg-[#121212] border-r border-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => toggleRow(module.id)}
                         className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white transition-all"
                         title="Select All Module Actions"
                       >
                          <Layout size={14} />
                       </button>
                       <div>
                          <h3 className="text-sm font-black dark:text-white leading-none mb-1.5 uppercase">{module.label}</h3>
                          <p className="text-[10px] font-medium text-gray-500 leading-tight">{module.description}</p>
                       </div>
                    </div>
                  </td>
                  {availableActions.map((action) => {
                    const isAvailable = module.actions.includes(action.id);
                    const isEnabled = permissions[module.id]?.has(action.id);
                    
                    return (
                      <td key={action.id} className="px-6 py-6 text-center">
                        {isAvailable ? (
                          <button 
                            onClick={() => togglePermission(module.id, action.id)}
                            className={`
                              w-10 h-10 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300
                              ${isEnabled 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-110' 
                                : 'bg-black/10 dark:bg-white/5 text-gray-600 hover:bg-black/20 dark:hover:bg-white/10'
                              }
                              ${action.isHighRisk && isEnabled ? 'bg-red-600 shadow-red-900/40' : ''}
                            `}
                          >
                            {isEnabled ? <Check size={18} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
                          </button>
                        ) : (
                          <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-300 dark:text-zinc-800">
                             <X size={16} strokeWidth={3} className="opacity-20" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-8 py-6 text-right pr-10">
                     <div className="flex justify-end">
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                          permissions[module.id].size === module.actions.length 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : permissions[module.id].size === 0
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                           {permissions[module.id].size === module.actions.length ? 'FULL ACCESS' : permissions[module.id].size === 0 ? 'RESTRICTED' : 'PARTIAL'}
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Safety Banner */}
      <div className="p-8 rounded-[2.5rem] bg-orange-600 text-white shadow-2xl flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-bottom-6 duration-1000">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldAlert size={40} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-black leading-tight mb-1 uppercase italic tracking-tighter">Security Safeguard Active</h4>
              <p className="text-sm font-medium opacity-90 leading-relaxed max-w-3xl">
                  Permissions designated as <span className="bg-white/20 px-1.5 py-0.5 rounded font-black">High Risk</span> require a secondary hardware-token authentication to save. These actions affect property revenue and critical financial data.
              </p>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20">
             {/* Fix: Added missing ShieldCheck import and used it here */}
             <ShieldCheck size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest">MFA Required for Write</span>
          </div>
      </div>

    </div>
  );
};

export default PermissionGrid;