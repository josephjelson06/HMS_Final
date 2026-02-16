import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Shield, Search, UserPlus, MoreHorizontal, Mail, Phone, 
  Key, Edit2, Trash2, ShieldAlert, Plus, MoreVertical, Eye
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import AddHotelUserModal from '../../modals/hotel/AddHotelUserModal';
import CreateHotelRoleModal from '../../modals/hotel/CreateHotelRoleModal';
import RoleDetailView from '../../modals/super/RoleDetailView';
import type { HotelStaffMember as StaffMember } from '@/domain/entities/HotelStaff';
import { useHotelStaff } from '@/application/hooks/useHotelStaff';

type Tab = 'STAFF' | 'ROLES' | 'VIEW_ROLE';

const HotelUsers: React.FC<{ initialTab?: Tab }> = ({ initialTab = 'STAFF' }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { staff: allStaff, roles: allRoles } = useHotelStaff();
  const [selectedRoleForView, setSelectedRoleForView] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredStaff = useMemo(() => {
    return allStaff.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search)
    );
  }, [allStaff, search]);

  const filteredRoles = useMemo(() => {
    return allRoles.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.desc.toLowerCase().includes(search.toLowerCase())
    );
  }, [allRoles, search]);

  const currentDataLength = activeTab === 'STAFF' ? filteredStaff.length : filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(currentDataLength / itemsPerPage));

  const handleViewRole = (role: any) => {
    setSelectedRoleForView(role);
    setActiveTab('VIEW_ROLE');
  };

  const handleRoleCreated = (roleName: string) => {
    const newRole = {
        name: roleName,
        desc: 'Custom property role created via admin entry.',
        userCount: 0,
        color: 'blue',
        status: 'Active'
    };
    handleViewRole(newRole);
  };

  const handlePrimaryAction = () => {
    if (activeTab === 'STAFF') {
      setIsAddModalOpen(true);
    } else {
      setIsRoleModalOpen(true);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, itemsPerPage]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  if (activeTab === 'VIEW_ROLE' && selectedRoleForView) {
    const roleStaff = allStaff.filter(s => s.role === selectedRoleForView.name);
    return (
      <RoleDetailView 
        role={selectedRoleForView} 
        users={roleStaff}
        onBack={() => setActiveTab('ROLES')} 
        type="hotel" 
      />
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-full">
      {/* Header with Integrated Action */}
      <PageHeader
        title="Team Sovereignty"
        subtitle="Staff Access & RBAC Configuration"
      >
        <Button
          variant="custom"
          className="bg-[#f97316] text-white shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 px-8"
          onClick={handlePrimaryAction}
          icon={activeTab === 'STAFF' ? <UserPlus size={20} strokeWidth={3} /> : <Shield size={20} strokeWidth={3} />}
        >
          {activeTab === 'STAFF' ? 'Add Member' : 'Add New Role'}
        </Button>
      </PageHeader>

      {/* Navigation & Search Area */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between pt-2">
        <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 shadow-inner backdrop-blur-md">
            <button 
            onClick={() => setActiveTab('STAFF')}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'STAFF' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
            Staff Registry
            </button>
            <button 
            onClick={() => setActiveTab('ROLES')}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'ROLES' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
            Access Roles
            </button>
        </div>

        <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" />
            <input 
                type="text" 
                placeholder={`Search ${activeTab === 'STAFF' ? 'Staff Identity' : 'Role Type'}...`} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm placeholder:text-gray-500/50"
            />
        </div>
      </div>

      <div className="relative z-10">
        {activeTab === 'STAFF' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
             {paginatedStaff.map((s) => (
               <GlassCard key={s.id} noPadding className="group flex flex-col h-full border-white/10 hover:border-blue-500/30 overflow-hidden min-w-0">
                  <div className="p-6 pb-0 flex justify-between items-start">
                      <div className="relative">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-accent-muted flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/40 dark:border-white/5">
                              <img src={`https://ui-avatars.com/api/?name=${s.name}&background=f97316&color=fff&size=128`} alt={s.name} />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#050505] shadow-sm ${s.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'bg-gray-400'}`} title={s.status}></div>
                      </div>
                      <GlassDropdown 
                          trigger={
                              <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-all">
                                  <MoreHorizontal size={20} />
                              </button>
                          }
                          items={[
                              { icon: Edit2, label: 'Edit Profile', onClick: () => {} },
                              { icon: Key, label: 'Reset Password', onClick: () => {} },
                              { icon: ShieldAlert, label: 'Revoke Access', onClick: () => {}, variant: 'warning', hasSeparatorAfter: true },
                              { icon: Trash2, label: 'Delete Record', onClick: () => {}, variant: 'danger' },
                          ]}
                      />
                  </div>

                  <div className="p-6 space-y-5 flex-1 flex flex-col min-w-0">
                      <div className="min-w-0">
                          <h3 className="text-lg font-black dark:text-white leading-tight mb-1 group-hover:text-accent-strong transition-colors uppercase tracking-tighter truncate w-full" title={s.name}>{s.name}</h3>
                          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{s.id}</p>
                      </div>

                      <div className="flex gap-2 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border truncate max-w-full ${
                              s.role === 'General Manager' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                              s.role === 'Night Auditor' ? 'bg-blue-500/10 text-accent border-accent/20' : 
                              'bg-gray-500/10 text-gray-500 border-gray-500/20'
                          }`}>
                              {s.role}
                          </span>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-4 min-w-0">
                          <div className="space-y-3">
                              <a href={`mailto:${s.email}`} title={s.email} className="flex items-center gap-3 group/link min-w-0">
                                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 group-hover/link:text-accent transition-colors shrink-0">
                                      <Mail size={14} />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-400 group-hover/link:text-accent transition-colors truncate flex-1">{s.email}</span>
                              </a>
                              <a href={`tel:${s.mobile}`} className="flex items-center gap-3 group/link min-w-0">
                                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 group-hover/link:text-accent transition-colors shrink-0">
                                      <Phone size={14} />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-400 group-hover/link:text-accent transition-colors truncate flex-1">{s.mobile}</span>
                              </a>
                          </div>
                      </div>

                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                          <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-black text-gray-500 uppercase">Last Session</span>
                              <span className={`text-[10px] font-bold truncate ${s.lastLogin.includes('ago') ? 'dark:text-gray-300' : 'text-red-500'}`}>{s.lastLogin}</span>
                          </div>
                          <div className="flex flex-col items-end min-w-0">
                              <span className="text-[8px] font-black text-gray-500 uppercase">Registered</span>
                              <span className={`text-[10px] font-bold dark:text-gray-300 truncate`}>{s.dateAdded}</span>
                          </div>
                      </div>
                  </div>
               </GlassCard>
             ))}
            </div>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredStaff.length}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {paginatedRoles.map((roleItem) => (
                 <GlassCard 
                    key={roleItem.name} 
                    noPadding 
                    onClick={() => handleViewRole(roleItem)}
                    className="group border-white/10 hover:border-accent/30 h-full flex flex-col cursor-pointer"
                >
                    <div className="p-8 pb-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${
                            roleItem.color === 'purple' ? 'bg-purple-600/10 text-purple-600' :
                            roleItem.color === 'blue' ? 'bg-accent-strong/10 text-accent-strong' :
                            roleItem.color === 'emerald' ? 'bg-emerald-600/10 text-emerald-600' :
                            'bg-orange-600/10 text-accent-strong'
                        }`}>
                            <Shield size={28} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white tracking-tighter uppercase mb-2 truncate" title={roleItem.name}>{roleItem.name}</h3>
                        <p className="text-xs font-medium text-gray-500 leading-relaxed mb-6 h-12 overflow-hidden">
                            {roleItem.desc}
                        </p>
                    </div>

                    <div className="p-8 pt-0 mt-auto">
                        <div className="flex justify-end">
                            <GlassDropdown 
                                trigger={
                                    <button onClick={(e) => e.stopPropagation()} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white transition-all">
                                        <MoreVertical size={18} />
                                    </button>
                                }
                                items={[
                                    { icon: Eye, label: 'View Details', onClick: () => handleViewRole(roleItem) },
                                    { icon: Edit2, label: 'Edit Identity', onClick: () => {} },
                                    { icon: Trash2, label: 'Delete Role', onClick: () => {}, variant: 'danger' },
                                ]}
                            />
                        </div>
                    </div>
                 </GlassCard>
               ))}
               
               <button 
                 onClick={() => setIsRoleModalOpen(true)}
                 className="group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-black/5 dark:bg-white/[0.01] hover:border-blue-500/50 hover:bg-blue-50/5 transition-all h-full min-h-[300px]"
               >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-accent group-hover:scale-110 transition-all mb-4">
                     <Plus size={32} />
                  </div>
                  <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">New Custom Role</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Define unique rights</p>
               </button>
            </div>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredRoles.length}
            />
          </div>
        )}
      </div>

      {(activeTab === 'STAFF' ? filteredStaff : filteredRoles).length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
              <Users size={64} className="text-gray-500 mb-6" />
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">No Registry Matches</h3>
              <p className="text-sm font-bold text-gray-500 uppercase mt-2">Adjust your filters or try a different search query.</p>
          </div>
      )}

      <AddHotelUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <CreateHotelRoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onCreated={handleRoleCreated} />
    </div>
  );
};

export default HotelUsers;
