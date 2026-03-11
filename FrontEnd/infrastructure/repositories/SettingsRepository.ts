import type { TenantConfig } from "../../domain/entities/TenantConfig";
import { httpClient } from "../http/client";
import {
  deleteCacheKey,
  getCachedFresh,
  setCached,
  setCachedIfChanged,
  tenantConfigKey,
} from "../storage/idbClient";

const TENANT_CONFIG_STORE = "tenantConfigs";
const TENANT_CONFIG_TTL_MS = 15 * 60 * 1000;

type ApiTenantConfigDTO = {
  id: string;
  tenant_id: string;
  timezone?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  default_lang?: string | null;
  welcome_message?: string | null;
  logo_url?: string | null;
  support_phone?: string | null;
  support_email?: string | null;
  extra?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export class ApiSettingsRepository {
  private mapToEntity(data: ApiTenantConfigDTO): TenantConfig {
    return {
      id: String(data.id),
      tenantId: String(data.tenant_id),
      timezone: data.timezone ?? "Asia/Kolkata",
      checkInTime: data.check_in_time ?? "14:00",
      checkOutTime: data.check_out_time ?? "11:00",
      defaultLang: data.default_lang ?? "en",
      welcomeMessage: data.welcome_message ?? undefined,
      logoUrl: data.logo_url ?? undefined,
      supportPhone: data.support_phone ?? undefined,
      supportEmail: data.support_email ?? undefined,
      extra: data.extra ?? {},
      createdAt: data.created_at ?? undefined,
      updatedAt: data.updated_at ?? undefined,
    };
  }

  async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    const key = tenantConfigKey(tenantId);
    const cached = await getCachedFresh<TenantConfig>(TENANT_CONFIG_STORE, key, {
      ttlMs: TENANT_CONFIG_TTL_MS,
      deleteIfStale: true,
    });

    if (cached) {
      void this.revalidateTenantConfig(tenantId, key);
      return cached;
    }

    try {
      const data = await httpClient.get<ApiTenantConfigDTO>(
        `api/tenants/${tenantId}/config`,
      );
      const mapped = this.mapToEntity(data);
      await setCached(TENANT_CONFIG_STORE, key, mapped);
      return mapped;
    } catch {
      return null;
    }
  }

  async clearTenantConfigCache(tenantId: string): Promise<void> {
    await deleteCacheKey(TENANT_CONFIG_STORE, tenantConfigKey(tenantId));
  }

  private async revalidateTenantConfig(
    tenantId: string,
    key: string,
  ): Promise<void> {
    try {
      const data = await httpClient.get<ApiTenantConfigDTO>(
        `api/tenants/${tenantId}/config`,
      );
      const mapped = this.mapToEntity(data);
      await setCachedIfChanged(TENANT_CONFIG_STORE, key, mapped);
    } catch {
      // Ignore background refresh failures
    }
  }
}

