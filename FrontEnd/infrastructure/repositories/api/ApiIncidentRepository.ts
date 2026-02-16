import type { IIncidentRepository } from '../../../domain/contracts/IIncidentRepository';
import type { Incident } from '../../../domain/entities/Incident';
import { httpClient } from '../../http/client';

export class ApiIncidentRepository implements IIncidentRepository {
  private baseUrl = 'api/hotels/';
  private hotelId = 1;

  async getAll(): Promise<Incident[]> {
    const data = await httpClient.get<any[]>(`${this.baseUrl}${this.hotelId}/incidents`);
    return data.map(this.mapToEntity);
  }

  async getById(id: string): Promise<Incident | null> {
    const data = await httpClient.get<any>(`${this.baseUrl}${this.hotelId}/incidents/${id}`);
    return this.mapToEntity(data);
  }

  async create(data: Omit<Incident, 'id'>): Promise<Incident> {
    // Backend expects snake_case for creation? 
    // Schema IncidentCreate uses snake_case fields (from IncidentBase).
    // So we need to map camelCase -> snake_case for request, and snake_case -> camelCase for response.
    const payload = this.mapToPayload(data);
    const response = await httpClient.post<any>(`${this.baseUrl}${this.hotelId}/incidents`, payload);
    return this.mapToEntity(response);
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    const payload = this.mapToPayload(data);
    const response = await httpClient.put<any>(`${this.baseUrl}${this.hotelId}/incidents/${id}`, payload);
    return this.mapToEntity(response);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${this.hotelId}/incidents/${id}`);
  }

  private mapToEntity(data: any): Incident {
    return {
        ...data,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        slaBreached: data.sla_breached,
        guestName: data.guest_name || 'Guest',
        reportedBy: data.reported_by || 'System',
        assignedTo: data.assigned_to || 'Unassigned',
        // Ensure other fields are passed if they match
    };
  }

  private mapToPayload(data: any): any {
    const payload: any = { ...data };
    if (data.createdAt) { payload.created_at = data.createdAt; delete payload.createdAt; }
    if (data.updatedAt) { payload.updated_at = data.updatedAt; delete payload.updatedAt; }
    if (data.slaBreached !== undefined) { payload.sla_breached = data.slaBreached; delete payload.slaBreached; }
    if (data.guestName) { payload.guest_name = data.guestName; delete payload.guestName; }
    if (data.reportedBy) { payload.reported_by = data.reportedBy; delete payload.reportedBy; }
    if (data.assignedTo) { payload.assigned_to = data.assignedTo; delete payload.assignedTo; }
    return payload;
  }
}
