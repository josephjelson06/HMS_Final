import type { TenantConfig } from "../entities/TenantConfig";

export interface ISettingsRepository {
  getTenantConfig(tenantId: string): Promise<TenantConfig | null>;
  updateTenantConfig(
    tenantId: string,
    updates: Partial<TenantConfig>,
  ): Promise<TenantConfig>;
  clearTenantConfigCache(tenantId: string): Promise<void>;
}
