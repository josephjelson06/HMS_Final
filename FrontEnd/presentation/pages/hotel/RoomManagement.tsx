
import React, { useState, useMemo, useRef } from 'react';
import { 
  LayoutGrid, List, Calendar, Search, Filter, 
  PlusCircle, DoorOpen, Brush, Wrench, Ban, 
  AlertTriangle, Play, Check, ChevronRight,
  Building2, Layers, ShieldCheck, Smartphone,
  Clock, Bell, Plus, ChevronDown, ChevronUp,
  Calendar as CalendarIcon, ChevronLeft, Layout, IndianRupee, Info, CheckCircle2,
  MousePointer2, Move, AlertCircle, Tags, Edit3, Trash2, Users, FileOutput
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import RoomDetailPanel from '../../modals/hotel/RoomDetailPanel';
import NewBookingWizard from '../../modals/hotel/NewBookingWizard';
import GuestDetailPanel from '../../modals/hotel/GuestDetailPanel';
import AddRoomModal from '../../modals/hotel/AddRoomModal';
import AddBuildingModal from '../../modals/hotel/AddBuildingModal';
import ManageRoomTypeModal from '../../modals/hotel/ManageRoomTypeModal';
import BatchRoomGeneratorModal from '../../modals/hotel/BatchRoomGeneratorModal';
import type { RoomStatus, RoomViewMode as ViewMode, Room } from '@/domain/entities/Room';
import { ROOM_CELL_WIDTH as CELL_WIDTH, ROOM_LIST_WIDTH, ROOM_DAYS_TO_SHOW as DAYS_TO_SHOW } from '@/domain/entities/Room';
import { useRooms } from '@/application/hooks/useRooms';

const RoomManagement: React.FC = () => {
  const { 
    rooms: allRooms, 
    bookings: allBookings, 
    roomTypes, 
    buildings, 
    createRoom, 
    createBuilding, 
    createType, 
    deleteType,
    batchCreateRooms
  } = useRooms();
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [activeBuilding, setActiveBuilding] = useState('Building 01');
  const [activeFloor, setActiveFloor] = useState<number | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Timeline/Booking Engine States
  const [viewDate, setViewDate] = useState(new Date('2026-02-10'));
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Room Types State
  // Removed local roomTypes state
  const [isManageTypeModalOpen, setIsManageTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    typeId: string;
    displayName: string;
  }>({
    isOpen: false,
    typeId: '',
    displayName: '',
  });

  const handleSaveRoomType = async (typeData: any) => {
    if (editingType) {
      // Update not implemented yet in backend/hook for types, skipping
      console.warn("Update type not supported yet");
    } else {
        await createType(typeData);
    }
    setEditingType(null);
  };

  const handleDeleteRoomType = (id: string, name: string) => {
    setConfirmDelete({
      isOpen: true,
      typeId: id,
      displayName: name
    });
  };

  const executeDeleteRoomType = async () => {
    await deleteType(confirmDelete.typeId);
    setConfirmDelete(prev => ({ ...prev, isOpen: false }));
  };

  const handleBatchGenerate = async (config: any) => {
    let buildingName = config.building;
    // Try to find existing ID
    let buildingId = buildings.find(b => b.name === buildingName)?.id;

    // Create building if new mode
    if (config.buildingMode === 'NEW') {
        try {
            const newB = await createBuilding(buildingName);
            buildingName = newB.name;
            buildingId = newB.id; 
        } catch (e) {
            console.error("Failed to create building", e);
            alert("Failed to create new building");
            return;
        }
    }

    if (!buildingId) {
         // Should have been found or created
         const found = buildings.find(b => b.name === buildingName);
         if (found) buildingId = found.id;
         // If still not found, we might need to rely on backend lookup or fail
         // But createBuilding updates hook state, so it should be there? 
         // Actually hook updates might not be immediate in 'buildings' list in this closure if it's from state.
         // But await createBuilding returns the new building object.
    }

    // Map rooms
    const roomsToCreate = config.rooms.map((r: any) => {
        const cat = roomTypes.find(c => c.name === r.category);
        return {
            id: r.id,
            floor: r.floor,
            category: r.category,
            building: buildingName,
            status: 'CLEAN_VACANT',
            type: 'Hostel Room',
            lastUpdate: new Date().toISOString(),
            // Backend fields
            category_id: cat?.id,
            building_id: buildingId 
        };
    });

    try {
        await batchCreateRooms(roomsToCreate);
        setIsBatchOpen(false);
    } catch (e) {
        console.error("Batch create failed", e);
        alert("Batch create failed");
    }
  };

  const filteredRooms = useMemo(() => {
    return allRooms.filter(r => {
      const matchesBuilding = r.building === activeBuilding;
      const matchesFloor = activeFloor === 'All' || r.floor === activeFloor;
      const matchesSearch = r.id.includes(search) || r.category.toLowerCase().includes(search.toLowerCase());
      return matchesBuilding && matchesFloor && matchesSearch;
    });
  }, [allRooms, activeBuilding, activeFloor, search]);

  const dates = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }).map((_, i) => {
      const d = new Date(viewDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [viewDate]);

  const headerRef = useRef<HTMLDivElement>(null);
  const roomsSidebarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (headerRef.current) headerRef.current.scrollLeft = target.scrollLeft;
    if (roomsSidebarRef.current) roomsSidebarRef.current.scrollTop = target.scrollTop;
  };

  const getStatusStyles = (status: string, source: string) => {
    const isOTA = ['MMT', 'Agoda', 'GoBiz', 'Booking.com'].includes(source);
    
    switch (status) {
      case 'checked-in': 
        return isOTA 
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-400 text-white shadow-emerald-900/40' 
            : 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20';
      case 'confirmed': 
        return 'bg-accent-strong border-blue-400 text-white shadow-blue-900/40';
      case 'overdue': 
        return 'bg-red-600 border-red-400 text-white shadow-red-900/40 animate-pulse';
      case 'pending': 
        return 'bg-amber-500 border-amber-400 text-white shadow-amber-900/20';
      default: 
        return 'bg-gray-700 border-gray-500 text-white';
    }
  };

  const navigateDates = (days: number) => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + days);
    setViewDate(next);
  };

  const ViewSwitcher = () => (
    <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10">
      <button 
        onClick={() => setViewMode('GRID')}
        className={`p-2.5 rounded-xl transition-all ${viewMode === 'GRID' ? 'bg-white dark:bg-white/10 text-accent-strong shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <LayoutGrid size={20} />
      </button>
      <button 
        onClick={() => setViewMode('TIMELINE')}
        className={`p-2.5 rounded-xl transition-all ${viewMode === 'TIMELINE' ? 'bg-white dark:bg-white/10 text-accent-strong shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <CalendarIcon size={20} />
      </button>
      <button 
        onClick={() => setViewMode('TYPES')}
        className={`p-2.5 rounded-xl transition-all ${viewMode === 'TYPES' ? 'bg-white dark:bg-white/10 text-accent-strong shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <Tags size={20} />
      </button>
    </div>
  );

  const availableFloors = useMemo(() => {
    const floors = new Set<number>();
    allRooms.forEach(room => {
        if (room.building === activeBuilding) {
            floors.add(room.floor);
        }
    });
    return ['All', ...Array.from(floors).sort((a, b) => a - b)];
  }, [allRooms, activeBuilding]);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-32 animate-in fade-in duration-500">
      
      {/* 1. Header Action Bar */}
      <PageHeader
        title={viewMode === 'TYPES' ? 'Room Types Definition' : 'Room Management'}
      >
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
             <div className="hidden lg:flex items-center gap-4">
                <ViewSwitcher />
            </div>

            {viewMode === 'TYPES' && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => { setEditingType(null); setIsManageTypeModalOpen(true); }}
                  icon={<Plus size={18} strokeWidth={3} />}
                >
                  Create Category
                </Button>
            )}
        </div>
      </PageHeader>

      {/* 2. Unified Context Strip (Hidden in TYPES view) */}
      {viewMode !== 'TYPES' && viewMode !== 'TIMELINE' && (
        <div className="flex flex-col xl:flex-row gap-6 items-center animate-in fade-in duration-500">
            <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 w-full xl:w-auto overflow-x-auto no-scrollbar items-center">
                {(buildings.length > 0 ? buildings : [{name: 'Building 01'}]).map(b => (
                    <button 
                        key={b.name}
                        onClick={() => setActiveBuilding(b.name)}
                        className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeBuilding === b.name ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                        {b.name}
                    </button>
                ))}
                {/* Add Building Button */}
                <button 
                    onClick={() => setIsAddBuildingOpen(true)}
                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-accent-strong hover:bg-white/5 transition-all whitespace-nowrap flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={3} /> Add
                </button>
                {/* Batch Button */}
                <button 
                    onClick={() => setIsBatchOpen(true)}
                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:bg-white/5 transition-all whitespace-nowrap flex items-center gap-2"
                >
                    <Layers size={14} strokeWidth={3} /> Auto Gen
                </button>
            </div>

            <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-16 pr-6 py-4 border border-white/10 rounded-[1.5rem] bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 sm:text-sm shadow-sm backdrop-blur-md font-bold uppercase tracking-widest"
                    placeholder="Search Room Identity..."
                />
            </div>
        </div>
      )}

      {/* 3. Main View Render Engine */}
      {viewMode === 'GRID' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <GlassCard className="border border-white/5 bg-black/5 dark:bg-white/[0.01]" noPadding>
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-10 overflow-x-auto no-scrollbar">
                    {availableFloors.map(f => (
                        <button 
                            key={f} 
                            onClick={() => setActiveFloor(f as any)}
                            className={`text-[10px] font-bold uppercase tracking-widest pb-3 border-b-2 transition-all ${activeFloor === f ? 'text-accent-strong border-blue-600 dark:text-accent dark:border-accent' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            {f === 'All' ? 'All Floors' : `Floor ${f}`}
                        </button>
                    ))}
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-5">
                    <button 
                      onClick={() => setIsAddRoomOpen(true)}
                      className="group flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all bg-white/40 dark:bg-transparent"
                    >
                        <PlusCircle size={28} className="text-gray-300 group-hover:text-accent transition-colors mb-2" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-accent">+ Add Room</span>
                    </button>

                    {filteredRooms.map((room) => (
                        <div 
                            key={room.id} 
                            onClick={() => setSelectedRoom(room)}
                            className="flex flex-col items-center justify-between h-32 p-4 rounded-2xl bg-white dark:bg-white/5 border border-white/10 shadow-sm hover:shadow-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-accent transition-colors">Room no</span>
                                {room.isDND && <Ban size={8} className="text-red-500" />}
                            </div>
                            <span className="text-2xl font-black dark:text-white group-hover:scale-110 transition-transform tracking-tighter">#{room.id}</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg group-hover:bg-accent-muted group-hover:text-accent transition-colors">{room.category}</span>
                        </div>
                    ))}
                </div>
              </div>
           </GlassCard>
        </div>
      )}

      {viewMode === 'TIMELINE' && (
        <div className="animate-in zoom-in-95 duration-500 h-[calc(100vh-320px)] flex flex-col">
            <GlassCard noPadding className="flex-1 flex flex-col overflow-hidden border-white/10 shadow-2xl relative bg-white/50 dark:bg-black/20">
                {/* Navigation & Legend Bar */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/5 shrink-0 z-40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white dark:bg-white/5 rounded-2xl border border-white/10 p-1 shadow-sm">
                            <button onClick={() => navigateDates(-7)} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-all">
                                <ChevronLeft size={22} />
                            </button>
                            <div className="px-8 flex flex-col items-center min-w-[200px]">
                                <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">Inventory Window</span>
                                <span className="text-sm font-black dark:text-white uppercase tracking-tighter">
                                    {dates[0].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {dates[DAYS_TO_SHOW-1].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <button onClick={() => navigateDates(7)} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-all">
                                <ChevronRight size={22} />
                            </button>
                        </div>
                        <button 
                            onClick={() => setViewDate(new Date('2026-02-10'))}
                            className="px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all border border-white/5"
                        >
                            Back to Today
                        </button>
                    </div>

                    <div className="hidden xl:flex items-center gap-8 px-6">
                        {[
                            { label: 'Checked-In', color: 'bg-emerald-500' },
                            { label: 'Confirmed', color: 'bg-accent-strong' },
                            { label: 'Overdue', color: 'bg-red-600' },
                            { label: 'Pending', color: 'bg-amber-500' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_8px_currentColor] opacity-80`} />
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid UI */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex shrink-0 z-30">
                        <div style={{ width: `${ROOM_LIST_WIDTH}px` }} className="border-r border-white/10 bg-black/20 p-6 flex items-center justify-between shrink-0 shadow-2xl relative z-40">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Unit Registry</span>
                            <LayoutGrid size={18} className="text-gray-600" />
                        </div>
                        <div ref={headerRef} className="flex-1 overflow-hidden flex bg-black/10">
                            {dates.map((date, i) => (
                                <div 
                                    key={i} 
                                    style={{ width: `${CELL_WIDTH}px` }} 
                                    className={`shrink-0 border-r border-white/5 py-4 flex flex-col items-center justify-center text-center ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-accent-strong/5 dark:bg-accent/5' : ''}`}
                                >
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-1">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                    <span className={`text-xl font-black tracking-tighter ${date.toISOString().split('T')[0] === '2026-02-10' ? 'text-accent-strong scale-125' : 'dark:text-white'}`}>{date.getDate()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden relative">
                        <div ref={roomsSidebarRef} className="overflow-hidden border-r border-white/10 bg-black/10 shrink-0 z-20" style={{ width: `${ROOM_LIST_WIDTH}px` }}>
                            {allRooms.filter(r => r.building === activeBuilding).map((room) => (
                                <div key={room.id} className="h-20 border-b border-white/5 p-6 flex items-center gap-5 group hover:bg-black/20 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-accent-strong transition-colors shadow-inner">
                                        <DoorOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black dark:text-white leading-none tracking-tighter">#{room.id}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1.5 tracking-widest">{room.category}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }} className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white"><Info size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div 
                            ref={gridRef} 
                            onScroll={handleScroll}
                            className="flex-1 overflow-auto custom-scrollbar relative"
                        >
                            {/* Grid Lines */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                {allRooms.filter(r => r.building === activeBuilding).map((_, i) => (
                                    <div key={i} className="h-20 border-b border-white/10 w-full"></div>
                                ))}
                                {dates.map((_, i) => (
                                    <div key={i} style={{ left: `${i * CELL_WIDTH}px` }} className="absolute top-0 bottom-0 border-r border-white/10 w-px"></div>
                                ))}
                            </div>

                            {/* Today Line */}
                            <div className="absolute top-0 bottom-0 w-px bg-accent-strong/50 z-10 pointer-events-none" style={{ left: '0px' }}>
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-strong absolute -left-[4.5px] top-0 shadow-[0_0_15px_currentColor]"></div>
                            </div>

                            <div className="relative min-w-max">
                                {allRooms.filter(r => r.building === activeBuilding).map((room) => (
                                    <div key={room.id} className="h-20 flex">
                                        {dates.map((date, dateIdx) => {
                                            const dStr = date.toISOString().split('T')[0];
                                            const booking = allBookings.find(b => b.roomId === room.id && b.startDate === dStr);
                                            
                                            return (
                                                <div 
                                                    key={dateIdx} 
                                                    onClick={() => !booking && setIsWizardOpen(true)}
                                                    style={{ width: `${CELL_WIDTH}px` }} 
                                                    className={`shrink-0 flex items-center justify-center relative cursor-crosshair group/cell transition-all ${!booking ? 'hover:bg-accent-strong/5' : ''}`}
                                                >
                                                    {!booking && (
                                                        <div className="opacity-0 group-hover/cell:opacity-100 p-2.5 rounded-xl bg-accent-strong/10 text-accent transition-all scale-90">
                                                            <Plus size={20} strokeWidth={3} />
                                                        </div>
                                                    )}

                                                    {booking && (
                                                        <div 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setSelectedBooking({
                                                                    ...booking,
                                                                    name: booking.guestName,
                                                                    refId: booking.id,
                                                                    room: booking.roomId,
                                                                    roomCategory: room.category,
                                                                    checkIn: booking.startDate,
                                                                    status: booking.status === 'checked-in' ? 'Checked-In' : 'Reserved',
                                                                    kycStatus: booking.status === 'checked-in' ? 'Verified' : 'Pending',
                                                                    nationality: 'Indian'
                                                                }); 
                                                            }}
                                                            style={{ 
                                                                width: `${booking.nights * CELL_WIDTH - 16}px`,
                                                                left: '8px'
                                                            }}
                                                            className={`
                                                                absolute z-20 h-[64px] rounded-[1.5rem] border-2 flex flex-col justify-center px-6 shadow-2xl cursor-pointer hover:scale-[1.03] active:scale-95 transition-all
                                                                ${getStatusStyles(booking.status, booking.source)}
                                                            `}
                                                        >
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-black uppercase tracking-tighter truncate pr-4">{booking.guestName}</span>
                                                                <span className="text-[9px] font-black opacity-80 whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-full">{booking.nights}N</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black opacity-90 uppercase tracking-widest italic">{booking.source}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {booking.balance > 0 && <AlertCircle size={14} className="text-white animate-bounce" />}
                                                                    <Move size={12} className="opacity-0 group-hover:opacity-60" />
                                                                </div>
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
                <div className="p-5 bg-black/20 border-t border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner"><CheckCircle2 size={18} /></div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Inventory Management Active</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            Export Chart <FileOutput size={16} className="opacity-50" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
      )}

      {viewMode === 'TYPES' && (
        <div className="space-y-6 animate-in fade-in duration-500">
            <GlassCard className="border-white/10" noPadding>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
                    <button 
                        onClick={() => { setEditingType(null); setIsManageTypeModalOpen(true); }}
                        className="group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all bg-white/40 dark:bg-transparent min-h-[250px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-accent group-hover:scale-110 transition-all mb-4">
                            <Plus size={32} />
                        </div>
                        <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">New Category</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Define new room type</p>
                    </button>

                    {roomTypes.map(rt => (
                        <div key={rt.id} className="p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all min-h-[250px]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-black dark:text-white uppercase leading-tight mb-1">{rt.name}</h4>
                                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{rt.id}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase">Active</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Base Rate</p>
                                        <p className="text-lg font-black text-accent-strong tracking-tighter">₹{rt.rate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Max Guests</p>
                                        <p className="text-lg font-black dark:text-white flex items-center gap-1">
                                            {rt.occupancy} <Users size={14} className="text-gray-400" />
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Amenities Included</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {rt.amenities.map((a, i) => (
                                            <span key={i} className="text-[8px] font-bold uppercase text-gray-500 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 mt-auto border-t border-white/5">
                                <button 
                                    onClick={() => { setEditingType(rt); setIsManageTypeModalOpen(true); }}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteRoomType(rt.id, rt.name)}
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
      )}

      <RoomDetailPanel 
        isOpen={!!selectedRoom} 
        room={selectedRoom} 
        onClose={() => setSelectedRoom(null)} 
      />

      <GuestDetailPanel 
        isOpen={!!selectedBooking} 
        guest={selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
      />

      <NewBookingWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

      <AddRoomModal 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)} 
        onAdd={async (data) => {
            // Map names to IDs
            const bld = buildings.find(b => b.name === data.building);
            const cat = roomTypes.find(c => c.name === data.category);
            
            if (!bld || !cat) {
                alert("Invalid Building or Category selected");
                return;
            }

            await createRoom({
                ...data,
                id: data.roomNumber,
                floor: parseInt(data.floor),
                category: cat.name,
                building: bld.name,
                status: 'CLEAN_VACANT',
                type: 'Hostel Room',
                lastUpdate: new Date().toISOString(),
                // Hidden fields for backend:
                category_id: cat.id,
                building_id: bld.id
            } as any);
        }}
      />
      <AddBuildingModal 
        isOpen={isAddBuildingOpen} 
        onClose={() => setIsAddBuildingOpen(false)} 
        onAdd={async (data) => {
            await createBuilding(data.name);
        }}
      />
      
      <BatchRoomGeneratorModal 
        isOpen={isBatchOpen} 
        onClose={() => setIsBatchOpen(false)} 
        buildings={buildings}
        categories={roomTypes}
        onGenerate={handleBatchGenerate}
      />
      
      <ManageRoomTypeModal 
        isOpen={isManageTypeModalOpen} 
        onClose={() => setIsManageTypeModalOpen(false)} 
        onSave={handleSaveRoomType}
        initialData={editingType}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeDeleteRoomType}
        title="Delete Room Category"
        message={`Are you absolutely sure you want to remove the ${confirmDelete.displayName} category? This will dissolve the classification registry for these units.`}
        variant="danger"
        confirmLabel="Remove Category"
      />

    </div>
  );
};

export default RoomManagement;
