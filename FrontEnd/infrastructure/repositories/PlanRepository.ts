import type {
  IPlanRepository,
  PlanCreateInput,
  PlanUpdateInput,
} from "../../domain/contracts/IPlanRepository";
import type { PlanData } from "../../domain/entities/Plan";
import { httpClient } from "../http/client";
import type { ApiPlanDTO } from "../dto/backend";
import {
  deleteCacheKey,
  getCachedFresh,
  globalKey,
  setCached,
} from "../storage/idbClient";

const PLAN_STORE = "plans";
const PLANS_TTL_MS = 10 * 60 * 1000;

export class ApiPlanRepository implements IPlanRepository {
  private readonly baseUrl = "/api/plans";

  async getAll(): Promise<PlanData[]> {
    const key = globalKey("plans");
    const cached = await getCachedFresh<PlanData[]>(PLAN_STORE, key, {
      ttlMs: PLANS_TTL_MS,
      deleteIfStale: true,
    });
    if (cached) {
      return cached;
    }

    const result = await httpClient.get<ApiPlanDTO[]>(this.baseUrl);
    const mapped = result.map(this.mapToEntity);
    await setCached(PLAN_STORE, key, mapped);
    return mapped;
  }

  async getById(id: string): Promise<PlanData | null> {
    try {
      const key = globalKey("plans", id);
      const cached = await getCachedFresh<PlanData>(PLAN_STORE, key, {
        ttlMs: PLANS_TTL_MS,
        deleteIfStale: true,
      });
      if (cached) {
        return cached;
      }

      const result = await httpClient.get<ApiPlanDTO>(`${this.baseUrl}/${id}`);
      const mapped = this.mapToEntity(result);
      await setCached(PLAN_STORE, key, mapped);
      return mapped;
    } catch (err) {
      return null;
    }
  }

  async create(data: PlanCreateInput): Promise<PlanData> {
    const payload = {
      name: data.name,
      price: data.price,
      period_months: data.period_months,
      max_users: data.max_users,
      max_roles: data.max_roles,
      max_rooms: data.max_rooms,
    };
    const result = await httpClient.post<ApiPlanDTO>(this.baseUrl, payload);
    const mapped = this.mapToEntity(result);
    await this.invalidateCache(mapped.id);
    return mapped;
  }

  async update(id: string, data: PlanUpdateInput): Promise<PlanData> {
    // Only send what's present
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    if (data.period_months !== undefined)
      payload.period_months = data.period_months;
    if (data.max_users !== undefined) payload.max_users = data.max_users;
    if (data.max_roles !== undefined) payload.max_roles = data.max_roles;
    if (data.max_rooms !== undefined) payload.max_rooms = data.max_rooms;
    if (data.is_archived !== undefined) payload.is_archived = data.is_archived;

    const result = await httpClient.patch<ApiPlanDTO>(
      `${this.baseUrl}/${id}`,
      payload,
    );
    const mapped = this.mapToEntity(result);
    await this.invalidateCache(id);
    return mapped;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
    await this.invalidateCache(id);
  }

  private mapToEntity(data: ApiPlanDTO): PlanData {
    return {
      id: String(data.id),
      name: data.name,
      price: data.price,
      period_months: data.period_months ?? undefined,
      max_users: data.max_users ?? undefined,
      max_roles: data.max_roles ?? undefined,
      max_rooms: data.max_rooms ?? undefined,
      is_archived: data.is_archived ?? false,
    };
  }

  private async invalidateCache(id?: string) {
    const listKey = globalKey("plans");
    await deleteCacheKey(PLAN_STORE, listKey);
    if (id) {
      await deleteCacheKey(PLAN_STORE, globalKey("plans", id));
    }
  }
}
