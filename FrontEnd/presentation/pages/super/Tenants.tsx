"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  User,
  Smartphone,
  CreditCard,
  LogIn,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  IndianRupee,
  Mail,
  Trash2,
  Download,
  Edit3,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import AddHotelModal from "../../modals/super/AddHotelModal";
import EditHotelModal from "../../modals/super/EditHotelModal";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import SharedStatusBadge, {
  statusToVariant,
} from "../../components/ui/StatusBadge";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useTenants } from "@/application/hooks/useTenants"; // Migrated hook
import { usePlans } from "@/application/hooks/usePlans";
import type { PlanData } from "@/domain/entities/Plan";
import { useUsers } from "@/application/hooks/useUsers"; // To get owner details if needed or we use tenants data

// --- ViewModel Adapter ---
export interface TenantViewModel {
  id: string;
  readableId: string;
  name: string;
  address: string;
  status: string;
  plan: string;
  gstin: string;
  pan: string;
  owner: string;
  mobile: string;
  email: string;
  kiosks: number;
  mrr: number;
  ownerId?: string;
  imageUrls?: string[];
}

const PlanBadge = ({ plan, plans }: { plan: string; plans: PlanData[] }) => {
  const currentPlan = plans.find((p) => p.name === plan);
  const theme = currentPlan?.id.includes("pro")
    ? "purple"
    : currentPlan?.id.includes("ent")
      ? "orange"
      : "blue"; // Approximate theme derived from ID or name if theme missing

  const styles: Record<string, string> = {
    blue: "bg-blue-500/10 text-accent-strong border-accent/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    orange: "bg-accent-muted text-accent-strong border-accent/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    slate: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${styles[theme] || styles.blue}`}
    >
      {plan}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <SharedStatusBadge label={status} variant={statusToVariant(status)} />
);

const HotelCard = React.memo(
  ({
    hotel,
    apiPlans,
    handleEdit,
    handleSuspend,
    handleDelete,
    navigateToHotelDetails,
  }: {
    hotel: TenantViewModel;
    apiPlans: PlanData[];
    handleEdit: (hotel: TenantViewModel) => void;
    handleSuspend: (h: TenantViewModel) => void;
    handleDelete: (id: string) => void;
    navigateToHotelDetails: (id: string) => void;
  }) => {
    const defaultImage =
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60";
    const images =
      hotel.imageUrls && hotel.imageUrls.length > 0
        ? hotel.imageUrls.map((url) => `http://localhost:8080${url}`)
        : [defaultImage];

    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
      if (images.length <= 1) return;
      const interval = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }, [images.length]);

    const goToNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIdx((prev) => (prev + 1) % images.length);
    };

    const goToPrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <GlassCard
        noPadding
        clipContent
        className="group flex flex-col h-full border-white/10 hover:border-accent/30 overflow-hidden shadow-2xl max-w-full"
      >
        {/* UNIFIED CONTAINER: Full-Bleed Image Header */}
        <div className="aspect-[16/9] w-full bg-black/40 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-700 z-0">
            <Building2
              size={120}
              className="text-white group-hover:scale-110 transition-transform duration-1000"
            />
          </div>

          {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                idx === currentIdx ? "opacity-40" : "opacity-0"
              } ${
                hotel.status === "Suspended"
                  ? "grayscale opacity-20 z-0"
                  : "grayscale group-hover:grayscale-0 group-hover:scale-105 z-0"
              }`}
              style={{ backgroundImage: `url('${img}')` }}
            ></div>
          ))}

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-black/40 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-black/40 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute top-5 left-5 z-20 flex gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentIdx ? "bg-white scale-125" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-5 right-5 z-20">
            <PlanBadge plan={hotel.plan} plans={apiPlans} />
          </div>

          <div className="absolute bottom-5 left-6 right-6 z-20">
            <div className="space-y-2 md:space-y-3">
              <StatusBadge status={hotel.status} />
              <h3 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight group-hover:text-accent transition-colors line-clamp-1">
                {hotel.name}
              </h3>
            </div>
          </div>
        </div>

        {/* UNIFIED CONTAINER: Flush Content Area (0px margin to image) */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6 md:space-y-8 bg-black/5 dark:bg-white/[0.01]">
          <div className="space-y-4 md:space-y-6">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address + ", " + hotel.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-500 hover:text-accent transition-all group/loc w-full"
            >
              <MapPin size={16} className="shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] truncate border-b border-transparent group-hover/loc:border-current flex-1">
                {hotel.address}
              </span>
            </a>

            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-white/5">
              <div className="space-y-2 md:space-y-3 drop-shadow-sm overflow-hidden text-ellipsis whitespace-nowrap min-w-0 pr-2">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Manager
                </p>
                <div className="space-y-1.5 md:space-y-2">
                  <p
                    className="text-xs md:text-sm font-bold dark:text-gray-200 truncate"
                    title={hotel.owner}
                  >
                    {hotel.owner}
                  </p>
                  <div className="flex items-center gap-2 md:gap-4">
                    <a
                      href={`tel:${hotel.mobile}`}
                      title="Call"
                      className="p-1.5 md:p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-accent-muted hover:text-accent transition-all"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={`mailto:${hotel.email}`}
                      title="Email"
                      className="p-1.5 md:p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-accent-muted hover:text-accent transition-all"
                    >
                      <Mail size={14} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="text-right overflow-hidden text-ellipsis whitespace-nowrap min-w-0 pl-2 border-l border-white/5">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  Tax ID
                </p>
                <p
                  className="text-[10px] md:text-[11px] font-mono font-bold dark:text-gray-400 uppercase tracking-tighter bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-white/5 inline-block truncate max-w-full"
                  title={hotel.gstin}
                >
                  {hotel.gstin}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 md:pt-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-0 md:mb-8 gap-2 md:gap-4">
              <div className="flex gap-4 md:gap-8 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Kiosks
                  </span>
                  <span className="text-base md:text-xl font-black dark:text-white flex items-center gap-1 md:gap-2 mt-1">
                    <Smartphone size={14} className="text-accent" />{" "}
                    {hotel.kiosks}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    MRR
                  </span>
                  <span className="text-base md:text-xl font-black text-emerald-500 flex items-center gap-0.5 md:gap-1 mt-1">
                    <IndianRupee size={14} />{" "}
                    {(hotel.mrr || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <GlassDropdown
                trigger={
                  <button className="p-2 md:p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all shrink-0">
                    <MoreHorizontal size={20} />
                  </button>
                }
                items={[
                  {
                    icon: Edit3,
                    label: "Edit Hotel Details",
                    onClick: () => handleEdit(hotel),
                  },
                  {
                    icon: ExternalLink,
                    label: "View Profile",
                    onClick: () => navigateToHotelDetails(hotel.id),
                  },
                  {
                    icon: ShieldAlert,
                    label:
                      hotel.status === "Suspended"
                        ? "Activate Account"
                        : "Suspend Account",
                    onClick: () => handleSuspend(hotel),
                    variant: "warning",
                  },
                  {
                    icon: Trash2,
                    label: "Delete Registry",
                    onClick: () => handleDelete(hotel.id),
                    variant: "danger",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    );
  },
);
HotelCard.displayName = "HotelCard";

const Tenants: React.FC = () => {
  const {
    tenants: apiTenants,
    updateTenant,
    deleteTenant,
    createTenant,
    fetchTenants,
    uploadImages,
  } = useTenants();
  const { plans: apiPlans, fetchPlans } = usePlans();
  const { users: apiUsers, fetchUsers } = useUsers(); // Fetch users to map owner details

  // Refresh data
  useEffect(() => {
    fetchTenants();
    fetchPlans();
    fetchUsers();
  }, [fetchTenants, fetchPlans, fetchUsers]);

  // Adapt to ViewModel
  const allHotels: TenantViewModel[] = useMemo(() => {
    return apiTenants.map((t) => {
      const plan = apiPlans.find((p) => p.id === t.planId);
      const ownerUser = apiUsers.find((u) => u.id === t.ownerId);

      return {
        id: t.id,
        readableId: t.readableId || t.id.split("-")[0],
        name: t.name,
        address: t.address || "Startups Tower, Bangalore",
        status: t.status || "Active",
        plan: t.planName || (plan ? plan.name : "Standard"),
        gstin: t.gstin || "N/A",
        pan: t.pan || "N/A",
        owner: t.ownerName || (ownerUser ? ownerUser.name : "Unknown Manager"),
        mobile: ownerUser
          ? ownerUser.mobile || ownerUser.phone || "N/A"
          : "N/A",
        email: ownerUser ? ownerUser.email : "N/A",
        kiosks: 2, // Mocked
        mrr: plan ? plan.price : 0,
        ownerId: t.ownerId,
        imageUrls: t.imageUrls || [],
      };
    });
  }, [apiTenants, apiPlans, apiUsers]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditHotel, setSelectedEditHotel] =
    useState<TenantViewModel | null>(null);

  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("All Plans");

  const handleEdit = useCallback((hotel: TenantViewModel) => {
    setSelectedEditHotel(hotel);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateTenant = useCallback(
    async (id: string, data: any) => {
      await updateTenant(id, data);
      fetchTenants();
    },
    [updateTenant, fetchTenants],
  );

  const [filterStatus, setFilterStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning" | "primary";
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  const openConfirm = useCallback(
    (config: Omit<typeof modalConfig, "isOpen">) => {
      setModalConfig({ ...config, isOpen: true });
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleSuspend = useCallback(
    (hotel: TenantViewModel) => {
      const isSuspended = hotel.status === "Suspended";
      openConfirm({
        title: isSuspended ? "Activate Hotel" : "Suspend Hotel",
        message: isSuspended
          ? `Are you sure you want to activate ${hotel.name}?`
          : `Are you sure you want to suspend ${hotel.name}? This will suspend the account and all associated services.`,
        variant: "warning",
        confirmLabel: isSuspended ? "Activate" : "Suspend",
        onConfirm: async () => {
          const newStatus = isSuspended ? "Active" : "Suspended";
          await updateTenant(hotel.id, { status: newStatus } as any);
          fetchTenants();
        },
      });
    },
    [openConfirm, updateTenant, fetchTenants],
  );

  const handleDelete = useCallback(
    (id: string) => {
      openConfirm({
        title: "Delete Hotel",
        message:
          "Are you sure you want to delete this hotel? This action cannot be undone.",
        variant: "danger",
        confirmLabel: "Delete Forever",
        onConfirm: async () => {
          await deleteTenant(id);
          fetchTenants();
        },
      });
    },
    [openConfirm, deleteTenant, fetchTenants],
  );

  // Helper for status filtering
  const filteredHotels = useMemo(() => {
    return allHotels.filter((hotel) => {
      const searchStr = search.toLowerCase();
      const matchesSearch =
        hotel.name.toLowerCase().includes(searchStr) ||
        hotel.gstin.toLowerCase().includes(searchStr) ||
        hotel.owner.toLowerCase().includes(searchStr) ||
        hotel.mobile.includes(search);

      const matchesPlan =
        filterPlan === "All Plans" || hotel.plan === filterPlan;
      const matchesStatus =
        filterStatus === "All Status" || hotel.status === filterStatus;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [allHotels, search, filterPlan, filterStatus]);

  const handleExport = useCallback(() => {
    if (filteredHotels.length === 0) return;

    const headers = [
      "ID",
      "Name",
      "Address",
      "Status",
      "Plan",
      "GSTIN",
      "Manager",
      "Mobile",
      "Email",
      "Kiosks",
      "MRR",
    ];

    const rows = filteredHotels.map((h) => [
      h.id,
      `"${h.name}"`,
      `"${h.address}"`,
      h.status,
      h.plan,
      h.gstin,
      `"${h.owner}"`,
      h.mobile,
      h.email,
      h.kiosks.toString(),
      h.mrr.toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `hotels_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredHotels]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPlan, filterStatus, itemsPerPage]);

  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHotels.slice(start, start + itemsPerPage);
  }, [filteredHotels, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  const navigateToHotelDetails = (hotelId: string) => {
    // Navigation placeholder
    window.location.href = `/super/tenants/${hotelId}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Page Header */}
      <PageHeader
        title="Hotels Registry"
        subtitle={`Core Hotel Ecosystem • ${filteredHotels.length} Accounts`}
      >
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="secondary"
            onClick={handleExport}
            icon={<Download size={20} strokeWidth={3} />}
          >
            Export CSV
          </Button>
          <Button
            size="lg"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={20} strokeWidth={3} />}
          >
            Onboard Hotel
          </Button>
        </div>
      </PageHeader>

      {/* Control Bar */}
      <div className="relative z-30">
        <GlassCard
          className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl border-white/10"
          noPadding
        >
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
                    <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">
                      {filterPlan}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                }
                items={[
                  {
                    label: "All Plans",
                    onClick: () => setFilterPlan("All Plans"),
                    variant: (filterPlan === "All Plans"
                      ? "selected"
                      : "default") as any,
                  },
                  ...apiPlans.map((p) => ({
                    label: p.name,
                    onClick: () => setFilterPlan(p.name),
                    variant: (filterPlan === p.name
                      ? "selected"
                      : "default") as any,
                  })),
                ]}
              />

              <GlassDropdown
                trigger={
                  <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                    <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">
                      {filterStatus}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                }
                items={[
                  {
                    label: "All Status",
                    onClick: () => setFilterStatus("All Status"),
                    variant:
                      filterStatus === "All Status" ? "selected" : "default",
                  },
                  {
                    label: "Active",
                    onClick: () => setFilterStatus("Active"),
                    variant: filterStatus === "Active" ? "selected" : "default",
                  },
                  {
                    label: "Past Due",
                    onClick: () => setFilterStatus("Past Due"),
                    variant:
                      filterStatus === "Past Due" ? "selected" : "default",
                  },
                  {
                    label: "Suspended",
                    onClick: () => setFilterStatus("Suspended"),
                    variant:
                      filterStatus === "Suspended" ? "selected" : "default",
                  },
                  {
                    label: "Onboarding",
                    onClick: () => setFilterStatus("Onboarding"),
                    variant:
                      filterStatus === "Onboarding" ? "selected" : "default",
                  },
                ]}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Registry View Area */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {paginatedHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              apiPlans={apiPlans}
              handleEdit={handleEdit}
              handleSuspend={handleSuspend}
              handleDelete={handleDelete}
              navigateToHotelDetails={navigateToHotelDetails}
            />
          ))}
        </div>
      </div>

      <AddHotelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreateHotel={createTenant}
        onUploadImages={uploadImages}
      />

      {selectedEditHotel && (
        <EditHotelModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          hotel={selectedEditHotel}
          onUpdateHotel={handleUpdateTenant}
        />
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredHotels.length}
      />
    </div>
  );
};

export default Tenants;
