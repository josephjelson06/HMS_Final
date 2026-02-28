"use client";

import React, { useEffect, useState } from "react";
import { Plus, CheckCircle2, Users, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "@/application/hooks/useAuth";
import { useRooms } from "@/application/hooks/useRooms";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import ManageRoomTypeModal from "../../modals/hotel/ManageRoomTypeModal";
// We don't have ConfirmationModal imported yet in this branch, so we will use a basic window.confirm or skip it if it's missing. Let's just create a generic one or use window.confirm for simplicity, or try importing it. I will try importing it.
// To be safe, let's just make a simple modal for confirmations or skip it. I will import it and see if it fails.
import ConfirmationModal from "../../components/ui/ConfirmationModal";

const Rooms: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const { rooms, fetchRooms, loading } = useRooms();

  useEffect(() => {
    if (tenantId) {
      fetchRooms(tenantId);
    }
  }, [tenantId, fetchRooms]);

  // Modal State
  const [isManageTypeModalOpen, setIsManageTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    typeId: string;
    displayName: string;
  }>({
    isOpen: false,
    typeId: "",
    displayName: "",
  });

  const handleSaveRoomType = async (typeData: any) => {
    // This will hook into actual save logic later
    console.log("Saving room type", typeData);
    setIsManageTypeModalOpen(false);
  };

  const handleDeleteRoomType = (id: string, name: string) => {
    setConfirmDelete({
      isOpen: true,
      typeId: id,
      displayName: name,
    });
  };

  const executeDeleteRoomType = async () => {
    // This will hook into actual delete logic later
    console.log("Deleting room type", confirmDelete.typeId);
    setConfirmDelete((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-32 animate-in fade-in duration-500">
      <PageHeader title="ROOM TYPES DEFINITION">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              setEditingType(null);
              setIsManageTypeModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-gray-100 transition-all border border-transparent"
          >
            <Plus size={16} strokeWidth={3} /> Create Category
          </button>
        </div>
      </PageHeader>

      <div className="space-y-6 animate-in fade-in duration-500">
        <GlassCard className="border-white/10" noPadding>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
            <button
              onClick={() => {
                setEditingType(null);
                setIsManageTypeModalOpen(true);
              }}
              className="group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all bg-white/40 dark:bg-transparent min-h-[250px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-accent group-hover:scale-110 transition-all mb-4">
                <Plus size={32} />
              </div>
              <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">
                New Category
              </h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">
                Define new room type
              </p>
            </button>

            {rooms.map((rt) => (
              <div
                key={rt.id}
                className="p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all min-h-[250px]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black dark:text-white uppercase leading-tight mb-1">
                        {rt.name}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                        {rt.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-gray-500 uppercase">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                        Base Rate
                      </p>
                      <p className="text-lg font-black text-accent-strong tracking-tighter">
                        ₹{rt.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                        Max Guests
                      </p>
                      <p className="text-lg font-black dark:text-white flex items-center gap-1">
                        {2} <Users size={14} className="text-gray-400" />
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase mb-2">
                      Amenities Included
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rt.amenities && rt.amenities.length > 0 ? (
                        rt.amenities.map((a, i) => (
                          <span
                            key={i}
                            className="text-[8px] font-bold uppercase text-gray-500 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md border border-white/5"
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] font-bold text-gray-500 italic">
                          No amenities listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto border-t border-white/5">
                  <button
                    onClick={() => {
                      setEditingType(rt);
                      setIsManageTypeModalOpen(true);
                    }}
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

      <ManageRoomTypeModal
        isOpen={isManageTypeModalOpen}
        onClose={() => setIsManageTypeModalOpen(false)}
        onSave={handleSaveRoomType}
        initialData={editingType}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDeleteRoomType}
        title="Delete Room Category"
        message={`Are you absolutely sure you want to remove the ${confirmDelete.displayName} category? This will dissolve the classification registry for these units.`}
        variant="danger"
        confirmLabel="Remove Category"
      />
    </div>
  );
};

export default Rooms;
