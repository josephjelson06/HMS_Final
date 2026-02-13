import type { IHotelHelpRepository } from '@/domain/contracts/IHotelHelpRepository';
import type { HotelTicket } from '@/domain/entities/HotelTicket';
import { mockHotelTickets } from '@/data/hotelHelp';

export class MockHotelHelpRepository implements IHotelHelpRepository {
  async getAll(): Promise<HotelTicket[]> {
    return mockHotelTickets;
  }

  async getById(id: string): Promise<HotelTicket | null> {
    return mockHotelTickets.find((t) => t.id === id) ?? null;
  }

  async create(data: Omit<HotelTicket, 'id'>): Promise<HotelTicket> {
    return { id: `TKT-${Date.now()}`, ...data };
  }

  async update(id: string, data: Partial<HotelTicket>): Promise<HotelTicket> {
    const existing = mockHotelTickets.find((t) => t.id === id);
    return { ...(existing ?? mockHotelTickets[0]), ...data } as HotelTicket;
  }
}
