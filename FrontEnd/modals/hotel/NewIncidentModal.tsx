import React from 'react';
import { DoorOpen, User, Camera, Info, Send, Plus } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';
import GlassInput from '../../components/ui/GlassInput';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const selectClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Raise Operational Alert"
      subtitle="Incident Logging Engine"
      footer={
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 text-amber-500">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">SLA will start immediately</span>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>Discard</Button>
              <Button variant="danger" onClick={onClose} icon={<Send size={16} />}>Initialize Ticket</Button>
           </div>
        </div>
      }
    >
      <div className="p-8 space-y-8">
         <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Category</label>
               <select className={selectClass}>
                  <option>Maintenance</option>
                  <option>Guest Complaint</option>
                  <option>Security</option>
                  <option>Housekeeping</option>
                  <option>IT Support</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Priority Level</label>
               <select className={selectClass}>
                  <option className="text-gray-500">Low</option>
                  <option className="text-accent">Medium</option>
                  <option className="text-accent">High</option>
                  <option className="text-red-500">Critical</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Room / Area Mapping</label>
               <div className="relative">
                  <DoorOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <GlassInput placeholder="e.g. 412 or Lobby" className="pl-11" />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Assign To</label>
               <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <select className={`${selectClass} pl-11`}>
                     <option>Maintenance Lead</option>
                     <option>Security Supervisor</option>
                     <option>Shift Manager</option>
                  </select>
               </div>
            </div>
            <div className="col-span-2">
               <GlassInput label="Alert Subject (Brief)" placeholder="e.g. AC leaking water on Floor 4" />
            </div>
            <div className="col-span-2">
               <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Technical Observation</label>
               <textarea rows={4} placeholder="Describe the issue in detail for the maintenance team..." className={`${selectClass} resize-none`} />
            </div>
         </div>

         <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-black/20 text-gray-500 group-hover:text-white transition-colors">
                  <Camera size={24} />
               </div>
               <div>
                  <p className="text-sm font-bold dark:text-white">Attach Evidence</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Photos or PDF Logs (Max 10MB)</p>
               </div>
            </div>
            <Plus size={20} className="text-gray-500" />
         </div>
      </div>
    </ModalShell>
  );
};

export default NewIncidentModal;