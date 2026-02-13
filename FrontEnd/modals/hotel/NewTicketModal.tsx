import React from 'react';
import { Send, Camera, Info, Plus, ChevronDown } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const selectClass = `w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none`;

const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Request Platform Support"
      subtitle="Issue Ticket Intake"
      footer={
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 text-emerald-500">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Our team responds within 60 mins</span>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>Discard</Button>
              <Button variant="action" size="lg" onClick={onClose} icon={<Send size={18} />}>Initialize Ticket</Button>
           </div>
        </div>
      }
    >
      <div className="p-8 space-y-8">
         <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">Issue Category</label>
               <div className="relative">
                  <select className={`${selectClass} pr-10`}>
                     <option>Software (Bug/Logic)</option>
                     <option>Billing (Invoice/Payment)</option>
                     <option>General Support</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">Operational Priority</label>
               <div className="relative">
                  <select className={`${selectClass} pr-10`}>
                     <option className="text-gray-500">Low — Request doc/info</option>
                     <option className="text-accent">Medium — Minor glitch</option>
                     <option className="text-accent">High — Process impact</option>
                     <option className="text-red-500">Critical — Site down</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
               </div>
            </div>
            <div className="col-span-2">
               <GlassInput label="Subject Summary" placeholder="e.g. Rate parity issue on mobile view" />
            </div>
            <div className="col-span-2">
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">Issue Description</label>
               <textarea rows={4} placeholder="Describe exactly what happened and when..." className={`${selectClass} resize-none`} />
            </div>
         </div>

         <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-black/20 text-gray-500 group-hover:text-white transition-colors">
                  <Camera size={24} />
               </div>
               <div>
                  <p className="text-sm font-bold dark:text-white">Attach Evidence</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Photos or error logs (Max 10MB)</p>
               </div>
            </div>
            <Plus size={20} className="text-gray-500" />
         </div>
      </div>
    </ModalShell>
  );
};

export default NewTicketModal;