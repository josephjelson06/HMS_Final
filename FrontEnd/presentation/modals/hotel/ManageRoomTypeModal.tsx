import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  BedDouble,
  IndianRupee,
  Users,
  Tag,
  Plus,
  X,
  ImagePlus,
} from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";
import type { RoomImageData } from "@/application/hooks/useRooms";

interface ExistingRoomImageFormData extends RoomImageData {}

interface NewRoomImageFormData {
  file: File;
  previewUrl: string;
  caption: string;
  tags: string[];
  category: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface RoomTypeFormData {
  id?: string;
  name: string;
  code: string;
  rate: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  existingImages: ExistingRoomImageFormData[];
  newImages: NewRoomImageFormData[];
}

interface ManageRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (typeData: RoomTypeFormData) => Promise<void>;
  onDeleteExistingImage?: (image: ExistingRoomImageFormData) => Promise<void>;
  initialData?: any;
}

const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const ManageRoomTypeModal: React.FC<ManageRoomTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteExistingImage,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rate, setRate] = useState("");
  const [maxAdults, setMaxAdults] = useState("");
  const [maxChildren, setMaxChildren] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [newImages, setNewImages] = useState<NewRoomImageFormData[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingRoomImageFormData[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCode(initialData.code || "");
        setRate(initialData.rate || initialData.price); // Handle both old and new data structures
        setMaxAdults(
          String(initialData.maxAdults ?? initialData.max_adults ?? 2)
        );
        setMaxChildren(
          String(
            initialData.maxChildren ??
              initialData.max_children ??
              initialData.max_childeren ??
              0
          )
        );
        setAmenities(initialData.amenities || []);
        setExistingImages(
          (initialData.images || []).map((image: RoomImageData, index: number) => ({
            ...image,
            displayOrder: image.displayOrder ?? index,
            caption: image.caption ?? "",
            tags: Array.isArray(image.tags) ? image.tags : [],
            category: image.category ?? "",
            isPrimary: Boolean(image.isPrimary),
          }))
        );
      } else {
        setName("");
        setCode("");
        setRate("");
        setMaxAdults("2");
        setMaxChildren("0");
        setAmenities(["WiFi", "TV"]);
        setExistingImages([]);
      }
      setSubmitError(null);
      setNewImages((prev) => {
        prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return [];
      });
    }
  }, [isOpen, initialData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);
    try {
      const normalizedExistingImages = [...existingImages]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image, index) => ({
          ...image,
          displayOrder: index,
        }));
      const normalizedNewImages = [...newImages]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image, index) => ({
          ...image,
          displayOrder: normalizedExistingImages.length + index,
        }));

       await onSave({
         id: initialData?.id || Math.random().toString(36).substring(2, 9),
         name,
         code: code.trim().toUpperCase(),
         rate: Number(rate),
         maxAdults: Number(maxAdults),
         maxChildren: Number(maxChildren),
         amenities,
         existingImages: normalizedExistingImages,
         newImages: normalizedNewImages,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save room type");
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (idx: number) => {
    setAmenities(amenities.filter((_, i) => i !== idx));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) {
      return;
    }

    if (existingImages.length + newImages.length + selected.length > 5) {
      setSubmitError("Maximum 5 images are allowed.");
      e.target.value = "";
      return;
    }

    setNewImages((prev) => [
      ...prev,
      ...selected.map((file, index) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
        tags: [],
        category: "",
        isPrimary: existingImages.length === 0 && prev.length + index === 0,
        displayOrder: existingImages.length + prev.length + index,
      })),
    ]);
    e.target.value = "";
  };

  const handleDeleteExistingImage = async (image: ExistingRoomImageFormData) => {
    if (!onDeleteExistingImage) {
      return;
    }
    setSubmitError(null);
    setDeletingImageId(image.id);
    try {
      await onDeleteExistingImage(image);
      setExistingImages((prev) => prev.filter((item) => item.id !== image.id));
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to delete image");
    } finally {
      setDeletingImageId(null);
    }
  };

  const updateExistingImage = (
    imageId: string,
    key: keyof ExistingRoomImageFormData,
    value: string | boolean | string[] | number
  ) => {
    setExistingImages((prev) =>
      prev.map((image) => {
        if (image.id !== imageId) {
          return key === "isPrimary" && value === true ? { ...image, isPrimary: false } : image;
        }
        return {
          ...image,
          [key]: value,
          ...(key === "isPrimary" && value === true ? { isPrimary: true } : {}),
        };
      })
    );
    if (key === "isPrimary" && value === true) {
      setNewImages((prev) => prev.map((image) => ({ ...image, isPrimary: false })));
    }
  };

  const updateNewImage = (
    previewUrl: string,
    key: keyof NewRoomImageFormData,
    value: string | boolean | string[] | number
  ) => {
    setNewImages((prev) =>
      prev.map((image) => {
        if (image.previewUrl !== previewUrl) {
          return key === "isPrimary" && value === true ? { ...image, isPrimary: false } : image;
        }
        return {
          ...image,
          [key]: value,
          ...(key === "isPrimary" && value === true ? { isPrimary: true } : {}),
        };
      })
    );
    if (key === "isPrimary" && value === true) {
      setExistingImages((prev) => prev.map((image) => ({ ...image, isPrimary: false })));
    }
  };

  const removeNewImage = (previewUrl: string) => {
    setNewImages((prev) => {
      const target = prev.find((image) => image.previewUrl === previewUrl);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((image) => image.previewUrl !== previewUrl);
    });
  };


  const renderImageEditor = (
    image: ExistingRoomImageFormData | NewRoomImageFormData,
    source: "existing" | "new"
  ) => {
    const identifier =
      source === "existing"
        ? (image as ExistingRoomImageFormData).id
        : (image as NewRoomImageFormData).previewUrl;
    const imageUrl =
      source === "existing"
        ? (image as ExistingRoomImageFormData).url
        : (image as NewRoomImageFormData).previewUrl;
    const handleUpdate =
      source === "existing"
        ? updateExistingImage
        : updateNewImage;

    return (
      <div key={identifier} className="rounded-2xl border border-white/10 bg-black/5 dark:bg-white/[0.03] p-3 space-y-3">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Room"
            className="h-24 w-full object-cover rounded-xl border border-white/10"
          />
          <button
            type="button"
            onClick={() =>
              source === "existing"
                ? handleDeleteExistingImage(image as ExistingRoomImageFormData)
                : removeNewImage((image as NewRoomImageFormData).previewUrl)
            }
            disabled={source === "existing" && deletingImageId === (image as ExistingRoomImageFormData).id}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-60"
            title="Remove image"
          >
            <X size={12} />
          </button>
        </div>

        <input
          type="number"
          min={0}
          placeholder="Sort order"
          value={image.displayOrder}
          onChange={(e) =>
            handleUpdate(identifier, "displayOrder", Number(e.target.value || 0))
          }
          className={inputClass}
        />

        <input
          type="text"
          placeholder="Caption"
          value={image.caption ?? ""}
          onChange={(e) => handleUpdate(identifier, "caption", e.target.value)}
          className={inputClass}
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={(image.tags || []).join(", ")}
          onChange={(e) =>
            handleUpdate(
              identifier,
              "tags",
              e.target.value
                .split(",")
                .map((tag) => tag.trim().toLowerCase())
                .filter(Boolean)
            )
          }
          className={inputClass}
        />

        <input
          type="text"
          placeholder="Category (e.g. balcony)"
          value={image.category ?? ""}
          onChange={(e) => handleUpdate(identifier, "category", e.target.value)}
          className={inputClass}
        />

        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={Boolean(image.isPrimary)}
            onChange={(e) => handleUpdate(identifier, "isPrimary", e.target.checked)}
          />
          Primary image
        </label>
      </div>
    );
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      headerContent={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white shadow-lg">
            <BedDouble size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">
              {initialData ? "Edit Room Type" : "Define Room Type"}
            </h2>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              Inventory Category Config
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="manage-room-type-form"
            icon={<CheckCircle2 size={16} />}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Definition"}
          </Button>
        </div>
      }
    >
      <form id="manage-room-type-form" onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
            Category Name
          </label>
          <div className="relative">
            <Tag
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
            />
            <input
              type="text"
              placeholder="e.g. Ocean View Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} pl-11`}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
            Category Code
          </label>
          <input
            type="text"
            placeholder="e.g. OVS"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass}
            maxLength={60}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Base Rack Rate
            </label>
            <div className="relative">
              <IndianRupee
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
              />
              <input
                type="number"
                placeholder="5500"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={`${inputClass} pl-11`}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Max Adults
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
              />
              <input
                type="number"
                placeholder="2"
                value={maxAdults}
                onChange={(e) => setMaxAdults(e.target.value)}
                className={`${inputClass} pl-11`}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Max Children
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
              />
              <input
                type="number"
                placeholder="0"
                value={maxChildren}
                onChange={(e) => setMaxChildren(e.target.value)}
                className={`${inputClass} pl-11`}
                min={0}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
            Included Amenities
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add feature (e.g. Balcony)"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addAmenity())
              }
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={addAmenity}
              className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-gray-600 dark:text-white"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg bg-accent/10 text-accent-strong border border-accent/20 text-[10px] font-bold uppercase tracking-wider"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(idx)}
                  className="p-1 hover:bg-accent/20 rounded-md ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
            Room Images (max 5)
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300 cursor-pointer hover:border-accent/50 transition-all">
              <ImagePlus size={16} />
              <span className="text-xs font-semibold">Select Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
            </label>
            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="space-y-4">
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Existing images
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {existingImages.map((image) => renderImageEditor(image, "existing"))}
                    </div>
                  </div>
                )}
                {newImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      New uploads
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {newImages.map((image) => renderImageEditor(image, "new"))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {submitError && (
          <p className="text-xs font-semibold text-red-500">{submitError}</p>
        )}
      </form>
    </ModalShell>
  );
};

export default ManageRoomTypeModal;
