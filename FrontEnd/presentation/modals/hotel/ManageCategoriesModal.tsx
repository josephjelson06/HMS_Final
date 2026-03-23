import React, { useEffect, useMemo, useState } from "react";
import { BedDouble, ListTree, Plus, Save, Trash2, Upload } from "lucide-react";

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
  onUpdate: (
    categoryId: string,
    payload: { name?: string; description?: string | null; display_order?: number }
  ) => Promise<void>;
  onUploadImages: (categoryId: string, files: File[]) => Promise<void>;
  onDeleteImage: (categoryId: string, imageUrl: string) => Promise<void>;
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
  onUpdate,
  onUploadImages,
  onDeleteImage,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingImageKey, setDeletingImageKey] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<
    Record<string, { name: string; description: string; displayOrder: string }>
  >({});

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

  useEffect(() => {
    const next: Record<string, { name: string; description: string; displayOrder: string }> = {};
    sortedCategories.forEach((category) => {
      next[category.id] = {
        name: category.name,
        description: category.description ?? "",
        displayOrder: String(category.displayOrder ?? 0),
      };
    });
    setEditingState(next);
  }, [sortedCategories]);

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

  const handleSave = async (categoryId: string) => {
    const edit = editingState[categoryId];
    if (!edit) return;
    setError(null);
    setSavingId(categoryId);
    try {
      await onUpdate(categoryId, {
        name: edit.name.trim(),
        description: edit.description.trim() || null,
        display_order: Number(edit.displayOrder || "0"),
      });
    } catch (err: any) {
      setError(err?.message || "Failed to update category");
    } finally {
      setSavingId(null);
    }
  };

  const handleSelectImages = async (
    category: RoomCategoryData,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length === 0) return;

    const remaining = Math.max(0, 3 - (category.imageUrls?.length ?? 0));
    if (remaining <= 0) {
      setError("Maximum 3 images are allowed per category.");
      return;
    }
    const files = selected.slice(0, remaining);
    setError(null);
    setUploadingId(category.id);
    try {
      await onUploadImages(category.id, files);
    } catch (err: any) {
      setError(err?.message || "Failed to upload category images");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteImage = async (categoryId: string, imageUrl: string) => {
    const key = `${categoryId}::${imageUrl}`;
    setError(null);
    setDeletingImageKey(key);
    try {
      await onDeleteImage(categoryId, imageUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to delete category image");
    } finally {
      setDeletingImageKey(null);
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
                  className="rounded-xl border border-white/10 bg-white/30 dark:bg-black/20 px-4 py-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editingState[category.id]?.name ?? ""}
                      onChange={(e) =>
                        setEditingState((prev) => ({
                          ...prev,
                          [category.id]: {
                            ...(prev[category.id] || {
                              name: category.name,
                              description: category.description ?? "",
                              displayOrder: String(category.displayOrder ?? 0),
                            }),
                            name: e.target.value,
                          },
                        }))
                      }
                      className={inputClass}
                      placeholder="Category name"
                    />
                    <input
                      type="text"
                      value={editingState[category.id]?.description ?? ""}
                      onChange={(e) =>
                        setEditingState((prev) => ({
                          ...prev,
                          [category.id]: {
                            ...(prev[category.id] || {
                              name: category.name,
                              description: category.description ?? "",
                              displayOrder: String(category.displayOrder ?? 0),
                            }),
                            description: e.target.value,
                          },
                        }))
                      }
                      className={inputClass}
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      min={0}
                      value={editingState[category.id]?.displayOrder ?? "0"}
                      onChange={(e) =>
                        setEditingState((prev) => ({
                          ...prev,
                          [category.id]: {
                            ...(prev[category.id] || {
                              name: category.name,
                              description: category.description ?? "",
                              displayOrder: String(category.displayOrder ?? 0),
                            }),
                            displayOrder: e.target.value,
                          },
                        }))
                      }
                      className={inputClass}
                      placeholder="Display order"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                      Category Images (max 3)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(category.imageUrls || []).map((imageUrl) => {
                        const imageKey = `${category.id}::${imageUrl}`;
                        const imageDeleting = deletingImageKey === imageKey;
                        return (
                          <div
                            key={imageUrl}
                            className="relative rounded-xl overflow-hidden border border-white/10"
                          >
                            <img
                              src={imageUrl}
                              alt={`${category.name} category`}
                              className="h-24 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-60"
                              onClick={() => handleDeleteImage(category.id, imageUrl)}
                              disabled={imageDeleting}
                              title="Delete image"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        );
                      })}
                      {(category.imageUrls || []).length < 3 && (
                        <label className="h-24 rounded-xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent/50 transition-all text-[10px] font-semibold uppercase tracking-wider">
                          <Upload size={14} />
                          {uploadingId === category.id ? "Uploading..." : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) => handleSelectImages(category, event)}
                            disabled={uploadingId === category.id}
                          />
                        </label>
                      )}
                      {(category.imageUrls || []).length === 0 && (
                        <div className="h-24 rounded-xl border border-dashed border-white/20 bg-gradient-to-br from-slate-700/30 via-slate-500/20 to-slate-400/10 text-gray-400 flex items-center justify-center">
                          <BedDouble size={20} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Save size={12} />}
                      onClick={() => handleSave(category.id)}
                      disabled={savingId === category.id}
                    >
                      {savingId === category.id ? "Saving..." : "Save"}
                    </Button>
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
