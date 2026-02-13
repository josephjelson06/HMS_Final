import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calendar, ChevronLeft, ChevronRight, 
  Plus, Edit3, Lock, Unlock, Zap, LayoutGrid, 
  ArrowUpRight, ArrowDownRight, Info, Save, 
  RefreshCcw, Filter, Search, IndianRupee, Layers,
  CheckSquare, Square, Pencil
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import BulkRateModal from '../../modals/hotel/BulkRateModal';

interface RoomType {
  id: string;
  name: string;
  totalRooms: number;
  rackRate: number;
}

interface CellData {
  rate: number;
  available: number;
  isBlocked: boolean;
  bookedCount: number;
}

const ROOM_TYPES: RoomType[] = [
  { id: 'rt1', name: 'Deluxe Double', totalRooms: 30, rackRate: 5500 },
  { id: 'rt2', name: 'Standard Single', totalRooms: 20, rackRate: 3500 },
  { id: 'rt3', name: 'Executive Suite', totalRooms: 5, rackRate: 12000 },
  { id: 'rt4', name: 'Standard Double', totalRooms: 40, rackRate: 4500 },
];

const RateInventoryManager: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date('2026-02-10'));
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);

  // Generate 14 days from start date
  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startDate]);

  // Mock initial data state
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, CellData>>>(() => {
    const data: Record<string, Record<string, CellData>> = {};
    ROOM_TYPES.forEach(rt => {
      data[rt.id] = {};
      Array.from({ length: 30 }).map((_, i) => {
        const d = new Date('2026-02-10');
        d.setDate(d.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        
        let rate = rt.rackRate;
        let booked = Math.floor(Math.random() * (rt.totalRooms * 0.8));
        
        if (d.getDay() === 5 || d.getDay() === 6) rate += 1000; 
        if (dStr === '2026-02-14') rate += 2500; 
        
        data[rt.id][dStr] = {
          rate: rate,
          bookedCount: booked,
          available: rt.totalRooms - booked,
          isBlocked: false
        };
      });
    });
    return data;
  });

  const toggleRowSelection = (id: string) => {
    setSelectedRoomTypes(prev => prev.includes(id) ? prev.filter(rtId => rtId !== id) : [...prev, id]);
  };

  const handleCellClick = (rtId: string, dateStr: string) => {
    console.log(`Edit ${rtId} for ${dateStr}`);
  };

  const getCellStyles = (rt: RoomType, cell: CellData) => {
    if (cell.isBlocked) return 'bg-zinc-100 dark:bg-zinc-900/50 grayscale opacity-60';
    if (cell.available === 0) return 'bg-red-500/10 border-red-500/20';
    if (cell.rate > rt.rackRate) return 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20';
    if (cell.rate < rt.rackRate) return 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20';
    return 'bg-white/40 dark:bg-white/[0.02]';
  };

  return (
    <div className="p-8 space-y-6 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Header Context */}
      <PageHeader
        title="Revenue Control"
        subtitle="Rate & Inventory Management Engine"
        badge="Dummy Data Page"
      >
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            icon={<RefreshCcw size={16} />}
            className="border-white/10 hover:bg-white/5"
          >
            Sync Channel Manager
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsBulkModalOpen(true)}
            icon={<Zap size={18} strokeWidth={3} fill="currentColor" />}
          >
            Bulk Yield Update
          </Button>
        </div>
      </PageHeader>

      {/* Navigation & Integrated Legend Bar */}
      <div className="flex flex-col xl:flex-row items-center gap-6 p-2 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
          <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-white/5 border border-white/5 shadow-sm">
              <button 
                onClick={() => setStartDate(new Date(startDate.setDate(startDate.getDate() - 7)))}
                className="p-2 rounded-xl text-gray-500 hover:text-accent-strong transition-all"
              >
                  <ChevronLeft size={20} />
              </button>
              <div className="px-6 flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase text-gray-400">View Window</span>
                  <span className="text-sm font-black dark:text-white uppercase tracking-tighter">
                      {dates[0].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {dates[6].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
              </div>
              <button 
                onClick={() => setStartDate(new Date(startDate.setDate(startDate.getDate() + 7)))}
                className="p-2 rounded-xl text-gray-500 hover:text-accent-strong transition-all"
              >
                  <ChevronRight size={20} />
              </button>
          </div>

          {/* Moved Legend To Top */}
          <div className="flex-1 flex flex-wrap gap-4 items-center justify-start xl:justify-center">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Yield Above Rack</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Yield Below Rack</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sold Out</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-500"></div>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Blocked</span>
              </div>
          </div>

          <div className="hidden xl:flex gap-3">
             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
                <ArrowUpRight size={14} /> Peak Season Active
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-muted text-accent text-[9px] font-bold uppercase tracking-widest border border-accent/20">
                <Lock size={14} /> 12 Blocked
             </div>
          </div>
      </div>

      {/* The Command Matrix */}
      <GlassCard noPadding className="overflow-hidden shadow-2xl border-white/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black/10 dark:bg-white/5">
                <th className="sticky left-0 z-30 bg-gray-100 dark:bg-[#1a1a1a] p-6 text-left border-r border-white/10 w-[280px]">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <CheckSquare size={14} className="opacity-30" />
                    <span>Room Categories (INR)</span>
                  </div>
                </th>
                {dates.slice(0, 10).map((date, i) => (
                  <th key={i} className={`p-4 min-w-[120px] text-center border-r border-white/5 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-accent-strong/5 dark:bg-accent/5' : ''}`}>
                    <p className="text-[10px] font-black text-gray-500 uppercase">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                    <p className="text-lg font-black dark:text-white leading-none">{date.getDate()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{date.toLocaleDateString('en-IN', { month: 'short' })}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROOM_TYPES.map((rt) => (
                <tr key={rt.id} className="border-t border-white/5 group">
                  <td className="sticky left-0 z-30 bg-gray-50 dark:bg-[#121212] p-6 border-r border-white/10 group-hover:bg-gray-100 dark:group-hover:bg-[#1a1a1a] transition-colors">
                    <div className="flex items-center gap-4">
                        <button onClick={() => toggleRowSelection(rt.id)} className="shrink-0 transition-colors">
                            {selectedRoomTypes.includes(rt.id) ? (
                                <CheckSquare size={18} className="text-accent-strong" />
                            ) : (
                                <Square size={18} className="text-gray-400" />
                            )}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-sm font-black dark:text-white leading-tight mb-1">{rt.name}</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                <span>{rt.totalRooms} Rooms</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="text-accent">Rack: {rt.rackRate.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                  </td>
                  {dates.slice(0, 10).map((date, i) => {
                    const dStr = date.toISOString().split('T')[0];
                    const cell = matrixData[rt.id][dStr];
                    if (!cell) return <td key={i}></td>;
                    
                    const isOverRack = cell.rate > rt.rackRate;
                    const isUnderRack = cell.rate < rt.rackRate;

                    return (
                      <td 
                        key={i} 
                        onClick={() => handleCellClick(rt.id, dStr)}
                        className={`p-0 border-r border-white/5 transition-all cursor-pointer group/cell hover:ring-2 hover:ring-blue-500 hover:z-20 ${getCellStyles(rt, cell)}`}
                      >
                        <div className="flex flex-col items-center justify-center h-24 p-2 gap-1.5 relative overflow-hidden">
                           {/* yield indicator accent */}
                           {isOverRack && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                           {isUnderRack && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                           
                           {/* Hover Edit Indicator */}
                           <div className="absolute top-2 right-2 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                              <Pencil size={10} className="text-gray-400" />
                           </div>

                           <div className="flex items-center gap-1">
                              <span className={`text-sm font-black ${isOverRack ? 'text-emerald-500' : isUnderRack ? 'text-amber-500' : 'dark:text-gray-300'}`}>
                                {cell.rate.toLocaleString()}
                              </span>
                           </div>

                           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5">
                              <span className={`text-[11px] font-black ${cell.available < 5 ? 'text-red-500 animate-pulse' : 'dark:text-white'}`}>
                                 {cell.isBlocked ? '--' : cell.available}
                              </span>
                              <span className="text-[8px] font-bold uppercase text-gray-500 tracking-tighter">Units</span>
                           </div>

                           {cell.available === 0 && (
                             <div className="absolute inset-0 flex items-center justify-center bg-red-600/10 backdrop-blur-[1px]">
                                <span className="text-[8px] font-bold uppercase text-red-600 bg-white dark:bg-black px-2 py-0.5 rounded-md border border-red-600/20 shadow-sm">Sold Out</span>
                             </div>
                           )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Seasonal Warning Card */}
      <div className="p-8 rounded-[2.5rem] bg-accent-strong text-white shadow-2xl flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
              <Info size={48} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-black leading-tight mb-2 uppercase italic tracking-tighter">SEASONAL ALERT: DEMAND SURGE</h4>
              <p className="text-base font-medium opacity-90 leading-relaxed max-w-3xl">
                  Valentine's week and upcoming long weekends are seeing 40% higher organic searches. Our intelligence engine recommends increasing Deluxe rates by 15% to capture maximum seasonal yield.
              </p>
          </div>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-10 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all whitespace-nowrap"
          >
              Adjust Now
          </button>
      </div>

      <BulkRateModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />

    </div>
  );
};

export default RateInventoryManager;