import React, { useState, useMemo } from 'react';
import { 
  Users, Shield, Search, UserPlus, MoreHorizontal, Mail, Phone, 
  ChevronDown, ChevronRight, Lock, Edit2, Trash2, 
  Plus, MoreVertical, KeyRound, ShieldAlert, ShieldCheck, Eye, ArrowLeft
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassDropdown from '../../components/ui/GlassDropdown';
import AddUserModal from '../../modals/super/AddUserModal';
import EditUserModal from '../../modals/super/EditUserModal';
import CreateRoleModal from '../../modals/super/CreateRoleModal';
import RoleDetailView from '../../modals/super/RoleDetailView';
import { useTheme } from '../../hooks/useTheme';
import { User, Role, INITIAL_USERS, INITIAL_ROLES } from '../../data/users';

type Tab = 'USERS' | 'ROLES' | 'VIEW_ROLE';

const UsersManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('USERS');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleForView, setSelectedRoleForView] = useState<Role | null>(null);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const filteredRoles = useMemo(() => {
    return roles.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, roles]);

  const handleViewRole = (role: Role) => {
    setSelectedRoleForView(role);
    setActiveTab('VIEW_ROLE');
  };

  const handleRoleCreated = (roleName: string) => {
    const newRole: Role = {
      name: roleName,
      desc: 'No description provided.',
      color: 'blue',
      userCount: 0,
      status: 'Active'
    };
    setRoles(prev => [...prev, newRole]);
    handleViewRole(newRole);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
    ));
  };

  const handleToggleRoleStatus = (roleName: string) => {
    setRoles(prev => prev.map(r => 
      r.name === roleName ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r
    ));
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this identity permanently?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleRemoveRole = (roleName: string) => {
    if (window.confirm(`Are you sure you want to delete the ${roleName} role? This might affect assigned users.`)) {
      setRoles(prev => prev.filter(r => r.name !== roleName));
    }
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsEditUserOpen(false);
    setUserToEdit(null);
  };

  if (activeTab === 'VIEW_ROLE' && selectedRoleForView) {
    const roleUsers = users.filter(u => u.role === selectedRoleForView.name);
    return (
      <RoleDetailView 
        role={selectedRoleForView} 
        users={roleUsers}
        onBack={() => setActiveTab('ROLES')} 
        type="super"
      />
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Access Control</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">Team Governance • Platform Security</p>
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'USERS' ? (
            <button 
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <UserPlus size={18} strokeWidth={3} />
              Add New Member
            </button>
          ) : (
            <button 
              onClick={() => setIsCreateRoleOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              Add New Role
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 w-fit">
            <button 
                onClick={() => setActiveTab('USERS')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'USERS' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                Users Registry
            </button>
            <button 
                onClick={() => setActiveTab('ROLES')}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ROLES' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                System Roles
            </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder={`Search ${activeTab === 'USERS' ? 'Team Member' : 'Role'}...`} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/40 dark:bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all backdrop-blur-md shadow-sm"
                />
            </div>
        </div>
      </div>

      {activeTab === 'USERS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {filteredUsers.map((user) => (
             <GlassCard key={user.id} noPadding className="group flex flex-col h-full border-white/10 hover:border-blue-500/30">
                <div className="p-6 pb-0 flex justify-between items-start">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/40 dark:border-white/5">
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&size=128`} alt={user.name} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#050505] shadow-sm ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <GlassDropdown 
                        trigger={
                            <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-all">
                                <MoreHorizontal size={20} />
                            </button>
                        }
                        items={[
                            { icon: Edit2, label: 'Edit Member', onClick: () => openEditModal(user) },
                            { 
                              icon: ShieldAlert, 
                              label: user.status === 'Active' ? 'Deactivate' : 'Activate', 
                              onClick: () => handleToggleUserStatus(user.id), 
                              variant: user.status === 'Active' ? 'warning' : 'primary', 
                              hasSeparatorAfter: true 
                            },
                            { icon: Trash2, label: 'Remove Identity', onClick: () => handleRemoveUser(user.id), variant: 'danger' },
                        ]}
                    />
                </div>

                <div className="p-6 space-y-5 flex-1 flex flex-col">
                    <div>
                        <h3 className={`text-lg font-black leading-none mb-1 uppercase tracking-tighter transition-colors ${user.status === 'Inactive' ? 'text-gray-400 dark:text-gray-600' : 'dark:text-white'}`}>{user.name}</h3>
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{user.id}</p>
                    </div>

                    <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                            user.status === 'Inactive' ? 'bg-gray-500/5 text-gray-500 border-gray-500/10 grayscale' :
                            user.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                            user.role === 'Finance' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                            {user.role}
                        </span>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center gap-4">
                            <a href={user.status === 'Active' ? `mailto:${user.email}` : undefined} title="Email Work" className={`flex items-center gap-2 group/link ${user.status === 'Inactive' ? 'cursor-default' : ''}`}>
                                <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 transition-colors ${user.status === 'Active' ? 'group-hover/link:text-blue-500' : ''}`}>
                                    <Mail size={14} />
                                </div>
                                <span className={`text-[10px] font-bold text-gray-400 truncate max-w-[120px] transition-colors ${user.status === 'Active' ? 'group-hover/link:text-blue-500' : 'text-gray-500'}`}>{user.email}</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href={user.status === 'Active' ? `tel:${user.mobile}` : undefined} title="Call Mobile" className={`flex items-center gap-2 group/link ${user.status === 'Inactive' ? 'cursor-default' : ''}`}>
                                <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 transition-colors ${user.status === 'Active' ? 'group-hover/link:text-blue-500' : ''}`}>
                                    <Phone size={14} />
                                </div>
                                <span className={`text-[10px] font-bold text-gray-400 transition-colors ${user.status === 'Active' ? 'group-hover/link:text-blue-500' : 'text-gray-500'}`}>{user.mobile}</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-500 uppercase">Last Session</span>
                            <span className={`text-[10px] font-bold transition-colors ${user.status === 'Inactive' ? 'text-gray-500' : 'dark:text-gray-300'}`}>{user.lastLogin}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-gray-500 uppercase">Joined</span>
                            <span className={`text-[10px] font-bold transition-colors ${user.status === 'Inactive' ? 'text-gray-500' : 'dark:text-gray-300'}`}>{user.dateAdded}</span>
                        </div>
                    </div>
                </div>
             </GlassCard>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {filteredRoles.map((role) => {
             const isInactive = role.status === 'Inactive';
             return (
               <GlassCard 
                 key={role.name} 
                 noPadding 
                 onClick={() => handleViewRole(role)}
                 className={`group border-white/10 hover:border-blue-500/30 h-full flex flex-col relative transition-all duration-300 cursor-pointer ${isInactive ? 'grayscale opacity-60' : ''}`}
               >
                  {isInactive && (
                    <div className="absolute top-4 right-10 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest z-10">
                      Deactivated
                    </div>
                  )}
                  
                  <div className="p-10 pb-0 text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl transition-all ${
                          isInactive ? 'bg-gray-500/10 text-gray-500' :
                          'bg-blue-600/10 text-blue-600'
                      }`}>
                          <Shield size={32} />
                      </div>
                      <h3 className={`text-xl font-black tracking-tighter uppercase mb-2 truncate transition-colors ${isInactive ? 'text-gray-400 dark:text-zinc-600' : 'dark:text-white'}`} title={role.name}>{role.name}</h3>
                      <p className={`text-sm font-medium leading-relaxed mb-10 h-16 overflow-hidden transition-colors ${isInactive ? 'text-gray-400 dark:text-zinc-700' : 'text-gray-500'}`}>
                          {role.desc}
                      </p>
                  </div>

                  <div className="p-10 pt-0 mt-auto">
                      <div className="flex items-center justify-end">
                          <GlassDropdown 
                              trigger={
                                  <button onClick={(e) => e.stopPropagation()} className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-500 transition-all shadow-sm ${!isInactive ? 'hover:text-white hover:bg-blue-600 dark:hover:bg-orange-500' : ''}`}>
                                      <MoreVertical size={20} />
                                  </button>
                              }
                              items={[
                                  { icon: Eye, label: 'View Details', onClick: () => handleViewRole(role) },
                                  { icon: Edit2, label: 'Edit Role Name', onClick: () => {} },
                                  { 
                                    icon: isInactive ? ShieldCheck : ShieldAlert, 
                                    label: isInactive ? 'Activate Role' : 'Deactivate Role', 
                                    onClick: () => handleToggleRoleStatus(role.name),
                                    variant: isInactive ? 'primary' : 'warning',
                                    hasSeparatorAfter: true
                                  },
                                  { icon: Trash2, label: 'Delete Role', onClick: () => handleRemoveRole(role.name), variant: 'danger' },
                              ]}
                          />
                      </div>
                  </div>
               </GlassCard>
             );
           })}
        </div>
      )}

      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />
      {userToEdit && (
        <EditUserModal 
          isOpen={isEditUserOpen} 
          user={userToEdit} 
          onClose={() => setIsEditUserOpen(false)} 
          onUpdate={handleUpdateUser}
        />
      )}
      <CreateRoleModal isOpen={isCreateRoleOpen} onClose={() => setIsCreateRoleOpen(false)} onCreated={handleRoleCreated} />
    </div>
  );
};

export default UsersManagement;