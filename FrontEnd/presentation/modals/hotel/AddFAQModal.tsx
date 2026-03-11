import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, CirclePlus, Loader2 } from "lucide-react";

import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";

interface AddFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const inputClass =
  "w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

const textareaClass = `${inputClass} resize-none min-h-[140px]`;

const AddFAQModal: React.FC<AddFAQModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuestion("");
    setAnswer("");
    setError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  const validationError = useMemo(() => {
    if (!question.trim()) return "Question is required";
    if (question.trim().length < 5) return "Question must be at least 5 characters";
    if (!answer.trim()) return "Answer is required";
    if (answer.trim().length < 5) return "Answer must be at least 5 characters";
    return null;
  }, [question, answer]);

  const canSubmit = !validationError && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          is_active: true,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || "Failed to create FAQ");
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent-strong/20">
            <CirclePlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">
              Add FAQ
            </h2>
            <p className="text-[10px] font-bold text-accent-strong uppercase tracking-widest mt-1">
              Create A New Guest Help Entry
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="action"
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            iconRight={
              isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} strokeWidth={3} />
              )
            }
          >
            {isSubmitting ? "Creating..." : "Create FAQ"}
          </Button>
        </div>
      }
    >
      <div className="p-8 pt-4 space-y-6">
        {(error || validationError) && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
            {error || validationError}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
            Question *
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. What is your check-in time?"
            value={question}
            maxLength={500}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
            Answer *
          </label>
          <textarea
            className={textareaClass}
            placeholder="Provide a clear answer for guests..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default AddFAQModal;
