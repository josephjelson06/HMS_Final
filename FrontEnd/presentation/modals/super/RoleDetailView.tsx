import React, { useState } from 'react';
import { 
  ArrowLeft, Shield, Users, Mail, Phone, ExternalLink, 
  ShieldCheck, History, ShieldAlert, Eye, PlusCircle, 
  Edit3, Trash2, FileOutput, Zap, Check, Layout, X, 
  Search, Info, Save, RotateCcw
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import type { Role, User } from '@/domain/entities/User';

interface RoleDetailViewProps {
  role: Role;
  users: any[]; // Supports both platform User and hotel StaffMember
  onBack: () => void;
  type?: 'super' | 'hotel';
}

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
  actions: string[];
}

const RoleDetailView: React.FC<RoleDetailViewProps> = ({ role, users, onBack, type = 'super' }) => {
  const [search, setSearch] = useState('');
  const isInactive = role.status === 'Inactive';

  // --- PERMISSION GRID LOGIC ---
  const availableActions: PermissionAction[] = [
    { id: 'view', label: 'View', icon: Eye },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'edit', label: 'Edit', icon: Edit3 },
    { id: 'delete', label: 'Delete', icon: Trash2, isHighRisk: true },
    { id: 'export', label: 'Export', icon: FileOutput },
    { id: 'special', label: 'Override', icon: Zap, isHighRisk: true },
  ];

  // Context-aware modules
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

  const [permissions, setPermissions] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    modules.forEach(m => {
      initial[m.id] = new Set(['view']); 
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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-accent-strong transition-colors group mb-3"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Role Registry
          </button>
          <div className="flex items-center gap-5">
             <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all ${
               isInactive ? 'bg-gray-500 grayscale' : 
               role.color === 'purple' ? 'bg-purple-600 shadow-purple-900/40' :
               role.color === 'blue' ? 'bg-accent-strong shadow-blue-900/40' :
               'bg-emerald-600 shadow-emerald-900/40'
             }`}>
                <Shield size={32} />
             </div>
             <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className={`text-3xl font-black tracking-tighter uppercase leading-none ${isInactive ? 'text-gray-400' : 'dark:text-white'}`}>{role.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      isInactive ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                        {role.status}
                    </span>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{role.userCount} Assigned Identities</p>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <RotateCcw size={16} /> Reset Default
          </button>
          <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-accent-strong text-white text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            <Save size={18} /> Commit Policy Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope & Matrix Control */}
        <div className="lg:col-span-4 space-y-8">
            <GlassCard className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-accent" />
                    Mission Scope
                </h3>
                <p className="text-sm font-medium dark:text-gray-300 leading-relaxed italic">
                    "{role.desc}"
                </p>
                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-500">Access Tier</span>
                        <span className="dark:text-white">Level 4 (Executive)</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-500">MFA Required</span>
                        <span className="text-emerald-500">YES</span>
                    </div>
                </div>
            </GlassCard>

            <GlassCard noPadding className="overflow-hidden border-white/10">
                <div className="px-8 py-5 border-b border-white/5 bg-black/5 dark:bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users size={18} className="text-gray-500" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Assigned Personnel</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-black/10 dark:bg-white/10 text-[9px] font-black dark:text-gray-400">{users.length}</span>
                </div>
                
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {users.length > 0 ? (
                        users.map((u) => (
                            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                                        <img src={`https://ui-avatars.com/api/?name=${u.name}&background=0D8ABC&color=fff&size=128`} alt={u.name} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black dark:text-white uppercase tracking-tight">{u.name}</h4>
                                        <p className="text-[8px] font-mono font-bold text-gray-500 uppercase">{u.id}</p>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center space-y-2 opacity-40">
                            <History size={32} className="mx-auto text-gray-500" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No assigned staff</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            <GlassCard className="bg-accent/5 border-accent/20">
                <div className="flex items-center gap-3 text-accent mb-4">
                    <ShieldAlert size={20} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Governance Alert</h3>
                </div>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                    Changes to this matrix will immediately affect the assigned personnel session tokens. Force-logout may be triggered on critical right revocations.
                </p>
            </GlassCard>
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-8 space-y-6">
            <GlassCard noPadding clipContent className="overflow-hidden shadow-2xl border-white/10">
                <div className="px-8 py-6 border-b border-white/10 bg-black/5 dark:bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em]">Logical Matrix</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Configure individual module rights</p>
                    </div>
                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-accent transition-colors" />
                        <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-inner"
                        placeholder="Search modules..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/10 dark:bg-white/[0.03] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/10">
                                <th className="px-8 py-5 min-w-[250px] sticky left-0 z-20 bg-gray-100 dark:bg-[#121212] border-r border-white/5">
                                    Functional Module
                                </th>
                                {availableActions.map((action) => (
                                    <th key={action.id} className="px-4 py-5 text-center min-w-[90px]">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 ${action.isHighRisk ? 'text-red-500' : 'text-gray-400'}`}>
                                                <action.icon size={14} />
                                            </div>
                                            <span>{action.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredModules.map((module) => (
                                <tr key={module.id} className="group hover:bg-black/5 dark:hover:bg-white/[0.01] transition-all">
                                    <td className="px-8 py-5 sticky left-0 z-20 bg-gray-50 dark:bg-[#0a0a0a] group-hover:bg-gray-100 dark:group-hover:bg-[#121212] border-r border-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => toggleRow(module.id)}
                                                className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white transition-all shadow-sm"
                                            >
                                                <Layout size={12} />
                                            </button>
                                            <div>
                                                <h3 className="text-xs font-black dark:text-white leading-none mb-1 uppercase tracking-tight">{module.label}</h3>
                                                <p className="text-[9px] font-medium text-gray-500 leading-none">{module.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {availableActions.map((action) => {
                                        const isAvailable = module.actions.includes(action.id);
                                        const isEnabled = permissions[module.id]?.has(action.id);
                                        
                                        return (
                                            <td key={action.id} className="px-4 py-5 text-center">
                                                {isAvailable ? (
                                                    <button 
                                                        onClick={() => togglePermission(module.id, action.id)}
                                                        className={`
                                                            w-8 h-8 rounded-xl mx-auto flex items-center justify-center transition-all duration-300
                                                            ${isEnabled 
                                                                ? 'bg-accent-strong text-white shadow-lg shadow-accent-strong/30 scale-105' 
                                                                : 'bg-black/10 dark:bg-white/5 text-gray-600 hover:bg-black/20 dark:hover:bg-white/10'
                                                            }
                                                            ${action.isHighRisk && isEnabled ? 'bg-red-600 shadow-red-900/40' : ''}
                                                        `}
                                                    >
                                                        {isEnabled ? <Check size={14} strokeWidth={4} /> : <div className="w-1 h-1 rounded-full bg-current opacity-20" />}
                                                    </button>
                                                ) : (
                                                    <div className="w-8 h-8 mx-auto flex items-center justify-center text-gray-300 dark:text-zinc-800">
                                                        <X size={12} strokeWidth={3} className="opacity-10" />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            
            <div className="flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
                <ShieldCheck size={20} className="text-emerald-500" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                    Matrix Integrity Verified • No Conflicting Entitlements
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailView;
