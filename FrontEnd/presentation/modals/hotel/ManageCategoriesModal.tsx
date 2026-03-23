import React, { useEffect, useMemo, useState } from "react";
import { ListTree, Plus, Trash2 } from "lucide-react";

import Button from "../../components/ui/Button";
import ModalShell from "../../components/ui/ModalShell";
import type { RoomCategoryData } from "@/application/hooks/useRoomCategories";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: RoomCategoryData[];
  loading?: boolean;
  onCreate: (payload: {
    name: string;
    description?: string | null;
    display_order?: number;
  }) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  loading = false,
  onCreate,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName("");
    setDescription("");
    setDisplayOrder("0");
    setError(null);
    setSaving(false);
    setDeletingId(null);
  }, [isOpen]);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return a.name.localeCompare(b.name);
      }),
    [categories]
  );

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || null,
        display_order: Number(displayOrder || "0"),
      });
      setName("");
      setDescription("");
      setDisplayOrder("0");
    } catch (err: any) {
      setError(err?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setError(null);
    setDeletingId(categoryId);
    try {
      await onDelete(categoryId);
    } catch (err: any) {
      setError(err?.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      headerContent={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg">
            <ListTree size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
              Manage Room Categories
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Group room types for admin organization
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-6">
        <form onSubmit={submitCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min={0}
              placeholder="Display order"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="action"
              type="submit"
              icon={<Plus size={14} />}
              disabled={saving}
            >
              {saving ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-black/5 dark:bg-white/[0.02] p-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : sortedCategories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories created yet.</p>
          ) : (
            <div className="space-y-2">
              {sortedCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/30 dark:bg-black/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {category.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {category.description || "No description"}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Order: {category.displayOrder}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={12} />}
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                  >
                    {deletingId === category.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    </ModalShell>
  );
};

export default ManageCategoriesModal;
