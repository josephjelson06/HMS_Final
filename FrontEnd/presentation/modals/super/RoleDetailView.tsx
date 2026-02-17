import React from 'react';
import { 
  ArrowLeft, Shield, Save, RotateCcw
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PermissionGrid from '../../components/ui/PermissionGrid';
import type { Role } from '@/domain/entities/User';

interface RoleDetailViewProps {
  role: Role & { id?: string };
  users: any[];
  onBack: () => void;
  type?: 'super' | 'hotel';
}

const RoleDetailView: React.FC<RoleDetailViewProps> = ({ role, users, onBack, type = 'super' }) => {
  const isInactive = role.status === 'Inactive';

  // If role has an id, we can show the live permission grid
  const hasRoleId = !!(role as any).id;

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
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Permission Matrix — now API-backed */}
        <div className="space-y-6">
            {hasRoleId ? (
              <PermissionGrid
                roleName={role.name}
                roleId={(role as any).id}
                onBack={onBack}
                type={type || 'hotel'}
              />
            ) : (
              <GlassCard className="text-center py-16 space-y-4">
                <Shield size={48} className="mx-auto text-gray-500 opacity-30" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Save this role first to configure permissions
                </p>
              </GlassCard>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoleDetailView;
