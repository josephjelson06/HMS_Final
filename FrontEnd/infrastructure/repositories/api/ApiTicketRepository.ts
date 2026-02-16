import type { ITicketRepository } from '../../../domain/contracts/ITicketRepository';
import type { HotelTicket, HotelTicketCategory, HotelTicketPriority, HotelTicketStatus } from '../../../domain/entities/HotelTicket';
import { httpClient } from '../../http/client';

export class ApiTicketRepository implements ITicketRepository {
  async getHotelTickets(hotelId: string): Promise<HotelTicket[]> {
    const data = await httpClient.get<any[]>(`api/hotels/${hotelId}/tickets`);
    return data.map(this.mapToEntity);
  }

  async createTicket(hotelId: string, data: Partial<HotelTicket>): Promise<HotelTicket> {
    const payload = {
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      category: data.category,
      status: data.status || 'Open'
    };
    const response = await httpClient.post<any>(`api/hotels/${hotelId}/tickets`, payload);
    return this.mapToEntity(response);
  }

  // Admin methods
  async getAllTickets(): Promise<HotelTicket[]> {
    const data = await httpClient.get<any[]>('api/tickets');
    return data.map(this.mapToEntity);
  }

  async updateTicket(id: string, data: Partial<HotelTicket>): Promise<HotelTicket> {
    const response = await httpClient.put<any>(`api/tickets/${id}`, data);
    return this.mapToEntity(response);
  }

  private mapToEntity(data: any): HotelTicket {
    return {
      id: data.id.toString(),
      subject: data.subject,
      description: data.description || '',
      category: data.category as HotelTicketCategory,
      priority: data.priority as HotelTicketPriority,
      status: data.status as HotelTicketStatus,
      createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
      updatedAt: data.updated_at ? new Date(data.updated_at).toLocaleString() : new Date().toLocaleString(),
      hotelId: data.hotel_id,
      hotelName: data.hotel_name // Only present for admin view
    };
  }
}
