"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CirclePlus, Edit2, FileQuestion, Loader2, Search, Trash2 } from "lucide-react";

import { useAuth } from "@/application/hooks/useAuth";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import AddFAQModal from "../../modals/hotel/AddFAQModal";
import EditFAQModal from "../../modals/hotel/EditFAQModal";

interface FAQItem {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HotelFAQ() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [faqForEdit, setFaqForEdit] = useState<FAQItem | null>(null);

  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/faqs", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || "Failed to fetch FAQs");
      }

      setFaqs(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchFaqs();
    }
  }, [tenantId, fetchFaqs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q),
    );
  }, [faqs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / itemsPerPage));
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFaqs.slice(start, start + itemsPerPage);
  }, [filteredFaqs, currentPage, itemsPerPage]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setFaqForEdit(faq);
  };

  const confirmDelete = async () => {
    if (!faqToDelete || isDeletePending) return;
    setIsDeletePending(true);
    try {
      const response = await fetch(`/api/faqs/${faqToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to delete FAQ");
      }
      setFaqToDelete(null);
      await fetchFaqs();
    } catch (err: any) {
      alert(err?.message || "Failed to delete FAQ");
    } finally {
      setIsDeletePending(false);
    }
  };

  if (!tenantId) {
    return <div className="p-8 text-red-500 font-bold">Error: No Property Context</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-full">
      <PageHeader title="FAQ Knowledge Base" subtitle="Guest-Facing Question Management">
        <Button
          variant="custom"
          className="bg-[#f97316] text-white shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 px-8"
          icon={<CirclePlus size={18} strokeWidth={3} />}
          onClick={openAddModal}
        >
          Add FAQ
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Total FAQs: <span className="text-gray-900 dark:text-white">{faqs.length}</span>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors"
          />
          <input
            type="text"
            placeholder="Search question or answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm placeholder:text-gray-500/50"
          />
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden border-white/10">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
          <div className="col-span-4">Question</div>
          <div className="col-span-5">Answer</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading && faqs.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
              Loading FAQ Registry...
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedFaqs.map((faq) => (
              <div key={faq.id} className="px-6 py-5 md:py-4">
                <div className="md:grid md:grid-cols-12 md:gap-4 items-start space-y-3 md:space-y-0">
                  <div className="md:col-span-4 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 md:hidden mb-1">
                      Question
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                      {faq.question}
                    </p>
                  </div>

                  <div className="md:col-span-5 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 md:hidden mb-1">
                      Answer
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="md:col-span-1 md:text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 md:hidden mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-[8px] font-bold uppercase tracking-widest ${faq.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}
                    >
                      {faq.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="md:col-span-2 flex md:justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit2 size={14} />}
                      onClick={() => openEditModal(faq)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => setFaqToDelete(faq)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {!loading && filteredFaqs.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center opacity-50">
          <FileQuestion size={64} className="text-gray-500 mb-6" />
          <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
            No FAQs Found
          </h3>
          <p className="text-sm font-bold text-gray-500 uppercase mt-2">
            Add your first FAQ or adjust your search query.
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={filteredFaqs.length}
        />
      )}

      <AddFAQModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={fetchFaqs}
      />

      <EditFAQModal
        isOpen={!!faqForEdit}
        faq={faqForEdit}
        onClose={() => setFaqForEdit(null)}
        onSaved={fetchFaqs}
      />

      <ConfirmationModal
        isOpen={!!faqToDelete}
        onClose={() => {
          if (!isDeletePending) setFaqToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete FAQ"
        message={`Are you sure you want to delete "${faqToDelete?.question || "this FAQ"}"? This action cannot be undone.`}
        confirmLabel={isDeletePending ? "Deleting..." : "Delete FAQ"}
        cancelLabel="Cancel"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
}
