import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';
import type { IncidentPriority, IncidentCategory } from '@/domain/entities/Incident';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('Medium');
  const [category, setCategory] = useState<IncidentCategory>('Maintenance');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !room) return;
    
    setLoading(true);
    try {
        await onSubmit({
            subject,
            room,
            description,
            priority,
            category,
            status: 'Open',
            reportedBy: 'Staff', // Hardcoded for now, should be current user
            createdAt: new Date().toISOString(), // Backend might overwrite this
            updatedAt: new Date().toISOString(),
            slaBreached: false
        });
        onClose();
        // Reset form
        setSubject('');
        setRoom('');
        setDescription('');
        setPriority('Medium');
        setCategory('Maintenance');
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerContent={
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-red-600 text-white shadow-lg">
              <ShieldAlert size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Report Incident</h2>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">New Operational Issue</p>
           </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
           <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
           <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!subject || !room || loading}
            icon={<CheckCircle2 size={16} />}
           >
            {loading ? 'Reporting...' : 'Report Incident'}
           </Button>
        </div>
      }
    >
      <div className="p-8 space-y-6">
        <GlassInput 
            label="Subject" 
            placeholder="e.g. WiFi not working" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-6">
            <GlassInput 
                label="Room Number" 
                placeholder="e.g. 101" 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Priority</label>
                <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none"
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</label>
            <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none"
            >
                <option value="Maintenance">Maintenance</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Guest Complaint">Guest Complaint</option>
                <option value="Security">Security</option>
                <option value="IT">IT</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Description</label>
            <textarea
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-accent/50 focus:ring-4 focus:ring-accent/10 min-h-[100px]"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
        </div>
      </div>
    </ModalShell>
  );
};

export default CreateIncidentModal;
