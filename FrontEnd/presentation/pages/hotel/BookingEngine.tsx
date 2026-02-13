import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Search, Filter, 
  Plus, Users, DoorOpen, Info, ShieldCheck, Clock,
  ArrowRight, IndianRupee, LayoutGrid, CheckCircle2,
  AlertCircle, Star, MoreHorizontal, UserCheck, Move
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import GuestDetailPanel from '../../modals/hotel/GuestDetailPanel';
import NewBookingWizard from '../../modals/hotel/NewBookingWizard';
import { Guest } from '../../../data/guests';
import { 
  BookingBlock, ROOMS_DATA, BOOKING_ENGINE_BOOKINGS as INITIAL_BOOKINGS,
  BOOKING_CELL_WIDTH as CELL_WIDTH, BOOKING_ROOM_LIST_WIDTH as ROOM_LIST_WIDTH,
  BOOKING_DAYS_TO_SHOW as DAYS_TO_SHOW, BOOKING_ROW_HEIGHT as ROW_HEIGHT
} from '../../../data/bookings';

const BookingEngine: React.FC = () => {
  const [viewDate, setViewDate] = useState(new Date('2026-02-10'));
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const roomsSidebarRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between header, sidebar, and grid
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (headerRef.current) headerRef.current.scrollLeft = target.scrollLeft;
    if (roomsSidebarRef.current) roomsSidebarRef.current.scrollTop = target.scrollTop;
  };

  const dates = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }).map((_, i) => {
      const d = new Date(viewDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [viewDate]);

  const getStatusStyles = (status: BookingBlock['status']) => {
    switch (status) {
      case 'checked-in': return 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20';
      case 'confirmed': return 'bg-accent border-blue-600 text-white shadow-blue-500/20';
      case 'overdue': return 'bg-red-500 border-red-600 text-white shadow-red-500/20 animate-pulse';
      case 'pending': return 'bg-amber-500 border-amber-600 text-white shadow-amber-900/20';
      default: return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const navigateDates = (days: number) => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + days);
    setViewDate(next);
  };

  const filteredBookings = useMemo(() => {
    if (!search) return INITIAL_BOOKINGS;
    return INITIAL_BOOKINGS.filter(b => 
      b.guestName.toLowerCase().includes(search.toLowerCase()) || 
      b.roomId.includes(search)
    );
  }, [search]);

  return (
    <div className="p-4 md:p-8 space-y-6 h-[calc(100vh-120px)] flex flex-col overflow-hidden animate-in fade-in duration-500">
      
      {/* Header Context Strip */}
      <PageHeader
        title="Booking Engine"
        subtitle="Tape Chart & Availability Flow"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent-strong transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search guest name or room..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/40 dark:bg-black/40 border border-white/10 rounded-[1.25rem] py-3 pl-10 pr-4 text-xs font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all backdrop-blur-md"
                />
            </div>
            <Button
                variant="primary"
                size="lg"
                onClick={() => setIsWizardOpen(true)}
                icon={<Plus size={18} strokeWidth={3} />}
                className="shadow-accent-strong/20"
            >
                Create Booking
            </Button>
        </div>
      </PageHeader>

      {/* Main Tape Chart Grid Container */}
      <GlassCard noPadding className="flex-1 flex flex-col overflow-hidden border-white/10 shadow-2xl relative bg-white/50 dark:bg-black/20">
        
        {/* Navigation & Legend Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/5 shrink-0 z-40 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-white dark:bg-white/5 rounded-2xl border border-white/10 p-1 shadow-sm">
                    <button onClick={() => navigateDates(-7)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-6 flex flex-col items-center min-w-[180px]">
                        <span className="text-[9px] font-bold uppercase text-gray-500">Inventory Window</span>
                        <span className="text-xs font-black dark:text-white uppercase tracking-tighter">
                            {dates[0].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {dates[DAYS_TO_SHOW-1].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                    </div>
                    <button onClick={() => navigateDates(7)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button 
                  onClick={() => setViewDate(new Date('2026-02-10'))}
                  className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-all border border-white/5"
                >
                    Jump to Today
                </button>
            </div>

            <div className="hidden xl:flex items-center gap-6">
                {[
                    { label: 'Checked-In', color: 'bg-emerald-500' },
                    { label: 'Confirmed', color: 'bg-accent' },
                    { label: 'Overdue', color: 'bg-red-500' },
                    { label: 'Pending', color: 'bg-amber-500' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* The Grid Body: Header, Sidebar, and Matrix */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* 1. Static Corner & Date Header */}
            <div className="flex shrink-0 z-30">
                <div style={{ width: `${ROOM_LIST_WIDTH}px` }} className="border-r border-white/10 bg-black/10 p-5 flex items-center justify-between shrink-0 shadow-lg relative z-40">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Room Units</span>
                    <LayoutGrid size={16} className="text-gray-600" />
                </div>
                <div ref={headerRef} className="flex-1 overflow-hidden flex bg-black/5">
                    {dates.map((date, i) => (
                        <div 
                          key={i} 
                          style={{ width: `${CELL_WIDTH}px` }} 
                          className={`shrink-0 border-r border-white/5 py-4 flex flex-col items-center justify-center text-center ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-blue-500/5 dark:bg-accent/5' : ''}`}
                        >
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mb-1">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                            <span className={`text-base font-black ${date.toISOString().split('T')[0] === '2026-02-10' ? 'text-accent-strong scale-110' : 'dark:text-white'}`}>{date.getDate()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Scrollable Interaction Area */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Rooms Sidebar (Y-Axis) */}
                <div ref={roomsSidebarRef} className="overflow-hidden border-r border-white/10 bg-black/5 shrink-0 z-20" style={{ width: `${ROOM_LIST_WIDTH}px` }}>
                    {ROOMS_DATA.map((room) => (
                        <div key={room.id} className="h-20 border-b border-white/5 p-5 flex items-center gap-4 group hover:bg-black/10 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-accent transition-colors shadow-sm">
                                <DoorOpen size={22} />
                            </div>
                            <div>
                                <p className="text-lg font-black dark:text-white leading-none">#{room.id}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1.5">{room.type}</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <Info size={14} className="text-gray-600" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Availability Matrix (X-Axis) */}
                <div 
                  ref={gridRef} 
                  onScroll={handleScroll}
                  className="flex-1 overflow-auto custom-scrollbar relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] dark:bg-none"
                >
                    {/* Grid Background Lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {ROOMS_DATA.map((_, i) => (
                            <div key={i} className="h-20 border-b border-white/10 w-full"></div>
                        ))}
                        {dates.map((_, i) => (
                            <div key={i} style={{ left: `${i * CELL_WIDTH}px` }} className="absolute top-0 bottom-0 border-r border-white/10 w-px"></div>
                        ))}
                    </div>

                    {/* Today Marker */}
                    <div className="absolute top-0 bottom-0 w-px bg-accent/50 z-10 pointer-events-none" style={{ left: '0px' }}>
                        <div className="w-2 h-2 rounded-full bg-accent-strong absolute -left-[4.5px] top-0 shadow-[0_0_15px_currentColor]"></div>
                    </div>

                    {/* Booking Blocks Layer */}
                    <div className="relative min-w-max">
                        {ROOMS_DATA.map((room) => (
                            <div key={room.id} className="h-20 flex">
                                {dates.map((date, dateIdx) => {
                                    const dStr = date.toISOString().split('T')[0];
                                    const booking = filteredBookings.find(b => b.roomId === room.id && b.startDate === dStr);
                                    
                                    return (
                                        <div 
                                          key={dateIdx} 
                                          onClick={() => !booking && setIsWizardOpen(true)}
                                          style={{ width: `${CELL_WIDTH}px` }} 
                                          className={`shrink-0 flex items-center justify-center relative cursor-crosshair group/cell transition-colors ${!booking ? 'hover:bg-accent-strong/5' : ''}`}
                                        >
                                            {!booking && (
                                                <div className="opacity-0 group-hover/cell:opacity-100 p-2 rounded-xl bg-accent-strong/10 text-accent transition-all scale-75">
                                                    <Plus size={18} strokeWidth={3} />
                                                </div>
                                            )}

                                            {booking && (
                                                <div 
                                                  onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    // Map to Guest interface for details panel
                                                    setSelectedBooking({
                                                      ...booking,
                                                      name: booking.guestName,
                                                      refId: booking.id,
                                                      room: booking.roomId,
                                                      roomCategory: room.type,
                                                      checkIn: booking.startDate,
                                                      status: booking.status === 'checked-in' ? 'Checked-In' : 'Reserved',
                                                      kycStatus: booking.status === 'checked-in' ? 'Verified' : 'Pending',
                                                      nationality: 'Indian'
                                                    }); 
                                                  }}
                                                  style={{ 
                                                    width: `${booking.nights * CELL_WIDTH - 12}px`,
                                                    left: '6px'
                                                  }}
                                                  className={`
                                                    absolute z-20 h-[58px] rounded-[1.25rem] border-2 flex flex-col justify-center px-5 shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all
                                                    ${getStatusStyles(booking.status)}
                                                  `}
                                                >
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="text-[11px] font-bold uppercase tracking-tighter truncate pr-2">{booking.guestName}</span>
                                                        <span className="text-[8px] font-bold opacity-80 whitespace-nowrap">{booking.nights}N</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest">{booking.source}</span>
                                                        {booking.balance > 0 && <IndianRupee size={10} className="animate-bounce" />}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Status Chip Footer */}
        <div className="p-4 bg-black/10 border-t border-white/5 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase text-gray-500">Auto-Reconciled: 02m ago</span>
                 </div>
             </div>
             <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-all">
                    <Calendar size={14} /> Month View
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    Export Grid
                 </button>
             </div>
        </div>
      </GlassCard>

      {/* Guest Detail Sidebar/Panel (Conditional Portal) */}
      <GuestDetailPanel 
        isOpen={!!selectedBooking} 
        guest={selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
      />

      <NewBookingWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

    </div>
  );
};

export default BookingEngine;
