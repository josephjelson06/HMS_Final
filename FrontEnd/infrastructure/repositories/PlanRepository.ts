import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { PlanData } from '../../domain/entities/Plan';
import { httpClient } from '../http/client';

export class ApiPlanRepository implements IPlanRepository {
  private readonly baseUrl = '/api/plans';

  async getAll(): Promise<PlanData[]> {
    const result = await httpClient.get<any[]>(this.baseUrl);
    return result.map(this.mapToEntity);
  }

  async getById(id: string): Promise<PlanData | null> {
    try {
      const result = await httpClient.get<any>(`${this.baseUrl}/${id}`);
      return this.mapToEntity(result);
    } catch (err) {
      return null;
    }
  }

  async create(data: Omit<PlanData, 'id'>): Promise<PlanData> {
    const payload = {
      name: data.name,
      price: data.price,
      rooms: data.rooms,
      kiosks: data.kiosks,
      subscribers: data.subscribers,
      support: data.support,
      included: data.included,
      theme: data.theme,
      is_archived: data.isArchived || false
    };
    const result = await httpClient.post<any>(this.baseUrl, payload);
    return this.mapToEntity(result);
  }

  async update(id: string, data: Partial<PlanData>): Promise<PlanData> {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    if (data.rooms !== undefined) payload.rooms = data.rooms;
    if (data.kiosks !== undefined) payload.kiosks = data.kiosks;
    if (data.subscribers !== undefined) payload.subscribers = data.subscribers;
    if (data.support) payload.support = data.support;
    if (data.included) payload.included = data.included;
    if (data.theme) payload.theme = data.theme;
    if (data.isArchived !== undefined) payload.is_archived = data.isArchived;

    const result = await httpClient.patch<any>(`${this.baseUrl}/${id}`, payload);
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  private mapToEntity(data: any): PlanData {
    return {
      id: String(data.id),
      name: data.name,
      price: data.price,
      rooms: data.rooms,
      kiosks: data.kiosks,
      subscribers: data.subscribers,
      support: data.support,
      included: data.included,
      theme: data.theme,
      isArchived: data.is_archived
    };
  }
}
