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

interface RoomTypeFormData {
  id?: string;
  name: string;
  code: string;
  rate: number;
  occupancy: number;
  amenities: string[];
  images: File[];
}

interface ManageRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (typeData: RoomTypeFormData) => Promise<void>;
  onDeleteExistingImage?: (imageUrl: string) => Promise<void>;
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
  const [occupancy, setOccupancy] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCode(initialData.code || "");
        setRate(initialData.rate || initialData.price); // Handle both old and new data structures
        setOccupancy(initialData.occupancy || initialData.maxGuests || 2); // Fallback for occupancy
        setAmenities(initialData.amenities || []);
        setExistingImageUrls(initialData.imageUrls || []);
      } else {
        setName("");
        setCode("");
        setRate("");
        setOccupancy("");
        setAmenities(["WiFi", "TV"]);
        setExistingImageUrls([]);
      }
      setSubmitError(null);
      setImages([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);
    try {
      await onSave({
        id: initialData?.id || Math.random().toString(36).substring(2, 9),
        name,
        code: code.trim().toUpperCase(),
        rate: Number(rate),
        occupancy: Number(occupancy),
        amenities,
        images,
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

    const nextImages = [...images, ...selected];
    if (existingImageUrls.length + nextImages.length > 5) {
      setSubmitError("Maximum 5 images are allowed.");
      e.target.value = "";
      return;
    }

    setImages(nextImages);
    setPreviewUrls((prev) => [...prev, ...selected.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  };

  const handleDeleteExistingImage = async (imageUrl: string) => {
    if (!onDeleteExistingImage) {
      return;
    }
    setSubmitError(null);
    setDeletingImageUrl(imageUrl);
    try {
      await onDeleteExistingImage(imageUrl);
      setExistingImageUrls((prev) => prev.filter((url) => url !== imageUrl));
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to delete image");
    } finally {
      setDeletingImageUrl(null);
    }
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

        <div className="grid grid-cols-2 gap-6">
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
              Max Occupancy
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
              />
              <input
                type="number"
                placeholder="2"
                value={occupancy}
                onChange={(e) => setOccupancy(e.target.value)}
                className={`${inputClass} pl-11`}
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
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {previewUrls.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`Room preview ${index + 1}`}
                    className="h-14 w-full object-cover rounded-lg border border-white/10"
                  />
                ))}
              </div>
            )}
            {existingImageUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {existingImageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`Existing room image ${index + 1}`}
                      className="h-14 w-full object-cover rounded-lg border border-white/10"
                    />
                    {initialData?.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(url)}
                        disabled={deletingImageUrl === url}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm disabled:opacity-60"
                        title="Delete image"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
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
