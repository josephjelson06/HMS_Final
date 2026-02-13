import React, { useState, useMemo, useEffect } from 'react';
import { 
  Monitor, Wifi, WifiOff, Battery, Activity, Search, Filter, 
  Signal, MoreVertical, ExternalLink, LayoutGrid, List, 
  Printer, Clock, ShieldCheck, Download, CheckSquare, Square,
  ChevronDown, Plus, Cpu, Zap, Binary
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Pagination from '../../components/ui/Pagination';
import { useTheme } from '../../hooks/useTheme';
import AddKioskModal from '../../modals/super/AddKioskModal';
import KioskFirmware from '../../modals/super/KioskFirmware';
import { kioskData } from '../../data/kiosks';

interface KioskFleetProps {
  onNavigateDetail?: (id: string) => void;
}

type FleetTab = 'DEVICES' | 'FIRMWARE';

const PaperLevel = ({ level, compact = false }: { level: number, compact?: boolean }) => {
  const color = level < 10 ? 'bg-red-500' : level < 20 ? 'bg-amber-500' : 'bg-emerald-500';
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="h-1.5 flex-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${level}%` }}></div>
        </div>
        <span className="text-[10px] font-black dark:text-gray-300 whitespace-nowrap">{level}%</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-[8px] font-black text-gray-500 uppercase tracking-widest">
          <Printer size={10} />
          Paper
        </div>
        <span className="text-[9px] font-black dark:text-gray-300">{level}%</span>
      </div>
      <div className="h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${level}%` }}></div>
      </div>
    </div>
  );
};

const KioskFleet: React.FC<KioskFleetProps> = ({ onNavigateDetail }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<FleetTab>('DEVICES');
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [selectedKiosks, setSelectedKiosks] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL STATUS');
  const [filterHotel, setFilterHotel] = useState('ALL HOTELS');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedKiosks(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const filteredData = useMemo(() => {
    return kioskData.filter(k => {
      const matchesSearch = k.id.toLowerCase().includes(search.toLowerCase()) || 
                           k.hotel.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'ALL STATUS' || k.status === filterStatus;
      const matchesHotel = filterHotel === 'ALL HOTELS' || k.hotel.includes(filterHotel);
      return matchesSearch && matchesStatus && matchesHotel;
    });
  }, [search, filterStatus, filterHotel]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterHotel, itemsPerPage, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Kiosk Fleet</h1>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-3">
              {activeTab === 'DEVICES' ? 'Hardware Command Center • 65 Devices Active' : 'Software Versioning & Firmware Deployment'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 w-fit">
              <button 
                  onClick={() => setActiveTab('DEVICES')}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'DEVICES' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                  <Monitor size={14} /> Device Registry
              </button>
              <button 
                  onClick={() => setActiveTab('FIRMWARE')}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'FIRMWARE' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                  <Binary size={14} /> Firmware Forge
              </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'DEVICES' ? (
              <>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mr-4"
                >
                  <Plus size={20} strokeWidth={3} />
                  Add New Kiosk
                </button>
                {[
                  { label: '62 ONLINE', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20' },
                  { label: '3 OFFLINE', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
                  { label: '1 CRITICAL', color: 'bg-red-600 text-white shadow-lg shadow-red-900/40 animate-pulse' },
                ].map((stat, i) => (
                  <div key={i} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${stat.color}`}>
                    {stat.label}
                  </div>
                ))}
              </>
            ) : null}
        </div>
      </div>

      {activeTab === 'DEVICES' ? (
        <>
          {/* Control Bar */}
          <div className="relative z-30">
            <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl border-white/10" noPadding>
              <div className="p-3 w-full flex-1 flex flex-col md:flex-row gap-3">
                  <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-16 pr-4 py-4 border-none rounded-2xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
                        placeholder="Search Device ID or Hotel Name..."
                      />
                  </div>
                  
                  <div className="flex items-center gap-3 px-4">
                      <GlassDropdown 
                          trigger={
                              <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                                  <span className="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{filterStatus}</span>
                                  <ChevronDown size={16} className="text-gray-400" />
                              </div>
                          }
                          items={[
                              { label: 'ALL STATUS', onClick: () => setFilterStatus('ALL STATUS'), variant: filterStatus === 'ALL STATUS' ? 'selected' : 'default' },
                              { label: 'ONLINE', onClick: () => setFilterStatus('ONLINE'), variant: filterStatus === 'ONLINE' ? 'selected' : 'default' },
                              { label: 'OFFLINE', onClick: () => setFilterStatus('OFFLINE'), variant: filterStatus === 'OFFLINE' ? 'selected' : 'default' },
                              { label: 'CRITICAL', onClick: () => setFilterStatus('CRITICAL'), variant: filterStatus === 'CRITICAL' ? 'selected' : 'default' }
                          ]}
                      />

                      <GlassDropdown 
                          trigger={
                              <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                                  <span className="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{filterHotel}</span>
                                  <ChevronDown size={16} className="text-gray-400" />
                              </div>
                          }
                          items={[
                              { label: 'ALL HOTELS', onClick: () => setFilterHotel('ALL HOTELS'), variant: filterHotel === 'ALL HOTELS' ? 'selected' : 'default' },
                              { label: 'Royal Orchid', onClick: () => setFilterHotel('Royal Orchid'), variant: filterHotel === 'Royal Orchid' ? 'selected' : 'default' },
                              { label: 'Lemon Tree', onClick: () => setFilterHotel('Lemon Tree'), variant: filterHotel === 'Lemon Tree' ? 'selected' : 'default' },
                              { label: 'Taj Palace', onClick: () => setFilterHotel('Taj Palace'), variant: filterHotel === 'Taj Palace' ? 'selected' : 'default' }
                          ]}
                      />
                      
                      <div className="h-10 w-px bg-black/5 dark:bg-white/10 mx-2 hidden md:block"></div>
                      
                      <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 border border-white/10">
                          <button onClick={() => setView('grid')} className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-white dark:bg-white/10 shadow-lg text-blue-600 dark:text-orange-500' : 'text-gray-400 hover:text-white'}`}>
                              <LayoutGrid size={20} />
                          </button>
                          <button onClick={() => setView('table')} className={`p-3 rounded-xl transition-all ${view === 'table' ? 'bg-white dark:bg-white/10 shadow-lg text-blue-600 dark:text-orange-500' : 'text-gray-400 hover:text-white'}`}>
                              <List size={20} />
                          </button>
                      </div>
                  </div>
              </div>
            </GlassCard>
          </div>

          {/* Main Content View */}
          <div className="relative z-10">
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {paginatedData.map((kiosk) => {
                  const isCritical = kiosk.status === 'CRITICAL';
                  const isOffline = kiosk.status === 'OFFLINE';
                  const statusColor = isCritical ? 'border-red-600' : isOffline ? 'border-red-500' : 'border-emerald-500';
                  
                  return (
                    <div 
                      key={kiosk.id} 
                      onClick={() => onNavigateDetail?.(kiosk.id)}
                      className={`
                        group relative glass-card p-8 rounded-[2.5rem] border-l-4 cursor-pointer transition-all duration-300 shadow-2xl hover:scale-[1.02]
                        ${statusColor} ${isCritical ? 'animate-[pulse_2.5s_infinite]' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-xl font-black dark:text-white tracking-tighter uppercase">{kiosk.id}</h3>
                          <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate max-w-[140px] mt-1.5">{kiosk.hotel}</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${isOffline || isCritical ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {isOffline || isCritical ? <WifiOff size={22} /> : <Wifi size={22} />}
                        </div>
                      </div>

                      <div className="space-y-6">
                          <div className="flex items-center justify-between py-3 border-y border-white/5">
                              <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-gray-400" />
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isCritical || isOffline ? 'text-red-500' : 'text-emerald-500'}`}>
                                      {kiosk.lastSeen}
                                  </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                  <Signal size={14} className={kiosk.signal > 50 ? 'text-emerald-500' : 'text-amber-500'} />
                                  <span className="text-[11px] font-black dark:text-white">{kiosk.signal}%</span>
                              </div>
                          </div>

                          <PaperLevel level={kiosk.paper} />

                          <div className="flex items-center justify-between pt-2">
                              <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">{kiosk.firmware}</span>
                              {kiosk.update && (
                                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                                      Update Ready
                                  </span>
                              )}
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <GlassCard noPadding clipContent className="overflow-hidden border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Unified Table Header */}
                <div className="px-10 py-6 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-black/5 dark:bg-white/[0.03] border-b border-white/10">
                    <div className="col-span-1 flex items-center">
                        <CheckSquare size={16} className="opacity-30" />
                    </div>
                    <div className="col-span-2 flex items-center">DEVICE ID</div>
                    <div className="col-span-3 flex items-center">HOTEL IDENTITY</div>
                    <div className="col-span-1 flex items-center">STATUS</div>
                    <div className="col-span-1 flex items-center justify-center">LAST HEARTBEAT</div>
                    <div className="col-span-2 flex items-center justify-center px-4">PAPER LEVEL</div>
                    <div className="col-span-1 flex items-center justify-center">FIRMWARE</div>
                    <div className="col-span-1 flex items-center justify-end pr-2">ACTION</div>
                </div>

                {/* High Density Unified Data Rows */}
                <div className="divide-y divide-white/5">
                    {paginatedData.map((k) => (
                      <div 
                        key={k.id}
                        onClick={() => onNavigateDetail?.(k.id)}
                        className="group grid grid-cols-12 gap-4 items-center px-10 py-5 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-600"
                      >
                        <div className="col-span-1" onClick={(e) => { e.stopPropagation(); toggleSelect(k.id); }}>
                            {selectedKiosks.includes(k.id) ? <CheckSquare size={20} className="text-blue-600 dark:text-orange-500" /> : <Square size={20} className="text-gray-500" />}
                        </div>
                        <div className="col-span-2 text-sm font-black dark:text-white font-mono uppercase tracking-tighter">{k.id}</div>
                        <div className="col-span-3">
                            <span className="text-sm font-black dark:text-gray-300 leading-tight block truncate uppercase tracking-tight">{k.hotel}</span>
                        </div>
                        <div className="col-span-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${k.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${k.status === 'ONLINE' ? 'text-gray-500' : 'text-red-500'}`}>{k.status}</span>
                            </div>
                        </div>
                        <div className="col-span-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-tighter">{k.lastSeen}</div>
                        <div className="col-span-2 px-8">
                            <PaperLevel level={k.paper} compact={true} />
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-black text-gray-500">{k.firmware}</span>
                                {k.update && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></div>}
                            </div>
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <GlassDropdown 
                                trigger={
                                    <button className="p-2.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all bg-black/5 dark:bg-white/5"><MoreVertical size={22} /></button>
                                }
                                items={[
                                    { icon: ExternalLink, label: 'Full Diagnostics', onClick: () => onNavigateDetail?.(k.id), variant: 'primary' },
                                    { icon: Clock, label: 'Shift Logs', onClick: () => {} },
                                    { icon: Download, label: 'Update Firmware', onClick: () => {}, variant: 'warning' },
                                    { icon: WifiOff, label: 'Force Reboot', onClick: () => {}, variant: 'danger' },
                                ]}
                            />
                        </div>
                      </div>
                    ))}
                </div>
              </GlassCard>
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredData.length}
          />

          {/* Bulk Action Footer */}
          {selectedKiosks.length > 0 && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10">
                  <div className="bg-gray-900 dark:bg-orange-600 p-6 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/20 flex justify-between items-center">
                      <div className="flex items-center gap-4 pl-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                            <ShieldCheck size={24} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-[0.2em] text-white">{selectedKiosks.length} Devices Mapped</span>
                      </div>
                      <div className="flex gap-3">
                          <button className="px-8 py-3.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all flex items-center gap-2">
                              <Download size={16} /> Bulk Firmware
                          </button>
                          <button className="px-8 py-3.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Reboot Fleet</button>
                      </div>
                  </div>
              </div>
          )}
        </>
      ) : (
        /* Render new Firmware Management Tab */
        <KioskFirmware />
      )}

      {/* Empty State for Devices */}
      {activeTab === 'DEVICES' && filteredData.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
              <Monitor size={64} className="text-gray-500 mb-6" />
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">No Devices Found</h3>
              <p className="text-sm font-bold text-gray-500 uppercase mt-2">Adjust your filters or try a different asset tag.</p>
          </div>
      )}

      <AddKioskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

    </div>
  );
};

export default KioskFleet;