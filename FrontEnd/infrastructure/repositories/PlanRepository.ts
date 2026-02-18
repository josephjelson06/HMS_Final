import type { IPlanRepository, PlanCreateInput, PlanUpdateInput } from '../../domain/contracts/IPlanRepository';
import type { PlanData } from '../../domain/entities/Plan';
import { httpClient } from '../http/client';
import type { ApiPlanDTO } from '../dto/backend';

export class ApiPlanRepository implements IPlanRepository {
  private readonly baseUrl = '/api/plans';

  async getAll(): Promise<PlanData[]> {
    const result = await httpClient.get<ApiPlanDTO[]>(this.baseUrl);
    return result.map(this.mapToEntity);
  }

  async getById(id: string): Promise<PlanData | null> {
    try {
      const result = await httpClient.get<ApiPlanDTO>(`${this.baseUrl}/${id}`);
      return this.mapToEntity(result);
    } catch (err) {
      return null;
    }
  }

  async create(data: PlanCreateInput): Promise<PlanData> {
    const payload = {
      name: data.name,
      price: data.price,
      rooms: data.rooms,
      kiosks: data.kiosks,
      support: data.support,
      included: data.included,
      theme: data.theme,
      max_roles: data.max_roles,
      max_users: data.max_users,
      is_archived: data.isArchived ?? data.is_archived ?? false,
    };
    const result = await httpClient.post<ApiPlanDTO>(this.baseUrl, payload);
    return this.mapToEntity(result);
  }

  async update(id: string, data: PlanUpdateInput): Promise<PlanData> {
    const payload: Record<string, unknown> = {};
    if (data.name) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    if (data.rooms !== undefined) payload.rooms = data.rooms;
    if (data.kiosks !== undefined) payload.kiosks = data.kiosks;
    if (data.support) payload.support = data.support;
    if (data.included) payload.included = data.included;
    if (data.theme) payload.theme = data.theme;
    if (data.max_roles !== undefined) payload.max_roles = data.max_roles;
    if (data.max_users !== undefined) payload.max_users = data.max_users;
    if (data.isArchived !== undefined) payload.is_archived = data.isArchived;
    if (data.is_archived !== undefined) payload.is_archived = data.is_archived;

    const result = await httpClient.patch<ApiPlanDTO>(`${this.baseUrl}/${id}`, payload);
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  private mapToEntity(data: ApiPlanDTO): PlanData {
    return {
      id: String(data.id),
      name: data.name ?? '',
      price: data.price ?? 0,
      rooms: data.rooms ?? 0,
      kiosks: data.kiosks ?? 0,
      subscribers: data.subscribers ?? 0,
      support: data.support ?? '',
      included: data.included ?? [],
      theme: data.theme ?? 'blue',
      max_roles: data.max_roles ?? undefined,
      max_users: data.max_users ?? undefined,
      isArchived: data.is_archived ?? false,
      is_archived: data.is_archived ?? false,
    };
  }
}
