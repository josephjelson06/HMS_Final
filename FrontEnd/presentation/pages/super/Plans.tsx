import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Archive, Check, 
  Monitor, Layout, IndianRupee, HelpCircle, 
  BarChart, ChevronRight, Zap, Users, ShieldCheck,
  ArchiveRestore, Layers
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import CreatePlanPanel from '../../modals/super/CreatePlanPanel';
import UpdatePlanPanel from '../../modals/super/UpdatePlanPanel';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useTheme } from '../../hooks/useTheme';
import type { PlanData } from '@/domain/entities/Plan';
import { usePlans } from '@/application/hooks/usePlans';

const PlanCard: React.FC<{ 
  plan: PlanData; 
  onEdit: (plan: PlanData) => void;
  onArchive: (id: string) => void;
}> = ({ plan, onEdit, onArchive }) => {
  const { isDarkMode } = useTheme();
  
  const themeStyles = {
    blue: {
      accent: 'bg-accent-strong',
      text: 'text-accent-strong dark:text-blue-400',
      bg: 'bg-blue-500/5',
      border: 'border-accent/20',
      shadow: 'shadow-accent/10'
    },
    purple: {
      accent: 'bg-purple-600',
      text: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      shadow: 'shadow-purple-500/10'
    },
    orange: {
      accent: 'bg-accent-strong',
      text: 'text-accent-strong dark:text-orange-400',
      bg: 'bg-accent/5',
      border: 'border-accent/20',
      shadow: 'shadow-accent/10'
    }
  };

  const style = themeStyles[plan.theme];

  return (
    <GlassCard noPadding clipContent className={`flex flex-col h-full border-2 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 ${style.border} ${style.shadow} ${plan.isArchived ? 'opacity-50 grayscale' : ''}`}>
      {/* Plan Header */}
      <div className={`p-8 border-b border-white/5 ${style.bg} relative`}>
        {plan.isArchived && (
          <div className="absolute top-0 left-0 w-full bg-red-500/80 text-white text-[8px] font-bold uppercase text-center py-1 tracking-widest z-10">
            Archived / Legacy Offering
          </div>
        )}
        <div className="flex justify-between items-start mb-6">
           <div className={`w-14 h-14 rounded-2xl ${style.accent} text-white flex items-center justify-center shadow-xl`}>
              <Zap size={28} fill="currentColor" />
           </div>
           <div className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">
              ID: {plan.id.toUpperCase()}
           </div>
        </div>
        <h3 className="text-3xl font-black dark:text-white tracking-tighter uppercase mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
           <span className={`text-4xl font-black dark:text-white tracking-tighter`}>₹{plan.price.toLocaleString()}</span>
           <span className="text-sm font-bold text-gray-500">/ mo</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">+ 18% GST Applicable</p>
      </div>

      {/* Limits Strip */}
      <div className="px-8 py-5 border-b border-white/5 flex gap-8">
          <div className="flex items-center gap-2">
             <Layout size={16} className="text-gray-400" />
             <div className="flex flex-col">
                <span className="text-[11px] font-black dark:text-white leading-none">{plan.rooms}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Max Rooms</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <Monitor size={16} className="text-gray-400" />
             <div className="flex flex-col">
                <span className="text-[11px] font-black dark:text-white leading-none">{plan.kiosks}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Max Kiosks</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <HelpCircle size={16} className="text-gray-400" />
             <div className="flex flex-col">
                <span className="text-[11px] font-black dark:text-white leading-none truncate max-w-[60px]">{plan.support.split(' ')[0]}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Support</span>
             </div>
          </div>
      </div>

      {/* Features List */}
      <div className="p-8 flex-1 space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Entitlements:</p>
          <div className="space-y-4">
            {plan.included.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                 <div className={`mt-0.5 p-0.5 rounded-full ${style.accent} text-white`}>
                    <Check size={10} strokeWidth={4} />
                 </div>
                 <span className="text-xs font-bold dark:text-gray-300 leading-tight">{item}</span>
              </div>
            ))}
          </div>
      </div>

      {/* Footer / Stats */}
      <div className="p-8 pt-0 mt-auto">
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5 flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <Users size={18} className="text-gray-500" />
                 <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Tenants</p>
                    <p className="text-lg font-black dark:text-white tracking-tighter">{plan.subscribers}</p>
                 </div>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
          </div>

          <div className="flex gap-2">
             <button 
               onClick={() => onEdit(plan)}
               className="flex-1 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                <Edit3 size={14} /> Update Catalog
             </button>
             <button 
               onClick={() => onArchive(plan.id)}
               className={`px-4 py-4 rounded-xl bg-black/5 dark:bg-white/5 transition-all border border-white/5 ${plan.isArchived ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-500 hover:text-red-500'}`}
               title={plan.isArchived ? "Restore Plan" : "Archive Plan"}
             >
                {plan.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
             </button>
          </div>
      </div>
    </GlassCard>
  );
};

const Plans: React.FC = () => {
  const { plans: hookPlans } = usePlans();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isUpdatePanelOpen, setIsUpdatePanelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    if (hookPlans.length > 0) setPlans(hookPlans);
  }, [hookPlans]);

  const handleArchivePlan = (id: string) => {
    setPlans(prev => prev.map(p => 
      p.id === id ? { ...p, isArchived: !p.isArchived } : p
    ));
  };

  const handleEditPlan = (plan: PlanData) => {
    setSelectedPlan(plan);
    setIsUpdatePanelOpen(true);
  };

  const handleUpdatePlan = (updatedPlan: PlanData) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const totalRevenue = plans.reduce((acc, curr) => acc + (curr.price * curr.subscribers), 0);
  const activeTenants = plans.reduce((acc, curr) => acc + curr.subscribers, 0);
  const activeOfferingsCount = plans.filter(p => !p.isArchived).length;

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <PageHeader
        title="Product Catalog"
        subtitle="Commercial Configuration & Tier Management"
      >
        <div className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent-strong/10 border border-accent-strong/20 text-accent-strong">
          <BarChart size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Yield Optimization: Active</span>
        </div>
        <Button
          size="lg"
          onClick={() => setIsCreatePanelOpen(true)}
          icon={<Plus size={20} strokeWidth={3} />}
        >
          Create New Offering
        </Button>
      </PageHeader>

      {/* Summary Analytics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="border-l-4 border-l-accent-strong">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Total Recurring Yield</p>
                   <h3 className="text-3xl font-black dark:text-white tracking-tighter">₹{(totalRevenue/100000).toFixed(2)}L <span className="text-xs font-bold text-gray-500">/ mo</span></h3>
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 text-accent"><IndianRupee size={24} /></div>
             </div>
          </GlassCard>
          <GlassCard className="border-l-4 border-l-purple-600">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Active Subscriptions</p>
                   <h3 className="text-3xl font-black dark:text-white tracking-tighter">{activeTenants} Tenants</h3>
                </div>
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500"><Users size={24} /></div>
             </div>
          </GlassCard>
          <GlassCard className="border-l-4 border-l-emerald-600">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Active Offerings</p>
                   <h3 className="text-3xl font-black dark:text-white tracking-tighter">{activeOfferingsCount} Plans</h3>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><Layers size={24} /></div>
             </div>
          </GlassCard>
      </div>

      {/* The Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-700">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onEdit={handleEditPlan}
              onArchive={handleArchivePlan}
            />
          ))}
          
          {/* Add Plan Placeholder */}
          <button 
            onClick={() => setIsCreatePanelOpen(true)}
            className="group relative flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/5 transition-all bg-white/40 dark:bg-transparent h-full min-h-[500px]"
          >
             <div className="w-20 h-20 rounded-full bg-white/5 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent-strong group-hover:scale-110 transition-all shadow-sm mb-6">
                <Plus size={40} strokeWidth={2} />
             </div>
             <h3 className="text-xl font-black dark:text-white uppercase tracking-widest">Define New Tier</h3>
             <p className="text-xs font-bold text-gray-500 uppercase mt-2">Initialize catalog item</p>
          </button>
      </div>

      <CreatePlanPanel isOpen={isCreatePanelOpen} onClose={() => setIsCreatePanelOpen(false)} />
      {selectedPlan && (
        <UpdatePlanPanel 
          isOpen={isUpdatePanelOpen} 
          onClose={() => setIsUpdatePanelOpen(false)} 
          plan={selectedPlan}
          onUpdate={handleUpdatePlan}
        />
      )}
    </div>
  );
};

export default Plans;
