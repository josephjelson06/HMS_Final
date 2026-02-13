import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Send, Paperclip, Monitor, User, Building2, 
  Clock, ShieldAlert, CheckCircle2, History, 
  AlertCircle, ChevronRight, MessageSquare, 
  FileText, Zap, Edit2, Share2, Users, Check,
  UserPlus, AlertTriangle, Info, Search, ChevronDown
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface HelpdeskDetailModalProps {
  isOpen: boolean;
  ticket: any;
  onClose: () => void;
}

const HelpdeskDetailModal: React.FC<HelpdeskDetailModalProps> = ({ isOpen, ticket, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'NOTES'>('CHAT');
  
  // Interactive States
  const [status, setStatus] = useState<string>('Open');
  const [priority, setPriority] = useState<string>('High');
  const [assignedTo, setAssignedTo] = useState<string>('Vijay Kumar');
  const [messages, setMessages] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  
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
      setMessages([
        { sender: 'Hotel Manager (Lemon Tree)', text: "Our main kiosk in the lobby isn't printing receipts. Guests are complaining. Please help!", time: '09 Feb, 08:00 AM', isMe: false },
        { sender: 'Aditya (Admin)', text: "Hi! I see the alert. Looking into the device telemetry now. Seems like a mechanical jam or empty roll.", time: '09 Feb, 08:12 AM', isMe: true },
        { sender: 'Hotel Manager (Lemon Tree)', text: "I've checked the paper, there's a full roll inside. I've attached a photo of the error screen.", time: '09 Feb, 08:15 AM', isMe: false, attachment: 'IMG_2024.jpg' },
      ]);
      setNotes([
        { author: 'System Log', text: "Device health check triggered. Printer status changed to 'FAULT'. Voltages nominal. Motor stall detected.", time: '09 Feb 08:05 AM', type: 'system' },
        { author: 'Aditya (Admin)', text: "Spoke to on-site maintenance. They found a loose cable. Asked them to plug back in and reboot.", time: '09 Feb 08:20 AM', type: 'admin' },
      ]);
    }
  }, [isOpen, ticket]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      sender: 'Me (Admin)',
      text: inputText,
      time: 'Just now',
      isMe: true
    };
    
    if (activeTab === 'CHAT') {
      setMessages([...messages, newMessage]);
    } else {
      setNotes([...notes, { author: 'Me (Admin)', text: inputText, time: 'Just now', type: 'admin' }]);
    }
    setInputText('');
  };

  const handleResolve = () => {
    setStatus('Resolved');
    setShowResolve(false);
    // Add a resolution note
    setNotes([...notes, { author: 'System', text: `Ticket Resolved. Summary: ${resolutionSummary || 'No summary provided.'}`, time: 'Just now', type: 'system' }]);
  };

  if (!isVisible && !isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`
          fixed inset-y-0 right-0 z-[9999] w-full max-w-4xl 
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          backdrop-blur-2xl
          ${isDarkMode ? 'bg-[#050505]/95 border-l border-white/10' : 'bg-white/95 border-l border-gray-200'}
        `}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className={`px-8 py-6 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'}`}>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-black dark:text-white tracking-tighter">Ticket Investigation</h2>
                        <span className="text-[10px] font-black text-blue-600 dark:text-orange-500 uppercase tracking-widest">{ticket?.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <div className="flex items-center gap-1.5"><Building2 size={12} /> {ticket?.hotel}</div>
                        <div className="flex items-center gap-1.5"><Clock size={12} /> SLA: 4h Remaining</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowEdit(true)} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 transition-all"><Edit2 size={18} /></button>
                    <button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 transition-all" title="Copy Ticket Link"><Share2 size={18} /></button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={24} /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Interaction Area */}
                <div className="flex-1 flex flex-col border-r border-white/5 relative">
                    
                    {/* Interaction Mode Toggle */}
                    <div className="p-4 border-b border-white/5 flex gap-2">
                        <button 
                            onClick={() => setActiveTab('CHAT')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'CHAT' ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}
                        >
                            <Users size={14} /> Client Conversation
                        </button>
                        <button 
                            onClick={() => setActiveTab('NOTES')}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'NOTES' ? 'bg-orange-600 text-white shadow-lg' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}
                        >
                            <FileText size={14} /> Internal Team Notes
                        </button>
                    </div>

                    {/* Thread */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {activeTab === 'CHAT' ? (
                            messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    <div className={`flex items-center gap-2 mb-1.5 px-2 ${m.isMe ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{m.sender}</span>
                                        <span className="text-[8px] font-bold text-gray-400">{m.time}</span>
                                    </div>
                                    <div className={`
                                        max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed
                                        ${m.isMe 
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-900/20' 
                                            : 'bg-black/5 dark:bg-white/5 dark:text-gray-200 border border-white/5 rounded-tl-none shadow-sm'
                                        }
                                    `}>
                                        {m.text}
                                        {m.attachment && (
                                            <div className="mt-4 p-4 rounded-2xl bg-black/20 flex items-center gap-4 border border-white/10 cursor-pointer hover:bg-black/30 transition-all group">
                                                <div className="p-2 bg-white/10 rounded-lg group-hover:text-blue-400 transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-tighter">{m.attachment}</p>
                                                    <p className="text-[9px] opacity-60 font-bold">2.4 MB • Click to preview</p>
                                                </div>
                                                <Zap size={14} className="text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-[11px] font-bold text-orange-500 flex gap-4">
                                    <AlertTriangle size={18} className="shrink-0" />
                                    <p className="leading-relaxed">Internal notes are strictly restricted. They are NOT visible to the hotel manager or external parties.</p>
                                </div>
                                {notes.map((n, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'system' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{n.author}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-500">{n.time}</span>
                                        </div>
                                        <p className="text-sm font-medium dark:text-gray-300 italic leading-relaxed">
                                            "{n.text}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <div className="p-6 border-t border-white/5 bg-black/5">
                        <div className="relative group">
                            <textarea 
                                rows={2}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={activeTab === 'CHAT' ? "Type message to hotel manager..." : "Add confidential internal note..."}
                                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-5 pr-20 text-sm dark:text-white focus:outline-none focus:border-blue-500/50 resize-none transition-all shadow-inner`}
                            />
                            <div className="absolute right-4 bottom-4 flex gap-2">
                                <button className="p-3 rounded-xl hover:bg-white/10 text-gray-500 transition-all"><Paperclip size={20} /></button>
                                <button 
                                    onClick={handleSendMessage}
                                    className={`p-3 rounded-xl text-white shadow-xl transition-all hover:scale-110 active:scale-95 ${activeTab === 'CHAT' ? 'bg-blue-600' : 'bg-orange-600'}`}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Context Area */}
                <div className="w-80 overflow-y-auto p-8 bg-black/10 dark:bg-white/[0.02] border-l border-white/5 space-y-10 custom-scrollbar">
                    
                    {/* Status Summary */}
                    <div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Execution Status</h3>
                         <div className="space-y-4">
                             <div className="p-5 rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-900/30 group cursor-pointer relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                     {/* Added missing import for ChevronDown above and use it here */}
                                     <ChevronDown size={16} />
                                 </div>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Lifecycle State</p>
                                 <h4 className="text-sm font-black">{status}</h4>
                             </div>
                             <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 group cursor-pointer relative">
                                 <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Edit2 size={14} className="text-gray-500" />
                                 </div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Priority</p>
                                 <h4 className={`text-sm font-black ${priority === 'Critical' ? 'text-red-500' : 'dark:text-white'}`}>{priority}</h4>
                             </div>
                         </div>
                    </div>

                    {/* Linked Asset */}
                    {ticket?.linkedKiosk && (
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Linked Infrastructure</h3>
                            <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-blue-500/30 transition-all">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shadow-inner"><Monitor size={22} /></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black dark:text-white leading-tight">{ticket.linkedKiosk}</h4>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Hardware ID</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    )}

                    {/* Assignment */}
                    <div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Assigned Ownership</h3>
                         <div className="flex items-center gap-4 p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-xs shadow-inner">
                                 {assignedTo.split(' ').map((n:any) => n[0]).join('')}
                             </div>
                             <div>
                                 <h4 className="text-sm font-black dark:text-white leading-tight">{assignedTo}</h4>
                                 <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Support Engineer</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => setShowReassign(true)}
                            className="w-full mt-4 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                         >
                            <UserPlus size={14} /> Reassign Owner
                         </button>
                    </div>

                    {/* Close Control */}
                    <div className="pt-8 border-t border-white/5">
                         {status !== 'Resolved' ? (
                            <button 
                                onClick={() => setShowResolve(true)}
                                className="w-full py-5 rounded-3xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={20} /> Mark as Resolved
                            </button>
                         ) : (
                            <div className="flex items-center gap-3 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in-95">
                                <CheckCircle2 size={24} />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest leading-none mb-1">Issue Resolved</h4>
                                    <p className="text-[9px] font-bold opacity-70 uppercase leading-none">Closed by You</p>
                                </div>
                            </div>
                         )}
                    </div>

                </div>
            </div>
            
            {/* SUB-MODALS OVERLAY */}
            
            {/* 1. Reassign Owner Modal */}
            {showReassign && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-md">
                        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/5">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">Transfer Ownership</h3>
                                <button onClick={() => setShowReassign(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="relative mb-4">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="text" placeholder="Search team member..." className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold dark:text-white focus:outline-none" />
                                </div>
                                <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {engineers.map((eng) => (
                                        <button 
                                            key={eng.name}
                                            onClick={() => {
                                                setAssignedTo(eng.name);
                                                setShowReassign(false);
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${assignedTo === eng.name ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${assignedTo === eng.name ? 'bg-white/20' : 'bg-white/5 text-gray-400'}`}>{eng.name.split(' ').map(n=>n[0]).join('')}</div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black leading-none mb-1">{eng.name}</p>
                                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${assignedTo === eng.name ? 'opacity-70' : 'opacity-40'}`}>{eng.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {assignedTo === eng.name ? <Check size={16} /> : <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{eng.availability}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* 2. Mark as Resolved Modal */}
            {showResolve && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-lg">
                        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
                            <div className="p-8 border-b border-white/5 bg-emerald-600/10">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-emerald-500">Final Resolution</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Submit closing forensics</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Resolution Summary</label>
                                    <textarea 
                                        rows={4}
                                        value={resolutionSummary}
                                        onChange={(e) => setResolutionSummary(e.target.value)}
                                        placeholder="Describe what fixed the issue..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
                                    <Info size={18} className="text-gray-500 shrink-0" />
                                    <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase">Submitting this will notify the hotel manager and close the SLA timer permanently.</p>
                                </div>
                            </div>
                            <div className="p-8 bg-black/5 dark:bg-white/[0.05] border-t border-white/5 flex justify-end gap-3">
                                <button onClick={() => setShowResolve(false)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">Cancel</button>
                                <button 
                                    onClick={handleResolve}
                                    className="px-8 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    Confirm Resolution
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* 3. Edit Ticket Metadata Modal */}
            {showEdit && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-lg">
                        <GlassCard noPadding className="shadow-2xl overflow-hidden border-white/10">
                            <div className="p-8 border-b border-white/5 bg-black/5">
                                <h3 className="text-lg font-black uppercase tracking-tighter dark:text-white">Modify Parameters</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Subject Identity</label>
                                    <input type="text" defaultValue={ticket?.subject} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm font-bold dark:text-white focus:outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Priority Level</label>
                                        <select 
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm font-bold dark:text-white focus:outline-none appearance-none"
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Infrastructure Mapping</label>
                                        <input type="text" defaultValue={ticket?.linkedKiosk} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm font-bold dark:text-white focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-black/5 dark:bg-white/[0.05] border-t border-white/5 flex justify-end gap-3">
                                <button onClick={() => setShowEdit(false)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">Discard</button>
                                <button 
                                    onClick={() => setShowEdit(false)}
                                    className="px-10 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    Update Blueprint
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
            
        </div>
      </div>
    </>
  , document.body);
};

export default HelpdeskDetailModal;