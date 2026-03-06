import React, { useState, useEffect, useMemo } from "react";
import { Building, User, CreditCard } from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import GlassInput from "../../components/ui/GlassInput";
import Button from "../../components/ui/Button";
import { usePlans } from "@/application/hooks/usePlans";
import type { TenantViewModel } from "../../pages/super/Tenants";

interface EditHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: TenantViewModel;
  onUpdateHotel: (id: string, data: any) => Promise<any>;
}

const EditHotelModal: React.FC<EditHotelModalProps> = ({
  isOpen,
  onClose,
  hotel,
  onUpdateHotel,
}) => {
  const { plans: apiPlans, loading: plansLoading, fetchPlans } = usePlans();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    pan: "",
    address: "",
    owner: "",
    mobile: "",
    email: "",
    plan: "",
  });

  // Filter active plans
  const activePlans = useMemo(
    () => apiPlans.filter((p) => !p.is_archived),
    [apiPlans],
  );

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      setFormData({
        name: hotel.name || "",
        gstin: hotel.gstin || "",
        pan: hotel.pan || "",
        address: hotel.address || "",
        owner: hotel.owner || "",
        mobile: hotel.mobile || "",
        email: hotel.email || "",
        plan: hotel.plan || "",
      });
    }
  }, [isOpen, hotel, fetchPlans]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedPlan = apiPlans.find((p) => p.name === formData.plan);

      const updateData: any = {
        name: formData.name,
        gstin: formData.gstin,
        pan: formData.pan,
        address: formData.address,
      };

      if (selectedPlan) {
        updateData.planId = selectedPlan.id;
      }

      await onUpdateHotel(hotel.id, updateData);

      onClose();
    } catch (error: any) {
      console.error("Failed to update hotel", error);
      alert(error?.message || "Failed to update hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hotel Details"
      subtitle={`Updating configurations for ${hotel.name}`}
      footer={
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="action"
            onClick={handleSubmit}
            disabled={loading || plansLoading}
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-8">
        {/* Business Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
            <Building size={16} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Business Details
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <GlassInput
                label="Hotel Legal Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <GlassInput
                label="Registered Address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <GlassInput
                label="GSTIN"
                mono
                maxLength={15}
                value={formData.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <GlassInput
                label="PAN"
                mono
                maxLength={10}
                value={formData.pan}
                onChange={(e) => handleChange("pan", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
            <CreditCard size={16} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Subscription Tier
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto px-1 custom-scrollbar">
            {activePlans.map((p) => (
              <div
                key={p.id}
                onClick={() => handleChange("plan", p.name)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.plan === p.name
                    ? "border-orange-500/50 bg-accent/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm dark:text-white">
                    {p.name}
                  </h4>
                </div>
                <span className="text-xs font-bold text-accent drop-shadow-sm">
                  ₹{p.price.toLocaleString()}/mo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Note: Owner/Contact changes could be decoupled into a User edit action, but included here read-only to show context */}
        <div className="space-y-4 opacity-60 pointer-events-none grayscale">
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
            <User size={16} className="text-gray-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Primary Contact (Read-Only)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <GlassInput
                label="Manager Name"
                value={formData.owner}
                readOnly
              />
            </div>
            <GlassInput label="Mobile" value={formData.mobile} readOnly />
            <GlassInput label="Email" value={formData.email} readOnly />
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default EditHotelModal;
