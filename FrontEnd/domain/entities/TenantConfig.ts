// TenantConfig domain entity — matches tenant_configs table in code.sql

export interface TenantConfig {
    id: string;
    tenantId: string;                // mapped from tenant_id (unique FK)
    timezone: string;                // default: 'Asia/Kolkata'
    checkInTime: string;             // mapped from check_in_time, default: '14:00'
    checkOutTime: string;            // mapped from check_out_time, default: '11:00'
    defaultLang: string;             // mapped from default_lang, default: 'en'
    availableLang: string[];         // mapped from available_lang
    welcomeMessage?: string;
    logoUrl?: string;
    supportPhone?: string;
    supportEmail?: string;
    extra: Record<string, unknown>;  // JSONB free-form config
    createdAt?: string;
    updatedAt?: string;
}
