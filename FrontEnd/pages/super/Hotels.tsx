import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, MoreHorizontal, User, Smartphone, CreditCard, 
  LogIn, ExternalLink, Edit, ShieldOff, ChevronDown, Filter,
  LayoutGrid, List, Building2, MapPin, Phone, IndianRupee,
  Activity, ArrowUpRight, Mail, ShieldAlert, Trash2, CheckSquare, Square
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassDropdown from '../../components/ui/GlassDropdown';
import AddHotelModal from '../../modals/super/AddHotelModal';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SharedStatusBadge, { statusToVariant } from '../../components/ui/StatusBadge';
import { hotelsData } from '../../data/hotels';

interface HotelsProps {
  onNavigate: (route: string) => void;
  onLoginAsAdmin?: (hotelName: string) => void;
}

const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: Record<string, string> = {
    Starter: "bg-blue-500/10 text-accent-strong border-accent/20",
    Professional: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    Enterprise: "bg-accent-muted text-accent-strong border-accent/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${styles[plan] || styles.Starter}`}>
      {plan}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <SharedStatusBadge label={status} variant={statusToVariant(status)} />
);

const Hotels: React.FC<HotelsProps> = ({ onNavigate, onLoginAsAdmin }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All Plans');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedHotels, setSelectedHotels] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const toggleSelect = (id: number) => {
    setSelectedHotels(prev => prev.includes(id) ? prev.filter(hId => hId !== id) : [...prev, id]);
  };

  const filteredHotels = useMemo(() => {
    return hotelsData.filter(hotel => {
      const searchStr = search.toLowerCase();
      const matchesSearch = 
        hotel.name.toLowerCase().includes(searchStr) ||
        hotel.gstin.toLowerCase().includes(searchStr) ||
        hotel.owner.toLowerCase().includes(searchStr) ||
        hotel.mobile.includes(search);
      
      const matchesPlan = filterPlan === 'All Plans' || hotel.plan === filterPlan;
      const matchesStatus = filterStatus === 'All Status' || hotel.status === filterStatus;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [search, filterPlan, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPlan, filterStatus, itemsPerPage]);

  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHotels.slice(start, start + itemsPerPage);
  }, [filteredHotels, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <PageHeader
        title="Hotels Registry"
        subtitle={`Core Tenant Ecosystem • ${filteredHotels.length} Active Accounts`}
      >
        <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 border border-white/10">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-lg text-accent-strong' : 'text-gray-400 hover:text-white'}`}
          >
            <LayoutGrid size={22} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-lg text-accent-strong' : 'text-gray-400 hover:text-white'}`}
          >
            <List size={22} />
          </button>
        </div>
        <Button
          size="lg"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={20} strokeWidth={3} />}
        >
          Onboard Hotel
        </Button>
      </PageHeader>

      {/* Control Bar */}
      <div className="relative z-30">
        <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl border-white/10" noPadding>
          <div className="p-3 w-full flex-1 flex flex-col md:flex-row gap-3">
               <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-16 pr-6 py-5 border-none rounded-2xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
                    placeholder="Search by Hotel Name, GSTIN or Manager..."
                  />
              </div>
              
              <div className="flex items-center gap-3 px-4">
                  <GlassDropdown 
                      trigger={
                          <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                              <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">{filterPlan}</span>
                              <ChevronDown size={16} className="text-gray-400" />
                          </div>
                      }
                      items={[
                          { label: 'All Plans', onClick: () => setFilterPlan('All Plans'), variant: filterPlan === 'All Plans' ? 'selected' : 'default' },
                          { label: 'Starter', onClick: () => setFilterPlan('Starter'), variant: filterPlan === 'Starter' ? 'selected' : 'default' },
                          { label: 'Professional', onClick: () => setFilterPlan('Professional'), variant: filterPlan === 'Professional' ? 'selected' : 'default' },
                          { label: 'Enterprise', onClick: () => setFilterPlan('Enterprise'), variant: filterPlan === 'Enterprise' ? 'selected' : 'default' }
                      ]}
                  />

                  <GlassDropdown 
                      trigger={
                          <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                              <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">{filterStatus}</span>
                              <ChevronDown size={16} className="text-gray-400" />
                          </div>
                      }
                      items={[
                          { label: 'All Status', onClick: () => setFilterStatus('All Status'), variant: filterStatus === 'All Status' ? 'selected' : 'default' },
                          { label: 'Active', onClick: () => setFilterStatus('Active'), variant: filterStatus === 'Active' ? 'selected' : 'default' },
                          { label: 'Past Due', onClick: () => setFilterStatus('Past Due'), variant: filterStatus === 'Past Due' ? 'selected' : 'default' },
                          { label: 'Suspended', onClick: () => setFilterStatus('Suspended'), variant: filterStatus === 'Suspended' ? 'selected' : 'default' },
                          { label: 'Onboarding', onClick: () => setFilterStatus('Onboarding'), variant: filterStatus === 'Onboarding' ? 'selected' : 'default' }
                      ]}
                  />
              </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Registry View Area */}
      <div className="relative z-10">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
             {paginatedHotels.map((hotel) => (
               <GlassCard key={hotel.id} noPadding clipContent className="group flex flex-col h-full border-white/10 hover:border-accent/30 overflow-hidden shadow-2xl">
                  {/* UNIFIED CONTAINER: Full-Bleed Image Header */}
                  <div className="aspect-[16/9] w-full bg-black/40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                          <Building2 size={120} className="text-white group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div 
                        className="absolute inset-0 opacity-40 bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60')` }}
                      ></div>
                      
                      <div className="absolute top-5 right-5 z-20">
                          <PlanBadge plan={hotel.plan} />
                      </div>

                      <div className="absolute bottom-5 left-6 right-6 z-20">
                          <div className="space-y-3">
                              <StatusBadge status={hotel.status} />
                              <h3 className="text-2xl font-black text-white leading-none tracking-tight group-hover:text-accent transition-colors">{hotel.name}</h3>
                          </div>
                      </div>
                  </div>

                  {/* UNIFIED CONTAINER: Flush Content Area (0px margin to image) */}
                  <div className="p-8 flex-1 flex flex-col justify-between space-y-8 bg-black/5 dark:bg-white/[0.01]">
                      <div className="space-y-6">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address + ", " + hotel.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-500 hover:text-accent transition-all group/loc"
                          >
                              <MapPin size={16} className="shrink-0" />
                              <span className="text-[11px] font-bold uppercase tracking-[0.15em] truncate border-b border-transparent group-hover/loc:border-current">{hotel.address}</span>
                          </a>
                          
                          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                              <div className="space-y-3">
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Property Manager</p>
                                  <div className="space-y-2">
                                      <p className="text-sm font-bold dark:text-gray-200 truncate">{hotel.owner}</p>
                                      <div className="flex items-center gap-4">
                                          <a href={`tel:${hotel.mobile}`} title="Call Manager" className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-accent-muted hover:text-accent transition-all">
                                              <Phone size={14} />
                                          </a>
                                          <a href={`mailto:${hotel.email}`} title="Email Manager" className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-accent-muted hover:text-accent transition-all">
                                              <Mail size={14} />
                                          </a>
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Tax Identifier</p>
                                  <p className="text-[11px] font-mono font-bold dark:text-gray-400 uppercase tracking-tighter bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-white/5 inline-block">{hotel.gstin}</p>
                              </div>
                          </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                          <div className="flex justify-between items-center mb-8">
                              <div className="flex gap-8">
                                  <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Kiosks</span>
                                      <span className="text-xl font-black dark:text-white flex items-center gap-2 mt-1">
                                          <Smartphone size={16} className="text-accent" /> {hotel.kiosks}
                                      </span>
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">MRR</span>
                                      <span className="text-xl font-black text-emerald-500 flex items-center gap-1 mt-1">
                                          <IndianRupee size={16} /> {(hotel.mrr/1000).toFixed(1)}k
                                      </span>
                                  </div>
                              </div>
                              
                              <GlassDropdown 
                                  trigger={
                                      <button className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                                          <MoreHorizontal size={22} />
                                      </button>
                                  }
                                  items={[
                                      { icon: LogIn, label: 'Impersonate Admin', onClick: () => onLoginAsAdmin?.(hotel.name), variant: 'primary', hasSeparatorAfter: true },
                                      { icon: ExternalLink, label: 'View Analytics', onClick: () => onNavigate('hotel-details') },
                                      { icon: Edit, label: 'Edit Parameters', onClick: () => {} },
                                      { icon: ShieldAlert, label: 'Suspend Account', onClick: () => {}, variant: 'warning' },
                                      { icon: Trash2, label: 'Delete Registry', onClick: () => {}, variant: 'danger' },
                                  ]}
                              />
                          </div>
                      </div>
                  </div>

                  {/* UNIFIED CONTAINER: Full-Bleed Anchored Footer Button */}
                  <button 
                      onClick={() => onNavigate('hotel-details')}
                      className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-accent-strong hover:text-white transition-all flex items-center justify-center gap-3 group/btn border-t border-white/5"
                  >
                      Access Property Profile <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
               </GlassCard>
             ))}
          </div>
        ) : (
          <div className="space-y-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="px-8 py-6 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 bg-black/10 dark:bg-white/5 rounded-t-[2rem] border-x border-t border-white/10 shadow-sm">
                  <div className="col-span-1 flex items-center"><CheckSquare size={16} className="opacity-30" /></div>
                  <div className="col-span-3 flex items-center">Identity & Location</div>
                  <div className="col-span-2 flex items-center">Tax Identifier</div>
                  <div className="col-span-2 flex items-center">Owner / Contact</div>
                  <div className="col-span-1 flex items-center">Plan</div>
                  <div className="col-span-1 flex items-center justify-center">Status</div>
                  <div className="col-span-1 flex items-center justify-end pr-4">Yield</div>
                  <div className="col-span-1 flex items-center justify-end pr-4">Action</div>
              </div>

              <div className="space-y-3 pt-3">
                  {paginatedHotels.map((hotel) => (
                  <div 
                      key={hotel.id}
                      className="group relative grid grid-cols-12 gap-4 items-center p-6 rounded-[2rem] glass-card border-white/5 dark:border-white/10 transition-all hover:border-blue-500/30 shadow-md"
                  >
                      <div className="col-span-1" onClick={(e) => { e.stopPropagation(); toggleSelect(hotel.id); }}>
                        {selectedHotels.includes(hotel.id) ? <CheckSquare size={20} className="text-accent-strong" /> : <Square size={20} className="text-gray-400" />}
                      </div>
                      <div className="col-span-3 flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-black/10 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-accent transition-colors shrink-0">
                              <Building2 size={28} />
                          </div>
                          <div className="min-w-0">
                              <button 
                                  onClick={() => onNavigate('hotel-details')}
                                  className="font-black text-gray-900 dark:text-white text-base hover:text-accent-strong transition-colors text-left truncate block w-full tracking-tight"
                              >
                                  {hotel.name}
                              </button>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address + ", " + hotel.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-tighter hover:text-accent transition-colors"
                              >
                                  <MapPin size={12} /> {hotel.address}
                              </a>
                          </div>
                      </div>
                      <div className="col-span-2 text-[11px] font-mono font-black text-gray-500 dark:text-gray-400 tracking-tighter">{hotel.gstin}</div>
                      <div className="col-span-2 flex flex-col gap-1.5">
                          <span className="text-sm font-black text-gray-800 dark:text-gray-200">{hotel.owner}</span>
                          <div className="flex items-center gap-3">
                              <a href={`tel:${hotel.mobile}`} className="text-gray-500 hover:text-accent transition-colors"><Phone size={12} /></a>
                              <a href={`mailto:${hotel.email}`} className="text-gray-500 hover:text-accent transition-colors"><Mail size={12} /></a>
                          </div>
                      </div>
                      <div className="col-span-1"><PlanBadge plan={hotel.plan} /></div>
                      <div className="col-span-1 flex justify-center"><StatusBadge status={hotel.status} /></div>
                      <div className="col-span-1 text-right pr-4">
                          <p className="text-sm font-black dark:text-white tracking-tighter">₹{hotel.mrr.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{hotel.kiosks} Kiosks</p>
                      </div>
                      <div className="col-span-1 flex justify-end pr-2">
                          <GlassDropdown 
                              trigger={
                                  <button className="p-3.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all bg-black/5 dark:bg-white/5"><MoreHorizontal size={22} /></button>
                              }
                              items={[
                                  { icon: LogIn, label: 'Impersonate Admin', onClick: () => onLoginAsAdmin?.(hotel.name), variant: 'primary', hasSeparatorAfter: true },
                                  { icon: ExternalLink, label: 'Full Analytics', onClick: () => onNavigate('hotel-details') },
                                  { icon: Edit, label: 'Settings', onClick: () => {} },
                                  { icon: ShieldAlert, label: 'Suspend', onClick: () => {}, variant: 'warning' },
                                  { icon: Trash2, label: 'Delete', onClick: () => {}, variant: 'danger' },
                              ]}
                          />
                      </div>
                  </div>
                  ))}
              </div>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredHotels.length}
      />

      <AddHotelModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default Hotels;