import { ISupportRepository } from '../../domain/contracts/ISupportRepository';
import { SupportTicket } from '../../domain/entities/Support';
import { httpClient } from '../http/client';
import { ApiTicketDTO } from '../dto/backend';

export class ApiSupportRepository implements ISupportRepository {
  private baseUrl = 'api/support/tickets/';
  private platformUrl = 'api/platform/support/tickets';
  private tenantUrl = (id: string) => `api/hotels/${id}/support/tickets`;

  private mapTicket = (dto: ApiTicketDTO): SupportTicket => ({
    id: dto.id,
    tenantId: dto.tenant_id,
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category ?? 'General',
    priority: dto.priority ?? 'medium',
    status: dto.status ?? 'open',
    createdAt: dto.created_at ?? new Date().toISOString(),
  });

  async getAllTickets(): Promise<SupportTicket[]> {
    const data = await httpClient.get<ApiTicketDTO[]>(this.platformUrl);
    return data.map(this.mapTicket);
  }

  async getTenantTickets(tenantId: string): Promise<SupportTicket[]> {
    const data = await httpClient.get<ApiTicketDTO[]>(this.tenantUrl(tenantId));
    return data.map(this.mapTicket);
  }

  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      const data = await httpClient.get<ApiTicketDTO>(`${this.baseUrl}${ticketId}`);
      return this.mapTicket(data);
    } catch {
      return null;
    }
  }

  async createTicket(tenantId: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
    };
    const response = await httpClient.post<ApiTicketDTO>(this.tenantUrl(tenantId), payload);
    return this.mapTicket(response);
  }

  async updateStatus(ticketId: string, status: string): Promise<SupportTicket> {
    const response = await httpClient.patch<ApiTicketDTO>(`${this.baseUrl}${ticketId}/status?status=${status}`, {});
    return this.mapTicket(response);
  }
}
