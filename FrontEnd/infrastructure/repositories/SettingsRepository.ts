import type { TenantConfig } from "../../domain/entities/TenantConfig";
import type { ISettingsRepository } from "../../domain/contracts/ISettingsRepository";
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
  available_lang?: string[] | null;
  welcome_message?: string | null;
  logo_url?: string | null;
  support_phone?: string | null;
  support_email?: string | null;
  extra?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export class ApiSettingsRepository implements ISettingsRepository {
  private mapToEntity(data: ApiTenantConfigDTO): TenantConfig {
    return {
      id: String(data.id),
      tenantId: String(data.tenant_id),
      timezone: data.timezone ?? "Asia/Kolkata",
      checkInTime: data.check_in_time ?? "14:00",
      checkOutTime: data.check_out_time ?? "11:00",
      defaultLang: data.default_lang ?? "en",
      availableLang: data.available_lang ?? [],
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

  async updateTenantConfig(
    tenantId: string,
    updates: Partial<TenantConfig>,
  ): Promise<TenantConfig> {
    const payload: Record<string, unknown> = {};

    if (updates.supportPhone !== undefined) {
      payload.support_phone = updates.supportPhone || null;
    }
    if (updates.supportEmail !== undefined) {
      payload.support_email = updates.supportEmail || null;
    }
    if (updates.defaultLang !== undefined) {
      payload.default_lang = updates.defaultLang;
    }
    if (updates.timezone !== undefined) {
      payload.timezone = updates.timezone;
    }
    if (updates.checkInTime !== undefined) {
      payload.check_in_time = updates.checkInTime;
    }
    if (updates.checkOutTime !== undefined) {
      payload.check_out_time = updates.checkOutTime;
    }
    if (updates.availableLang !== undefined) {
      payload.available_lang = updates.availableLang;
    }
    if (updates.welcomeMessage !== undefined) {
      payload.welcome_message = updates.welcomeMessage || null;
    }
    if (updates.logoUrl !== undefined) {
      payload.logo_url = updates.logoUrl || null;
    }
    if (updates.extra !== undefined) {
      payload.extra = updates.extra;
    }

    const data = await httpClient.patch<ApiTenantConfigDTO>(
      "api/tenants/me/config",
      payload,
    );
    const mapped = this.mapToEntity(data);
    await setCached(TENANT_CONFIG_STORE, tenantConfigKey(tenantId), mapped);
    return mapped;
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
