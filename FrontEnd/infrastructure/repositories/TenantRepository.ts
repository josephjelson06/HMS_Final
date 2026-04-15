import type { ITenantRepository } from "../../domain/contracts/ITenantRepository";
import type { Tenant } from "../../domain/entities/Tenant";
import { httpClient } from "../http/client";
import type { ApiTenantDTO } from "../dto/backend";
import {
  getCached,
  globalKey,
  setCached,
} from "../storage/idbClient";

const TENANT_STORE = "tenants";
const TENANT_LIST_KEY = globalKey("tenants");
let tenantsInFlight: Promise<Tenant[]> | null = null;

export class ApiTenantRepository implements ITenantRepository {
  private baseUrl = "api/tenants";

  private mapToEntity(data: ApiTenantDTO): Tenant {
    return {
      id: String(data.id),
      readableId: data.readable_id ?? undefined,
      name: data.hotel_name,
      slug: data.slug ?? "",
      address: data.address ?? undefined,
      planId: data.plan_id ?? undefined,
      planName: data.plan_name ?? undefined,
      ownerId: data.owner_user_id ?? undefined,
      ownerName: data.owner_name ?? undefined,
      gstin: data.gstin ?? undefined,
      pan: data.pan ?? undefined,
      status:
        data.status === undefined
          ? undefined
          : data.status
            ? "Active"
            : "Suspended",
      imageUrls: [data.image_url_1, data.image_url_2, data.image_url_3].filter(
        Boolean,
      ) as string[],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private toPayload(data: Partial<Tenant>): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      hotel_name: data.name,
      slug: data.slug,
      address: data.address,
      plan_id: data.planId,
      owner_user_id: data.ownerId,
      owner_name: data.ownerName,
      owner_email: data.ownerEmail,
      owner_phone: data.ownerPhone,
      gstin: data.gstin,
      pan: data.pan,
    };

    if (data.status !== undefined) {
      payload.status = data.status === "Active";
    }
    return payload;
  }

  async getAll(): Promise<Tenant[]> {
    if (tenantsInFlight) return tenantsInFlight;

    const cached = await getCached<Tenant[]>(TENANT_STORE, TENANT_LIST_KEY);
    if (cached) return cached;

    tenantsInFlight = (async () => {
      const result = await httpClient.get<ApiTenantDTO[]>(this.baseUrl);
      const mapped = result.map((item) => this.mapToEntity(item));
      await setCached(TENANT_STORE, TENANT_LIST_KEY, mapped);
      return mapped;
    })();

    try {
      return await tenantsInFlight;
    } finally {
      tenantsInFlight = null;
    }
  }

  async getById(id: string): Promise<Tenant | null> {
    const list = await getCached<Tenant[]>(TENANT_STORE, TENANT_LIST_KEY);
    if (list) {
      const found = list.find((item) => item.id === id);
      if (found) return found;
    }

    try {
      const result = await httpClient.get<ApiTenantDTO>(
        `${this.baseUrl}/${id}`,
      );
      const mapped = this.mapToEntity(result);
      if (list) {
        const next = list.some((item) => item.id === id)
          ? list.map((item) => (item.id === id ? mapped : item))
          : [...list, mapped];
        await setCached(TENANT_STORE, TENANT_LIST_KEY, next);
      }
      return mapped;
    } catch (error) {
      return null;
    }
  }

  async create(data: Omit<Tenant, "id">): Promise<Tenant> {
    const payload = this.toPayload(data);
    const result = await httpClient.post<ApiTenantDTO>(this.baseUrl, payload);
    const mapped = this.mapToEntity(result);
    const list = await getCached<Tenant[]>(TENANT_STORE, TENANT_LIST_KEY);
    if (list) {
      await setCached(TENANT_STORE, TENANT_LIST_KEY, [...list, mapped]);
    }
    return mapped;
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const payload = this.toPayload(data);
    const result = await httpClient.patch<ApiTenantDTO>(
      `${this.baseUrl}/${id}`,
      payload,
    );
    const mapped = this.mapToEntity(result);
    const list = await getCached<Tenant[]>(TENANT_STORE, TENANT_LIST_KEY);
    if (list) {
      const next = list.map((item) => (item.id === id ? mapped : item));
      await setCached(
        TENANT_STORE,
        TENANT_LIST_KEY,
        next,
      );
    }
    return mapped;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
    const list = await getCached<Tenant[]>(TENANT_STORE, TENANT_LIST_KEY);
    if (list) {
      const next = list.filter((item) => item.id !== id);
      await setCached(
        TENANT_STORE,
        TENANT_LIST_KEY,
        next,
      );
    }
  }

  async uploadImages(id: string, formData: FormData): Promise<Tenant> {
    const result = await httpClient.post<ApiTenantDTO>(
      `${this.baseUrl}/${id}/images`,
      formData,
    );
    const mapped = this.mapToEntity(result);
    const list = await getCached<Tenant[]>(TENANT_STORE, TENANT_LIST_KEY);
    if (list) {
      const next = list.map((item) => (item.id === id ? mapped : item));
      await setCached(
        TENANT_STORE,
        TENANT_LIST_KEY,
        next,
      );
    }
    return mapped;
  }
}
