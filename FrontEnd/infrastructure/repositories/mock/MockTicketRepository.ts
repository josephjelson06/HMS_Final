import type { ITicketRepository } from '../../../domain/contracts/ITicketRepository';
import type { HotelTicket } from '../../../domain/entities/HotelTicket';
import { mockTickets } from '../../../data/helpdesk';

export class MockTicketRepository implements ITicketRepository {
  private data: HotelTicket[] = mockTickets.map(t => ({
      id: t.id,
      subject: t.subject,
      description: 'Mock Description',
      category: t.category as any,
      priority: t.priority as any,
      status: t.status as any,
      createdAt: t.createdDate || new Date().toISOString(),
      updatedAt: t.lastUpdated || new Date().toISOString(),
      hotelId: 1, // Mock ID
      hotelName: t.hotel
  }));

  async getHotelTickets(hotelId: string): Promise<HotelTicket[]> {
    return this.data;
  }

  async createTicket(hotelId: string, data: Partial<HotelTicket>): Promise<HotelTicket> {
    const ticket: HotelTicket = {
        id: `TKT-${Date.now()}`,
        subject: data.subject!,
        description: data.description!,
        category: data.category!,
        priority: data.priority!,
        status: data.status || 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hotelId: parseInt(hotelId),
        hotelName: 'Mock Hotel'
    };
    this.data.push(ticket);
    return ticket;
  }

  async getAllTickets(): Promise<HotelTicket[]> {
    return this.data;
  }

  async updateTicket(id: string, data: Partial<HotelTicket>): Promise<HotelTicket> {
    const idx = this.data.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Ticket ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...data, updatedAt: new Date().toISOString() };
    return this.data[idx];
  }
}
