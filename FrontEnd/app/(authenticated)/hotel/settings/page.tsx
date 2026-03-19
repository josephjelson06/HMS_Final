"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "@/application/hooks/useAuth";
import { useTenantConfig } from "@/application/hooks/useTenantConfig";
import PageHeader from "@/presentation/components/ui/PageHeader";
import GlassCard from "@/presentation/components/ui/GlassCard";
import GlassInput from "@/presentation/components/ui/GlassInput";
import Button from "@/presentation/components/ui/Button";

export default function HotelSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const tenantId = user?.tenantId;
  const { config, loading, saving, error, fetchTenantConfig, updateConfig } =
    useTenantConfig(tenantId);

  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [defaultLang, setDefaultLang] = useState("en");
  const [extraText, setExtraText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    void fetchTenantConfig();
  }, [tenantId, fetchTenantConfig]);

  useEffect(() => {
    setSupportPhone(config?.supportPhone ?? "");
    setSupportEmail(config?.supportEmail ?? "");
    setDefaultLang(config?.defaultLang ?? "en");
    const rawExtra = config?.extra ?? {};
    const noteLikeValue =
      typeof rawExtra.panel_note === "string"
        ? rawExtra.panel_note
        : typeof rawExtra.notes === "string"
          ? rawExtra.notes
          : "";
    setExtraText(noteLikeValue);
  }, [config]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const isSubmittingDisabled = useMemo(
    () => authLoading || loading || saving || !tenantId,
    [authLoading, loading, saving, tenantId],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId) return;
    setSuccessMessage("");
    const currentExtra = (config?.extra ?? {}) as Record<string, unknown>;
    const nextExtra: Record<string, unknown> = {
      ...currentExtra,
      panel_note: extraText.trim(),
    };

    const updated = await updateConfig({
      supportPhone: supportPhone.trim(),
      supportEmail: supportEmail.trim(),
      defaultLang: defaultLang.trim(),
      extra: nextExtra,
    });
    if (updated) {
      setSuccessMessage("Settings updated successfully.");
    }
  };

  return (
    <section className="space-y-8">
      <PageHeader
        title="Hotel Settings"
        subtitle="Kiosk Support Contacts"
      />

      <GlassCard className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-base font-black uppercase tracking-widest text-gray-900 dark:text-white">
              Support Details
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              These details are shown to guests on your kiosk screens.
            </p>
          </div>

          <div>
            <GlassInput
              label="System Timezone"
              type="text"
              value="Asia/Kolkata (IST)"
              disabled={true}
              readOnly
              className="opacity-75"
            />
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-white/50">
              Timezone is locked to Indian Standard Time. Contact support to
              change.
            </p>
          </div>

          <GlassInput
            label="Front Desk / Support Phone"
            type="tel"
            value={supportPhone}
            onChange={(event) => setSupportPhone(event.target.value)}
            placeholder="+91 98765 43210"
            disabled={authLoading || loading || !tenantId}
          />

          <GlassInput
            label="Support Email"
            type="email"
            value={supportEmail}
            onChange={(event) => setSupportEmail(event.target.value)}
            placeholder="support@hotel.com"
            disabled={authLoading || loading || !tenantId}
          />

          <div className="w-full">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Default Language
            </label>
            <select
              value={defaultLang}
              onChange={(event) => setDefaultLang(event.target.value)}
              disabled={authLoading || loading || !tenantId}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-all duration-200 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/20 dark:text-white"
            >
              {(config?.availableLang?.length ? config.availableLang : [defaultLang]).map(
                (lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ),
              )}
            </select>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Available languages are managed by Super Admin based on subscription.
            </p>
          </div>

          <div className="w-full">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Extra Notes
            </label>
            <textarea
              value={extraText}
              onChange={(event) => setExtraText(event.target.value)}
              placeholder="Any additional kiosk instructions..."
              disabled={authLoading || loading || !tenantId}
              rows={6}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder-gray-400 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder-gray-500"
            />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Saved internally as JSON. You can write plain text here.
            </p>
          </div>

          {(authLoading || loading) && (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Loading settings...
            </p>
          )}

          {error && (
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {successMessage}
            </p>
          )}

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              variant="action"
              size="md"
              disabled={isSubmittingDisabled}
            >
              {saving ? "Saving..." : loading ? "Loading..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </section>
  );
}
