import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Clock, ShieldAlert, Monitor, 
  User, UserPlus, CheckCircle2, AlertCircle, 
  Search, Check, Edit2, Share2, Info
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';

interface HelpdeskDetailModalProps {
  isOpen: boolean;
  ticket: any;
  onClose: () => void;
}

const HelpdeskDetailModal: React.FC<HelpdeskDetailModalProps> = ({ isOpen, ticket, onClose }) => {
  // Interactive States
  const [status, setStatus] = useState<string>('Open');
  const [priority, setPriority] = useState<string>('High');
  const [assignedTo, setAssignedTo] = useState<string>('Vijay Kumar');
  
  // UI Sub-modals/States
  const [showReassign, setShowReassign] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');

  const engineers = [
    { name: 'Vijay Kumar', role: 'Hardware Engineer', availability: 'On Shift' },
    { name: 'Aditya Sharma', role: 'Lead Architect', availability: 'On Shift' },
    { name: 'Suman Rao', role: 'Finance Ops', availability: 'Off Duty' },
    { name: 'Neha Singh', role: 'Support Agent', availability: 'On Shift' },
  ];

  useEffect(() => {
    if (isOpen && ticket) {
      setStatus(ticket.status || 'Open');
      setPriority(ticket.priority || 'High');
      setAssignedTo(ticket.assignedTo || 'Vijay Kumar');
    }
  }, [isOpen, ticket]);

  const handleResolve = () => {
    setStatus('Resolved');
    setShowResolve(false);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerContent={
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase whitespace-nowrap">Ticket Brief</h2>
             <span className="text-[10px] font-black text-accent-strong bg-accent-strong/5 px-2 py-1 rounded-lg uppercase tracking-widest">{ticket?.id}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full"><Building2 size={12} /> {ticket?.hotel}</div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest"><Clock size={12} /> SLA: 4H Remaining</div>
          </div>
        </div>
      }
    >
      <div className="p-8 space-y-8">
        
        {/* Ticket Subject Section */}
        <div className="space-y-3">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Context Overview</h3>
             <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
                <p className="text-lg font-black dark:text-white leading-tight tracking-tight mb-2 uppercase">"{ticket?.subject}"</p>
                <p className="text-xs font-medium text-gray-500 leading-relaxed italic">
                    Infrastructure mapping indicates a critical disruption in terminal services. Immediate diagnostic attention required to restore optimal hotel operations.
                </p>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status & Priority Mapping */}
            <div className="space-y-6">
                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Lifecycle State</h3>
                   <div className="p-4 rounded-2xl bg-accent-strong text-white shadow-xl shadow-accent-strong/30 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl"><ShieldAlert size={18} /></div>
                            <h4 className="text-sm font-black uppercase tracking-tight">{status}</h4>
                        </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Priority Level</h3>
                   <div className={`p-4 rounded-2xl border border-white/5 flex items-center justify-between ${priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${priority === 'Critical' ? 'bg-red-500/20' : 'bg-black/5'}`}><AlertCircle size={18} /></div>
                            <h4 className="text-sm font-black uppercase tracking-tight">{priority} Rank</h4>
                        </div>
                        <button onClick={() => setShowEdit(true)} className="p-2 hover:bg-black/5 rounded-lg transition-colors"><Edit2 size={14} /></button>
                   </div>
                </div>
            </div>

            {/* Infrastructure Link */}
            <div className="space-y-6">
                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Linked Asset</h3>
                   <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/10 flex items-center gap-4 group cursor-pointer hover:border-blue-500/30 transition-all h-full">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-accent shadow-inner shrink-0"><Monitor size={22} /></div>
                        <div className="min-w-0">
                            <h4 className="text-xs font-black dark:text-white uppercase truncate">{ticket?.linkedKiosk || 'Central Terminal'}</h4>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Sovereignty Mapping</p>
                        </div>
                   </div>
                </div>

               <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Assigned Engineer</h3>
                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-accent-strong font-black text-[10px] shadow-inner shrink-0 uppercase">
                            {assignedTo.split(' ').map((n:any) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black dark:text-white leading-tight truncate uppercase">{assignedTo}</h4>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Owner Mapping</p>
                        </div>
                        <button onClick={() => setShowReassign(true)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-all shrink-0"><UserPlus size={16} /></button>
                   </div>
               </div>
            </div>
        </div>

        {/* Closing Actions */}
        <div className="pt-8 border-t border-white/5 flex gap-4">
             {status !== 'Resolved' ? (
                <button 
                    onClick={() => setShowResolve(true)}
                    className="flex-1 py-5 rounded-[1.5rem] bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <CheckCircle2 size={20} /> Terminate & Resolve
                </button>
             ) : (
                <div className="flex-1 flex items-center gap-3 p-5 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in-95">
                    <CheckCircle2 size={24} />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest leading-none mb-1">Investigation Closed</h4>
                        <p className="text-[9px] font-bold opacity-70 uppercase leading-none italic">SLA requirements satisfied</p>
                    </div>
                </div>
             )}
             <button className="px-8 py-5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center gap-2">
                <Share2 size={16} /> Broadcast
             </button>
        </div>

      </div>

      {/* Sub-modals - Overlaying the content for depth */}
      
      {showReassign && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-full max-w-sm">
                  <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10 scale-in-center">
                      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Transfer Ownership</h3>
                          <button onClick={() => setShowReassign(false)} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                      </div>
                      <div className="p-4 space-y-1">
                          <div className="relative mb-4">
                              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input type="text" placeholder="Identity lookup..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold dark:text-white focus:outline-none" />
                          </div>
                          <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                              {engineers.map((eng) => (
                                  <button 
                                      key={eng.name}
                                      onClick={() => {
                                          setAssignedTo(eng.name);
                                          setShowReassign(false);
                                      }}
                                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${assignedTo === eng.name ? 'bg-accent-strong text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${assignedTo === eng.name ? 'bg-white/20' : 'bg-white/5 text-gray-400'}`}>{eng.name.split(' ').map(n=>n[0]).join('')}</div>
                                          <div className="text-left font-black text-xs uppercase tracking-tighter">{eng.name}</div>
                                      </div>
                                      {assignedTo === eng.name && <Check size={16} />}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </GlassCard>
              </div>
          </div>
      )}

      {showResolve && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-full max-w-md">
                  <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10 scale-in-center">
                      <div className="p-8 border-b border-white/10 bg-emerald-600/10 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter text-emerald-500">Forensic Briefing</h3>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Submit closing documentation</p>
                          </div>
                          <button onClick={() => setShowResolve(false)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                      </div>
                      <div className="p-8 space-y-6">
                            <textarea 
                                rows={4}
                                value={resolutionSummary}
                                onChange={(e) => setResolutionSummary(e.target.value)}
                                placeholder="Describe the resolution blueprint..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none transition-all shadow-inner placeholder:opacity-30"
                            />
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5">
                                <Info size={16} className="text-emerald-500 shrink-0" />
                                <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed tracking-wider">Submitting this will archive the investigation and notify all stakeholders.</p>
                            </div>
                      </div>
                      <div className="p-6 bg-black/20 border-t border-white/10 flex justify-end gap-3">
                          <button 
                              onClick={handleResolve}
                              className="w-full py-4 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                          >
                              Commit Resolution
                          </button>
                      </div>
                  </GlassCard>
              </div>
          </div>
      )}

      {showEdit && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="w-full max-w-md">
                  <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10 scale-in-center">
                      <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Modify Parameters</h3>
                          <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                      </div>
                      <div className="p-8 space-y-6">
                          <div>
                              <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Priority Mapping</label>
                              <select 
                                  value={priority}
                                  onChange={(e) => setPriority(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-xs font-black dark:text-white focus:outline-none appearance-none cursor-pointer uppercase tracking-widest"
                              >
                                  <option>Low</option>
                                  <option>Medium</option>
                                  <option>High</option>
                                  <option>Critical</option>
                              </select>
                          </div>
                      </div>
                      <div className="p-6 bg-black/20 border-t border-white/10">
                          <button 
                              onClick={() => setShowEdit(false)}
                              className="w-full py-4 rounded-xl bg-accent-strong text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                          >
                              Update Ledger
                          </button>
                      </div>
                  </GlassCard>
              </div>
          </div>
      )}

    </ModalShell>
  );
};

export default HelpdeskDetailModal;